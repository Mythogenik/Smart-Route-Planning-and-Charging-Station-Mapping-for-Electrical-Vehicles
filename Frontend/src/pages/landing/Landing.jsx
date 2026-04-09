import { useNavigate } from 'react-router-dom';
import './Landing.css';

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
        <svg className="hero-bg-svg" viewBox="0 0 1400 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="1400" height="420" fill="#1a1a1a"/>
          <g stroke="#2a2a2a" strokeWidth="1.5" fill="none">
            <path d="M0 60 Q350 40 700 65 T1400 55"/>
            <path d="M0 140 Q200 120 500 145 Q800 165 1100 138 T1400 148"/>
            <path d="M0 220 Q400 200 750 225 T1400 215"/>
            <path d="M0 300 Q300 285 650 305 T1400 295"/>
            <path d="M0 370 Q500 355 900 375 T1400 365"/>
            <path d="M80 0 Q95 100 78 420"/>
            <path d="M200 0 Q215 100 198 420"/>
            <path d="M360 0 Q372 150 355 420"/>
            <path d="M520 0 Q535 100 518 420"/>
            <path d="M680 0 Q692 150 676 420"/>
            <path d="M840 0 Q855 100 838 420"/>
            <path d="M1000 0 Q1012 150 996 420"/>
            <path d="M1160 0 Q1175 100 1158 420"/>
            <path d="M1320 0 Q1332 150 1316 420"/>
            <path d="M0 0 Q200 80 360 140 Q520 200 680 220 Q900 245 1100 210 T1400 180"/>
            <path d="M0 420 Q300 360 520 300 Q740 240 900 300 T1400 280"/>
          </g>
          <g stroke="#333" strokeWidth="2.5" fill="none">
            <path d="M0 180 Q350 160 700 185 T1400 170"/>
            <path d="M460 0 Q480 120 465 420"/>
            <path d="M920 0 Q945 200 918 420"/>
          </g>
          <g fill="#2e2e2e">
            <circle cx="200" cy="140" r="4"/>
            <circle cx="360" cy="220" r="4"/>
            <circle cx="520" cy="140" r="4"/>
            <circle cx="680" cy="300" r="4"/>
            <circle cx="840" cy="140" r="4"/>
            <circle cx="1000" cy="220" r="4"/>
            <circle cx="1160" cy="300" r="4"/>
          </g>
        </svg>

        <div className="hero-left-fade"/>
        <h1 className="hero-title">CHARGE<br/>SMARTER.<br/>DRIVE<br/>FURTHER.</h1>
        <p className="hero-subtitle">
          Plan your journey, locate charging stations,
          and eliminate range anxiety — from your
          neighbourhood to across the country
          with EV Router.
        </p>
      </section>

      {/* ── FEATURE SECTION ── */}
      <section className="feature-section">
        <div className="feature-card">
          <h2 className="feature-card-title">Plan Your Own Route</h2>
          <p className="feature-card-desc">
            Set your start and destination, choose your vehicle,
            and let EV Router calculate the most efficient path
            with optimised charging stops along the way.
          </p>
          <button className="feature-cta" onClick={() => navigate('/signup')}>
            CREATE ROUTE
          </button>
        </div>

        <div className="feature-photo">
          <svg viewBox="0 0 680 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#87CEEB"/>
                <stop offset="60%" stopColor="#b8dff0"/>
                <stop offset="100%" stopColor="#d0e8c0"/>
              </linearGradient>
              <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#555"/>
                <stop offset="100%" stopColor="#333"/>
              </linearGradient>
            </defs>
            <rect width="680" height="480" fill="url(#skyGrad)"/>
            <rect x="0" y="340" width="680" height="140" fill="url(#roadGrad)"/>
            <rect x="0" y="336" width="680" height="8" fill="#444"/>
            <g stroke="#fff" strokeWidth="3" strokeDasharray="40 20" opacity="0.5">
              <line x1="0" y1="410" x2="680" y2="410"/>
            </g>
            <g fill="#2a4a6a" opacity="0.5">
              <rect x="20"  y="200" width="40" height="140"/>
              <rect x="70"  y="160" width="60" height="180"/>
              <rect x="140" y="220" width="30" height="120"/>
              <rect x="180" y="180" width="50" height="160"/>
              <rect x="240" y="140" width="70" height="200"/>
              <rect x="320" y="200" width="40" height="140"/>
              <rect x="370" y="170" width="55" height="170"/>
              <rect x="440" y="190" width="35" height="150"/>
              <rect x="490" y="150" width="65" height="190"/>
              <rect x="570" y="210" width="45" height="130"/>
              <rect x="625" y="185" width="55" height="155"/>
            </g>
            <g transform="translate(160, 285)">
              <rect x="0" y="30" width="220" height="68" rx="10" fill="#1a1a2e"/>
              <path d="M35 30 Q55 0 85 0 L155 0 Q185 0 190 30Z" fill="#16213e"/>
              <path d="M42 28 Q58 6 85 6 L148 6 Q168 6 174 28Z" fill="#4a9fd4" opacity="0.8"/>
              <circle cx="45"  cy="98" r="24" fill="#222"/>
              <circle cx="45"  cy="98" r="13" fill="#555"/>
              <circle cx="45"  cy="98" r="5"  fill="#777"/>
              <circle cx="175" cy="98" r="24" fill="#222"/>
              <circle cx="175" cy="98" r="13" fill="#555"/>
              <circle cx="175" cy="98" r="5"  fill="#777"/>
              <rect x="210" y="46" width="14" height="7" rx="3" fill="#fffde7" opacity="0.9"/>
              <rect x="210" y="58" width="14" height="4" rx="2" fill="#fff9c4" opacity="0.6"/>
              <circle cx="5" cy="56" r="6" fill="#3ddc84" opacity="0.9"/>
              <rect x="0" y="74" width="220" height="3" fill="#3ddc84" opacity="0.4"/>
            </g>
            <g transform="translate(500, 215)">
              <rect x="0" y="0" width="52" height="125" rx="6" fill="#1a2a3a"/>
              <rect x="6" y="10" width="40" height="52" rx="4" fill="#0d1b2a"/>
              <rect x="9" y="13" width="34" height="42" rx="3" fill="#001a0d"/>
              <text x="26" y="30" textAnchor="middle" fontSize="9" fill="#3ddc84" fontFamily="monospace">EV</text>
              <text x="26" y="42" textAnchor="middle" fontSize="8" fill="#3ddc84" fontFamily="monospace">CHARGE</text>
              <text x="26" y="54" textAnchor="middle" fontSize="11" fill="#5ff0a0" fontFamily="monospace">⚡</text>
              <path d="M26 125 Q22 138 30 148 Q37 155 34 163" stroke="#444" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <circle cx="26" cy="78" r="5" fill="#3ddc84">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <rect x="-10" y="123" width="72" height="9" rx="4" fill="#111"/>
            </g>
            <path d="M0 360 Q160 340 280 355 Q390 368 500 342 Q560 328 680 335"
              stroke="#3ddc84" strokeWidth="3" fill="none" strokeDasharray="10 5" strokeLinecap="round"/>
            <circle cx="55"  cy="356" r="9" fill="#3ddc84"/>
            <text x="55" y="360" textAnchor="middle" fontSize="9" fill="#0a0f0d" fontWeight="bold">A</text>
            <circle cx="500" cy="343" r="9" fill="#facc15"/>
            <text x="500" y="347" textAnchor="middle" fontSize="9" fill="#0a0f0d">⚡</text>
            <circle cx="635" cy="337" r="9" fill="#3ddc84"/>
            <text x="635" y="341" textAnchor="middle" fontSize="9" fill="#0a0f0d" fontWeight="bold">B</text>
          </svg>
        </div>
      </section>

    </div>
  );
}