import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDuration } from '../../utils/RouteEngine';
import { useTheme } from '../../context/ThemeContext';
import { getMapStyles } from '../../utils/mapStyles';
import './ViewRoute.css';

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
    script.id = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load'));
    document.head.appendChild(script);
  });
}

export default function ViewRoute() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const { theme }  = useTheme();
  const mapRef     = useRef(null);
  const mapInst    = useRef(null);
  const watchIdRef = useRef(null);
  const userMarker = useRef(null);

  const [route,        setRoute]        = useState(null);
  const [notFound,     setNotFound]     = useState(false);
  const [trackingGPS,  setTrackingGPS]  = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);

  // Step 1 — load route data from API
  useEffect(() => {
    import('../../utils/api').then(({ apiGetRouteById, mapRouteFromApi }) => {
      apiGetRouteById(id)
        .then(data => {
          if (data) setRoute(mapRouteFromApi(data));
          else setNotFound(true);
        })
        .catch(() => setNotFound(true));
    });
  }, [id]);

  // Step 2 — init map after route state is set and DOM is painted
  useEffect(() => {
    if (!route || mapInst.current) return;

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInst.current) return;

      loadGoogleMaps().then(maps => {
        if (!mapRef.current || mapInst.current) return;

        const map = new maps.Map(mapRef.current, {
          center: { lat: route.origin.lat, lng: route.origin.lng },
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: getMapStyles(theme),
        });
        mapInst.current = map;

        // green route polyline
        const renderer = new maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: { strokeColor: '#3ddc84', strokeWeight: 5, strokeOpacity: 0.9 },
        });
        renderer.setMap(map);

        // draw directions
        new maps.DirectionsService().route(
          {
            origin:      { lat: route.origin.lat,      lng: route.origin.lng      },
            destination: { lat: route.destination.lat, lng: route.destination.lng },
            travelMode:  maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              renderer.setDirections(result);
              const bounds = new maps.LatLngBounds();
              bounds.extend({ lat: route.origin.lat,      lng: route.origin.lng      });
              bounds.extend({ lat: route.destination.lat, lng: route.destination.lng });
              route.stops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
              map.fitBounds(bounds, 60);
            }
          }
        );

        // origin A marker
        new maps.Marker({
          position: { lat: route.origin.lat, lng: route.origin.lng },
          map,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10, fillColor: '#3ddc84', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 2.5,
          },
          label: { text: 'A', color: '#0a0f0d', fontSize: '11px', fontWeight: 'bold' },
          zIndex: 300,
        });

        // destination B marker
        new maps.Marker({
          position: { lat: route.destination.lat, lng: route.destination.lng },
          map,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10, fillColor: '#111', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 2.5,
          },
          label: { text: 'B', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' },
          zIndex: 300,
        });

        // charging stop markers
        route.stops.forEach(stop => {
          const marker = new maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map,
            title: stop.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 11, fillColor: '#facc15', fillOpacity: 1,
              strokeColor: '#fff', strokeWeight: 2,
            },
            label: { text: '⚡', fontSize: '11px' },
            zIndex: 200,
          });
          marker.addListener('click', () => {
            setSelectedStop(stop);
            mapInst.current.panTo({ lat: stop.lat, lng: stop.lng });
            mapInst.current.setZoom(15);
          });
        });

      }).catch(err => console.error('Map load error:', err));
    }, 200);

    return () => clearTimeout(timer);
  }, [route]);

  // update map styles when theme changes
  useEffect(() => {
    if (mapInst.current) {
      mapInst.current.setOptions({ styles: getMapStyles(theme) });
    }
  }, [theme]);

  // cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  function focusStop(stop) {
    setSelectedStop(stop);
    if (mapInst.current) {
      mapInst.current.panTo({ lat: stop.lat, lng: stop.lng });
      mapInst.current.setZoom(15);
    }
  }

  function startTracking() {
    if (!navigator.geolocation) return;
    setTrackingGPS(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (!mapInst.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const maps = window.google.maps;
        if (userMarker.current) {
          userMarker.current.setPosition(loc);
        } else {
          userMarker.current = new maps.Marker({
            position: loc,
            map: mapInst.current,
            title: 'You are here',
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 9, fillColor: '#4285f4', fillOpacity: 1,
              strokeColor: '#fff', strokeWeight: 3,
            },
            zIndex: 999,
          });
        }
        mapInst.current.panTo(loc);
      },
      () => setTrackingGPS(false),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  function stopTracking() {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (userMarker.current) { userMarker.current.setMap(null); userMarker.current = null; }
    setTrackingGPS(false);
  }

  // not found screen
  if (notFound) return (
    <div className="vr-page">
      <div className="vr-topbar">
        <button className="vr-back" onClick={() => navigate('/dashboard')}>← Back</button>
        <span className="vr-topbar-title">Route Not Found</span>
        <div/>
      </div>
      <div className="vr-not-found">
        <span>⟶</span>
        <p>This route doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  if (!route) return null;

  return (
    <div className="vr-page">

      <div className="vr-topbar">
        <button className="vr-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <span className="vr-topbar-title">
          {route.origin.name} → {route.destination.name}
        </span>
        <button
          className={`vr-gps-btn ${trackingGPS ? 'active' : ''}`}
          onClick={trackingGPS ? stopTracking : startTracking}
        >
          {trackingGPS ? '📍 Tracking...' : '📍 Track Me'}
        </button>
      </div>

      <div className="vr-body">

        <div className="vr-panel">

          <div className="vr-summary">
            <div className="vr-summary-row">
              <div className="vr-summary-point">
                <div className="vr-dot vr-dot-green"/>
                <div>
                  <div className="vr-point-label">FROM</div>
                  <div className="vr-point-name">{route.origin.name}</div>
                  <div className="vr-point-addr">{route.origin.address}</div>
                </div>
              </div>
            </div>
            <div className="vr-summary-line"/>
            <div className="vr-summary-row">
              <div className="vr-summary-point">
                <div className="vr-dot vr-dot-dark"/>
                <div>
                  <div className="vr-point-label">TO</div>
                  <div className="vr-point-name">{route.destination.name}</div>
                  <div className="vr-point-addr">{route.destination.address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="vr-stats">
            <div className="vr-stat">
              <span className="vr-stat-val">{route.totalDistanceKm} <span className="vr-stat-unit">km</span></span>
              <span className="vr-stat-label">Distance</span>
            </div>
            <div className="vr-stat-div"/>
            <div className="vr-stat">
              <span className="vr-stat-val">{formatDuration(route.totalDuration)}</span>
              <span className="vr-stat-label">Drive time</span>
            </div>
            <div className="vr-stat-div"/>
            <div className="vr-stat">
              <span className="vr-stat-val">{route.stops.length}</span>
              <span className="vr-stat-label">Stops</span>
            </div>
          </div>

          <div className="vr-car-badge">
            <span className="vr-car-icon">◻</span>
            <div>
              <div className="vr-car-name">{route.car.make} {route.car.model}</div>
              <div className="vr-car-range">Stop every ~{route.safeRangeKm} km</div>
            </div>
          </div>

          <div className="vr-section-label">
            CHARGING STOPS {route.stops.length > 0 ? `(${route.stops.length})` : ''}
          </div>

          {route.stops.length === 0 ? (
            <div className="vr-no-stops">✓ No stops needed — destination is within range!</div>
          ) : (
            <div className="vr-stops-list">
              <div className="vr-timeline-item vr-timeline-origin">
                <div className="vr-timeline-dot vr-tdot-green">A</div>
                <div className="vr-timeline-info">
                  <div className="vr-timeline-name">{route.origin.name}</div>
                  <div className="vr-timeline-sub">Starting point</div>
                </div>
              </div>

              {route.stops.map((stop, i) => (
                <div key={i}>
                  <div className="vr-timeline-line"/>
                  <button
                    className={`vr-timeline-item vr-timeline-stop ${selectedStop === stop ? 'selected' : ''} ${!stop.placeId ? 'vr-stop-missing' : ''}`}
                    onClick={() => focusStop(stop)}
                  >
                    <div className={`vr-timeline-dot ${stop.placeId ? 'vr-tdot-yellow' : 'vr-tdot-red'}`}>{stop.placeId ? '⚡' : '!'}</div>
                    <div className="vr-timeline-info">
                      <div className="vr-timeline-name">{stop.placeId ? stop.name : '⚠ No charger found here'}</div>
                      <div className="vr-timeline-sub">{stop.placeId ? stop.address : 'Consider an alternative charging plan for this area'}</div>
                      <div className="vr-timeline-dist">at {stop.distanceFromStartKm} km · tap to zoom</div>
                    </div>
                    {stop.rating && <span className="vr-stop-rating">★ {stop.rating.toFixed(1)}</span>}
                  </button>
                </div>
              ))}

              <div className="vr-timeline-line"/>
              <div className="vr-timeline-item vr-timeline-dest">
                <div className="vr-timeline-dot vr-tdot-dark">B</div>
                <div className="vr-timeline-info">
                  <div className="vr-timeline-name">{route.destination.name}</div>
                  <div className="vr-timeline-sub">Destination · {route.totalDistanceKm} km</div>
                </div>
              </div>
            </div>
          )}

          <div className="vr-created">
            Saved {new Date(route.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>

        </div>

        <div className="vr-map-wrap">
          <div ref={mapRef} className="vr-map"/>
          {selectedStop && (
            <div className="vr-overlay">
              <div className="vr-overlay-icon">⚡</div>
              <div className="vr-overlay-info">
                <div className="vr-overlay-name">{selectedStop.name}</div>
                <div className="vr-overlay-addr">{selectedStop.address}</div>
              </div>
              <button className="vr-overlay-close" onClick={() => setSelectedStop(null)}>✕</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}