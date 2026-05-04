/**
 * RouteEngine.js
 * Pure functions — no React, no map rendering.
 *
 * Strategy for finding charging stops:
 * - Walk the route polyline step by step
 * - At ~80% of safe range, collect several candidate points along the next 40km of route
 * - Search for chargers near EACH candidate point (smaller radius)
 * - Score every found charger by: distance from route + detour penalty
 * - Pick the best-scoring charger — the one closest to the road
 */

const SAFETY_FACTOR   = 0.90;  // stop at 90% of max range
const SEARCH_RADIUS   = 2000;  // 2km strict search first
const CANDIDATE_STEPS = 10;    // many sample points along the route
const CANDIDATE_SPREAD_KM = 60; // spread across 60km window

/** Haversine distance between two lat/lng points in km */
function haversine(a, b) {
  const R  = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Given the full route legs and a target km from start,
 * returns a lat/lng point on the route polyline.
 */
function getPointAlongRoute(legs, targetKm) {
  let accumulated = 0;
  for (const leg of legs) {
    for (const step of leg.steps) {
      const stepKm = step.distance.value / 1000;
      if (accumulated + stepKm >= targetKm) {
        const fraction  = (targetKm - accumulated) / stepKm;
        const startLat  = step.start_location.lat();
        const startLng  = step.start_location.lng();
        const endLat    = step.end_location.lat();
        const endLng    = step.end_location.lng();
        return {
          lat: startLat + (endLat - startLat) * fraction,
          lng: startLng + (endLng - startLng) * fraction,
        };
      }
      accumulated += stepKm;
    }
  }
  const lastLeg  = legs[legs.length - 1];
  const lastStep = lastLeg.steps[lastLeg.steps.length - 1];
  return { lat: lastStep.end_location.lat(), lng: lastStep.end_location.lng() };
}

/**
 * Build an array of sample points along the route,
 * spread around targetKm so we search the road ahead and behind.
 */
function getCandidatePoints(legs, targetKm, totalKm) {
  const points = [];
  const half   = CANDIDATE_SPREAD_KM / 2;
  for (let i = 0; i <= CANDIDATE_STEPS; i++) {
    const offset = -half + (CANDIDATE_SPREAD_KM * i) / CANDIDATE_STEPS;
    const km     = Math.max(0, Math.min(totalKm - 1, targetKm + offset));
    points.push({ km, ...getPointAlongRoute(legs, km) });
  }
  return points;
}

/**
 * Minimum distance from a lat/lng point to the route polyline (approximate).
 * Checks each step segment and finds the closest point on any segment.
 */
function distanceToRoute(point, legs) {
  let minDist = Infinity;
  for (const leg of legs) {
    for (const step of leg.steps) {
      const A = { lat: step.start_location.lat(), lng: step.start_location.lng() };
      const B = { lat: step.end_location.lat(),   lng: step.end_location.lng()   };
      // project point onto segment AB
      const AB  = { lat: B.lat - A.lat, lng: B.lng - A.lng };
      const AP  = { lat: point.lat - A.lat, lng: point.lng - A.lng };
      const dot = AP.lat * AB.lat + AP.lng * AB.lng;
      const len2 = AB.lat ** 2 + AB.lng ** 2;
      let t = len2 === 0 ? 0 : Math.max(0, Math.min(1, dot / len2));
      const closest = { lat: A.lat + t * AB.lat, lng: A.lng + t * AB.lng };
      const d = haversine(point, closest);
      if (d < minDist) minDist = d;
    }
  }
  return minDist; // km
}

/**
 * Search for EV chargers near a single point.
 * Returns Promise<PlaceResult[]>
 */
function searchChargersNear(maps, location, map, radius = SEARCH_RADIUS) {
  return new Promise(resolve => {
    const svc = new maps.places.PlacesService(map);
    svc.nearbySearch(
      {
        location,
        radius,
        keyword: 'electric vehicle charging station',
        type:    'establishment',
      },
      (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && results?.length > 0) {
          resolve(results);
        } else {
          resolve([]);
        }
      }
    );
  });
}

/**
 * Find the best charging station for a given waypoint on the route.
 * First tries strict 2.5km radius, then falls back to 8km if nothing found.
 */
async function findBestCharger(maps, legs, targetKm, totalKm, mapInstance) {
  const result = await findBestChargerWithRadius(maps, legs, targetKm, totalKm, mapInstance, SEARCH_RADIUS);
  if (result) return result;
  // fallback — try wider radius for sparse areas
  return findBestChargerWithRadius(maps, legs, targetKm, totalKm, mapInstance, 8000);
}

async function findBestChargerWithRadius(maps, legs, targetKm, totalKm, mapInstance, radius) {
  const candidates = getCandidatePoints(legs, targetKm, totalKm);

  // search near each candidate point in parallel
  const searchResults = await Promise.all(
    candidates.map(pt => searchChargersNear(maps, { lat: pt.lat, lng: pt.lng }, mapInstance, radius))
  );

  // flatten and deduplicate by place_id
  const seen   = new Set();
  const allPlaces = [];
  for (const results of searchResults) {
    for (const place of results) {
      if (!seen.has(place.place_id)) {
        seen.add(place.place_id);
        allPlaces.push(place);
      }
    }
  }

  if (allPlaces.length === 0) return null;

  // threshold relaxes for wider search
  const distThreshold = radius <= 2000 ? 2.5 : 7.0;

  let bestPlace = null;
  let bestScore = Infinity;

  for (const place of allPlaces) {
    const plat = place.geometry.location.lat();
    const plng = place.geometry.location.lng();
    const ptOnRoute = { lat: plat, lng: plng };

    const distToRoute  = distanceToRoute(ptOnRoute, legs);
    const distToTarget = haversine(ptOnRoute, getPointAlongRoute(legs, targetKm));

    if (distToRoute > distThreshold) continue;

    const score = distToRoute * 5.0 + distToTarget * 0.2;

    if (score < bestScore) {
      bestScore = score;
      bestPlace = place;
    }
  }

  return bestPlace;
}

/**
 * Main calculation function.
 */
export async function calculateRoute({
  startPlace,
  endPlace,
  car,
  maps,
  mapInstance,
  directionsResult,
  userEmail,
}) {
  const maxRangeKm     = (car.battery / car.consumption) * 100;
  const safeRangeKm    = maxRangeKm * SAFETY_FACTOR;
  const totalDistanceKm = directionsResult.routes[0].legs.reduce(
    (sum, leg) => sum + leg.distance.value / 1000, 0
  );
  const legs = directionsResult.routes[0].legs;

  const stops   = [];
  let coveredKm = 0;

  while (coveredKm + (maxRangeKm * 0.60) < totalDistanceKm) {
    // Search window: start looking at 70% of range, must stop by 90%
    const searchStartKm = coveredKm + (maxRangeKm * 0.70);
    const searchEndKm   = Math.min(coveredKm + safeRangeKm, totalDistanceKm - 10);
    const windowKm      = searchEndKm - searchStartKm;

    if (windowKm <= 0) break;

    // Sample points across the window — run ALL searches in parallel for speed
    const WINDOW_STEPS = 6;
    let bestCharger  = null;
    let bestKm       = searchEndKm;
    let bestScore    = Infinity;

    const samplePoints = Array.from({ length: WINDOW_STEPS + 1 }, (_, i) => ({
      km: searchStartKm + (windowKm * i) / WINDOW_STEPS,
      pt: getPointAlongRoute(legs, searchStartKm + (windowKm * i) / WINDOW_STEPS),
    }));

    // run all strict searches in parallel
    const strictResults = await Promise.all(
      samplePoints.map(({ pt }) => searchChargersNear(maps, pt, mapInstance, SEARCH_RADIUS))
    );

    // for points that got nothing, run wide in parallel
    const wideResults = await Promise.all(
      samplePoints.map(({ pt }, i) =>
        strictResults[i].length === 0
          ? searchChargersNear(maps, pt, mapInstance, 8000)
          : Promise.resolve([])
      )
    );

    for (let i = 0; i <= WINDOW_STEPS; i++) {
      const sampleKm = samplePoints[i].km;
      const places   = strictResults[i].length > 0 ? strictResults[i] : wideResults[i];
      const strict   = strictResults[i].length > 0;
      const distThreshold = strict ? 2.5 : 7.0;

      for (const place of places) {
        const plat = place.geometry.location.lat();
        const plng = place.geometry.location.lng();
        const distToRoute = distanceToRoute({ lat: plat, lng: plng }, legs);
        if (distToRoute > distThreshold) continue;
        const earlinessBonus = (searchEndKm - sampleKm) / windowKm * 2.0;
        const score = distToRoute * 3.0 - earlinessBonus;
        if (score < bestScore) {
          bestScore   = score;
          bestCharger = place;
          bestKm      = sampleKm;
        }
      }
    }

    if (bestCharger) {
      const actualKm = Math.round(bestKm);
      stops.push({
        name:     bestCharger.name,
        address:  bestCharger.vicinity,
        placeId:  bestCharger.place_id,
        lat:      bestCharger.geometry.location.lat(),
        lng:      bestCharger.geometry.location.lng(),
        rating:   bestCharger.rating || null,
        isOpen:   bestCharger.opening_hours?.open_now ?? null,
        distanceFromStartKm: actualKm,
      });
      // next leg starts from where we actually stopped
      coveredKm = actualKm;
    } else {
      // truly no charger found in this window
      const fallbackKm = Math.round(searchEndKm);
      const fallbackPt = getPointAlongRoute(legs, fallbackKm);
      stops.push({
        name:     'No Station Found',
        address:  'No EV charger found in this area — plan alternative',
        placeId:  null,
        lat:      fallbackPt.lat,
        lng:      fallbackPt.lng,
        rating:   null,
        isOpen:   null,
        distanceFromStartKm: fallbackKm,
      });
      coveredKm = fallbackKm;
    }
  }

  const route = {
    id:          Date.now(),
    ownerEmail:  userEmail,
    createdAt:   new Date().toISOString(),
    car: {
      make:        car.make,
      model:       car.model,
      battery:     car.battery,
      consumption: car.consumption,
      range:       car.range,
    },
    origin: {
      name:    startPlace.name || startPlace.formatted_address,
      address: startPlace.formatted_address,
      lat:     startPlace.geometry.location.lat(),
      lng:     startPlace.geometry.location.lng(),
    },
    destination: {
      name:    endPlace.name || endPlace.formatted_address,
      address: endPlace.formatted_address,
      lat:     endPlace.geometry.location.lat(),
      lng:     endPlace.geometry.location.lng(),
    },
    totalDistanceKm: Math.round(totalDistanceKm),
    totalDuration:   directionsResult.routes[0].legs.reduce(
      (sum, leg) => sum + leg.duration.value, 0
    ),
    safeRangeKm: Math.round(safeRangeKm),
    stops,
  };

  const all = JSON.parse(localStorage.getItem('ev_routes') || '[]');
  all.push(route);
  localStorage.setItem('ev_routes', JSON.stringify(all));

  return route;
}

export function getAllRoutes(userEmail) {
  const all = JSON.parse(localStorage.getItem('ev_routes') || '[]');
  return all.filter(r => r.ownerEmail === userEmail);
}

export function getRouteById(id) {
  const all = JSON.parse(localStorage.getItem('ev_routes') || '[]');
  return all.find(r => r.id === Number(id)) || null;
}

export function deleteRoute(id) {
  const all = JSON.parse(localStorage.getItem('ev_routes') || '[]');
  localStorage.setItem('ev_routes', JSON.stringify(all.filter(r => r.id !== Number(id))));
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}