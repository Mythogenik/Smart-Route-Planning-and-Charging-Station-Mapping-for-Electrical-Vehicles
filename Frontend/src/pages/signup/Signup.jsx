import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', phone: ''
  });
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
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ email: result.error });
        setLoading(false);
      }
    }, 600);
  }

  const strength = !form.password ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
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
              <path d="M60  0 Q72  200 58  900"/>
              <path d="M160 0 Q175 300 158 900"/>
              <path d="M280 0 Q295 200 278 900"/>
              <path d="M400 0 Q415 300 398 900"/>
              <path d="M520 0 Q535 200 518 900"/>
              <path d="M630 0 Q645 300 628 900"/>
              <path d="M0 0 Q200 180 350 300 Q500 420 700 380"/>
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
            </g>
            <g fill="#3ddc84">
              <circle cx="160" cy="460" r="6">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="400" cy="580" r="5">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.9s" repeatCount="indefinite"/>
              </circle>
              <circle cx="560" cy="300" r="7">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.6s" repeatCount="indefinite"/>
              </circle>
              <circle cx="280" cy="720" r="5">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
              </circle>
            </g>
          </svg>

          <div className="auth-map-content">
            <h2 className="auth-map-title">JOIN THE<br/>SMARTER<br/>GRID.</h2>
            <p className="auth-map-sub">Plan routes. Find charge. Drive further.</p>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-box">
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">
              Already have an account? <Link to="/login" className="auth-link">Log in</Link>
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
                      {[1,2,3].map(i => (
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