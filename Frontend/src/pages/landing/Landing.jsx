import { useNavigate } from 'react-router-dom';
import './Landing.css';

const STATS = [
  { value: 'Save 23%', label: 'avg. battery per trip' },
  { value: '#1', label: 'fastest EV routes' },
  { value: '0 queues', label: 'smart stop timing' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-main">EV ROUTER</span>
          <span className="nav-logo-powered">POWERED BY <strong>GreenDrive</strong></span>
        </div>
        <div className="nav-links">
          <a href="#">Plan Route</a>
          <a href="#">Stations</a>
          <a href="#">Community</a>
          <a href="#">Vehicles</a>
        </div>
        <div className="nav-auth">
          <button className="btn-login" onClick={() => navigate('/login')}>LOG IN</button>
          <button className="btn-signup" onClick={() => navigate('/signup')}>SIGN UP</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">

        <svg className="hero-bg-svg" viewBox="0 0 1400 460" preserveAspectRatio="xMidYMid slice">
          <rect width="1400" height="460" fill="#111"/>
          <g stroke="#1e1e1e" strokeWidth="1" fill="none">
            <path d="M0 80  Q350 58  700 82  T1400 74"/>
            <path d="M0 160 Q280 138 600 163 Q920 186 1200 155 T1400 162"/>
            <path d="M0 240 Q400 218 750 244 T1400 234"/>
            <path d="M0 320 Q320 300 660 324 T1400 314"/>
            <path d="M0 400 Q500 380 900 404 T1400 394"/>
            <path d="M90  0 Q104 120 88  460"/>
            <path d="M210 0 Q226 120 208 460"/>
            <path d="M370 0 Q384 160 368 460"/>
            <path d="M530 0 Q546 120 528 460"/>
            <path d="M690 0 Q705 160 688 460"/>
            <path d="M850 0 Q866 120 848 460"/>
            <path d="M1010 0 Q1024 160 1008 460"/>
            <path d="M1170 0 Q1185 120 1168 460"/>
            <path d="M1330 0 Q1344 160 1328 460"/>
          </g>
          <g stroke="#272727" strokeWidth="2" fill="none">
            <path d="M0 200 Q360 178 710 204 T1400 192"/>
            <path d="M470 0 Q486 130 470 460"/>
            <path d="M930 0 Q948 210 928 460"/>
          </g>
          {/* animated green route across hero */}
          <path d="M0 390 Q200 360 400 372 Q620 384 820 358 Q1020 332 1200 348 T1400 338"
            stroke="#3ddc84" strokeWidth="2.5" fill="none"
            strokeDasharray="14 7" strokeLinecap="round" opacity="0.5">
            <animate attributeName="stroke-dashoffset" from="0" to="-210" dur="4s" repeatCount="indefinite"/>
          </path>
          <g fill="#3ddc84">
            <circle cx="400" cy="372" r="4" opacity="0.8">
              <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="820" cy="358" r="4" opacity="0.8">
              <animate attributeName="r" values="4;7;4" dur="2.7s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.7s" repeatCount="indefinite"/>
            </circle>
            <circle cx="1200" cy="348" r="4" opacity="0.8">
              <animate attributeName="r" values="4;7;4" dur="1.9s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.9s" repeatCount="indefinite"/>
            </circle>
          </g>
        </svg>

        <div className="hero-left-fade"/>

        <h1 className="hero-title">
          CHARGE<br/>SMARTER.<br/>DRIVE<br/>FURTHER.
        </h1>

        <div className="hero-right">
          <p className="hero-subtitle">
            Not just a map. The only route planner
            built from the ground up for electric
            vehicles — charging stops included.
          </p>
          <div className="hero-stats">
            {STATS.map((s, i) => (
              <div className="hero-stat" key={i}>
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <button className="btn-hero" onClick={() => navigate('/signup')}>
            START FOR FREE →
          </button>
        </div>

      </section>

      {/* ── FEATURE SECTION ── */}
      <section className="feature-section">

        <div className="feature-photo">
          <svg viewBox="0 0 1200 560" width="100%" height="100%"
            xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ec8e3"/>
                <stop offset="55%" stopColor="#b8dff0"/>
                <stop offset="100%" stopColor="#cce8d8"/>
              </linearGradient>
              <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a4a4a"/>
                <stop offset="100%" stopColor="#2e2e2e"/>
              </linearGradient>
            </defs>
            <rect width="1200" height="560" fill="url(#skyGrad)"/>
            {/* buildings left */}
            <g fill="#5580a0" opacity="0.55">
              <rect x="0"   y="260" width="55"  height="300"/>
              <rect x="60"  y="200" width="75"  height="360"/>
              <rect x="145" y="280" width="40"  height="280"/>
              <rect x="195" y="230" width="65"  height="330"/>
              <rect x="270" y="170" width="90"  height="390"/>
              <rect x="370" y="250" width="50"  height="310"/>
              <rect x="430" y="210" width="70"  height="350"/>
              <rect x="510" y="270" width="45"  height="290"/>
            </g>
            {/* buildings right */}
            <g fill="#5580a0" opacity="0.55">
              <rect x="720"  y="220" width="80"  height="340"/>
              <rect x="810"  y="260" width="50"  height="300"/>
              <rect x="870"  y="190" width="85"  height="370"/>
              <rect x="965"  y="250" width="55"  height="310"/>
              <rect x="1030" y="210" width="75"  height="350"/>
              <rect x="1115" y="270" width="50"  height="290"/>
              <rect x="1170" y="230" width="30"  height="330"/>
            </g>
            {/* windows */}
            <g fill="#87CEEB" opacity="0.45">
              <rect x="72"  y="215" width="10" height="13"/><rect x="90"  y="215" width="10" height="13"/>
              <rect x="108" y="215" width="10" height="13"/><rect x="72"  y="238" width="10" height="13"/>
              <rect x="90"  y="238" width="10" height="13"/><rect x="108" y="238" width="10" height="13"/>
              <rect x="282" y="188" width="14" height="16"/><rect x="304" y="188" width="14" height="16"/>
              <rect x="326" y="188" width="14" height="16"/><rect x="282" y="214" width="14" height="16"/>
              <rect x="304" y="214" width="14" height="16"/><rect x="326" y="214" width="14" height="16"/>
              <rect x="732" y="238" width="12" height="14"/><rect x="752" y="238" width="12" height="14"/>
              <rect x="772" y="238" width="12" height="14"/><rect x="732" y="262" width="12" height="14"/>
              <rect x="884" y="208" width="14" height="16"/><rect x="906" y="208" width="14" height="16"/>
              <rect x="928" y="208" width="14" height="16"/><rect x="884" y="234" width="14" height="16"/>
            </g>
            {/* road */}
            <rect x="0" y="400" width="1200" height="160" fill="url(#roadGrad)"/>
            <rect x="0" y="396" width="1200" height="9" fill="#3a3a3a"/>
            <line x1="0" y1="478" x2="1200" y2="478"
              stroke="#fff" strokeWidth="3.5" strokeDasharray="55 28" opacity="0.3"/>
            {/* EV car */}
            <g transform="translate(490, 338)">
              <rect x="0" y="40" width="260" height="78" rx="12" fill="#1a1a2e"/>
              <path d="M42 40 Q65 6 100 6 L175 6 Q215 6 222 40Z" fill="#141428"/>
              <path d="M50 38 Q70 12 100 12 L172 12 Q200 12 206 38Z" fill="#4a9fd4" opacity="0.85"/>
              <circle cx="52"  cy="118" r="28" fill="#1a1a1a"/>
              <circle cx="52"  cy="118" r="16" fill="#3a3a3a"/>
              <circle cx="52"  cy="118" r="6"  fill="#555"/>
              <circle cx="208" cy="118" r="28" fill="#1a1a1a"/>
              <circle cx="208" cy="118" r="16" fill="#3a3a3a"/>
              <circle cx="208" cy="118" r="6"  fill="#555"/>
              <rect x="248" y="58" width="16" height="8" rx="4" fill="#fffde7" opacity="0.95"/>
              <rect x="248" y="72" width="16" height="5" rx="2.5" fill="#fff9c4" opacity="0.6"/>
              <circle cx="6" cy="68" r="7" fill="#3ddc84" opacity="0.95"/>
              <rect x="0" y="90" width="260" height="4" fill="#3ddc84" opacity="0.4"/>
            </g>
            {/* charging station */}
            <g transform="translate(855, 255)">
              <rect x="0"  y="0"  width="62" height="145" rx="8"  fill="#0f1e2a"/>
              <rect x="7"  y="12" width="48" height="62"  rx="5"  fill="#0a1520"/>
              <rect x="11" y="16" width="40" height="50"  rx="3"  fill="#001a0d"/>
              <text x="31" y="35" textAnchor="middle" fontSize="10" fill="#3ddc84" fontFamily="monospace" fontWeight="bold">EV</text>
              <text x="31" y="48" textAnchor="middle" fontSize="9"  fill="#3ddc84" fontFamily="monospace">CHARGE</text>
              <text x="31" y="63" textAnchor="middle" fontSize="14" fill="#5ff0a0" fontFamily="monospace">⚡</text>
              <circle cx="31" cy="92" r="6" fill="#3ddc84">
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <path d="M31 145 Q26 160 34 172 Q40 180 37 192"
                stroke="#333" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <rect x="-12" y="141" width="86" height="10" rx="5" fill="#0a0a0a"/>
            </g>
            {/* floating bubble */}
            <g transform="translate(810, 210)">
              <rect x="0" y="0" width="126" height="38" rx="7" fill="#111" opacity="0.9"/>
              <text x="63" y="15" textAnchor="middle" fontSize="10" fill="#3ddc84" fontFamily="monospace">⚡ SuperCharger</text>
              <text x="63" y="29" textAnchor="middle" fontSize="9"  fill="#999" fontFamily="monospace">2 min wait · 150kW</text>
            </g>
            {/* animated route line */}
            <path d="M0 418 Q180 402 360 413 Q560 425 660 410 Q820 390 930 404 Q1060 418 1200 408"
              stroke="#3ddc84" strokeWidth="3.5" fill="none"
              strokeDasharray="14 7" strokeLinecap="round" opacity="0.9">
              <animate attributeName="stroke-dashoffset" from="0" to="-210" dur="3s" repeatCount="indefinite"/>
            </path>
            {/* pins */}
            <circle cx="80"   cy="414" r="11" fill="#3ddc84"/>
            <text x="80"   y="419" textAnchor="middle" fontSize="10" fill="#0a0f0d" fontWeight="bold">A</text>
            <circle cx="660"  cy="410" r="11" fill="#facc15"/>
            <text x="660"  y="415" textAnchor="middle" fontSize="11" fill="#0a0f0d">⚡</text>
            <circle cx="1120" cy="408" r="11" fill="#3ddc84"/>
            <text x="1120" y="413" textAnchor="middle" fontSize="10" fill="#0a0f0d" fontWeight="bold">B</text>
          </svg>
        </div>

        {/* floating card */}
        <div className="feature-card">
          <div className="feature-card-tag">ROUTE PLANNER</div>
          <h2 className="feature-card-title">Plan Your Own Route</h2>
          <p className="feature-card-desc">
            Set your start and destination, choose your vehicle,
            and let EV Router find the fastest path with perfectly
            timed charging stops.
          </p>
          <ul className="feature-card-perks">
            <li><span className="perk-icon">⚡</span>Fastest EV-optimised routes</li>
            <li><span className="perk-icon">🔋</span>Save up to 23% battery per trip</li>
            <li><span className="perk-icon">⏱</span>Avoid charging queues automatically</li>
          </ul>
          <button className="feature-cta" onClick={() => navigate('/signup')}>
            CREATE ROUTE
          </button>
        </div>

      </section>

    </div>
  );
}