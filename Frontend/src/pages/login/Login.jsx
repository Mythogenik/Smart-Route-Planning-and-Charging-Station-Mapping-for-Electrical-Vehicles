import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ email: form.email, password: form.password });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="auth-page">

      {/* NAV */}
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-main">EV ROUTER</span>
          <span className="nav-logo-powered">POWERED BY <strong>GreenDrive</strong></span>
        </Link>
        <div className="nav-auth">
          <span className="nav-auth-text">Don't have an account?</span>
          <button className="btn-signup" onClick={() => navigate('/signup')}>SIGN UP</button>
        </div>
      </nav>

      {/* SPLIT LAYOUT */}
      <div className="auth-layout">

        {/* LEFT — dark map panel */}
        <div className="auth-map-panel">
          <svg className="auth-map-svg" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
            <rect width="700" height="900" fill="#1a1a1a"/>
            <g stroke="#2a2a2a" strokeWidth="1.5" fill="none">
              <path d="M0 100 Q175 80 350 105 T700 95"/>
              <path d="M0 220 Q200 195 400 225 T700 210"/>
              <path d="M0 340 Q175 320 350 345 T700 330"/>
              <path d="M0 460 Q200 440 400 465 T700 450"/>
              <path d="M0 580 Q175 560 350 585 T700 570"/>
              <path d="M0 700 Q200 680 400 705 T700 690"/>
              <path d="M0 820 Q175 800 350 825 T700 810"/>
              <path d="M60  0 Q72  200 58  900"/>
              <path d="M160 0 Q175 300 158 900"/>
              <path d="M280 0 Q295 200 278 900"/>
              <path d="M400 0 Q415 300 398 900"/>
              <path d="M520 0 Q535 200 518 900"/>
              <path d="M630 0 Q645 300 628 900"/>
              <path d="M0 0 Q200 180 350 300 Q500 420 700 380"/>
              <path d="M0 500 Q300 420 500 520 T700 480"/>
            </g>
            <g stroke="#333" strokeWidth="2.5" fill="none">
              <path d="M0 160 Q350 140 700 165"/>
              <path d="M220 0 Q235 250 218 900"/>
              <path d="M480 0 Q495 250 478 900"/>
            </g>
            <g fill="#2e2e2e">
              <circle cx="160" cy="220" r="4"/>
              <circle cx="280" cy="340" r="4"/>
              <circle cx="400" cy="220" r="4"/>
              <circle cx="520" cy="460" r="4"/>
              <circle cx="160" cy="580" r="4"/>
              <circle cx="400" cy="700" r="4"/>
            </g>
            {/* animated charging pins */}
            <g fill="#3ddc84">
              <circle cx="220" cy="300" r="6">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="480" cy="520" r="5">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="330" cy="680" r="7">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            </g>
          </svg>

          <div className="auth-map-content">
            <h2 className="auth-map-title">WELCOME<br/>BACK.</h2>
            <p className="auth-map-sub">Your next smart route is waiting.</p>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-box">
            <h1 className="auth-form-title">Log in</h1>
            <p className="auth-form-sub">
              New to EV Router? <Link to="/signup" className="auth-link">Create an account</Link>
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Email address</label>
                <input
                  className="field-input"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-input-wrap">
                  <input
                    className="field-input"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="field-eye"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}