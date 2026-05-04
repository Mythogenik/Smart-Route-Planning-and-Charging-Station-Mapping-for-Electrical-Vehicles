import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AddVehicle.css';

const EV_API_KEY = import.meta.env.VITE_EV_API_KEY;

const MAKE_COLORS = {
  tesla: '#cc0000', bmw: '#1c69ad', mercedes: '#222222', volkswagen: '#151f6d',
  audi: '#bb0a21', hyundai: '#002c5f', kia: '#05141f', porsche: '#d5001c',
  volvo: '#003057', peugeot: '#002663', opel: '#ffcc00', renault: '#efdf00',
  nissan: '#c3002f', togg: '#e30613', ford: '#003478', rivian: '#00a550',
  lucid: '#c8a951', polestar: '#0a0a0a', default: '#1a1a2e',
};

function getColor(make) {
  return MAKE_COLORS[make?.toLowerCase()] || MAKE_COLORS.default;
}

function shadeColor(hex, pct) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (n >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct));
    const b = Math.min(255, Math.max(0, (n & 0xff) + pct));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch { return hex; }
}

const EV_MODELS = {
  Tesla:      ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  BMW:        ['i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX2', 'iX3'],
  Mercedes:   ['EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV'],
  Volkswagen: ['ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz'],
  Audi:       ['Q4 e-tron', 'Q6 e-tron', 'Q8 e-tron', 'e-tron GT', 'RS e-tron GT'],
  Hyundai:    ['IONIQ 5', 'IONIQ 6', 'IONIQ 9', 'Kona Electric'],
  Kia:        ['EV3', 'EV6', 'EV9', 'Niro EV'],
  Porsche:    ['Taycan', 'Taycan Cross Turismo', 'Macan Electric'],
  Volvo:      ['XC40 Recharge', 'C40 Recharge', 'EX30', 'EX40', 'EX90'],
  Peugeot:    ['e-208', 'e-2008', 'e-308', 'e-3008', 'e-5008'],
  Opel:       ['Corsa Electric', 'Mokka Electric', 'Astra Electric', 'Frontera Electric'],
  Renault:    ['Zoe', 'Megane E-Tech', 'Scenic E-Tech', '5 E-Tech', '4 E-Tech'],
  Nissan:     ['Leaf', 'Ariya'],
  Togg:       ['T10X', 'T10F', 'T10S'],
  Ford:       ['Mustang Mach-E', 'Explorer Electric', 'Capri Electric'],
  Rivian:     ['R1T', 'R1S', 'R2'],
  Lucid:      ['Air Pure', 'Air Touring', 'Air Grand Touring', 'Gravity'],
  Polestar:   ['Polestar 2', 'Polestar 3', 'Polestar 4'],
  MG:         ['MG4', 'MG5', 'ZS EV', 'Marvel R'],
  BYD:        ['Atto 3', 'Seal', 'Dolphin', 'Han', 'Tang'],
  Cupra:      ['Born', 'Tavascan'],
  DS:         ['DS 3 E-Tense', 'DS 4 E-Tense'],
  Dacia:      ['Spring'],
  Honda:      ['e', 'e:Ny1'],
  Jaguar:     ['I-PACE'],
  Jeep:       ['Avenger Electric', 'Wrangler 4xe'],
  Lexus:      ['RZ 450e', 'UX 300e'],
  Mini:       ['Cooper SE', 'Countryman E', 'Aceman'],
  Mitsubishi: ['Eclipse Cross PHEV', 'Outlander PHEV'],
  Nio:        ['ES6', 'ES7', 'ES8', 'ET5', 'ET7'],
  Seat:       ['Mii Electric'],
  Skoda:      ['Enyaq iV', 'Enyaq Coupe iV'],
  Smart:      ['#1', '#3'],
  Subaru:     ['Solterra'],
  Toyota:     ['bZ4X', 'Prius PHEV'],
  Xpeng:      ['P7', 'G9', 'G6'],
  Mazda:      ['MX-30'],
  Fiat:       ['500e'],
};

const MAKES = Object.keys(EV_MODELS).sort();

const FALLBACK_SPECS = {
  'Tesla Model 3':           { topSpeed: 225, range: 491, battery: 60,  consumption: 14.0, year: 2024 },
  'Tesla Model Y':           { topSpeed: 217, range: 430, battery: 60,  consumption: 15.5, year: 2024 },
  'Tesla Model S':           { topSpeed: 250, range: 652, battery: 100, consumption: 17.0, year: 2024 },
  'Tesla Model X':           { topSpeed: 250, range: 543, battery: 100, consumption: 20.0, year: 2024 },
  'Tesla Cybertruck':        { topSpeed: 193, range: 547, battery: 123, consumption: 25.0, year: 2024 },
  'BMW i3':                  { topSpeed: 150, range: 285, battery: 42,  consumption: 15.0, year: 2023 },
  'BMW i4':                  { topSpeed: 190, range: 590, battery: 84,  consumption: 16.0, year: 2024 },
  'BMW i5':                  { topSpeed: 193, range: 582, battery: 84,  consumption: 16.5, year: 2024 },
  'BMW i7':                  { topSpeed: 240, range: 625, battery: 105, consumption: 18.0, year: 2024 },
  'BMW iX':                  { topSpeed: 200, range: 630, battery: 112, consumption: 20.0, year: 2024 },
  'BMW iX1':                 { topSpeed: 180, range: 417, battery: 65,  consumption: 17.5, year: 2024 },
  'BMW iX2':                 { topSpeed: 180, range: 449, battery: 65,  consumption: 17.0, year: 2024 },
  'BMW iX3':                 { topSpeed: 180, range: 461, battery: 80,  consumption: 18.5, year: 2024 },
  'Mercedes EQA':            { topSpeed: 160, range: 426, battery: 66,  consumption: 17.0, year: 2024 },
  'Mercedes EQB':            { topSpeed: 160, range: 419, battery: 66,  consumption: 17.5, year: 2024 },
  'Mercedes EQC':            { topSpeed: 180, range: 400, battery: 85,  consumption: 22.0, year: 2024 },
  'Mercedes EQE':            { topSpeed: 210, range: 654, battery: 90,  consumption: 15.7, year: 2024 },
  'Mercedes EQE SUV':        { topSpeed: 210, range: 547, battery: 90,  consumption: 19.0, year: 2024 },
  'Mercedes EQS':            { topSpeed: 210, range: 780, battery: 108, consumption: 15.7, year: 2024 },
  'Mercedes EQS SUV':        { topSpeed: 210, range: 660, battery: 108, consumption: 19.0, year: 2024 },
  'Volkswagen ID.3':         { topSpeed: 160, range: 426, battery: 77,  consumption: 15.4, year: 2024 },
  'Volkswagen ID.4':         { topSpeed: 180, range: 520, battery: 77,  consumption: 17.0, year: 2024 },
  'Volkswagen ID.5':         { topSpeed: 180, range: 520, battery: 77,  consumption: 17.0, year: 2024 },
  'Volkswagen ID.7':         { topSpeed: 180, range: 621, battery: 77,  consumption: 14.5, year: 2024 },
  'Volkswagen ID. Buzz':     { topSpeed: 160, range: 423, battery: 77,  consumption: 20.0, year: 2024 },
  'Audi Q4 e-tron':          { topSpeed: 180, range: 488, battery: 77,  consumption: 18.0, year: 2024 },
  'Audi Q6 e-tron':          { topSpeed: 210, range: 625, battery: 100, consumption: 18.5, year: 2024 },
  'Audi Q8 e-tron':          { topSpeed: 200, range: 582, battery: 114, consumption: 22.0, year: 2024 },
  'Audi e-tron GT':          { topSpeed: 245, range: 488, battery: 93,  consumption: 19.0, year: 2024 },
  'Audi RS e-tron GT':       { topSpeed: 250, range: 472, battery: 93,  consumption: 20.0, year: 2024 },
  'Hyundai IONIQ 5':         { topSpeed: 185, range: 507, battery: 77,  consumption: 16.7, year: 2024 },
  'Hyundai IONIQ 6':         { topSpeed: 185, range: 614, battery: 77,  consumption: 14.3, year: 2024 },
  'Hyundai IONIQ 9':         { topSpeed: 200, range: 620, battery: 110, consumption: 19.0, year: 2025 },
  'Hyundai Kona Electric':   { topSpeed: 172, range: 514, battery: 65,  consumption: 14.7, year: 2024 },
  'Kia EV3':                 { topSpeed: 170, range: 605, battery: 81,  consumption: 14.3, year: 2024 },
  'Kia EV6':                 { topSpeed: 185, range: 528, battery: 77,  consumption: 16.5, year: 2024 },
  'Kia EV9':                 { topSpeed: 200, range: 563, battery: 99,  consumption: 20.0, year: 2024 },
  'Kia Niro EV':             { topSpeed: 167, range: 463, battery: 64,  consumption: 15.0, year: 2024 },
  'Porsche Taycan':          { topSpeed: 260, range: 590, battery: 93,  consumption: 18.0, year: 2024 },
  'Porsche Taycan Cross Turismo': { topSpeed: 250, range: 568, battery: 93, consumption: 19.0, year: 2024 },
  'Porsche Macan Electric':  { topSpeed: 220, range: 516, battery: 100, consumption: 21.0, year: 2024 },
  'Volvo XC40 Recharge':     { topSpeed: 180, range: 418, battery: 79,  consumption: 21.0, year: 2024 },
  'Volvo C40 Recharge':      { topSpeed: 180, range: 476, battery: 79,  consumption: 18.5, year: 2024 },
  'Volvo EX30':              { topSpeed: 180, range: 480, battery: 69,  consumption: 16.0, year: 2024 },
  'Volvo EX40':              { topSpeed: 180, range: 418, battery: 79,  consumption: 21.0, year: 2024 },
  'Volvo EX90':              { topSpeed: 210, range: 580, battery: 111, consumption: 21.0, year: 2024 },
  'Peugeot e-208':           { topSpeed: 150, range: 362, battery: 51,  consumption: 15.0, year: 2024 },
  'Peugeot e-2008':          { topSpeed: 150, range: 322, battery: 54,  consumption: 18.5, year: 2024 },
  'Peugeot e-308':           { topSpeed: 170, range: 418, battery: 54,  consumption: 14.5, year: 2024 },
  'Peugeot e-3008':          { topSpeed: 170, range: 527, battery: 97,  consumption: 20.0, year: 2024 },
  'Peugeot e-5008':          { topSpeed: 170, range: 502, battery: 97,  consumption: 21.0, year: 2024 },
  'Renault Zoe':             { topSpeed: 135, range: 395, battery: 52,  consumption: 14.0, year: 2023 },
  'Renault Megane E-Tech':   { topSpeed: 160, range: 450, battery: 60,  consumption: 15.0, year: 2024 },
  'Renault Scenic E-Tech':   { topSpeed: 170, range: 625, battery: 87,  consumption: 15.5, year: 2024 },
  'Renault 5 E-Tech':        { topSpeed: 150, range: 400, battery: 52,  consumption: 14.5, year: 2024 },
  'Renault 4 E-Tech':        { topSpeed: 150, range: 400, battery: 52,  consumption: 14.5, year: 2025 },
  'Nissan Leaf':             { topSpeed: 150, range: 385, battery: 59,  consumption: 16.8, year: 2024 },
  'Nissan Ariya':            { topSpeed: 200, range: 533, battery: 87,  consumption: 18.0, year: 2024 },
  'Togg T10X':               { topSpeed: 180, range: 523, battery: 88,  consumption: 18.0, year: 2024 },
  'Togg T10F':               { topSpeed: 180, range: 508, battery: 88,  consumption: 18.5, year: 2024 },
  'Togg T10S':               { topSpeed: 180, range: 500, battery: 88,  consumption: 18.5, year: 2025 },
  'Ford Mustang Mach-E':     { topSpeed: 180, range: 610, battery: 98,  consumption: 18.0, year: 2024 },
  'Ford Explorer Electric':  { topSpeed: 180, range: 602, battery: 77,  consumption: 14.5, year: 2024 },
  'Ford Capri Electric':     { topSpeed: 180, range: 592, battery: 77,  consumption: 14.5, year: 2024 },
  'Polestar 2':              { topSpeed: 205, range: 655, battery: 82,  consumption: 14.5, year: 2024 },
  'Polestar 3':              { topSpeed: 210, range: 631, battery: 111, consumption: 19.0, year: 2024 },
  'Polestar 4':              { topSpeed: 200, range: 592, battery: 100, consumption: 18.5, year: 2024 },
  'MG MG4':                  { topSpeed: 160, range: 450, battery: 64,  consumption: 16.0, year: 2024 },
  'MG ZS EV':                { topSpeed: 175, range: 440, battery: 72,  consumption: 18.0, year: 2024 },
  'BYD Atto 3':              { topSpeed: 160, range: 420, battery: 60,  consumption: 16.0, year: 2024 },
  'BYD Seal':                { topSpeed: 180, range: 570, battery: 83,  consumption: 16.0, year: 2024 },
  'BYD Dolphin':             { topSpeed: 160, range: 427, battery: 60,  consumption: 15.0, year: 2024 },
  'Cupra Born':              { topSpeed: 160, range: 570, battery: 82,  consumption: 16.0, year: 2024 },
  'Cupra Tavascan':          { topSpeed: 180, range: 522, battery: 77,  consumption: 17.0, year: 2024 },
  'Skoda Enyaq iV':          { topSpeed: 180, range: 545, battery: 82,  consumption: 17.0, year: 2024 },
  'Mini Cooper SE':          { topSpeed: 150, range: 402, battery: 54,  consumption: 15.0, year: 2024 },
  'Rivian R1T':              { topSpeed: 201, range: 516, battery: 135, consumption: 30.0, year: 2024 },
  'Rivian R1S':              { topSpeed: 201, range: 516, battery: 135, consumption: 30.0, year: 2024 },
  'Lucid Air Pure':          { topSpeed: 200, range: 664, battery: 88,  consumption: 14.0, year: 2024 },
  'Lucid Air Grand Touring': { topSpeed: 270, range: 800, battery: 118, consumption: 16.0, year: 2024 },
  'Jaguar I-PACE':           { topSpeed: 200, range: 470, battery: 90,  consumption: 21.0, year: 2024 },
  'Subaru Solterra':         { topSpeed: 160, range: 466, battery: 71,  consumption: 17.0, year: 2024 },
  'Toyota bZ4X':             { topSpeed: 160, range: 516, battery: 71,  consumption: 15.0, year: 2024 },
  'Fiat 500e':               { topSpeed: 150, range: 320, battery: 42,  consumption: 14.0, year: 2024 },
  'Dacia Spring':            { topSpeed: 125, range: 220, battery: 27,  consumption: 14.0, year: 2024 },
  'Smart #1':                { topSpeed: 180, range: 440, battery: 66,  consumption: 16.0, year: 2024 },
  'Smart #3':                { topSpeed: 180, range: 455, battery: 66,  consumption: 16.0, year: 2024 },
  'Opel Corsa Electric':     { topSpeed: 150, range: 402, battery: 51,  consumption: 14.0, year: 2024 },
  'Opel Mokka Electric':     { topSpeed: 150, range: 338, battery: 54,  consumption: 17.5, year: 2024 },
  'Opel Astra Electric':     { topSpeed: 170, range: 418, battery: 54,  consumption: 14.5, year: 2024 },
  'Xpeng P7':                { topSpeed: 200, range: 480, battery: 80,  consumption: 17.0, year: 2023 },
  'Xpeng G9':                { topSpeed: 200, range: 520, battery: 98,  consumption: 20.0, year: 2023 },
  'Xpeng G6':                { topSpeed: 200, range: 570, battery: 87,  consumption: 16.5, year: 2024 },
};

function getFallback(make, model) {
  const key = `${make} ${model}`;
  if (FALLBACK_SPECS[key]) return FALLBACK_SPECS[key];
  const partialKey = Object.keys(FALLBACK_SPECS).find(k =>
    k.toLowerCase().startsWith(key.toLowerCase()) ||
    key.toLowerCase().startsWith(k.toLowerCase())
  );
  return partialKey ? FALLBACK_SPECS[partialKey] : null;
}

function parseNum(str) {
  if (!str) return null;
  const n = parseFloat(str.replace(/[^\d.]/g, ''));
  return isNaN(n) ? null : n;
}

function CarIllustration({ car }) {
  const body  = getColor(car?.make);
  const dark  = shadeColor(body, -40);
  const light = shadeColor(body, 40);
  return (
    <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" className="car-svg">
      <ellipse cx="160" cy="148" rx="130" ry="10" fill="rgba(0,0,0,0.12)"/>
      <rect x="20" y="80" width="280" height="60" rx="12" fill={body}/>
      <path d="M60 80 Q85 30 115 28 L205 28 Q240 28 252 80Z" fill={dark}/>
      <path d="M72 78 Q93 38 115 36 L200 36 Q228 36 242 78Z" fill="#7ec8e3" opacity="0.75"/>
      <path d="M62 78 Q78 50 105 42 L118 42 Q93 52 80 78Z" fill="#7ec8e3" opacity="0.4"/>
      <path d="M245 78 Q238 55 215 42 L202 42 Q222 54 232 78Z" fill="#7ec8e3" opacity="0.4"/>
      <circle cx="75"  cy="138" r="22" fill="#111"/><circle cx="75"  cy="138" r="13" fill="#333"/><circle cx="75"  cy="138" r="5" fill="#555"/>
      <circle cx="245" cy="138" r="22" fill="#111"/><circle cx="245" cy="138" r="13" fill="#333"/><circle cx="245" cy="138" r="5" fill="#555"/>
      <path d="M48 115 Q48 100 75 100 Q102 100 102 115" fill={dark}/>
      <path d="M218 115 Q218 100 245 100 Q272 100 272 115" fill={dark}/>
      <rect x="295" y="90" width="8" height="14" rx="4" fill="#fffde7" opacity="0.95"/>
      <rect x="17"  y="90" width="8" height="14" rx="4" fill="#ff4444" opacity="0.8"/>
      <circle cx="24" cy="110" r="5" fill="#3ddc84" opacity="0.95"/>
      <rect x="20" y="108" width="280" height="3" rx="1.5" fill={light} opacity="0.35"/>
      <line x1="160" y1="80" x2="160" y2="138" stroke={dark} strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

export default function AddVehicle() {
  const navigate        = useNavigate();
  const { currentUser } = useAuth();
  const dropdownRef     = useRef(null);

  const [selectedMake,   setSelectedMake]   = useState('');
  const [modelQuery,     setModelQuery]     = useState('');
  const [selectedCar,    setSelectedCar]    = useState(null);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [customNickname, setCustomNickname] = useState('');
  const [specsLoading,   setSpecsLoading]   = useState(false);
  const [apiError,       setApiError]       = useState('');
  const [specs, setSpecs] = useState({
    topSpeed: '', range: '', battery: '', consumption: '', year: '',
  });

  const availableModels = selectedMake ? (EV_MODELS[selectedMake] || []) : [];
  const filteredModels  = availableModels.filter(m =>
    !modelQuery || m.toLowerCase().includes(modelQuery.toLowerCase())
  );

  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  async function fetchSpecs(make, model) {
    setSpecsLoading(true);
    setApiError('');
    try {
      const params = new URLSearchParams({ make: make.toLowerCase(), model });
      const res    = await fetch(`https://api.api-ninjas.com/v1/electricvehicle?${params}`, {
        headers: { 'X-Api-Key': EV_API_KEY },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data     = await res.json();
      const fallback = getFallback(make, model);

      let range, battery, consumption, topSpeed, year;

      if (Array.isArray(data) && data.length > 0) {
        const ev    = data[0];
        range       = fallback?.range || null;
        battery     = parseNum(ev.battery_useable_capacity || ev.battery_capacity);
        consumption = ev.rated_consumption
          ? parseFloat((parseNum(ev.rated_consumption) / 10).toFixed(1))
          : fallback?.consumption;
        topSpeed    = fallback?.topSpeed || null;
        year        = ev.year_start || fallback?.year;
      } else {
        range       = fallback?.range       || null;
        battery     = fallback?.battery     || null;
        consumption = fallback?.consumption || null;
        topSpeed    = fallback?.topSpeed    || null;
        year        = fallback?.year        || null;
        if (!fallback) setApiError('No data found — please fill specs manually.');
      }

      setSpecs({
        topSpeed:    topSpeed    != null ? String(topSpeed)    : '',
        range:       range       != null ? String(range)       : '',
        battery:     battery     != null ? String(battery)     : '',
        consumption: consumption != null ? String(consumption) : '',
        year:        year        != null ? String(year)        : '',
      });
    } catch (e) {
      const fallback = getFallback(make, model);
      if (fallback) {
        setSpecs({
          topSpeed:    String(fallback.topSpeed),
          range:       String(fallback.range),
          battery:     String(fallback.battery),
          consumption: String(fallback.consumption),
          year:        String(fallback.year),
        });
      } else {
        setApiError('Could not fetch specs — please fill manually.');
      }
    } finally {
      setSpecsLoading(false);
    }
  }

  function selectModel(model) {
    const car = { make: selectedMake, model, color: getColor(selectedMake) };
    setSelectedCar(car);
    setModelQuery(model);
    setShowDropdown(false);
    fetchSpecs(selectedMake, model);
  }

  async function handleSave() {
    if (!selectedCar) return;
    try {
      const { apiCreateVehicle, mapVehicleFromApi } = await import('../../utils/api');
      const newVehicle = await apiCreateVehicle({
        make:        selectedCar.make,
        model:       selectedCar.model,
        year:        Number(specs.year)        || 0,
        color:       selectedCar.color,
        nickname:    customNickname || `${selectedCar.make} ${selectedCar.model}`,
        topSpeed:    Number(specs.topSpeed)    || 0,
        range:       Number(specs.range)       || 0,
        battery:     Number(specs.battery)     || 0,
        consumption: Number(specs.consumption) || 0,
      });
      const mapped = mapVehicleFromApi(newVehicle);
      mapped.ownerEmail = JSON.parse(localStorage.getItem('ev_current_user'))?.email;
      const cars = JSON.parse(localStorage.getItem('ev_cars') || '[]');
      cars.push(mapped);
      localStorage.setItem('ev_cars', JSON.stringify(cars));
      navigate('/dashboard');
    } catch (e) {
      console.error('Failed to save vehicle:', e);
      alert('Failed to save vehicle: ' + e.message);
    }
  }

  const specFields = [
    { key: 'year',        label: 'Model Year',      unit: '',          icon: '📅', desc: 'First year available'    },
    { key: 'topSpeed',    label: 'Top Speed',        unit: 'km/h',      icon: '⚡', desc: 'Maximum speed'           },
    { key: 'battery',     label: 'Battery Capacity', unit: 'kWh',       icon: '🔋', desc: 'Usable battery capacity' },
    { key: 'range',       label: 'Range',            unit: 'km',        icon: '↔',  desc: 'Rated range (WLTP)'      },
    { key: 'consumption', label: 'Consumption',      unit: 'kWh/100km', icon: '📊', desc: 'Energy per 100 km'       },
  ];

  return (
    <div className="av-page">
      <div className="av-topbar">
        <button className="av-back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <span className="av-topbar-title">Add Vehicle</span>
        <div style={{ width: 140 }}/>
      </div>

      <div className="av-body">
        <div className="av-panel">

          <div className="av-section">
            <div className="av-section-label">MANUFACTURER</div>
            <div className="av-make-grid">
              {MAKES.map(make => (
                <button key={make}
                  className={`av-make-btn ${selectedMake === make ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMake(prev => prev === make ? '' : make);
                    setModelQuery(''); setSelectedCar(null);
                    setSpecs({ topSpeed: '', range: '', battery: '', consumption: '', year: '' });
                    setApiError('');
                  }}>
                  {make}
                </button>
              ))}
            </div>
          </div>

          <div className="av-section">
            <div className="av-section-label">MODEL</div>
            <div className="av-dropdown-wrap" ref={dropdownRef}>
              <div className={`av-search-box ${showDropdown ? 'open' : ''}`}>
                <span className="av-search-icon">🔍</span>
                <input className="av-search-input" type="text"
                  placeholder={selectedMake ? `Search ${selectedMake} models...` : 'Select a manufacturer first'}
                  value={modelQuery} disabled={!selectedMake}
                  onChange={e => { setModelQuery(e.target.value); setShowDropdown(true); setSelectedCar(null); }}
                  onFocus={() => selectedMake && setShowDropdown(true)}
                />
                {modelQuery && (
                  <button className="av-search-clear" onClick={() => {
                    setModelQuery(''); setSelectedCar(null);
                    setSpecs({ topSpeed: '', range: '', battery: '', consumption: '', year: '' });
                  }}>✕</button>
                )}
              </div>
              {showDropdown && selectedMake && (
                <div className="av-dropdown">
                  {filteredModels.length === 0 ? (
                    <div className="av-dropdown-empty">No models found</div>
                  ) : filteredModels.map((model, i) => (
                    <button key={i} className="av-dropdown-item" onClick={() => selectModel(model)}>
                      <div className="av-dropdown-color" style={{ background: getColor(selectedMake) }}/>
                      <div className="av-dropdown-info">
                        <span className="av-dropdown-name">{selectedMake} {model}</span>
                        <span className="av-dropdown-sub">Click to load live specs from API</span>
                      </div>
                      <span className="av-dropdown-speed">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedCar && (
            <div className="av-section">
              <div className="av-section-label">NICKNAME (optional)</div>
              <input className="av-nickname-input" type="text"
                placeholder={`e.g. "My Tesla" or "Work Car"`}
                value={customNickname} onChange={e => setCustomNickname(e.target.value)}/>
            </div>
          )}

          {selectedCar && (
            <div className="av-section">
              <div className="av-section-label">
                SPECIFICATIONS
                {specsLoading && <span className="av-specs-loading"> · Fetching from API...</span>}
              </div>
              {apiError && <p className="av-api-error">{apiError}</p>}
              <div className="av-specs-grid">
                {specFields.map(f => (
                  <div className="av-spec-card" key={f.key}>
                    <div className="av-spec-top">
                      <span className="av-spec-icon">{f.icon}</span>
                      <span className="av-spec-label">{f.label}</span>
                    </div>
                    <div className="av-spec-input-wrap">
                      <input className="av-spec-input" type="number"
                        value={specs[f.key]} placeholder={specsLoading ? '...' : '—'}
                        disabled={specsLoading}
                        onChange={e => setSpecs(prev => ({ ...prev, [f.key]: e.target.value }))}/>
                      <span className="av-spec-unit">{f.unit}</span>
                    </div>
                    <span className="av-spec-desc">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className={`av-save ${selectedCar && !specsLoading ? 'active' : ''}`}
            disabled={!selectedCar || specsLoading}
            onClick={handleSave}>
            {specsLoading ? 'Loading specs...' : '+ ADD TO MY GARAGE'}
          </button>

        </div>

        <div className="av-preview">
          {selectedCar ? (
            <>
              <div className="av-preview-header">
                <span className="av-preview-tag">PREVIEW</span>
                <h2 className="av-preview-name">{selectedCar.make}</h2>
                <h3 className="av-preview-model">{selectedCar.model}</h3>
                {specs.year && <span className="av-preview-year">{specs.year}</span>}
              </div>
              <div className="av-car-stage">
                <div className="av-car-bg"/>
                <CarIllustration car={selectedCar}/>
              </div>
              <div className="av-preview-stats">
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">
                    {specsLoading ? '...' : (specs.range || '—')}
                    {!specsLoading && specs.range && <span className="av-preview-stat-unit"> km</span>}
                  </span>
                  <span className="av-preview-stat-label">Range</span>
                </div>
                <div className="av-preview-stat-div"/>
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">
                    {specsLoading ? '...' : (specs.battery || '—')}
                    {!specsLoading && specs.battery && <span className="av-preview-stat-unit"> kWh</span>}
                  </span>
                  <span className="av-preview-stat-label">Battery</span>
                </div>
                <div className="av-preview-stat-div"/>
                <div className="av-preview-stat">
                  <span className="av-preview-stat-val">
                    {specsLoading ? '...' : (specs.topSpeed || '—')}
                    {!specsLoading && specs.topSpeed && <span className="av-preview-stat-unit"> km/h</span>}
                  </span>
                  <span className="av-preview-stat-label">Top Speed</span>
                </div>
              </div>
              <div className="av-preview-badge">
                <span className="av-badge-dot"/>
                <span>Specs fetched live from EV database · editable above</span>
              </div>
            </>
          ) : (
            <div className="av-preview-empty">
              <div className="av-preview-empty-icon">
                <svg viewBox="0 0 120 60" width="120" height="60" opacity="0.15">
                  <rect x="5" y="20" width="110" height="30" rx="8" fill="#888"/>
                  <path d="M20 20 Q30 5 42 5 L78 5 Q92 5 98 20Z" fill="#666"/>
                  <circle cx="28" cy="52" r="10" fill="#555"/>
                  <circle cx="92" cy="52" r="10" fill="#555"/>
                </svg>
              </div>
              <p className="av-preview-empty-text">Select a vehicle to see preview</p>
              <p className="av-preview-empty-sub">
                {selectedMake ? 'Now search a model above' : 'Choose a manufacturer first'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}