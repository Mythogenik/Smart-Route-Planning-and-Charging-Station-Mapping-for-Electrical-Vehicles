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
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login({ email: form.email, password: form.password });
      if (result.success) { navigate('/dashboard'); }
      else { setError(result.error); setLoading(false); }
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

      <div className="auth-layout">

        {/* LEFT PANEL */}
        <div className="auth-map-panel">

          {/* static map grid — same style as landing hero, no animations */}
          <svg className="auth-map-svg" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
            <rect width="700" height="900" fill="#111"/>
            {/* dim grid */}
            <g stroke="#1e1e1e" strokeWidth="1" fill="none">
              <path d="M0 80  Q175 60  350 82  T700 74"/>
              <path d="M0 180 Q200 158 400 183 T700 172"/>
              <path d="M0 280 Q175 258 350 282 T700 272"/>
              <path d="M0 380 Q200 358 400 383 T700 372"/>
              <path d="M0 480 Q175 458 350 482 T700 472"/>
              <path d="M0 580 Q200 558 400 583 T700 572"/>
              <path d="M0 680 Q175 658 350 682 T700 672"/>
              <path d="M0 780 Q200 758 400 783 T700 772"/>
              <path d="M0 880 Q175 858 350 882 T700 872"/>
              <path d="M60  0 Q74  150 58  900"/>
              <path d="M160 0 Q176 150 158 900"/>
              <path d="M270 0 Q286 150 268 900"/>
              <path d="M380 0 Q396 150 378 900"/>
              <path d="M490 0 Q506 150 488 900"/>
              <path d="M600 0 Q616 150 598 900"/>
            </g>
            {/* brighter accent roads */}
            <g stroke="#252525" strokeWidth="2" fill="none">
              <path d="M0 230 Q350 208 700 233"/>
              <path d="M0 530 Q350 508 700 533"/>
              <path d="M215 0 Q231 200 214 900"/>
              <path d="M485 0 Q501 200 484 900"/>
            </g>
            {/* static charge pin dots */}
            <g fill="#3ddc84" opacity="0.6">
              <circle cx="215" cy="230" r="5"/>
              <circle cx="485" cy="380" r="4"/>
              <circle cx="160" cy="530" r="6"/>
              <circle cx="380" cy="680" r="4"/>
              <circle cx="600" cy="230" r="5"/>
              <circle cx="270" cy="780" r="4"/>
            </g>
            {/* static route line */}
            <path d="M0 760 Q150 730 270 748 Q390 764 485 738 Q570 718 700 730"
              stroke="#3ddc84" strokeWidth="2" fill="none"
              strokeDasharray="12 6" strokeLinecap="round" opacity="0.4"/>
          </svg>

          <div className="auth-map-content">
            <h2 className="auth-map-title">WELCOME<br/>BACK.</h2>
            <p className="auth-map-sub">
              Your next smart route is waiting.<br/>
              Pick up where you left off.
            </p>
            <div className="auth-map-stats">
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">Save 23%</span>
                <span className="auth-map-stat-label">avg. battery per trip</span>
              </div>
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">#1</span>
                <span className="auth-map-stat-label">fastest EV routes</span>
              </div>
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">0 queues</span>
                <span className="auth-map-stat-label">smart stop timing</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="auth-form-panel">
          <div className="auth-form-box">

            <h1 className="auth-form-title">Log in</h1>
            <p className="auth-form-sub">
              New to EV Router?{' '}
              <Link to="/signup" className="auth-link">Create an account</Link>
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Email address</label>
                <input
                  className="field-input"
                  id="email" name="email" type="email"
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
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="field-eye"
                    onClick={() => setShowPassword(p => !p)}>
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