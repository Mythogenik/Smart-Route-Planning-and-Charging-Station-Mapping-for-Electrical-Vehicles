import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AddVehicle.css';

const EV_DATABASE = [
  // Tesla
  { make: 'Tesla', model: 'Model 3 Standard Range',   year: 2024, topSpeed: 225, range: 491, battery: 60,  consumption: 14.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Model 3 Long Range',        year: 2024, topSpeed: 225, range: 629, battery: 82,  consumption: 14.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Model 3 Performance',       year: 2024, topSpeed: 262, range: 528, battery: 82,  consumption: 15.5, color: '#cc0000' },
  { make: 'Tesla', model: 'Model Y Standard Range',    year: 2024, topSpeed: 217, range: 430, battery: 60,  consumption: 15.5, color: '#cc0000' },
  { make: 'Tesla', model: 'Model Y Long Range',        year: 2024, topSpeed: 217, range: 533, battery: 82,  consumption: 17.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Model Y Performance',       year: 2024, topSpeed: 250, range: 514, battery: 82,  consumption: 17.5, color: '#cc0000' },
  { make: 'Tesla', model: 'Model S Long Range',        year: 2024, topSpeed: 250, range: 652, battery: 100, consumption: 17.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Model S Plaid',             year: 2024, topSpeed: 322, range: 600, battery: 100, consumption: 18.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Model X Long Range',        year: 2024, topSpeed: 250, range: 543, battery: 100, consumption: 20.0, color: '#cc0000' },
  { make: 'Tesla', model: 'Cybertruck AWD',            year: 2024, topSpeed: 193, range: 547, battery: 123, consumption: 25.0, color: '#aaaaaa' },
  // BMW
  { make: 'BMW', model: 'i3 120Ah',                   year: 2023, topSpeed: 150, range: 285, battery: 42,  consumption: 15.0, color: '#1c69ad' },
  { make: 'BMW', model: 'i4 eDrive40',                year: 2024, topSpeed: 190, range: 590, battery: 84,  consumption: 16.0, color: '#1c69ad' },
  { make: 'BMW', model: 'i4 M50',                     year: 2024, topSpeed: 227, range: 510, battery: 84,  consumption: 18.0, color: '#1c69ad' },
  { make: 'BMW', model: 'iX xDrive40',                year: 2024, topSpeed: 200, range: 425, battery: 71,  consumption: 20.0, color: '#1c69ad' },
  { make: 'BMW', model: 'iX xDrive50',                year: 2024, topSpeed: 200, range: 630, battery: 112, consumption: 20.0, color: '#1c69ad' },
  { make: 'BMW', model: 'iX M60',                     year: 2024, topSpeed: 250, range: 566, battery: 112, consumption: 22.0, color: '#1c69ad' },
  { make: 'BMW', model: 'iX1 xDrive30',               year: 2024, topSpeed: 180, range: 417, battery: 65,  consumption: 17.5, color: '#1c69ad' },
  { make: 'BMW', model: 'i5 eDrive40',                year: 2024, topSpeed: 193, range: 582, battery: 84,  consumption: 16.5, color: '#1c69ad' },
  // Mercedes
  { make: 'Mercedes', model: 'EQA 250',               year: 2024, topSpeed: 160, range: 426, battery: 66,  consumption: 17.0, color: '#222222' },
  { make: 'Mercedes', model: 'EQB 250',               year: 2024, topSpeed: 160, range: 419, battery: 66,  consumption: 17.5, color: '#222222' },
  { make: 'Mercedes', model: 'EQC 400 4MATIC',        year: 2024, topSpeed: 180, range: 400, battery: 85,  consumption: 22.0, color: '#222222' },
  { make: 'Mercedes', model: 'EQE 350',               year: 2024, topSpeed: 210, range: 654, battery: 90,  consumption: 15.7, color: '#222222' },
  { make: 'Mercedes', model: 'EQE SUV 350',           year: 2024, topSpeed: 210, range: 547, battery: 90,  consumption: 19.0, color: '#222222' },
  { make: 'Mercedes', model: 'EQS 450+',              year: 2024, topSpeed: 210, range: 780, battery: 108, consumption: 15.7, color: '#222222' },
  { make: 'Mercedes', model: 'EQS SUV 450',           year: 2024, topSpeed: 210, range: 660, battery: 108, consumption: 19.0, color: '#222222' },
  // Volkswagen
  { make: 'Volkswagen', model: 'ID.3 Pure',           year: 2024, topSpeed: 160, range: 351, battery: 58,  consumption: 15.4, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.3 Pro',            year: 2024, topSpeed: 160, range: 426, battery: 77,  consumption: 15.4, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.4 Pure',           year: 2024, topSpeed: 160, range: 345, battery: 58,  consumption: 17.0, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.4 Pro',            year: 2024, topSpeed: 180, range: 520, battery: 77,  consumption: 17.0, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.4 GTX',            year: 2024, topSpeed: 180, range: 480, battery: 77,  consumption: 19.0, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.5 Pro',            year: 2024, topSpeed: 180, range: 520, battery: 77,  consumption: 17.0, color: '#151f6d' },
  { make: 'Volkswagen', model: 'ID.7 Pro',            year: 2024, topSpeed: 180, range: 621, battery: 77,  consumption: 14.5, color: '#151f6d' },
  // Audi
  { make: 'Audi', model: 'Q4 e-tron 40',             year: 2024, topSpeed: 180, range: 488, battery: 77,  consumption: 18.0, color: '#bb0a21' },
  { make: 'Audi', model: 'Q4 e-tron 50 quattro',     year: 2024, topSpeed: 180, range: 465, battery: 82,  consumption: 19.5, color: '#bb0a21' },
  { make: 'Audi', model: 'Q8 e-tron 50',             year: 2024, topSpeed: 200, range: 491, battery: 95,  consumption: 22.0, color: '#bb0a21' },
  { make: 'Audi', model: 'Q8 e-tron 55',             year: 2024, topSpeed: 200, range: 582, battery: 114, consumption: 22.0, color: '#bb0a21' },
  { make: 'Audi', model: 'e-tron GT',                year: 2024, topSpeed: 245, range: 488, battery: 93,  consumption: 19.0, color: '#bb0a21' },
  { make: 'Audi', model: 'RS e-tron GT',             year: 2024, topSpeed: 250, range: 472, battery: 93,  consumption: 20.0, color: '#bb0a21' },
  // Hyundai
  { make: 'Hyundai', model: 'IONIQ 5 Standard',      year: 2024, topSpeed: 185, range: 385, battery: 58,  consumption: 16.7, color: '#002c5f' },
  { make: 'Hyundai', model: 'IONIQ 5 Long Range RWD',year: 2024, topSpeed: 185, range: 507, battery: 77,  consumption: 16.7, color: '#002c5f' },
  { make: 'Hyundai', model: 'IONIQ 5 Long Range AWD',year: 2024, topSpeed: 185, range: 454, battery: 77,  consumption: 18.5, color: '#002c5f' },
  { make: 'Hyundai', model: 'IONIQ 6 Standard',      year: 2024, topSpeed: 185, range: 429, battery: 53,  consumption: 14.3, color: '#002c5f' },
  { make: 'Hyundai', model: 'IONIQ 6 Long Range RWD',year: 2024, topSpeed: 185, range: 614, battery: 77,  consumption: 14.3, color: '#002c5f' },
  { make: 'Hyundai', model: 'Kona Electric 48kWh',   year: 2024, topSpeed: 167, range: 342, battery: 48,  consumption: 14.7, color: '#002c5f' },
  { make: 'Hyundai', model: 'Kona Electric 65kWh',   year: 2024, topSpeed: 172, range: 514, battery: 65,  consumption: 14.7, color: '#002c5f' },
  // Kia
  { make: 'Kia', model: 'EV6 Standard',              year: 2024, topSpeed: 185, range: 394, battery: 58,  consumption: 16.5, color: '#05141f' },
  { make: 'Kia', model: 'EV6 Long Range RWD',        year: 2024, topSpeed: 185, range: 528, battery: 77,  consumption: 16.5, color: '#05141f' },
  { make: 'Kia', model: 'EV6 GT',                    year: 2024, topSpeed: 260, range: 424, battery: 77,  consumption: 19.5, color: '#05141f' },
  { make: 'Kia', model: 'EV9 Long Range RWD',        year: 2024, topSpeed: 200, range: 541, battery: 99,  consumption: 20.5, color: '#05141f' },
  { make: 'Kia', model: 'EV9 Long Range AWD',        year: 2024, topSpeed: 200, range: 505, battery: 99,  consumption: 22.0, color: '#05141f' },
  { make: 'Kia', model: 'Niro EV',                   year: 2024, topSpeed: 167, range: 460, battery: 65,  consumption: 15.0, color: '#05141f' },
  // Porsche
  { make: 'Porsche', model: 'Taycan',                year: 2024, topSpeed: 230, range: 431, battery: 79,  consumption: 19.0, color: '#d5001c' },
  { make: 'Porsche', model: 'Taycan 4S',             year: 2024, topSpeed: 250, range: 423, battery: 93,  consumption: 21.0, color: '#d5001c' },
  { make: 'Porsche', model: 'Taycan Turbo',          year: 2024, topSpeed: 260, range: 435, battery: 93,  consumption: 22.5, color: '#d5001c' },
  { make: 'Porsche', model: 'Taycan Turbo S',        year: 2024, topSpeed: 260, range: 412, battery: 93,  consumption: 24.0, color: '#d5001c' },
  { make: 'Porsche', model: 'Taycan Cross Turismo',  year: 2024, topSpeed: 250, range: 388, battery: 93,  consumption: 22.0, color: '#d5001c' },
  { make: 'Porsche', model: 'Macan Electric',        year: 2024, topSpeed: 220, range: 516, battery: 100, consumption: 19.5, color: '#d5001c' },
  // Volvo
  { make: 'Volvo', model: 'XC40 Recharge',           year: 2024, topSpeed: 180, range: 423, battery: 79,  consumption: 20.0, color: '#003057' },
  { make: 'Volvo', model: 'C40 Recharge',            year: 2024, topSpeed: 180, range: 476, battery: 79,  consumption: 18.5, color: '#003057' },
  { make: 'Volvo', model: 'EX40',                    year: 2024, topSpeed: 180, range: 423, battery: 79,  consumption: 20.0, color: '#003057' },
  { make: 'Volvo', model: 'EX90 Twin Motor',         year: 2024, topSpeed: 210, range: 580, battery: 111, consumption: 21.5, color: '#003057' },
  // Peugeot / Opel
  { make: 'Peugeot', model: 'e-208',                 year: 2024, topSpeed: 150, range: 362, battery: 51,  consumption: 14.5, color: '#002663' },
  { make: 'Peugeot', model: 'e-2008',                year: 2024, topSpeed: 150, range: 362, battery: 51,  consumption: 16.0, color: '#002663' },
  { make: 'Opel', model: 'Corsa-e',                  year: 2024, topSpeed: 150, range: 349, battery: 51,  consumption: 14.5, color: '#ffcc00' },
  { make: 'Opel', model: 'Mokka-e',                  year: 2024, topSpeed: 150, range: 338, battery: 51,  consumption: 16.0, color: '#ffcc00' },
  { make: 'Opel', model: 'Astra Electric',           year: 2024, topSpeed: 170, range: 416, battery: 54,  consumption: 14.5, color: '#ffcc00' },
  // Renault
  { make: 'Renault', model: 'Zoe R135',              year: 2024, topSpeed: 140, range: 395, battery: 52,  consumption: 14.3, color: '#efdf00' },
  { make: 'Renault', model: 'Megane E-Tech 130',     year: 2024, topSpeed: 160, range: 450, battery: 60,  consumption: 15.0, color: '#efdf00' },
  { make: 'Renault', model: 'Megane E-Tech 220',     year: 2024, topSpeed: 160, range: 450, battery: 60,  consumption: 15.0, color: '#efdf00' },
  { make: 'Renault', model: '5 E-Tech 120',          year: 2024, topSpeed: 150, range: 400, battery: 52,  consumption: 14.0, color: '#efdf00' },
  // Nissan
  { make: 'Nissan', model: 'Leaf 40kWh',             year: 2024, topSpeed: 150, range: 270, battery: 40,  consumption: 15.5, color: '#c3002f' },
  { make: 'Nissan', model: 'Leaf e+ 62kWh',          year: 2024, topSpeed: 157, range: 385, battery: 62,  consumption: 17.0, color: '#c3002f' },
  { make: 'Nissan', model: 'Ariya 63kWh',            year: 2024, topSpeed: 160, range: 403, battery: 63,  consumption: 18.0, color: '#c3002f' },
  { make: 'Nissan', model: 'Ariya 87kWh',            year: 2024, topSpeed: 200, range: 533, battery: 87,  consumption: 18.0, color: '#c3002f' },
  // Togg (Turkish EV)
  { make: 'Togg', model: 'T10X Standard Range',      year: 2024, topSpeed: 180, range: 362, battery: 52,  consumption: 16.0, color: '#e30613' },
  { make: 'Togg', model: 'T10X Long Range',          year: 2024, topSpeed: 180, range: 523, battery: 88,  consumption: 16.0, color: '#e30613' },
  { make: 'Togg', model: 'T10F',                     year: 2024, topSpeed: 180, range: 499, battery: 88,  consumption: 17.5, color: '#e30613' },
];

// group by make for dropdown
const MAKES = [...new Set(EV_DATABASE.map(c => c.make))].sort();

function CarIllustration({ car }) {
  const bodyColor  = car?.color || '#1a1a2e';
  const darkColor  = shadeColor(bodyColor, -40);
  const lightColor = shadeColor(bodyColor, 40);

  return (
    <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" className="car-svg">
      {/* shadow */}
      <ellipse cx="160" cy="148" rx="130" ry="10" fill="rgba(0,0,0,0.12)"/>
      {/* body */}
      <rect x="20" y="80" width="280" height="60" rx="12" fill={bodyColor}/>
      {/* cabin */}
      <path d={`M60 80 Q85 30 115 28 L205 28 Q240 28 252 80Z`} fill={darkColor}/>
      {/* windshield */}
      <path d="M72 78 Q93 38 115 36 L200 36 Q228 36 242 78Z" fill="#7ec8e3" opacity="0.75"/>
      {/* rear window */}
      <path d="M62 78 Q78 50 105 42 L118 42 Q93 52 80 78Z" fill="#7ec8e3" opacity="0.4"/>
      {/* side window */}
      <path d="M245 78 Q238 55 215 42 L202 42 Q222 54 232 78Z" fill="#7ec8e3" opacity="0.4"/>
      {/* wheels */}
      <circle cx="75"  cy="138" r="22" fill="#111"/>
      <circle cx="75"  cy="138" r="13" fill="#333"/>
      <circle cx="75"  cy="138" r="5"  fill="#555"/>
      <circle cx="245" cy="138" r="22" fill="#111"/>
      <circle cx="245" cy="138" r="13" fill="#333"/>
      <circle cx="245" cy="138" r="5"  fill="#555"/>
      {/* wheel arches */}
      <path d="M48 115 Q48 100 75 100 Q102 100 102 115" fill={darkColor}/>
      <path d="M218 115 Q218 100 245 100 Q272 100 272 115" fill={darkColor}/>
      {/* headlight */}
      <rect x="295" y="90" width="8" height="14" rx="4" fill="#fffde7" opacity="0.95"/>
      <rect x="293" y="107" width="8" height="6"  rx="3" fill="#fff9c4" opacity="0.6"/>
      {/* taillight */}
      <rect x="17"  y="90" width="8" height="14" rx="4" fill="#ff4444" opacity="0.8"/>
      {/* charge port */}
      <circle cx="24" cy="110" r="5" fill="#3ddc84" opacity="0.95"/>
      {/* accent stripe */}
      <rect x="20" y="108" width="280" height="3" rx="1.5" fill={lightColor} opacity="0.35"/>
      {/* door lines */}
      <line x1="160" y1="80" x2="160" y2="138" stroke={darkColor} strokeWidth="1.5" opacity="0.5"/>
      <line x1="110" y1="80" x2="110" y2="138" stroke={darkColor} strokeWidth="1"   opacity="0.3"/>
      <line x1="210" y1="80" x2="210" y2="138" stroke={darkColor} strokeWidth="1"   opacity="0.3"/>
    </svg>
  );
}

function shadeColor(hex, percent) {
  try {
    const num = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  } catch { return hex; }
}

export default function AddVehicle() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [selectedMake,  setSelectedMake]  = useState('');
  const [modelQuery,    setModelQuery]    = useState('');
  const [selectedCar,   setSelectedCar]  = useState(null);
  const [showDropdown,  setShowDropdown] = useState(false);
  const [customNickname, setCustomNickname] = useState('');
  const [specs, setSpecs] = useState({
    topSpeed: '', range: '', battery: '', consumption: '',
  });
  const dropdownRef = useRef(null);

  // filtered models based on make + query
  const filteredModels = EV_DATABASE.filter(car => {
    const matchesMake  = !selectedMake || car.make === selectedMake;
    const matchesQuery = !modelQuery   ||
      `${car.make} ${car.model}`.toLowerCase().includes(modelQuery.toLowerCase());
    return matchesMake && matchesQuery;
  });

  // close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function selectCar(car) {
    setSelectedCar(car);
    setModelQuery(`${car.make} ${car.model}`);
    setSelectedMake(car.make);
    setSpecs({
      topSpeed:    String(car.topSpeed),
      range:       String(car.range),
      battery:     String(car.battery),
      consumption: String(car.consumption),
    });
    setShowDropdown(false);
  }

  function handleSpecChange(key, val) {
    setSpecs(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!selectedCar) return;
    const cars = JSON.parse(localStorage.getItem('ev_cars') || '[]');
    const newCar = {
      id:          Date.now(),
      ownerEmail:  currentUser?.email,
      make:        selectedCar.make,
      model:       selectedCar.model,
      year:        selectedCar.year,
      color:       selectedCar.color,
      nickname:    customNickname || `${selectedCar.make} ${selectedCar.model}`,
      topSpeed:    Number(specs.topSpeed),
      range:       Number(specs.range),
      battery:     Number(specs.battery),
      consumption: Number(specs.consumption),
    };
    cars.push(newCar);
    localStorage.setItem('ev_cars', JSON.stringify(cars));
    navigate('/dashboard?tab=vehicles');
  }

  const specFields = [
    { key: 'topSpeed',    label: 'Top Speed',       unit: 'km/h', icon: '⚡',  desc: 'Maximum speed'              },
    { key: 'battery',     label: 'Battery Capacity', unit: 'kWh',  icon: '🔋', desc: 'Total usable battery'       },
    { key: 'range',       label: 'Range',            unit: 'km',   icon: '↔',  desc: 'Full charge range (WLTP)'   },
    { key: 'consumption', label: 'Consumption',      unit: 'kWh/100km', icon: '📊', desc: 'Energy per 100 km'    },
  ];

  return (
    <div className="av-page">

      {/* TOPBAR */}
      <div className="av-topbar">
        <button className="av-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <span className="av-topbar-title">Add Vehicle</span>
        <div style={{ width: 140 }}/>
      </div>

      <div className="av-body">

        {/* LEFT — form */}
        <div className="av-panel">

          {/* make filter */}
          <div className="av-section">
            <div className="av-section-label">MANUFACTURER</div>
            <div className="av-make-grid">
              {MAKES.map(make => (
                <button
                  key={make}
                  className={`av-make-btn ${selectedMake === make ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMake(prev => prev === make ? '' : make);
                    setModelQuery('');
                    setSelectedCar(null);
                    setSpecs({ topSpeed: '', range: '', battery: '', consumption: '' });
                  }}
                >
                  {make}
                </button>
              ))}
            </div>
          </div>

          {/* model search */}
          <div className="av-section">
            <div className="av-section-label">MODEL</div>
            <div className="av-dropdown-wrap" ref={dropdownRef}>
              <div className={`av-search-box ${showDropdown ? 'open' : ''}`}>
                <span className="av-search-icon">🔍</span>
                <input
                  className="av-search-input"
                  type="text"
                  placeholder={selectedMake ? `Search ${selectedMake} models...` : 'Search all EV models...'}
                  value={modelQuery}
                  onChange={e => { setModelQuery(e.target.value); setShowDropdown(true); setSelectedCar(null); }}
                  onFocus={() => setShowDropdown(true)}
                />
                {modelQuery && (
                  <button className="av-search-clear" onClick={() => {
                    setModelQuery(''); setSelectedCar(null);
                    setSpecs({ topSpeed: '', range: '', battery: '', consumption: '' });
                  }}>✕</button>
                )}
              </div>

              {showDropdown && (
                <div className="av-dropdown">
                  {filteredModels.length === 0 ? (
                    <div className="av-dropdown-empty">No models found</div>
                  ) : (
                    filteredModels.slice(0, 12).map((car, i) => (
                      <button key={i} className="av-dropdown-item" onClick={() => selectCar(car)}>
                        <div className="av-dropdown-color" style={{ background: car.color }}/>
                        <div className="av-dropdown-info">
                          <span className="av-dropdown-name">{car.make} {car.model}</span>
                          <span className="av-dropdown-sub">{car.year} · {car.range} km · {car.battery} kWh</span>
                        </div>
                        <span className="av-dropdown-speed">{car.topSpeed} km/h</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* nickname */}
          {selectedCar && (
            <div className="av-section">
              <div className="av-section-label">NICKNAME (optional)</div>
              <input
                className="av-nickname-input"
                type="text"
                placeholder={`e.g. "My Tesla" or "Work Car"`}
                value={customNickname}
                onChange={e => setCustomNickname(e.target.value)}
              />
            </div>
          )}

          {/* specs */}
          {selectedCar && (
            <div className="av-section">
              <div className="av-section-label">SPECIFICATIONS</div>
              <div className="av-specs-grid">
                {specFields.map(f => (
                  <div className="av-spec-card" key={f.key}>
                    <div className="av-spec-top">
                      <span className="av-spec-icon">{f.icon}</span>
                      <span className="av-spec-label">{f.label}</span>
                    </div>
                    <div className="av-spec-input-wrap">
                      <input
                        className="av-spec-input"
                        type="number"
                        value={specs[f.key]}
                        onChange={e => handleSpecChange(f.key, e.target.value)}
                      />
                      <span className="av-spec-unit">{f.unit}</span>
                    </div>
                    <span className="av-spec-desc">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* save button */}
          <button
            className={`av-save ${selectedCar ? 'active' : ''}`}
            disabled={!selectedCar}
            onClick={handleSave}
          >
            + ADD TO MY GARAGE
          </button>

        </div>

        {/* RIGHT — car preview */}
        <div className="av-preview">
          {selectedCar ? (
            <>
              <div className="av-preview-header">
                <span className="av-preview-tag">PREVIEW</span>
                <h2 className="av-preview-name">{selectedCar.make}</h2>
                <h3 className="av-preview-model">{selectedCar.model}</h3>
                <span className="av-preview-year">{selectedCar.year}</span>
              </div>

              <div className="av-car-stage">
                <div className="av-car-bg"/>
                <CarIllustration car={selectedCar}/>
              </div>

              <div className="av-preview-stats">
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">{specs.range}<span className="av-preview-stat-unit"> km</span></span>
                  <span className="av-preview-stat-label">Range</span>
                </div>
                <div className="av-preview-stat-div"/>
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">{specs.battery}<span className="av-preview-stat-unit"> kWh</span></span>
                  <span className="av-preview-stat-label">Battery</span>
                </div>
                <div className="av-preview-stat-div"/>
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">{specs.topSpeed}<span className="av-preview-stat-unit"> km/h</span></span>
                  <span className="av-preview-stat-label">Top Speed</span>
                </div>
              </div>

              <div className="av-preview-badge">
                <span className="av-badge-dot"/>
                <span>Data pre-filled from EV database · editable above</span>
              </div>
            </>
          ) : (
            <div className="av-preview-empty">
              <div className="av-preview-empty-icon">
                <svg viewBox="0 0 120 60" width="120" height="60" opacity="0.15">
                  <rect x="5"  y="20" width="110" height="30" rx="8"  fill="#888"/>
                  <path d="M20 20 Q30 5 42 5 L78 5 Q92 5 98 20Z"      fill="#666"/>
                  <circle cx="28"  cy="52" r="10" fill="#555"/>
                  <circle cx="92"  cy="52" r="10" fill="#555"/>
                </svg>
              </div>
              <p className="av-preview-empty-text">Select a vehicle to see preview</p>
              <p className="av-preview-empty-sub">Choose a manufacturer and model from the left</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}