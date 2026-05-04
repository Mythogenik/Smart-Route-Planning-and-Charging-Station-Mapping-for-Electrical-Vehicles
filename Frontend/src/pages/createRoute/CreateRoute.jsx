import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calculateRoute } from '../../utils/RouteEngine';
import './CreateRoute.css';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    const existing = document.getElementById('gmap-script');
    if (existing) {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); resolve(window.google.maps); }
      }, 100);
      setTimeout(() => { clearInterval(interval); reject(new Error('Timeout')); }, 10000);
      return;
    }
    const script = document.createElement('script');
    script.id    = 'gmap-script';
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload  = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

/** Reverse geocode a lat/lng to a place-like object */
function reverseGeocode(maps, lat, lng) {
  return new Promise(resolve => {
    const geocoder = new maps.Geocoder();
    const latLng = new maps.LatLng(lat, lng);
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          formatted_address: results[0].formatted_address,
          name: results[0].formatted_address.split(',')[0],
          geometry: {
            location: results[0].geometry.location, // ← use the actual LatLng object from geocoder
          },
        });
      } else {
        resolve({
          formatted_address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          geometry: {
            location: latLng, // ← use the LatLng object directly
          },
        });
      }
    });
  });
}

export default function CreateRoute() {
  const navigate        = useNavigate();
  const { currentUser } = useAuth();

  const mapRef              = useRef(null);
  const mapInstance         = useRef(null);
  const startInputRef       = useRef(null);
  const endInputRef         = useRef(null);
  const startAcRef          = useRef(null);
  const endAcRef            = useRef(null);
  const directionsRenderer  = useRef(null);
  const startMarker         = useRef(null);
  const endMarker           = useRef(null);
  const stopMarkersRef      = useRef([]);
  const userMarkerRef       = useRef(null);
  const watchIdRef          = useRef(null);
  const directionsResultRef = useRef(null);

  const [mapsLoaded,       setMapsLoaded]       = useState(false);
  const [mapsError,        setMapsError]        = useState('');
  const [startPlace,       setStartPlace]       = useState(null);
  const [endPlace,         setEndPlace]         = useState(null);
  const [startVal,         setStartVal]         = useState('');
  const [endVal,           setEndVal]           = useState('');
  const [routeInfo,        setRouteInfo]        = useState(null);
  const [selectedCar,      setSelectedCar]      = useState(null);
  const [calculating,      setCalculating]      = useState(false);
  const [calculatedRoute,  setCalculatedRoute]  = useState(null);
  const [carWarning,       setCarWarning]       = useState(false);
  const [trackingGPS,      setTrackingGPS]      = useState(false);
  const [savedMsg,         setSavedMsg]         = useState('');
  const [gpsLoading,       setGpsLoading]       = useState(false);

  const userCars = JSON.parse(localStorage.getItem('ev_cars') || '[]')
    .filter(c => c.ownerEmail === currentUser?.email);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError('Could not load Google Maps. Check your API key.'));
  }, []);

  // ── create a draggable marker ─────────────────────
  function makeDraggableMarker(maps, position, isStart) {
    const marker = new maps.Marker({
      position,
      map: mapInstance.current,
      draggable: true,
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: isStart ? '#3ddc84' : '#111',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2.5,
      },
      label: {
        text: isStart ? 'A' : 'B',
        color: isStart ? '#0a0f0d' : '#ffffff',
        fontSize: '11px', fontWeight: 'bold',
      },
      cursor: 'grab',
    });

    // on drag end — reverse geocode the new position
    marker.addListener('dragend', async () => {
      const pos = marker.getPosition();
      const lat = pos.lat();
      const lng = pos.lng();
      const place = await reverseGeocode(maps, lat, lng);

      if (isStart) {
        setStartPlace(place);
        setStartVal(place.formatted_address);
        if (startInputRef.current) startInputRef.current.value = place.formatted_address;
      } else {
        setEndPlace(place);
        setEndVal(place.formatted_address);
        if (endInputRef.current) endInputRef.current.value = place.formatted_address;
      }
      setCalculatedRoute(null);
      setSavedMsg('');
    });

    return marker;
  }

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    const maps = window.google.maps;

    mapInstance.current = new maps.Map(mapRef.current, {
      center: { lat: 37.0, lng: 35.3 },
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi',           elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',       elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water',         elementType: 'geometry', stylers: [{ color: '#c9d8f0' }] },
        { featureType: 'landscape',     elementType: 'geometry', stylers: [{ color: '#f4f5f7' }] },
        { featureType: 'road.highway',  elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.local',    elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
      ],
    });

    directionsRenderer.current = new maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#3ddc84', strokeWeight: 4, strokeOpacity: 0.9 },
    });
    directionsRenderer.current.setMap(mapInstance.current);

    startAcRef.current = new maps.places.Autocomplete(startInputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });
    startAcRef.current.addListener('place_changed', () => {
      const place = startAcRef.current.getPlace();
      if (!place.geometry) return;
      setStartPlace(place);
      setStartVal(place.formatted_address || place.name);
      setCalculatedRoute(null); setSavedMsg('');
    });

    endAcRef.current = new maps.places.Autocomplete(endInputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });
    endAcRef.current.addListener('place_changed', () => {
      const place = endAcRef.current.getPlace();
      if (!place.geometry) return;
      setEndPlace(place);
      setEndVal(place.formatted_address || place.name);
      setCalculatedRoute(null); setSavedMsg('');
    });
  }, [mapsLoaded]);

  const drawBaseRoute = useCallback(() => {
    if (!startPlace || !endPlace || !mapInstance.current) return;
    const maps = window.google.maps;
    stopMarkersRef.current.forEach(m => m.setMap(null));
    stopMarkersRef.current = [];
    if (startMarker.current) startMarker.current.setMap(null);
    if (endMarker.current)   endMarker.current.setMap(null);

    startMarker.current = makeDraggableMarker(maps, startPlace.geometry.location, true);
    endMarker.current   = makeDraggableMarker(maps, endPlace.geometry.location, false);

    const svc = new maps.DirectionsService();
    svc.route(
      { origin: startPlace.geometry.location, destination: endPlace.geometry.location, travelMode: maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(result);
          directionsResultRef.current = result;
          const leg = result.routes[0].legs[0];
          setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });
        }
      }
    );
  }, [startPlace, endPlace]);

  useEffect(() => {
    if (startPlace && !endPlace) {
      mapInstance.current?.panTo(startPlace.geometry.location);
      mapInstance.current?.setZoom(13);
      if (startMarker.current) startMarker.current.setMap(null);
      const maps = window.google.maps;
      startMarker.current = makeDraggableMarker(maps, startPlace.geometry.location, true);
    }
    if (startPlace && endPlace) drawBaseRoute();
  }, [startPlace, endPlace, drawBaseRoute]);

  // ── Use my location as start ──────────────────────
  async function useMyLocation() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const maps  = window.google.maps;
        const place = await reverseGeocode(maps, lat, lng);
        setStartPlace(place);
        setStartVal(place.formatted_address);
        if (startInputRef.current) startInputRef.current.value = place.formatted_address;
        mapInstance.current?.panTo({ lat, lng });
        mapInstance.current?.setZoom(13);
        setCalculatedRoute(null); setSavedMsg('');
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  }

  function plotStopMarkers(stops) {
    stopMarkersRef.current.forEach(m => m.setMap(null));
    stopMarkersRef.current = [];
    const maps = window.google.maps;
    stops.forEach(stop => {
      const marker = new maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstance.current,
        title: stop.name,
        icon: { path: maps.SymbolPath.CIRCLE, scale: 11, fillColor: '#facc15', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
        label: { text: '⚡', fontSize: '11px' },
        zIndex: 200,
      });
      marker.addListener('click', () => {
        mapInstance.current.panTo({ lat: stop.lat, lng: stop.lng });
        mapInstance.current.setZoom(15);
      });
      stopMarkersRef.current.push(marker);
    });
  }

  async function handleCalculate() {
    if (!selectedCar) { setCarWarning(true); return; }
    if (!startPlace || !endPlace || !directionsResultRef.current) return;
    setCarWarning(false); setCalculating(true); setSavedMsg('');
    try {
      const route = await calculateRoute({
        startPlace, endPlace,
        car:              selectedCar,
        maps:             window.google.maps,
        mapInstance:      mapInstance.current,
        directionsResult: directionsResultRef.current,
        userEmail:        currentUser?.email,
      });
      setCalculatedRoute(route);
      plotStopMarkers(route.stops);
      setSavedMsg('Route saved to My Routes ✓');
    } catch (e) {
      console.error('Route calculation error:', e);
    } finally {
      setCalculating(false);
    }
  }

  function startTracking() {
    if (!navigator.geolocation) return;
    setTrackingGPS(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (!mapInstance.current) return;
        const loc  = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const maps = window.google.maps;
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(loc);
        } else {
          userMarkerRef.current = new maps.Marker({
            position: loc, map: mapInstance.current, title: 'You are here',
            icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#4285f4', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
            zIndex: 999,
          });
        }
        mapInstance.current.panTo(loc);
      },
      () => setTrackingGPS(false),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  function stopTracking() {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null; }
    setTrackingGPS(false);
  }

  useEffect(() => () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); }, []);

  function clearRoute() {
    setStartPlace(null); setEndPlace(null); setStartVal(''); setEndVal('');
    setRouteInfo(null); setCalculatedRoute(null); setCarWarning(false); setSavedMsg('');
    stopMarkersRef.current.forEach(m => m.setMap(null)); stopMarkersRef.current = [];
    if (startMarker.current) startMarker.current.setMap(null);
    if (endMarker.current)   endMarker.current.setMap(null);
    if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
    if (startInputRef.current) startInputRef.current.value = '';
    if (endInputRef.current)   endInputRef.current.value   = '';
    directionsResultRef.current = null;
    mapInstance.current?.setCenter({ lat: 37.0, lng: 35.3 });
    mapInstance.current?.setZoom(6);
  }

  function focusStop(stop) {
    mapInstance.current?.panTo({ lat: stop.lat, lng: stop.lng });
    mapInstance.current?.setZoom(15);
  }

  const canCalculate = startPlace && endPlace && !calculating;

  return (
    <div className="cr-page">
      <div className="cr-topbar">
        <button className="cr-back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <span className="cr-topbar-title">Create Route</span>
        <button className={`cr-gps-btn ${trackingGPS ? 'active' : ''}`}
          onClick={trackingGPS ? stopTracking : startTracking}>
          {trackingGPS ? '📍 Tracking...' : '📍 Track Me'}
        </button>
      </div>

      <div className="cr-body">
        <div className="cr-panel">

          <div className="cr-section">
            <div className="cr-section-label">ROUTE</div>
            <div className="cr-input-group">
              <div className="cr-input-row">
                <div className="cr-input-dot cr-dot-green"/>
                <div className="cr-input-wrap">
                  <label className="cr-input-label">Starting point</label>
                  <input ref={startInputRef} className="cr-input" type="text"
                    placeholder="Search starting location..." value={startVal}
                    onChange={e => setStartVal(e.target.value)}/>
                </div>
                <button
                  className={`cr-my-loc-btn ${gpsLoading ? 'loading' : ''}`}
                  onClick={useMyLocation}
                  title="Use my current location"
                  disabled={gpsLoading}
                >
                  {gpsLoading ? '⏳' : '◎'}
                </button>
              </div>
              <div className="cr-connector-line"/>
              <div className="cr-input-row">
                <div className="cr-input-dot cr-dot-dark"/>
                <div className="cr-input-wrap">
                  <label className="cr-input-label">Destination</label>
                  <input ref={endInputRef} className="cr-input" type="text"
                    placeholder="Search destination..." value={endVal}
                    onChange={e => setEndVal(e.target.value)}/>
                </div>
              </div>
            </div>
            <div className="cr-input-hints">
              <span>💡 Drag the <strong>A</strong> or <strong>B</strong> markers on the map to adjust</span>
            </div>
            {(startVal || endVal) && <button className="cr-clear" onClick={clearRoute}>✕ Clear route</button>}
          </div>

          {routeInfo && (
            <div className="cr-route-info">
              <div className="cr-route-info-item">
                <span className="cr-route-info-icon">↔</span>
                <div><span className="cr-route-info-val">{routeInfo.distance}</span><span className="cr-route-info-sub">Total distance</span></div>
              </div>
              <div className="cr-route-info-divider"/>
              <div className="cr-route-info-item">
                <span className="cr-route-info-icon">⏱</span>
                <div><span className="cr-route-info-val">{routeInfo.duration}</span><span className="cr-route-info-sub">Est. drive time</span></div>
              </div>
            </div>
          )}

          <div className="cr-section">
            <div className="cr-section-label">YOUR VEHICLE</div>
            {carWarning && <div className="cr-car-warning">⚠ Please select a vehicle to calculate charging stops.</div>}
            {userCars.length === 0 ? (
              <div className="cr-no-car">
                <span className="cr-no-car-icon">◻</span>
                <p className="cr-no-car-text">No vehicle added yet.<br/>Add your EV for accurate range.</p>
                <button className="cr-add-car-btn" onClick={() => navigate('/add-vehicle')}>+ Add a Vehicle</button>
              </div>
            ) : (
              <div className="cr-car-list">
                {userCars.map((car, i) => (
                  <button key={i}
                    className={`cr-car-item ${selectedCar?.id === car.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedCar(car); setCarWarning(false); }}>
                    <div className="cr-car-icon">
                      <svg viewBox="0 0 40 24" width="40" height="24">
                        <rect x="0" y="8" width="40" height="12" rx="3" fill={selectedCar?.id === car.id ? '#3ddc84' : '#1a1a2e'}/>
                        <path d="M6 8 Q9 2 13 2 L27 2 Q33 2 35 8Z" fill={selectedCar?.id === car.id ? '#2ab870' : '#141428'}/>
                        <path d="M8 7.5 Q10.5 3 13 3 L26 3 Q31 3 33 7.5Z" fill="#4a9fd4" opacity="0.8"/>
                        <circle cx="9"  cy="20" r="4" fill="#111"/><circle cx="9"  cy="20" r="2" fill="#444"/>
                        <circle cx="31" cy="20" r="4" fill="#111"/><circle cx="31" cy="20" r="2" fill="#444"/>
                        <circle cx="1"  cy="13" r="1.5" fill={selectedCar?.id === car.id ? '#fff' : '#3ddc84'}/>
                      </svg>
                    </div>
                    <div className="cr-car-info">
                      <span className="cr-car-name">{car.make} {car.model}</span>
                      <span className="cr-car-range">{car.range ? `${car.range} km range` : 'Range not set'} · {car.battery} kWh</span>
                    </div>
                    {selectedCar?.id === car.id && <span className="cr-car-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
            {selectedCar && (
              <div className="cr-range-hint">
                <span className="cr-range-dot"/>
                Stop every ~{Math.round((selectedCar.battery / selectedCar.consumption) * 100 * 0.8)} km
                (80% of {Math.round((selectedCar.battery / selectedCar.consumption) * 100)} km max range)
              </div>
            )}
          </div>

          {calculatedRoute && calculatedRoute.stops.length > 0 && (
            <div className="cr-section">
              <div className="cr-section-label">CHARGING STOPS ({calculatedRoute.stops.length})</div>
              <div className="cr-stops-list">
                {calculatedRoute.stops.map((stop, i) => (
                  <button key={i} className="cr-stop-item" onClick={() => focusStop(stop)}>
                    <div className="cr-stop-num">{i + 1}</div>
                    <div className="cr-stop-info">
                      <div className="cr-stop-name">{stop.name}</div>
                      <div className="cr-stop-address">{stop.address}</div>
                      <div className="cr-stop-dist">at {stop.distanceFromStartKm} km from start</div>
                    </div>
                    <span className="cr-stop-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {calculatedRoute && calculatedRoute.stops.length === 0 && (
            <div className="cr-section">
              <div className="cr-no-stops">✓ No charging stops needed — destination is within range!</div>
            </div>
          )}

          {savedMsg && <div className="cr-saved-msg">{savedMsg}</div>}
          {mapsError && <p className="cr-error">{mapsError}</p>}

          <button
            className={`cr-calculate ${canCalculate ? 'active' : ''} ${calculating ? 'loading' : ''}`}
            disabled={!canCalculate || calculating}
            onClick={handleCalculate}>
            {calculating ? '⏳ Calculating stops...' : '⚡ CALCULATE ROUTE'}
          </button>

        </div>

        <div className="cr-map-wrap">
          {!mapsLoaded && !mapsError && (
            <div className="cr-map-loading"><span className="cr-loading-dot"/><span>Loading map...</span></div>
          )}
          {mapsError && <div className="cr-map-loading cr-map-error"><span>⚠ {mapsError}</span></div>}
          <div ref={mapRef} className="cr-map"/>
        </div>
      </div>
    </div>
  );
}
