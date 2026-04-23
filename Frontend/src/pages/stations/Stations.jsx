import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stations.css';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google?.maps?.places) { resolve(window.google.maps); return; }

        const existing = document.getElementById('gmap-script');
        if (existing) {
            // script already in DOM, wait for it
            const interval = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(interval);
                    resolve(window.google.maps);
                }
            }, 100);
            setTimeout(() => { clearInterval(interval); reject(new Error('Timeout')); }, 10000);
            return;
        }

        const script = document.createElement('script');
        script.id = 'gmap-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps failed to load'));
        document.head.appendChild(script);
    });
}

const STATUS_COLORS = {
    OPERATIONAL: '#3ddc84',
    CLOSED_TEMPORARILY: '#facc15',
    unknown: '#aaa',
};

export default function Stations() {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const mapInst = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const infoWindowRef = useRef(null);

    const [step, setStep] = useState('permission'); // permission | loading | ready | error
    const [errorMsg, setErrorMsg] = useState('');
    const [location, setLocation] = useState(null);
    const [stations, setStations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [radius, setRadius] = useState(3000);
    const [searching, setSearching] = useState(false);

    // ── ask for location ──────────────────────────────
    function requestLocation() {
        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser.');
            setStep('error');
            return;
        }
        setStep('loading');
        navigator.geolocation.getCurrentPosition(
            pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLocation(loc);
                setStep('ready');        // ← add this line
                setTimeout(() => initMap(loc), 100);
            },
            err => {
                setErrorMsg(
                    err.code === 1
                        ? 'Location access was denied. Please allow location in your browser settings.'
                        : 'Could not get your location. Please try again.'
                );
                setStep('error');
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    }

    // ── init map + search stations ────────────────────
    async function initMap(loc) {
        try {
            await loadGoogleMaps();
            const maps = window.google.maps;

            mapInst.current = new maps.Map(mapRef.current, {
                center: loc,
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8f0' }] },
                    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f4f5f7' }] },
                    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                    { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
                ],
            });

            infoWindowRef.current = new maps.InfoWindow();

            // user location marker
            userMarkerRef.current = new maps.Marker({
                position: loc,
                map: mapInst.current,
                title: 'Your Location',
                icon: {
                    path: maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4285f4',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 3,
                },
                zIndex: 999,
            });

            // accuracy circle
            new maps.Circle({
                map: mapInst.current,
                center: loc,
                radius: 80,
                fillColor: '#4285f4',
                fillOpacity: 0.1,
                strokeColor: '#4285f4',
                strokeOpacity: 0.3,
                strokeWeight: 1,
            });

            searchStations(loc, radius, maps);
        } catch (e) {
            console.error('initMap error:', e);
            setErrorMsg('Could not load Google Maps. Check your API key.');
            setStep('error');
        }
    }

    // ── search for charging stations ─────────────────
    function searchStations(loc, rad, maps) {
        setSearching(true);
        setStations([]);
        clearMarkers();

        const service = new maps.places.PlacesService(mapInst.current);
        service.nearbySearch(
            {
                location: loc,
                radius: rad,
                keyword: 'electric vehicle charging station',
                type: 'establishment',
            },
            (results, status) => {
                setSearching(false);
                if (status === maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    setStations(results);
                    plotMarkers(results, maps);
                } else if (status === maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setStations([]);
                } else {
                    // fallback — show map anyway without pins
                    setStations([]);
                }
            }
        );
    }

    // ── plot station markers ──────────────────────────
    function plotMarkers(results, maps) {
        clearMarkers();
        results.forEach((place, i) => {
            const isOpen = place.opening_hours?.open_now;
            const color = isOpen === true ? '#3ddc84' : isOpen === false ? '#facc15' : '#aaa';

            const marker = new maps.Marker({
                position: place.geometry.location,
                map: mapInst.current,
                title: place.name,
                icon: {
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 1.5,
                    scale: 1.6,
                    anchor: new maps.Point(12, 22),
                },
                label: {
                    text: '⚡',
                    fontSize: '10px',
                },
                zIndex: 100 - i,
            });

            marker.addListener('click', () => {
                setSelected(place);
                mapInst.current.panTo(place.geometry.location);
                mapInst.current.setZoom(16);
            });

            markersRef.current.push(marker);
        });
    }

    function clearMarkers() {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
    }

    function handleRadiusChange(newRadius) {
        setRadius(newRadius);
        if (location && mapInst.current) {
            const maps = window.google.maps;
            mapInst.current.setZoom(newRadius <= 1000 ? 15 : newRadius <= 3000 ? 14 : newRadius <= 5000 ? 13 : 12);
            searchStations(location, newRadius, maps);
        }
    }

    function focusStation(place) {
        setSelected(place);
        if (mapInst.current) {
            mapInst.current.panTo(place.geometry.location);
            mapInst.current.setZoom(16);
        }
    }

    function getRating(place) {
        if (!place.rating) return null;
        return '★'.repeat(Math.round(place.rating)) + '☆'.repeat(5 - Math.round(place.rating));
    }

    const openStatus = (place) => {
        if (place.opening_hours?.open_now === true) return { label: 'Open now', color: '#3ddc84' };
        if (place.opening_hours?.open_now === false) return { label: 'Closed', color: '#e53e3e' };
        return { label: 'Hours unknown', color: '#aaa' };
    };

    return (
        <div className="st-page">

            {/* TOPBAR */}
            <div className="st-topbar">
                <button className="st-back" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <span className="st-topbar-title">Nearby Charging Stations</span>
                <div style={{ width: 160 }} />
            </div>

            {/* ── PERMISSION SCREEN ── */}
            {step === 'permission' && (
                <div className="st-permission">
                    <div className="st-permission-card">
                        <div className="st-permission-icon">📍</div>
                        <h2 className="st-permission-title">Find stations near you</h2>
                        <p className="st-permission-desc">
                            EV Router needs your location to show nearby charging stations.
                            Your location is only used to search the map and is never stored.
                        </p>
                        <button className="st-permission-btn" onClick={requestLocation}>
                            Allow Location Access
                        </button>
                        <button className="st-permission-skip" onClick={() => {
                            const loc = { lat: 41.015, lng: 28.979 };
                            setLocation(loc);
                            setStep('ready');        // ← add this
                            setTimeout(() => initMap(loc), 100);
                        }}>
                            Skip — show Istanbul instead
                        </button>
                    </div>
                </div>
            )}

            {/* ── LOADING ── */}
            {step === 'loading' && (
                <div className="st-loading">
                    <div className="st-loading-pulse" />
                    <p>Getting your location...</p>
                </div>
            )}

            {/* ── ERROR ── */}
            {step === 'error' && (
                <div className="st-permission">
                    <div className="st-permission-card st-error-card">
                        <div className="st-permission-icon">⚠</div>
                        <h2 className="st-permission-title">Location unavailable</h2>
                        <p className="st-permission-desc">{errorMsg}</p>
                        <button className="st-permission-btn" onClick={() => setStep('permission')}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* ── MAIN VIEW ── */}
            {step === 'ready' && (
                <div className="st-body">

                    {/* LEFT PANEL */}
                    <div className="st-panel">

                        {/* radius filter */}
                        <div className="st-section">
                            <div className="st-section-label">SEARCH RADIUS</div>
                            <div className="st-radius-btns">
                                {[500, 1000, 3000, 5000, 10000].map(r => (
                                    <button
                                        key={r}
                                        className={`st-radius-btn ${radius === r ? 'active' : ''}`}
                                        onClick={() => handleRadiusChange(r)}
                                    >
                                        {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* results */}
                        <div className="st-section st-results-section">
                            <div className="st-section-label">
                                {searching
                                    ? 'SEARCHING...'
                                    : `${stations.length} STATION${stations.length !== 1 ? 'S' : ''} FOUND`}
                            </div>

                            {searching && (
                                <div className="st-searching">
                                    <div className="st-search-dots">
                                        <span /><span /><span />
                                    </div>
                                    <p>Looking for charging stations nearby...</p>
                                </div>
                            )}

                            {!searching && stations.length === 0 && (
                                <div className="st-no-results">
                                    <span>⚡</span>
                                    <p>No charging stations found within this radius.<br />Try increasing the search area.</p>
                                </div>
                            )}

                            <div className="st-list">
                                {stations.map((place, i) => {
                                    const status = openStatus(place);
                                    const isSelected = selected?.place_id === place.place_id;
                                    return (
                                        <button
                                            key={place.place_id}
                                            className={`st-station-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => focusStation(place)}
                                        >
                                            <div className="st-station-number">{i + 1}</div>
                                            <div className="st-station-info">
                                                <div className="st-station-name">{place.name}</div>
                                                <div className="st-station-address">{place.vicinity}</div>
                                                <div className="st-station-meta">
                                                    <span className="st-station-status" style={{ color: status.color }}>
                                                        ● {status.label}
                                                    </span>
                                                    {place.rating && (
                                                        <span className="st-station-rating">★ {place.rating.toFixed(1)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && <span className="st-station-selected-pip" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* MAP */}
                    <div className="st-map-wrap">
                        <div ref={mapRef} className="st-map" />

                        {/* selected station overlay */}
                        {selected && (
                            <div className="st-overlay">
                                <div className="st-overlay-header">
                                    <div className="st-overlay-icon">⚡</div>
                                    <div className="st-overlay-info">
                                        <div className="st-overlay-name">{selected.name}</div>
                                        <div className="st-overlay-address">{selected.vicinity}</div>
                                    </div>
                                    <button className="st-overlay-close" onClick={() => setSelected(null)}>✕</button>
                                </div>
                                <div className="st-overlay-row">
                                    <span className="st-overlay-status"
                                        style={{ color: openStatus(selected).color }}>
                                        ● {openStatus(selected).label}
                                    </span>
                                    {selected.rating && (
                                        <span className="st-overlay-rating">
                                            ★ {selected.rating.toFixed(1)}
                                            {selected.user_ratings_total && (
                                                <span className="st-overlay-rating-count"> ({selected.user_ratings_total})</span>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}