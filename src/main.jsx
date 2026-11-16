import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Cloud, CloudRain, CloudSun, Sun, CloudSnow, CloudDrizzle, Wind, Droplets, Gauge, Eye, Sunrise, Sunset, MapPin, Search, RefreshCw, CalendarDays, Clock3, Thermometer, ChevronDown, AlertCircle, Moon, CloudFog } from 'lucide-react';
import './styles.css';

const LOCATIONS = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Nellore","Kurnool"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Tawang","Pasighat"],
  "Assam": ["Guwahati","Dibrugarh","Silchar","Jorhat","Tezpur"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Jagdalpur"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar","Bhavnagar","Jamnagar"],
  "Haryana": ["Gurugram","Faridabad","Panipat","Ambala","Hisar","Karnal"],
  "Himachal Pradesh": ["Shimla","Manali","Dharamshala","Solan","Mandi"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar"],
  "Karnataka": ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Kalaburagi"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Alappuzha"],
  "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Thane","Chhatrapati Sambhajinagar","Kolhapur","Navi Mumbai"],
  "Manipur": ["Imphal","Thoubal","Churachandpur"],
  "Meghalaya": ["Shillong","Tura","Jowai"],
  "Mizoram": ["Aizawl","Lunglei","Champhai"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Puri","Sambalpur"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali"],
  "Rajasthan": ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner","Jaisalmer"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Vellore"],
  "Telangana": ["Hyderabad","Warangal","Karimnagar","Nizamabad","Khammam"],
  "Tripura": ["Agartala","Udaipur","Dharmanagar"],
  "Uttar Pradesh": ["Lucknow","Noida","Ghaziabad","Kanpur","Varanasi","Agra","Prayagraj","Gorakhpur","Meerut","Bareilly","Ayodhya","Jhansi"],
  "Uttarakhand": ["Dehradun","Haridwar","Rishikesh","Haldwani","Roorkee","Nainital"],
  "West Bengal": ["Kolkata","Howrah","Siliguri","Durgapur","Asansol","Darjeeling"],
  "Delhi": ["New Delhi","Dwarka","Rohini","Connaught Place"],
  "Jammu and Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla"],
  "Ladakh": ["Leh","Kargil"],
  "Puducherry": ["Puducherry","Karaikal","Mahe"],
  "Chandigarh": ["Chandigarh"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman","Silvassa"],
  "Lakshadweep": ["Kavaratti"]
};

const weatherInfo = (code) => {
  if (code === 0) return ['Clear sky', Sun];
  if ([1,2].includes(code)) return ['Partly cloudy', CloudSun];
  if (code === 3) return ['Overcast', Cloud];
  if ([45,48].includes(code)) return ['Foggy', CloudFog];
  if ([51,53,55,56,57].includes(code)) return ['Drizzle', CloudDrizzle];
  if ([61,63,65,66,67,80,81,82].includes(code)) return ['Rain', CloudRain];
  if ([71,73,75,77,85,86].includes(code)) return ['Snow', CloudSnow];
  if ([95,96,99].includes(code)) return ['Thunderstorm', CloudRain];
  return ['Cloudy', Cloud];
};
const fmt = (v) => v == null ? '—' : Math.round(v);
const dayName = (date, options={weekday:'short'}) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', options);
const timeName = (date) => new Date(date).toLocaleTimeString('en-IN',{hour:'numeric',hour12:true});
const dateLabel = (date, options={day:'numeric',month:'short'}) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN',options);

function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('awanish-weather-location')) } catch { return null } })();
  const [state, setState] = useState(saved?.state || 'Uttar Pradesh');
  const [city, setCity] = useState(saved?.city || 'Lucknow');
  const [tab, setTab] = useState('Today');
  const [unit, setUnit] = useState('C');
  const [data, setData] = useState(null);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(null);
  const cities = LOCATIONS[state] || [];

  useEffect(() => { if (!cities.includes(city)) setCity(cities[0]); }, [state]);
  useEffect(() => { localStorage.setItem('awanish-weather-location', JSON.stringify({state,city})); }, [state,city]);

  const loadWeather = async () => {
    if (!city) return;
    setLoading(true); setError('');
    try {
      const query = encodeURIComponent(`${city}, ${state}, India`);
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`);
      if (!geoRes.ok) throw new Error('Unable to locate this city. Please try again.');
      const geo = await geoRes.json();
      const match = (geo.results || []).find(x => x.country_code === 'IN' && (x.admin1 || '').toLowerCase().includes(state.toLowerCase().split(' ')[0])) ||
                    (geo.results || []).find(x => x.country_code === 'IN') || geo.results?.[0];
      if (!match) throw new Error(`Could not find ${city}. Try another city from the list.`);
      setPlace(match);
      const params = new URLSearchParams({
        latitude: match.latitude, longitude: match.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
        hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
        timezone: 'auto', forecast_days: '16'
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!res.ok) throw new Error('Weather service is temporarily unavailable.');
      const json = await res.json();
      setData(json); setUpdated(new Date());
    } catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadWeather(); }, [city, state]);

  const convert = (v) => unit === 'C' ? fmt(v) : fmt((v * 9/5) + 32);
  const degree = `°${unit}`;
  const current = data?.current;
  const daily = data?.daily;
  const hourly = data?.hourly;
  const currentInfo = current ? weatherInfo(current.weather_code) : ['Weather', Cloud];
  const CurrentIcon = currentInfo[1];
  const nowIndex = useMemo(() => {
    if (!hourly?.time) return 0;
    const now = new Date();
    let idx = hourly.time.findIndex(t => new Date(t) >= now);
    return Math.max(0, idx);
  }, [hourly, updated]);
  const nextHours = hourly ? hourly.time.slice(nowIndex, nowIndex + 24).map((t, i) => ({
    time:t, temp:hourly.temperature_2m[nowIndex+i], code:hourly.weather_code[nowIndex+i],
    rain:hourly.precipitation_probability[nowIndex+i], wind:hourly.wind_speed_10m[nowIndex+i]
  })) : [];
  const days = daily ? daily.time.map((d,i) => ({
    date:d, code:daily.weather_code[i], max:daily.temperature_2m_max[i], min:daily.temperature_2m_min[i],
    rain:daily.precipitation_probability_max[i], uv:daily.uv_index_max[i], sunrise:daily.sunrise[i], sunset:daily.sunset[i]
  })) : [];
  const weekly = days.slice(0,7);
  const monthlyAvg = days.length ? Math.round(days.reduce((s,d)=>s+(d.max+d.min)/2,0)/days.length) : null;
  const stats = [
    {label:'Feels like',value:current ? `${convert(current.apparent_temperature)}${degree}`:'—',icon:Thermometer},
    {label:'Humidity',value:current ? `${fmt(current.relative_humidity_2m)}%`:'—',icon:Droplets},
    {label:'Wind speed',value:current ? `${fmt(current.wind_speed_10m)} km/h`:'—',icon:Wind},
    {label:'Pressure',value:current ? `${fmt(current.surface_pressure)} hPa`:'—',icon:Gauge},
    {label:'Precipitation',value:current ? `${current.precipitation ?? 0} mm`:'—',icon:CloudRain},
    {label:'UV index',value:daily ? fmt(daily.uv_index_max[0]):'—',icon:Sun}
  ];

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><CloudSun size={23}/></span><span>Awanish Weather<span className="brand-accent"> India</span></span></a>
      <div className="top-note"><span className="live-dot"></span> Live weather dashboard</div>
      <button className="unit-toggle" onClick={()=>setUnit(unit==='C'?'F':'C')}>°{unit} <span>/</span> °{unit==='C'?'F':'C'}</button>
    </header>

    <main className="main">
      <section className="intro">
        <div><p className="eyebrow">WEATHER, MADE CLEAR</p><h1>Know before you <em>go.</em></h1><p className="subhead">Real-time conditions and forecasts for cities across India.</p></div>
        <div className="location-picker">
          <label><MapPin size={15}/> Select location</label>
          <div className="select-row">
            <div className="select-wrap"><select value={state} onChange={e=>setState(e.target.value)} aria-label="Select state">{Object.keys(LOCATIONS).sort().map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={15}/></div>
            <div className="select-wrap"><select value={city} onChange={e=>setCity(e.target.value)} aria-label="Select city">{cities.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={15}/></div>
            <button className="refresh-btn" onClick={loadWeather} disabled={loading} aria-label="Refresh weather"><RefreshCw size={17} className={loading?'spin':''}/></button>
          </div>
        </div>
      </section>

      {error && <div className="error"><AlertCircle size={18}/><span>{error}</span><button onClick={loadWeather}>Retry</button></div>}
      {loading && !data ? <div className="loading"><span className="loader"></span><p>Fetching weather for {city}...</p></div> : null}

      {data && current && <React.Fragment>
        <section className="hero-card">
          <div className="hero-main">
            <div className="place-line"><MapPin size={15}/>{place?.name || city}, {place?.admin1 || state}<span className="today-pill">TODAY</span></div>
            <div className="hero-weather">
              <div className="hero-temp">{convert(current.temperature_2m)}<span>{degree}</span></div>
              <div className="hero-condition"><CurrentIcon size={54} strokeWidth={1.35}/><div><strong>{currentInfo[0]}</strong><small>Feels like {convert(current.apparent_temperature)}{degree}</small></div></div>
            </div>
            <p className="hero-summary">The temperature is currently {convert(current.temperature_2m)}{degree} in {city}. {daily ? `Today's range is ${convert(daily.temperature_2m_min[0])}° to ${convert(daily.temperature_2m_max[0])}°${unit}.` : ''}</p>
          </div>
          <div className="hero-side">
            <div className="sun-times"><div><Sunrise size={19}/><span><small>Sunrise</small><b>{daily ? timeName(daily.sunrise[0]) : '—'}</b></span></div><div><Sunset size={19}/><span><small>Sunset</small><b>{daily ? timeName(daily.sunset[0]) : '—'}</b></span></div></div>
            <div className="hero-side-bottom"><span>LOCAL TIME</span><strong>{new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</strong><small>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</small></div>
          </div>
          <div className="hero-glow"></div>
        </section>

        <section className="stats-grid">{stats.map(({label,value,icon:Icon})=><div className="stat-card" key={label}><div className="stat-icon"><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong></div></div>)}</section>

        <section className="forecast-section">
          <div className="section-heading"><div><p className="eyebrow">PLAN YOUR DAYS</p><h2>Forecast overview</h2></div><div className="tabs">{['Today','Hourly','Daily','Weekly','Monthly'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div></div>
          {tab==='Today' && <div className="today-layout">
            <div className="panel hourly-panel"><div className="panel-title"><div><Clock3 size={17}/><b>Next 12 hours</b></div><span>HOURLY</span></div><div className="hour-strip">{nextHours.slice(0,12).filter((h,i)=>i%2===0).map((h,i)=>{const [label,Icon]=weatherInfo(h.code);return <div className="hour-item" key={h.time}><small>{i===0?'Now':timeName(h.time)}</small><Icon size={23}/><b>{convert(h.temp)}°</b><span><Droplets size={11}/>{h.rain ?? 0}%</span></div>})}</div></div>
            <div className="panel week-panel"><div className="panel-title"><div><CalendarDays size={17}/><b>7-day outlook</b></div><button onClick={()=>setTab('Weekly')}>View all ↗</button></div>{weekly.slice(0,5).map(d=>{const [label,Icon]=weatherInfo(d.code);return <div className="mini-day" key={d.date}><span>{dayName(d.date)}</span><Icon size={19}/><small>{label}</small><b>{convert(d.max)}° <i>{convert(d.min)}°</i></b></div>})}</div>
          </div>}
          {tab==='Hourly' && <div className="panel"><div className="panel-title"><div><Clock3 size={17}/><b>Next 24 hours</b></div><span>LOCAL TIME</span></div><div className="hourly-grid">{nextHours.map((h,i)=>{const [label,Icon]=weatherInfo(h.code);return <div className="hour-card" key={h.time}><small>{i===0?'Now':timeName(h.time)}</small><Icon size={23}/><b>{convert(h.temp)}°</b><span><Droplets size={12}/>{h.rain ?? 0}%</span><small>{fmt(h.wind)} km/h wind</small></div>})}</div></div>}
          {tab==='Daily' && <div className="panel"><div className="panel-title"><div><CalendarDays size={17}/><b>Daily forecast</b></div><span>UP TO 16 DAYS</span></div><div className="daily-list">{days.map((d,i)=>{const [label,Icon]=weatherInfo(d.code);return <div className="daily-row" key={d.date}><b>{i===0?'Today':dayName(d.date,{weekday:'long'})}</b><span>{dateLabel(d.date)}</span><Icon size={22}/><span className="condition-label">{label}</span><span className="rain-chance"><Droplets size={13}/>{d.rain ?? 0}%</span><div className="temp-range"><b>{convert(d.max)}°</b><span></span><i>{convert(d.min)}°</i></div><small>UV {fmt(d.uv)}</small></div>})}</div></div>}
          {tab==='Weekly' && <div className="panel"><div className="panel-title"><div><CalendarDays size={17}/><b>7-day forecast</b></div><span>THIS WEEK</span></div><div className="weekly-grid">{weekly.map((d,i)=>{const [label,Icon]=weatherInfo(d.code);return <div className="weekly-card" key={d.date}><small>{i===0?'Today':dayName(d.date,{weekday:'long'})}</small><span>{dateLabel(d.date,{day:'numeric',month:'short'})}</span><Icon size={30}/><b>{label}</b><strong>{convert(d.max)}° <i>{convert(d.min)}°</i></strong><small><Droplets size={12}/>{d.rain ?? 0}% rain</small><small>UV index: {fmt(d.uv)}</small></div>})}</div></div>}
          {tab==='Monthly' && <div className="monthly-layout"><div className="monthly-card"><p className="eyebrow">AVAILABLE FORECAST WINDOW</p><h3>{days.length}-day outlook</h3><div className="monthly-number">{monthlyAvg == null?'—':`${convert(monthlyAvg)}°`}<small> average daily midpoint</small></div><p>Based on the daily forecast currently available for {city}.</p><div className="month-range"><span>Warmest expected day</span><b>{days.length?`${convert(Math.max(...days.map(d=>d.max)))}°${unit}`:'—'}</b><span>Coolest expected night</span><b>{days.length?`${convert(Math.min(...days.map(d=>d.min)))}°${unit}`:'—'}</b></div></div><div className="monthly-note"><div className="note-icon"><AlertCircle size={21}/></div><h3>About the monthly view</h3><p>Reliable day-by-day weather forecasts are currently available here for up to 16 days. A precise 30-day forecast is not provided by this free weather data source, so we show the available forecast window instead of presenting estimated days as facts.</p><button onClick={()=>setTab('Daily')}>Explore available days <span>→</span></button></div></div>}
        </section>
        <footer><span>Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span><span>{updated?`Last updated ${updated.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`:'Updating...'}</span></footer>
      </React.Fragment>}
      {!data && !loading && !error && <div className="loading"><p>Select a location to view the forecast.</p></div>}
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
