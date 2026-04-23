import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CreateRoute.css';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    const existing = document.getElementById('gmap-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      return;
    }
    const script = document.createElement('script');
    script.id  = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload  = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

export default function CreateRoute() {
  const navigate   = useNavigate();
  const { currentUser } = useAuth();

  const mapRef        = useRef(null);
  const mapInstance   = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef   = useRef(null);
  const startAcRef    = useRef(null);
  const endAcRef      = useRef(null);
  const directionsRenderer = useRef(null);
  const startMarker   = useRef(null);
  const endMarker     = useRef(null);

  const [mapsLoaded, setMapsLoaded]   = useState(false);
  const [mapsError,  setMapsError]    = useState('');
  const [startPlace, setStartPlace]   = useState(null);
  const [endPlace,   setEndPlace]     = useState(null);
  const [startVal,   setStartVal]     = useState('');
  const [endVal,     setEndVal]       = useState('');
  const [routeInfo,  setRouteInfo]    = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

  // load user's cars from localStorage
  const userCars = JSON.parse(localStorage.getItem('ev_cars') || '[]')
    .filter(c => c.ownerEmail === currentUser?.email);

  // ── Load Google Maps ──────────────────────────────
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError('Could not load Google Maps. Check your API key.'));
  }, []);

  // ── Init map + autocomplete ───────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;

    const maps = window.google.maps;

    // map centred on Turkey by default
    mapInstance.current = new maps.Map(mapRef.current, {
      center: { lat: 37.0, lng: 35.3 },
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi',            elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',        elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water',          elementType: 'geometry', stylers: [{ color: '#c9d8f0' }] },
        { featureType: 'landscape',      elementType: 'geometry', stylers: [{ color: '#f4f5f7' }] },
        { featureType: 'road.highway',   elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial',  elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.local',     elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8c8c8' }] },
      ],
    });

    directionsRenderer.current = new maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#3ddc84', strokeWeight: 4, strokeOpacity: 0.9 },
    });
    directionsRenderer.current.setMap(mapInstance.current);

    // autocomplete — start
    startAcRef.current = new maps.places.Autocomplete(startInputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });
    startAcRef.current.addListener('place_changed', () => {
      const place = startAcRef.current.getPlace();
      if (!place.geometry) return;
      setStartPlace(place);
      setStartVal(place.formatted_address || place.name);
    });

    // autocomplete — end
    endAcRef.current = new maps.places.Autocomplete(endInputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });
    endAcRef.current.addListener('place_changed', () => {
      const place = endAcRef.current.getPlace();
      if (!place.geometry) return;
      setEndPlace(place);
      setEndVal(place.formatted_address || place.name);
    });
  }, [mapsLoaded]);

  // ── React to place selections ─────────────────────
  const drawRoute = useCallback(() => {
    if (!startPlace || !endPlace || !mapInstance.current) return;

    const maps = window.google.maps;

    // clear old markers
    if (startMarker.current) startMarker.current.setMap(null);
    if (endMarker.current)   endMarker.current.setMap(null);

    // start marker — green
    startMarker.current = new maps.Marker({
      position: startPlace.geometry.location,
      map: mapInstance.current,
      title: 'Start',
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3ddc84',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2.5,
      },
      label: { text: 'A', color: '#0a0f0d', fontSize: '11px', fontWeight: 'bold' },
    });

    // end marker — dark
    endMarker.current = new maps.Marker({
      position: endPlace.geometry.location,
      map: mapInstance.current,
      title: 'End',
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#111',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2.5,
      },
      label: { text: 'B', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' },
    });

    // draw directions
    const directionsService = new maps.DirectionsService();
    directionsService.route(
      {
        origin:      startPlace.geometry.location,
        destination: endPlace.geometry.location,
        travelMode:  maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
          });
        }
      }
    );
  }, [startPlace, endPlace]);

  useEffect(() => {
    if (startPlace && !endPlace) {
      // just pan to start
      mapInstance.current?.panTo(startPlace.geometry.location);
      mapInstance.current?.setZoom(13);
      if (startMarker.current) startMarker.current.setMap(null);
      const maps = window.google.maps;
      startMarker.current = new maps.Marker({
        position: startPlace.geometry.location,
        map: mapInstance.current,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3ddc84',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
        label: { text: 'A', color: '#0a0f0d', fontSize: '11px', fontWeight: 'bold' },
      });
    }
    if (startPlace && endPlace) drawRoute();
  }, [startPlace, endPlace, drawRoute]);

  function clearRoute() {
    setStartPlace(null);
    setEndPlace(null);
    setStartVal('');
    setEndVal('');
    setRouteInfo(null);
    setSelectedCar(null);
    if (startMarker.current) startMarker.current.setMap(null);
    if (endMarker.current)   endMarker.current.setMap(null);
    if (directionsRenderer.current) directionsRenderer.current.setDirections({ routes: [] });
    if (startInputRef.current) startInputRef.current.value = '';
    if (endInputRef.current)   endInputRef.current.value   = '';
    mapInstance.current?.setCenter({ lat: 37.0, lng: 35.3 });
    mapInstance.current?.setZoom(6);
  }

  return (
    <div className="cr-page">

      {/* ── TOPBAR ── */}
      <div className="cr-topbar">
        <button className="cr-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="cr-topbar-center">
          <span className="cr-topbar-title">Create Route</span>
        </div>
        <div className="cr-topbar-right"/>
      </div>

      <div className="cr-body">

        {/* ── LEFT PANEL ── */}
        <div className="cr-panel">

          {/* route inputs */}
          <div className="cr-section">
            <div className="cr-section-label">ROUTE</div>

            <div className="cr-input-group">
              <div className="cr-input-row">
                <div className="cr-input-dot cr-dot-green"/>
                <div className="cr-input-wrap">
                  <label className="cr-input-label">Starting point</label>
                  <input
                    ref={startInputRef}
                    className="cr-input"
                    type="text"
                    placeholder="Search starting location..."
                    value={startVal}
                    onChange={e => setStartVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="cr-connector-line"/>

              <div className="cr-input-row">
                <div className="cr-input-dot cr-dot-dark"/>
                <div className="cr-input-wrap">
                  <label className="cr-input-label">Destination</label>
                  <input
                    ref={endInputRef}
                    className="cr-input"
                    type="text"
                    placeholder="Search destination..."
                    value={endVal}
                    onChange={e => setEndVal(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {startVal || endVal ? (
              <button className="cr-clear" onClick={clearRoute}>✕ Clear route</button>
            ) : null}
          </div>

          {/* route info pill */}
          {routeInfo && (
            <div className="cr-route-info">
              <div className="cr-route-info-item">
                <span className="cr-route-info-icon">↔</span>
                <div>
                  <span className="cr-route-info-val">{routeInfo.distance}</span>
                  <span className="cr-route-info-sub">Total distance</span>
                </div>
              </div>
              <div className="cr-route-info-divider"/>
              <div className="cr-route-info-item">
                <span className="cr-route-info-icon">⏱</span>
                <div>
                  <span className="cr-route-info-val">{routeInfo.duration}</span>
                  <span className="cr-route-info-sub">Est. drive time</span>
                </div>
              </div>
            </div>
          )}

          {/* ── VEHICLE SECTION ── */}
          <div className="cr-section">
            <div className="cr-section-label">YOUR VEHICLE</div>

            {userCars.length === 0 ? (
              <div className="cr-no-car">
                <span className="cr-no-car-icon">◻</span>
                <p className="cr-no-car-text">No vehicle added yet.<br/>Add your EV for accurate range.</p>
                <button className="cr-add-car-btn" onClick={() => navigate('/add-vehicle')}>
                  + Add a Vehicle
                </button>
              </div>
            ) : (
              <div className="cr-car-list">
                {userCars.map((car, i) => (
                  <button
                    key={i}
                    className={`cr-car-item ${selectedCar === i ? 'selected' : ''}`}
                    onClick={() => setSelectedCar(i)}
                  >
                    <div className="cr-car-icon">
                      <svg viewBox="0 0 40 24" width="40" height="24">
                        <rect x="0" y="8" width="40" height="12" rx="3" fill={selectedCar === i ? '#3ddc84' : '#1a1a2e'}/>
                        <path d="M6 8 Q9 2 13 2 L27 2 Q33 2 35 8Z" fill={selectedCar === i ? '#2ab870' : '#141428'}/>
                        <path d="M8 7.5 Q10.5 3 13 3 L26 3 Q31 3 33 7.5Z" fill="#4a9fd4" opacity="0.8"/>
                        <circle cx="9"  cy="20" r="4" fill="#111"/><circle cx="9"  cy="20" r="2" fill="#444"/>
                        <circle cx="31" cy="20" r="4" fill="#111"/><circle cx="31" cy="20" r="2" fill="#444"/>
                        <circle cx="1"  cy="13" r="1.5" fill={selectedCar === i ? '#fff' : '#3ddc84'}/>
                      </svg>
                    </div>
                    <div className="cr-car-info">
                      <span className="cr-car-name">{car.make} {car.model}</span>
                      <span className="cr-car-range">{car.range ? `${car.range} km range` : 'Range not set'}</span>
                    </div>
                    {selectedCar === i && <span className="cr-car-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── CALCULATE BUTTON ── */}
          <button
            className={`cr-calculate ${startPlace && endPlace ? 'active' : ''}`}
            disabled={!startPlace || !endPlace}
          >
            ⚡ CALCULATE ROUTE
          </button>

          {mapsError && <p className="cr-error">{mapsError}</p>}
        </div>

        {/* ── MAP ── */}
        <div className="cr-map-wrap">
          {!mapsLoaded && !mapsError && (
            <div className="cr-map-loading">
              <span className="cr-loading-dot"/>
              <span>Loading map...</span>
            </div>
          )}
          {mapsError && (
            <div className="cr-map-loading cr-map-error">
              <span>⚠ {mapsError}</span>
            </div>
          )}
          <div ref={mapRef} className="cr-map"/>
        </div>

      </div>
    </div>
  );
}