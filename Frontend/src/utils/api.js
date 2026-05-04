/**
 * api.js
 * Central utility for all backend API calls.
 * Handles JWT token, request/response, and errors.
 */

const BASE_URL = 'http://localhost:5119';

// ── Token helpers ─────────────────────────────────
export function getToken() {
  return localStorage.getItem('ev_token');
}

export function setToken(token) {
  localStorage.setItem('ev_token', token);
}

export function removeToken() {
  localStorage.removeItem('ev_token');
}

// ── Base fetch wrapper ────────────────────────────
async function request(method, path, body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  // 204 No Content — return null
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || data || `Error ${res.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}

// ── Auth ──────────────────────────────────────────
export async function apiRegister({ username, firstName, lastName, phoneNumber, email, password }) {
  return request('POST', '/api/auth/register', {
    username, firstName, lastName, phoneNumber, email, password
  }, false);
}

export async function apiLogin({ email, password }) {
  const data = await request('POST', '/api/auth/login', { email, password }, false);
  if (data?.token) setToken(data.token);
  return data;
}

export function apiLogout() {
  removeToken();
}

// ── Vehicles ──────────────────────────────────────
export async function apiGetVehicles() {
  return request('GET', '/api/vehicles');
}

export async function apiCreateVehicle(vehicle) {
  return request('POST', '/api/vehicles', {
    brand:              vehicle.make,
    model:              vehicle.model,
    batteryCapacity:    vehicle.battery,
    currentSoc:         100,
    averageConsumption: vehicle.consumption,
    range:              vehicle.range,
    topSpeed:           vehicle.topSpeed,
    color:              vehicle.color,
    year:               vehicle.year,
    nickname:           vehicle.nickname || '',
  });
}

export async function apiDeleteVehicle(id) {
  return request('DELETE', `/api/vehicles/${id}`);
}

export async function apiUpdateVehicle(id, vehicle) {
  return request('PUT', `/api/vehicles/${id}`, {
    brand:              vehicle.make,
    model:              vehicle.model,
    batteryCapacity:    vehicle.battery,
    currentSoc:         vehicle.currentSoc || 100,
    averageConsumption: vehicle.consumption,
    range:              vehicle.range,
    topSpeed:           vehicle.topSpeed,
    color:              vehicle.color,
    year:               vehicle.year,
    nickname:           vehicle.nickname || '',
  });
}

// ── Routes ────────────────────────────────────────
export async function apiGetRoutes() {
  return request('GET', '/api/Route');
}

export async function apiGetRouteById(id) {
  return request('GET', `/api/Route/${id}`);
}

export async function apiSaveRoute(route, vehicleId) {
  return request('POST', '/api/Route', {
    vehicleId:          vehicleId,
    userId:             0, // backend sets this from JWT
    originLat:          route.origin.lat,
    originLon:          route.origin.lng,
    originName:         route.origin.name,
    originAddress:      route.origin.address,
    destinationLat:     route.destination.lat,
    destinationLon:     route.destination.lng,
    destinationName:    route.destination.name,
    destinationAddress: route.destination.address,
    stopsJson:          JSON.stringify(route.stops.map(s => ({
      name:    s.name,
      address: s.address,
      lat:     s.lat,
      lon:     s.lng,
      placeId: s.placeId || '',
    }))),
    totalDistance:  route.totalDistanceKm,
    totalDuration:  route.totalDuration,
    safeRange:      route.safeRangeKm,
    createdAt:      new Date().toISOString(),
  });
}

export async function apiDeleteRoute(id) {
  return request('DELETE', `/api/Route/${id}`);
}

// ── Map backend route to frontend format ──────────
export function mapRouteFromApi(apiRoute) {
  return {
    id:             apiRoute.id,
    ownerEmail:     '',
    createdAt:      apiRoute.createdAt,
    car: {
      make:        apiRoute.vehicle?.brand,
      model:       apiRoute.vehicle?.model,
      battery:     apiRoute.vehicle?.batteryCapacity,
      consumption: apiRoute.vehicle?.averageConsumption,
      range:       apiRoute.vehicle?.range,
    },
    origin: {
      name:    apiRoute.originName,
      address: apiRoute.originAddress,
      lat:     apiRoute.originLat,
      lng:     apiRoute.originLon,
    },
    destination: {
      name:    apiRoute.destinationName,
      address: apiRoute.destinationAddress,
      lat:     apiRoute.destinationLat,
      lng:     apiRoute.destinationLon,
    },
    stops: (apiRoute.stops || []).map(s => ({
      name:    s.name,
      address: s.address,
      lat:     s.lat,
      lng:     s.lon,
      placeId: s.placeId,
    })),
    totalDistanceKm: apiRoute.totalDistance,
    totalDuration:   apiRoute.totalDuration,
    safeRangeKm:     apiRoute.safeRange,
  };
}

// ── Map backend vehicle to frontend format ─────────
export function mapVehicleFromApi(apiVehicle) {
  return {
    id:          apiVehicle.id,
    ownerEmail:  '',
    make:        apiVehicle.brand,
    model:       apiVehicle.model,
    year:        apiVehicle.year,
    color:       apiVehicle.color,
    nickname:    apiVehicle.nickname,
    topSpeed:    apiVehicle.topSpeed,
    range:       apiVehicle.range,
    battery:     apiVehicle.batteryCapacity,
    consumption: apiVehicle.averageConsumption,
  };
}