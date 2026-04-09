import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters.';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.phone) e.phone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    return e;
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const result = signup({ email: form.email, password: form.password, phone: form.phone });
      if (result.success) { navigate('/'); }
      else { setErrors({ email: result.error }); setLoading(false); }
    }, 600);
  }

  const strength = !form.password ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#e53e3e', '#facc15', '#3ddc84'];

  return (
    <div className="auth-page">

      {/* NAV */}
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-main">EV ROUTER</span>
          <span className="nav-logo-powered">POWERED BY <strong>GreenDrive</strong></span>
        </Link>
        <div className="nav-auth">
          <span className="nav-auth-text">Already have an account?</span>
          <button className="btn-login-outline" onClick={() => navigate('/login')}>LOG IN</button>
        </div>
      </nav>

      <div className="auth-layout">

        {/* LEFT PANEL */}
        <div className="auth-map-panel">

          {/* static map grid */}
          <svg className="auth-map-svg" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
            <rect width="700" height="900" fill="#111"/>
            <g stroke="#1e1e1e" strokeWidth="1" fill="none">
              <path d="M0 80  Q175 60  350 82  T700 74"/>
              <path d="M0 180 Q200 158 400 183 T700 172"/>
              <path d="M0 280 Q175 258 350 282 T700 272"/>
              <path d="M0 380 Q200 358 400 383 T700 372"/>
              <path d="M0 480 Q175 458 350 482 T700 472"/>
              <path d="M0 580 Q200 558 400 583 T700 572"/>
              <path d="M0 680 Q175 658 350 682 T700 672"/>
              <path d="M0 780 Q200 758 400 783 T700 772"/>
              <path d="M60  0 Q74  150 58  900"/>
              <path d="M160 0 Q176 150 158 900"/>
              <path d="M270 0 Q286 150 268 900"/>
              <path d="M380 0 Q396 150 378 900"/>
              <path d="M490 0 Q506 150 488 900"/>
              <path d="M600 0 Q616 150 598 900"/>
            </g>
            <g stroke="#252525" strokeWidth="2" fill="none">
              <path d="M0 130 Q350 108 700 133"/>
              <path d="M0 430 Q350 408 700 433"/>
              <path d="M0 730 Q350 708 700 733"/>
              <path d="M215 0 Q231 200 214 900"/>
              <path d="M485 0 Q501 200 484 900"/>
            </g>
            {/* static pins — different positions from login */}
            <g fill="#3ddc84" opacity="0.6">
              <circle cx="160" cy="280" r="4"/>
              <circle cx="380" cy="130" r="6"/>
              <circle cx="485" cy="480" r="5"/>
              <circle cx="600" cy="380" r="4"/>
              <circle cx="270" cy="630" r="5"/>
              <circle cx="160" cy="780" r="4"/>
              <circle cx="490" cy="730" r="6"/>
            </g>
            {/* two static route lines for variety */}
            <path d="M0 440 Q160 418 270 432 Q380 446 485 420 Q570 400 700 412"
              stroke="#3ddc84" strokeWidth="2" fill="none"
              strokeDasharray="12 6" strokeLinecap="round" opacity="0.35"/>
            <path d="M0 640 Q215 618 380 634 Q490 648 700 628"
              stroke="#3ddc84" strokeWidth="1.5" fill="none"
              strokeDasharray="10 8" strokeLinecap="round" opacity="0.25"/>
          </svg>

          <div className="auth-map-content">
            <h2 className="auth-map-title">JOIN THE<br/>SMARTER<br/>GRID.</h2>
            <p className="auth-map-sub">
              Plan routes. Find charge.<br/>
              Drive further with every trip.
            </p>
            <div className="auth-map-stats">
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">50K+</span>
                <span className="auth-map-stat-label">charging stations mapped</span>
              </div>
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">2M+</span>
                <span className="auth-map-stat-label">routes planned</span>
              </div>
              <div className="auth-map-stat">
                <span className="auth-map-stat-value">Free</span>
                <span className="auth-map-stat-label">always free to start</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="auth-form-panel">
          <div className="auth-form-box">

            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Log in</Link>
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Email address</label>
                <input
                  className={`field-input ${errors.email ? 'field-input--error' : ''}`}
                  id="email" name="email" type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-input-wrap">
                  <input
                    className={`field-input ${errors.password ? 'field-input--error' : ''}`}
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="field-eye"
                    onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {form.password && (
                  <div className="strength-row">
                    <div className="strength-bar">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="strength-seg"
                          style={{ background: i <= strength ? strengthColor[strength] : '#e5e5e5' }}/>
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                <div className="field-input-wrap">
                  <input
                    className={`field-input ${errors.confirmPassword ? 'field-input--error' : ''}`}
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button type="button" className="field-eye"
                    onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="phone">Phone number</label>
                <input
                  className={`field-input ${errors.phone ? 'field-input--error' : ''}`}
                  id="phone" name="phone" type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}