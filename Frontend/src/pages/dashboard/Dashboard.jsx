import { useState, useRef, useEffect } from 'react';
import { apiGetVehicles, apiDeleteVehicle, mapVehicleFromApi, apiGetRoutes, apiDeleteRoute, mapRouteFromApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'routes', icon: '⟶', label: 'My Routes' },
  { id: 'stations', icon: '⚡', label: 'Stations' },
  { id: 'vehicles', icon: '◻', label: 'My Vehicles' },
];

function shadeColor(hex, pct) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
    const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch { return hex; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [activeNav, setActiveNav] = useState('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userCars, setUserCars] = useState([]);
  const dropdownRef = useRef(null);

  const [userRoutes, setUserRoutes] = useState([]);
  const totalStops = userRoutes.reduce((sum, r) => sum + r.stops.length, 0);

  useEffect(() => {
    apiGetRoutes().then(routes => {
      if (routes) setUserRoutes(routes.map(mapRouteFromApi));
    }).catch(() => { });
  }, []);
  // load vehicles from API
  useEffect(() => {
    apiGetVehicles()
      .then(vehicles => { if (vehicles) setUserCars(vehicles.map(mapVehicleFromApi)); })
      .catch(() => { });
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function removeCar(id) {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await apiDeleteVehicle(id);
      setUserCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  }

  function formatDur(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');
  const initials = [currentUser?.firstName?.[0], currentUser?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'EV';

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="#3ddc84" />
            <rect x="2" y="17" width="28" height="9" rx="2.5" fill="#111" />
            <path d="M6 17 Q8.5 10 12 10 L20 10 Q24 10 25 17Z" fill="#0d0d1a" />
            <path d="M7.5 16.5 Q9.5 11.5 12 11.5 L19.5 11.5 Q22.5 11.5 23.5 16.5Z" fill="#4a9fd4" opacity="0.9" />
            <circle cx="7.5" cy="26" r="3.5" fill="#0a0a0a" />
            <circle cx="7.5" cy="26" r="2" fill="#333" />
            <circle cx="24.5" cy="26" r="3.5" fill="#0a0a0a" />
            <circle cx="24.5" cy="26" r="2" fill="#333" />
            <circle cx="2.5" cy="21" r="1.5" fill="#fff" />
            <rect x="2" y="22.5" width="28" height="1" rx="0.5" fill="#fff" opacity="0.4" />
          </svg>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-main">EV ROUTER</span>
            <span className="sidebar-logo-sub">Smart Route Planner</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">MAIN MENU</span>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {activeNav === item.id && <span className="sidebar-nav-pip" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-stats">
          <span className="sidebar-section-label">YOUR STATS</span>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Routes planned</span>
            <span className="sidebar-stat-val">{userRoutes.length}</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Charging stops</span>
            <span className="sidebar-stat-val">{totalStops}</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Vehicles</span>
            <span className="sidebar-stat-val">{userCars.length}</span>
          </div>
        </div>

        <div className="sidebar-account" ref={dropdownRef}>
          <button className="sidebar-account-btn" onClick={() => setDropdownOpen(p => !p)}>
            <div className="account-avatar">{initials}</div>
            <div className="account-info">
              <span className="account-email">{fullName || currentUser?.email || 'Guest'}</span>
              <span className="account-role">Free plan</span>
            </div>
            <span className={`account-chevron ${dropdownOpen ? 'open' : ''}`}>▲</span>
          </button>

          {dropdownOpen && (
            <div className="account-dropdown">
              <button className="dropdown-item" onClick={() => { setActiveNav('vehicles'); setDropdownOpen(false); }}>
                <span>◻</span> Add Vehicle
              </button>
              <button className="dropdown-item" onClick={() => { setActiveNav('routes'); setDropdownOpen(false); }}>
                <span>⟶</span> View Routes
              </button>
              <button className="dropdown-item" onClick={() => { setActiveNav('account'); setDropdownOpen(false); }}>
                <span>○</span> Account Info
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                <span>↩</span> Log Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main">

        <div className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'routes' && 'My Routes'}
              {activeNav === 'stations' && 'Stations'}
              {activeNav === 'vehicles' && 'My Vehicles'}
              {activeNav === 'account' && 'Account Info'}
            </h1>
            <span className="topbar-greeting">
              Welcome back, {currentUser?.firstName || currentUser?.email?.split('@')[0] || 'driver'} 👋
            </span>
          </div>
          <button className="btn-create-route" onClick={() => navigate('/create-route')}>
            + CREATE ROUTE
          </button>
        </div>

        {/* ── DASHBOARD VIEW ── */}
        {activeNav === 'dashboard' && (
          <div className="content">
            <div className="stat-cards">
              {[
                { label: 'Total Routes', value: userRoutes.length, icon: '⟶', sub: userRoutes.length === 0 ? 'No routes yet' : `${userRoutes.length} saved` },
                { label: 'Charging Stops', value: totalStops, icon: '⚡', sub: 'Across all routes' },
                { label: 'km Planned', value: userRoutes.reduce((s, r) => s + r.totalDistanceKm, 0) || '—', icon: '🔋', sub: 'Total distance' },
                { label: 'Vehicles', value: userCars.length || '—', icon: '◻', sub: 'In your garage' },
              ].map((c, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-card-top">
                    <span className="stat-card-icon">{c.icon}</span>
                    <span className="stat-card-value">{c.value}</span>
                  </div>
                  <span className="stat-card-label">{c.label}</span>
                  <span className="stat-card-sub">{c.sub}</span>
                </div>
              ))}
            </div>

            {userRoutes.length === 0 ? (
              <div className="map-area">
                <div className="map-area-header">
                  <span className="map-area-title">Recent Route</span>
                  <span className="map-area-hint">No routes yet</span>
                </div>
                <div className="map-illustration">
                  <svg viewBox="0 0 900 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="dbSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#daeef8" />
                        <stop offset="100%" stopColor="#e8f5e9" />
                      </linearGradient>
                      <linearGradient id="dbRoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#555" />
                        <stop offset="100%" stopColor="#333" />
                      </linearGradient>
                    </defs>
                    <rect width="900" height="400" fill="url(#dbSky)" />
                    <g fill="#7aa8c0" opacity="0.4">
                      <rect x="0" y="180" width="40" height="220" /><rect x="45" y="140" width="55" height="260" />
                      <rect x="108" y="200" width="30" height="200" /><rect x="145" y="160" width="48" height="240" />
                      <rect x="200" y="120" width="65" height="280" /><rect x="275" y="175" width="38" height="225" />
                      <rect x="540" y="155" width="58" height="245" /><rect x="608" y="185" width="38" height="215" />
                      <rect x="654" y="135" width="62" height="265" /><rect x="725" y="178" width="42" height="222" />
                      <rect x="776" y="155" width="55" height="245" /><rect x="840" y="195" width="35" height="205" />
                    </g>
                    <rect x="0" y="290" width="900" height="110" fill="url(#dbRoad)" />
                    <rect x="0" y="287" width="900" height="7" fill="#3a3a3a" />
                    <line x1="0" y1="342" x2="900" y2="342" stroke="#fff" strokeWidth="2.5" strokeDasharray="40 20" opacity="0.25" />
                    <g transform="translate(370, 248)">
                      <rect x="0" y="28" width="160" height="50" rx="8" fill="#1a1a2e" />
                      <path d="M26 28 Q40 4 62 4 L108 4 Q132 4 136 28Z" fill="#141428" />
                      <path d="M31 27 Q43 8 62 8 L105 8 Q124 8 129 27Z" fill="#4a9fd4" opacity="0.85" />
                      <circle cx="32" cy="78" r="18" fill="#1a1a1a" /><circle cx="32" cy="78" r="10" fill="#3a3a3a" /><circle cx="32" cy="78" r="4" fill="#555" />
                      <circle cx="128" cy="78" r="18" fill="#1a1a1a" /><circle cx="128" cy="78" r="10" fill="#3a3a3a" /><circle cx="128" cy="78" r="4" fill="#555" />
                      <rect x="152" y="38" width="10" height="6" rx="3" fill="#fffde7" opacity="0.95" />
                      <circle cx="4" cy="44" r="5" fill="#3ddc84" opacity="0.95" />
                      <rect x="0" y="57" width="160" height="3" fill="#3ddc84" opacity="0.4" />
                    </g>
                    <g transform="translate(640, 195)">
                      <rect x="0" y="0" width="44" height="96" rx="6" fill="#0f1e2a" />
                      <rect x="5" y="9" width="34" height="44" rx="4" fill="#0a1520" />
                      <rect x="8" y="12" width="28" height="34" rx="2" fill="#001a0d" />
                      <text x="22" y="26" textAnchor="middle" fontSize="7" fill="#3ddc84" fontFamily="monospace" fontWeight="bold">EV</text>
                      <text x="22" y="36" textAnchor="middle" fontSize="6" fill="#3ddc84" fontFamily="monospace">CHARGE</text>
                      <text x="22" y="47" textAnchor="middle" fontSize="10" fill="#5ff0a0" fontFamily="monospace">⚡</text>
                      <circle cx="22" cy="63" r="4" fill="#3ddc84" opacity="0.9" />
                      <rect x="-8" y="93" width="60" height="7" rx="3" fill="#0a0a0a" />
                    </g>
                    <g>
                      <rect x="310" y="100" width="280" height="110" rx="10" fill="#fff" opacity="0.92" />
                      <text x="450" y="133" textAnchor="middle" fontSize="22" fill="#3ddc84">⚡</text>
                      <text x="450" y="158" textAnchor="middle" fontSize="14" fill="#111" fontFamily="DM Sans, sans-serif" fontWeight="700">No routes yet</text>
                      <text x="450" y="178" textAnchor="middle" fontSize="11" fill="#888" fontFamily="DM Sans, sans-serif">Hit "Create Route" to plan your first trip</text>
                    </g>
                    <path d="M60 300 Q200 282 370 295 Q500 305 640 282 Q750 264 880 272" stroke="#3ddc84" strokeWidth="2.5" fill="none" strokeDasharray="10 6" strokeLinecap="round" opacity="0.35" />
                  </svg>
                </div>
              </div>
            ) : (() => {
              const last = userRoutes[userRoutes.length - 1];
              return (
                <div className="map-area db-last-route" onClick={() => navigate(`/route/${last.id}`)}>
                  <div className="map-area-header">
                    <span className="map-area-title">Last Route</span>
                    <span className="map-area-hint db-view-link">View on map →</span>
                  </div>
                  <div className="db-route-summary">
                    <div className="db-route-points">
                      <div className="db-route-point">
                        <div className="db-route-dot db-dot-green" />
                        <div>
                          <div className="db-route-point-label">FROM</div>
                          <div className="db-route-point-name">{last.origin.name}</div>
                        </div>
                      </div>
                      {last.stops.map((stop, i) => (
                        <div key={i}>
                          <div className="db-route-line" />
                          <div className="db-route-point">
                            <div className="db-route-dot db-dot-yellow" />
                            <div>
                              <div className="db-route-point-label">⚡ STOP {i + 1} · {stop.distanceFromStartKm} km</div>
                              <div className="db-route-point-name">{stop.name}</div>
                              <div className="db-route-point-addr">{stop.address}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="db-route-line" />
                      <div className="db-route-point">
                        <div className="db-route-dot db-dot-dark" />
                        <div>
                          <div className="db-route-point-label">TO</div>
                          <div className="db-route-point-name">{last.destination.name}</div>
                        </div>
                      </div>
                    </div>
                    <div className="db-route-stats">
                      <div className="db-route-stat">
                        <span className="db-route-stat-val">{last.totalDistanceKm} km</span>
                        <span className="db-route-stat-label">Distance</span>
                      </div>
                      <div className="db-route-stat-div" />
                      <div className="db-route-stat">
                        <span className="db-route-stat-val">{formatDur(last.totalDuration)}</span>
                        <span className="db-route-stat-label">Drive time</span>
                      </div>
                      <div className="db-route-stat-div" />
                      <div className="db-route-stat">
                        <span className="db-route-stat-val">{last.stops.length}</span>
                        <span className="db-route-stat-label">Stops</span>
                      </div>
                      <div className="db-route-stat-div" />
                      <div className="db-route-stat">
                        <span className="db-route-stat-val">{last.car.make}</span>
                        <span className="db-route-stat-label">{last.car.model}</span>
                      </div>
                    </div>
                    {last.stops.length === 0 && (
                      <div className="db-route-no-stops">✓ No charging stops needed for this route</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── MY ROUTES VIEW ── */}
        {activeNav === 'routes' && (
          <div className="content">
            {userRoutes.length === 0 ? (
              <div className="empty-panel">
                <div className="empty-icon">⟶</div>
                <h2 className="empty-title">No routes yet</h2>
                <p className="empty-desc">Create your first route and it will appear here.<br />EV Router will optimise your charging stops automatically.</p>
                <button className="btn-create-route-lg" onClick={() => navigate('/create-route')}>+ CREATE YOUR FIRST ROUTE</button>
              </div>
            ) : (
              <div className="routes-grid">
                {[...userRoutes].reverse().map(route => (
                  <div key={route.id} className="route-card" onClick={() => navigate(`/route/${route.id}`)}>
                    <div className="route-card-header">
                      <div className="route-card-title">
                        <span className="route-origin">{route.origin.name}</span>
                        <span className="route-arrow">→</span>
                        <span className="route-dest">{route.destination.name}</span>
                      </div>
                      <button className="route-delete" onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this route?')) {
                          try {
                            await apiDeleteRoute(route.id);
                            setUserRoutes(prev => prev.filter(r => r.id !== route.id));
                          } catch (err) {
                            console.error('Failed to delete route:', err);
                          }
                        }
                      }} title="Delete">✕</button>
                    </div>
                    <div className="route-card-stats">
                      <div className="route-stat">
                        <span className="route-stat-val">{route.totalDistanceKm}</span>
                        <span className="route-stat-unit">km</span>
                        <span className="route-stat-label">Distance</span>
                      </div>
                      <div className="route-stat-div" />
                      <div className="route-stat">
                        <span className="route-stat-val">{formatDur(route.totalDuration)}</span>
                        <span className="route-stat-label">Drive time</span>
                      </div>
                      <div className="route-stat-div" />
                      <div className="route-stat">
                        <span className="route-stat-val">{route.stops.length}</span>
                        <span className="route-stat-label">Stops</span>
                      </div>
                    </div>
                    <div className="route-card-footer">
                      <div className="route-car">
                        <span className="route-car-dot" />
                        {route.car.make} {route.car.model}
                      </div>
                      <span className="route-date">
                        {new Date(route.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {route.stops.length > 0 && (
                      <div className="route-stops-preview">
                        {route.stops.slice(0, 3).map((stop, i) => (
                          <span key={i} className="route-stop-pill">⚡ {stop.name}</span>
                        ))}
                        {route.stops.length > 3 && (
                          <span className="route-stop-pill route-stop-more">+{route.stops.length - 3} more</span>
                        )}
                      </div>
                    )}
                    <div className="route-card-cta">View on map →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATIONS VIEW ── */}
        {activeNav === 'stations' && (
          <div className="content">
            <div className="empty-panel">
              <div className="empty-icon">⚡</div>
              <h2 className="empty-title">Charging stations</h2>
              <p className="empty-desc">Find nearby charging stations with real-time availability.<br />Filter by network, connector type, and charging speed.</p>
              <button className="btn-create-route-lg" onClick={() => navigate('/stations')}>FIND STATIONS NEAR ME</button>
            </div>
          </div>
        )}

        {/* ── VEHICLES VIEW ── */}
        {activeNav === 'vehicles' && (
          <div className="content">
            <div className="vehicles-header">
              <p className="vehicles-sub">{userCars.length} vehicle{userCars.length !== 1 ? 's' : ''} in your garage</p>
              <button className="btn-create-route" onClick={() => navigate('/add-vehicle')}>+ ADD VEHICLE</button>
            </div>

            {userCars.length === 0 ? (
              <div className="empty-panel">
                <div className="empty-icon">◻</div>
                <h2 className="empty-title">No vehicles added</h2>
                <p className="empty-desc">Add your EV to get accurate range calculations<br />and personalised charging recommendations.</p>
                <button className="btn-create-route-lg" onClick={() => navigate('/add-vehicle')}>+ ADD MY VEHICLE</button>
              </div>
            ) : (
              <div className="vehicles-grid">
                {userCars.map(car => {
                  const body = car.color || '#1a1a2e';
                  const dark = shadeColor(body, -40);
                  const light = shadeColor(body, 40);
                  return (
                    <div className="vehicle-card" key={car.id}>
                      <div className="vehicle-card-stage">
                        <svg viewBox="0 0 320 160" className="vehicle-card-svg">
                          <ellipse cx="160" cy="148" rx="130" ry="10" fill="rgba(0,0,0,0.08)" />
                          <rect x="20" y="80" width="280" height="60" rx="12" fill={body} />
                          <path d="M60 80 Q85 30 115 28 L205 28 Q240 28 252 80Z" fill={dark} />
                          <path d="M72 78 Q93 38 115 36 L200 36 Q228 36 242 78Z" fill="#7ec8e3" opacity="0.75" />
                          <circle cx="75" cy="138" r="22" fill="#111" /><circle cx="75" cy="138" r="13" fill="#333" /><circle cx="75" cy="138" r="5" fill="#555" />
                          <circle cx="245" cy="138" r="22" fill="#111" /><circle cx="245" cy="138" r="13" fill="#333" /><circle cx="245" cy="138" r="5" fill="#555" />
                          <rect x="295" y="90" width="8" height="14" rx="4" fill="#fffde7" opacity="0.95" />
                          <circle cx="24" cy="110" r="5" fill="#3ddc84" opacity="0.95" />
                          <rect x="20" y="108" width="280" height="3" rx="1.5" fill={light} opacity="0.35" />
                          <line x1="160" y1="80" x2="160" y2="138" stroke={dark} strokeWidth="1.5" opacity="0.4" />
                        </svg>
                      </div>
                      <div className="vehicle-card-info">
                        <div className="vehicle-card-header">
                          <div>
                            <div className="vehicle-card-nickname">{car.nickname || `${car.make} ${car.model}`}</div>
                            <div className="vehicle-card-year">{car.year}</div>
                          </div>
                          <button className="vehicle-card-remove" onClick={() => removeCar(car.id)} title="Remove vehicle">✕</button>
                        </div>
                        <div className="vehicle-card-stats">
                          <div className="vehicle-stat">
                            <span className="vehicle-stat-val">{car.range}</span>
                            <span className="vehicle-stat-unit">km</span>
                            <span className="vehicle-stat-label">Range</span>
                          </div>
                          <div className="vehicle-stat-div" />
                          <div className="vehicle-stat">
                            <span className="vehicle-stat-val">{car.battery}</span>
                            <span className="vehicle-stat-unit">kWh</span>
                            <span className="vehicle-stat-label">Battery</span>
                          </div>
                          <div className="vehicle-stat-div" />
                          <div className="vehicle-stat">
                            <span className="vehicle-stat-val">{car.topSpeed || '—'}</span>
                            <span className="vehicle-stat-unit">km/h</span>
                            <span className="vehicle-stat-label">Top Speed</span>
                          </div>
                        </div>
                        <div className="vehicle-card-consumption">
                          <span className="vehicle-consumption-dot" />
                          {car.consumption} kWh/100km consumption
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ACCOUNT VIEW ── */}
        {activeNav === 'account' && (
          <div className="content">
            <div className="account-panel">
              <div className="account-panel-avatar">{initials}</div>
              <h2 className="account-panel-name">{fullName || currentUser?.email}</h2>
              <span className="account-panel-plan">Free Plan</span>
              <div className="account-fields">
                <div className="account-field">
                  <span className="account-field-label">First name</span>
                  <span className="account-field-value">{currentUser?.firstName || '—'}</span>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Last name</span>
                  <span className="account-field-value">{currentUser?.lastName || '—'}</span>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Email</span>
                  <span className="account-field-value">{currentUser?.email}</span>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Phone</span>
                  <span className="account-field-value">{currentUser?.phone || '—'}</span>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Member since</span>
                  <span className="account-field-value">{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Plan</span>
                  <span className="account-field-value account-field-green">Free — unlimited routes</span>
                </div>
              </div>
              <button className="btn-danger" onClick={handleLogout}>LOG OUT</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}