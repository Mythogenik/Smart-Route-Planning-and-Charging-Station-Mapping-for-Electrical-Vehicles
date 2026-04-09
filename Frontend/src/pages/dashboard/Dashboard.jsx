import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'routes',    icon: '⟶', label: 'My Routes'  },
  { id: 'stations',  icon: '⚡', label: 'Stations'   },
  { id: 'vehicles',  icon: '◻', label: 'My Vehicles' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [activeNav, setActiveNav]       = useState('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');
  const initials = [currentUser?.firstName?.[0], currentUser?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'EV';

  return (
    <div className="dashboard">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">

        {/* logo */}
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill="#3ddc84"/>
            <rect x="2"    y="17"   width="28" height="9"   rx="2.5" fill="#111"/>
            <path d="M6 17 Q8.5 10 12 10 L20 10 Q24 10 25 17Z"       fill="#0d0d1a"/>
            <path d="M7.5 16.5 Q9.5 11.5 12 11.5 L19.5 11.5 Q22.5 11.5 23.5 16.5Z" fill="#4a9fd4" opacity="0.9"/>
            <circle cx="7.5"  cy="26" r="3.5" fill="#0a0a0a"/>
            <circle cx="7.5"  cy="26" r="2"   fill="#333"/>
            <circle cx="24.5" cy="26" r="3.5" fill="#0a0a0a"/>
            <circle cx="24.5" cy="26" r="2"   fill="#333"/>
            <circle cx="2.5"  cy="21" r="1.5" fill="#fff"/>
            <rect   x="2"     y="22.5" width="28" height="1" rx="0.5" fill="#fff" opacity="0.4"/>
          </svg>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-main">EV ROUTER</span>
            <span className="sidebar-logo-sub">Smart Route Planner</span>
          </div>
        </div>

        {/* nav */}
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
              {activeNav === item.id && <span className="sidebar-nav-pip"/>}
            </button>
          ))}
        </nav>

        {/* quick stats */}
        <div className="sidebar-stats">
          <span className="sidebar-section-label">YOUR STATS</span>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Routes planned</span>
            <span className="sidebar-stat-val">0</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Stations saved</span>
            <span className="sidebar-stat-val">0</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="sidebar-stat-label">Battery saved</span>
            <span className="sidebar-stat-val">—</span>
          </div>
        </div>

        {/* account block — bottom of sidebar */}
        <div className="sidebar-account" ref={dropdownRef}>
          <button
            className="sidebar-account-btn"
            onClick={() => setDropdownOpen(p => !p)}
          >
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
              <div className="dropdown-divider"/>
              <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                <span>↩</span> Log Out
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main">

        {/* topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'routes'    && 'My Routes'}
              {activeNav === 'stations'  && 'Stations'}
              {activeNav === 'vehicles'  && 'My Vehicles'}
              {activeNav === 'account'   && 'Account Info'}
            </h1>
            <span className="topbar-greeting">
              Welcome back, {currentUser?.firstName || currentUser?.email?.split('@')[0] || 'driver'} 👋
            </span>
          </div>
          <button className="btn-create-route" onClick={() => setActiveNav('routes')}>
            + CREATE ROUTE
          </button>
        </div>

        {/* ── DASHBOARD VIEW ── */}
        {activeNav === 'dashboard' && (
          <div className="content">

            {/* stat cards row */}
            <div className="stat-cards">
              {[
                { label: 'Total Routes',      value: '0',   icon: '⟶', sub: 'No routes yet'       },
                { label: 'Charging Stops',    value: '0',   icon: '⚡', sub: 'Across all routes'   },
                { label: 'Battery Saved',     value: '—',   icon: '🔋', sub: 'Est. savings'        },
                { label: 'Stations Nearby',   value: '—',   icon: '◉',  sub: 'Enable location'     },
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

            {/* map placeholder */}
            <div className="map-area">
              <div className="map-area-header">
                <span className="map-area-title">Route Map</span>
                <span className="map-area-hint">Plan your first route to see it here</span>
              </div>

              <div className="map-illustration">
                <svg viewBox="0 0 900 400" width="100%" height="100%"
                  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <linearGradient id="dbSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#daeef8"/>
                      <stop offset="100%" stopColor="#e8f5e9"/>
                    </linearGradient>
                    <linearGradient id="dbRoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#555"/>
                      <stop offset="100%" stopColor="#333"/>
                    </linearGradient>
                  </defs>

                  {/* sky */}
                  <rect width="900" height="400" fill="url(#dbSky)"/>

                  {/* buildings */}
                  <g fill="#7aa8c0" opacity="0.4">
                    <rect x="0"   y="180" width="40"  height="220"/>
                    <rect x="45"  y="140" width="55"  height="260"/>
                    <rect x="108" y="200" width="30"  height="200"/>
                    <rect x="145" y="160" width="48"  height="240"/>
                    <rect x="200" y="120" width="65"  height="280"/>
                    <rect x="275" y="175" width="38"  height="225"/>
                    <rect x="320" y="150" width="52"  height="250"/>

                    <rect x="540" y="155" width="58"  height="245"/>
                    <rect x="608" y="185" width="38"  height="215"/>
                    <rect x="654" y="135" width="62"  height="265"/>
                    <rect x="725" y="178" width="42"  height="222"/>
                    <rect x="776" y="155" width="55"  height="245"/>
                    <rect x="840" y="195" width="35"  height="205"/>
                    <rect x="882" y="165" width="18"  height="235"/>
                  </g>

                  {/* road */}
                  <rect x="0" y="290" width="900" height="110" fill="url(#dbRoad)"/>
                  <rect x="0" y="287" width="900" height="7"   fill="#3a3a3a"/>
                  <line x1="0" y1="342" x2="900" y2="342"
                    stroke="#fff" strokeWidth="2.5" strokeDasharray="40 20" opacity="0.25"/>

                  {/* car */}
                  <g transform="translate(370, 248)">
                    <rect x="0"  y="28" width="160" height="50" rx="8"  fill="#1a1a2e"/>
                    <path d="M26 28 Q40 4 62 4 L108 4 Q132 4 136 28Z"   fill="#141428"/>
                    <path d="M31 27 Q43 8  62 8  L105 8  Q124 8  129 27Z" fill="#4a9fd4" opacity="0.85"/>
                    <circle cx="32"  cy="78" r="18" fill="#1a1a1a"/>
                    <circle cx="32"  cy="78" r="10" fill="#3a3a3a"/>
                    <circle cx="32"  cy="78" r="4"  fill="#555"/>
                    <circle cx="128" cy="78" r="18" fill="#1a1a1a"/>
                    <circle cx="128" cy="78" r="10" fill="#3a3a3a"/>
                    <circle cx="128" cy="78" r="4"  fill="#555"/>
                    <rect x="152" y="38" width="10" height="6" rx="3" fill="#fffde7" opacity="0.95"/>
                    <rect x="152" y="48" width="10" height="4" rx="2" fill="#fff9c4" opacity="0.6"/>
                    <circle cx="4" cy="44" r="5" fill="#3ddc84" opacity="0.95"/>
                    <rect x="0" y="57" width="160" height="3" fill="#3ddc84" opacity="0.4"/>
                  </g>

                  {/* charging station */}
                  <g transform="translate(640, 195)">
                    <rect x="0"  y="0"   width="44" height="96" rx="6" fill="#0f1e2a"/>
                    <rect x="5"  y="9"   width="34" height="44" rx="4" fill="#0a1520"/>
                    <rect x="8"  y="12"  width="28" height="34" rx="2" fill="#001a0d"/>
                    <text x="22" y="26" textAnchor="middle" fontSize="7"  fill="#3ddc84" fontFamily="monospace" fontWeight="bold">EV</text>
                    <text x="22" y="36" textAnchor="middle" fontSize="6"  fill="#3ddc84" fontFamily="monospace">CHARGE</text>
                    <text x="22" y="47" textAnchor="middle" fontSize="10" fill="#5ff0a0" fontFamily="monospace">⚡</text>
                    <circle cx="22" cy="63" r="4" fill="#3ddc84" opacity="0.9"/>
                    <rect x="-8" y="93" width="60" height="7" rx="3" fill="#0a0a0a"/>
                  </g>

                  {/* empty state overlay */}
                  <g>
                    <rect x="310" y="100" width="280" height="110" rx="10" fill="#fff" opacity="0.92"/>
                    <text x="450" y="133" textAnchor="middle" fontSize="22" fill="#3ddc84">⚡</text>
                    <text x="450" y="158" textAnchor="middle" fontSize="14" fill="#111" fontFamily="DM Sans, sans-serif" fontWeight="700">No routes yet</text>
                    <text x="450" y="178" textAnchor="middle" fontSize="11" fill="#888" fontFamily="DM Sans, sans-serif">Hit "Create Route" to plan your first trip</text>
                  </g>

                  {/* dashed route placeholder */}
                  <path d="M60 300 Q200 282 370 295 Q500 305 640 282 Q750 264 880 272"
                    stroke="#3ddc84" strokeWidth="2.5" fill="none"
                    strokeDasharray="10 6" strokeLinecap="round" opacity="0.35"/>
                </svg>
              </div>
            </div>

          </div>
        )}

        {/* ── MY ROUTES VIEW ── */}
        {activeNav === 'routes' && (
          <div className="content">
            <div className="empty-panel">
              <div className="empty-icon">⟶</div>
              <h2 className="empty-title">No routes planned yet</h2>
              <p className="empty-desc">
                Create your first route and it will appear here.<br/>
                EV Router will optimise your charging stops automatically.
              </p>
              <button className="btn-create-route-lg">+ CREATE YOUR FIRST ROUTE</button>
            </div>
          </div>
        )}

        {/* ── STATIONS VIEW ── */}
        {activeNav === 'stations' && (
          <div className="content">
            <div className="empty-panel">
              <div className="empty-icon">⚡</div>
              <h2 className="empty-title">Charging stations</h2>
              <p className="empty-desc">
                Station search and filtering will appear here.<br/>
                Filter by network, connector type, and live availability.
              </p>
              <button className="btn-create-route-lg">FIND STATIONS NEAR ME</button>
            </div>
          </div>
        )}

        {/* ── VEHICLES VIEW ── */}
        {activeNav === 'vehicles' && (
          <div className="content">
            <div className="empty-panel">
              <div className="empty-icon">◻</div>
              <h2 className="empty-title">No vehicles added</h2>
              <p className="empty-desc">
                Add your EV to get accurate range calculations<br/>
                and personalised charging recommendations.
              </p>
              <button className="btn-create-route-lg">+ ADD MY VEHICLE</button>
            </div>
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