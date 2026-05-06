import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiPurchase } from '../../utils/api';
import './Payment.css';

const PACKAGES = [
  { id: '10',        routes: '10 Routes',        price: '$20',  per: '$2.00 / route',  badge: null           },
  { id: '30',        routes: '30 Routes',        price: '$55',  per: '$1.83 / route',  badge: 'SAVE 8%'      },
  { id: '50',        routes: '50 Routes',        price: '$90',  per: '$1.80 / route',  badge: 'SAVE 10%'     },
  { id: 'unlimited', routes: 'Unlimited Routes', price: '$200', per: 'No limits ever', badge: 'BEST VALUE'   },
];

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

export default function Payment() {
  const navigate = useNavigate();
  const { currentUser, updateRoutesRemaining } = useAuth();

  const [selected, setSelected]   = useState('30');
  const [cardNum,  setCardNum]    = useState('');
  const [name,     setName]       = useState('');
  const [expiry,   setExpiry]     = useState('');
  const [cvv,      setCvv]        = useState('');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState(false);

  const remaining = currentUser?.routesRemaining ?? 2;
  const isBlocked = remaining === 0;

  async function handlePurchase() {
    if (!name.trim() || cardNum.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) {
      setError('Please fill in all card details correctly.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await apiPurchase(selected);
      updateRoutesRemaining(result.routesRemaining ?? (selected === 'unlimited' ? -1 : parseInt(selected)));
      setSuccess(true);
    } catch (e) {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const pkg = PACKAGES.find(p => p.id === selected);
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Purchase Successful</h2>
          <p>{pkg.routes} added to your account.</p>
          <button className="btn-payment-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">

        {/* Header */}
        <div className="payment-header">
          <button className="payment-back" onClick={() => navigate('/dashboard')}>← Back</button>
          <div className="payment-header-text">
            <h1>Top Up Routes</h1>
            <p>
              {isBlocked
                ? 'You\'ve used all your free routes. Pick a package to continue.'
                : `You have ${remaining === -1 ? 'unlimited' : remaining} route${remaining !== 1 ? 's' : ''} remaining.`}
            </p>
          </div>
        </div>

        <div className="payment-body">

          {/* Package selector */}
          <div className="payment-section">
            <h2 className="payment-section-title">Choose a Package</h2>
            <div className="packages-grid">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  className={`package-card ${selected === pkg.id ? 'selected' : ''}`}
                  onClick={() => setSelected(pkg.id)}
                >
                  {pkg.badge && <span className="package-badge">{pkg.badge}</span>}
                  <span className="package-routes">{pkg.routes}</span>
                  <span className="package-price">{pkg.price}</span>
                  <span className="package-per">{pkg.per}</span>
                  {selected === pkg.id && <span className="package-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Card form */}
          <div className="payment-section">
            <h2 className="payment-section-title">Card Details</h2>
            <div className="card-form">
              <div className="card-field card-field--full">
                <label>Card Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={e => setCardNum(formatCard(e.target.value))}
                  maxLength={19}
                />
              </div>
              <div className="card-field card-field--full">
                <label>Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="card-field">
                <label>Expiry Date</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="card-field">
                <label>CVV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Summary + submit */}
          <div className="payment-section payment-summary">
            <div className="summary-row">
              <span>{PACKAGES.find(p => p.id === selected)?.routes}</span>
              <span className="summary-price">{PACKAGES.find(p => p.id === selected)?.price}</span>
            </div>
            {error && <p className="payment-error">{error}</p>}
            <button
              className="btn-payment-primary"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? 'Processing…' : 'Process Purchase'}
            </button>
            <p className="payment-disclaimer">
              This is a simulated payment. No real charge will be made.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}