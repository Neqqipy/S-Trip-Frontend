import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faUtensils, faMapLocationDot, faRoute,
  faSun, faCloudSun, faMoon, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { enrichPlacesWithCoords } from '../services/geocodeUtils';

// ── Mock fallback ─────────────────────────────────────────────
const mockTours = [
  { name: "Địa điểm tham quan 1", thumbnail: null },
  { name: "Địa điểm tham quan 2", thumbnail: null },
  { name: "Địa điểm tham quan 3", thumbnail: null },
];
const mockFoods = [
  { name: "Nhà hàng địa phương 1", thumbnail: null },
  { name: "Quán ăn ngon 2",        thumbnail: null },
  { name: "Quán ăn ngon 3",        thumbnail: null },
];

const SESSION_META = [
  { key: 'morning',   label: 'Sáng',  icon: faSun,      color: '#f59e0b' },
  { key: 'afternoon', label: 'Chiều', icon: faCloudSun,  color: '#3b82f6' },
  { key: 'evening',   label: 'Tối',   icon: faMoon,      color: '#8b5cf6' },
];

function buildDayPlaces(data) {
  const toursPool = data.realTours?.length > 0 ? data.realTours : mockTours;
  const foodsPool = data.realFoods?.length > 0 ? data.realFoods : mockFoods;
  const numDays   = parseInt(data.days?.toString().split(' ')[0]) || 3;
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const places = [];
    SESSION_META.forEach((s, si) => {
      const idx = i * 3 + si;
      const tour = toursPool[idx % toursPool.length];
      const food = foodsPool[idx % foodsPool.length];
      // Giữ lại lat/lng nếu backend đã trả về
      places.push({ session: s.label, sessionColor: s.color, sessionIcon: s.icon, type: 'tour',
        name: tour.name, thumbnail: tour.thumbnail || null,
        lat: tour.lat || tour.latitude || null,
        lng: tour.lng || tour.longitude || null,
      });
      places.push({ session: s.label, sessionColor: s.color, sessionIcon: s.icon, type: 'food',
        name: food.name, thumbnail: food.thumbnail || null,
        lat: food.lat || food.latitude || null,
        lng: food.lng || food.longitude || null,
      });
    });
    days.push(places);
  }
  return days;
}

// ── Lấy tọa độ: hotel (điểm O) + địa điểm trong ngày ────────
async function resolveMarkers(hotel, places, location) {
  // --- Geocode khách sạn ---
  let hotelMarker = null;
  if (hotel) {
    const existLat = hotel.lat || hotel.latitude;
    const existLng = hotel.lng || hotel.longitude;
    if (existLat && existLng) {
      hotelMarker = { ...hotel, type: 'hotel', lat: parseFloat(existLat), lng: parseFloat(existLng) };
    } else {
      try {
        const { tours: [enrichedHotel] } = await enrichPlacesWithCoords(
          location,
          [{ name: hotel.name, type: 'tour' }],
          []
        );
        if (enrichedHotel?.lat) hotelMarker = { ...hotel, type: 'hotel', lat: enrichedHotel.lat, lng: enrichedHotel.lng };
      } catch {}
    }
  }

  // --- Geocode địa điểm ngày ---
  let dayMarkers = [];
  const allReady = places.every(p => p.lat && p.lng);
  if (allReady) {
    dayMarkers = places.filter(p => p.lat && p.lng);
  } else {
    const tours = places.filter(p => p.type === 'tour');
    const foods  = places.filter(p => p.type === 'food');
    try {
      const { tours: eTours, foods: eFoods } = await enrichPlacesWithCoords(location, tours, foods);
      const enrichedMap = {};
      [...eTours, ...eFoods].forEach(p => { enrichedMap[p.name + p.type] = p; });
      dayMarkers = places.map(p => enrichedMap[p.name + p.type] || p).filter(p => p.lat && p.lng);
    } catch {
      dayMarkers = places.filter(p => p.lat && p.lng);
    }
  }

  // Khách sạn là điểm xuất phát đầu tiên (O), rồi mới đến các địa điểm
  return hotelMarker ? [hotelMarker, ...dayMarkers] : dayMarkers;
}

// ── Tạo HTML Leaflet + OSRM routing ──────────────────────────
function buildLeafletHtml(markers) {
  const markersJson = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
    .custom-label {
      background: white;
      border: 2px solid #10b981;
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 800;
      color: #111;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
  (async function() {
    const markers = ${markersJson};
    if (!markers.length) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-family:sans-serif;flex-direction:column;gap:8px"><div style="font-size:32px">🗺️</div><div>Không tìm được tọa độ địa điểm</div></div>';
      return;
    }

    const map = L.map('map', { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const typeColors = { tour: '#8b5cf6', food: '#f97316', hotel: '#10b981' };
    const latlngs = [];
    // dayIndex: bỏ qua marker khách sạn (i=0) khi đánh số
    let dayIdx = 0;

    markers.forEach((m, i) => {
      const isHotel = m.type === 'hotel';
      const color   = typeColors[m.type] || '#10b981';

      let html;
      if (isHotel) {
        // Icon khách sạn đặc biệt — hình nhà, nhãn "KS"
        html = \`<div style="position:relative;width:42px;height:50px">
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
            <ellipse cx="21" cy="48" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)"/>
            <path d="M21 1C12.2 1 5 8.2 5 17c0 11 16 31 16 31s16-20 16-31C37 8.2 29.8 1 21 1z"
                  fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="21" cy="17" r="10" fill="white"/>
            <!-- Hình nhà -->
            <polygon points="21,9 13,16 29,16" fill="#10b981"/>
            <rect x="16" y="16" width="10" height="8" fill="#10b981"/>
            <rect x="19" y="19" width="4" height="5" fill="white"/>
          </svg>
          <!-- Badge "KS" -->
          <div style="position:absolute;top:-6px;right:-4px;background:#10b981;color:white;font-size:8px;font-weight:900;padding:2px 4px;border-radius:6px;border:1.5px solid white;font-family:sans-serif">KS</div>
        </div>\`;
      } else {
        dayIdx++;
        const emoji = m.type === 'tour' ? '📍' : '🍜';
        html = \`<div style="position:relative;width:36px;height:44px">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
            <ellipse cx="18" cy="42" rx="5" ry="2" fill="rgba(0,0,0,0.25)"/>
            <path d="M18 1C10.3 1 4 7.3 4 15c0 9.6 14 27 14 27s14-17.4 14-27C32 7.3 25.7 1 18 1z"
                  fill="\${color}" stroke="white" stroke-width="1.5"/>
            <circle cx="18" cy="15" r="8" fill="white"/>
            <text x="18" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="\${color}" font-family="sans-serif">\${dayIdx}</text>
          </svg>
        </div>\`;
      }

      const icon = L.divIcon({ html, iconSize: isHotel?[42,50]:[36,44], iconAnchor: isHotel?[21,50]:[18,44], popupAnchor:[0,-50], className:'' });
      const sessionLabel = m.session || '';
      L.marker([m.lat, m.lng], { icon }).addTo(map)
        .bindPopup(\`
          <div style="font-family:sans-serif;min-width:160px">
            \${isHotel ? '<div style="font-size:10px;font-weight:800;color:#10b981;text-transform:uppercase;margin-bottom:4px">🏨 Điểm xuất phát</div>' : ''}
            <div style="font-size:13px;font-weight:900;color:#111;margin-bottom:4px">\${m.name}</div>
            \${!isHotel ? '<div style="font-size:11px;color:'+color+';font-weight:700">'+( m.type==='tour'?'📍 Tham quan':'🍜 Ăn uống')+'</div>' : ''}
            \${sessionLabel ? '<div style="font-size:11px;color:#9ca3af;margin-top:2px">Buổi '+sessionLabel+'</div>' : ''}
          </div>\`);
      latlngs.push([m.lat, m.lng]);
    });

    // Fit bounds trước
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Vẽ route theo đường thật bằng OSRM
    if (latlngs.length > 1) {
      try {
        const coordStr = markers.map(m => m.lng + ',' + m.lat).join(';');
        const url = 'https://router.project-osrm.org/route/v1/driving/' + coordStr
                  + '?overview=full&geometries=geojson&continue_straight=false';
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]) {
          L.geoJSON(data.routes[0].geometry, {
            style: { color: '#10b981', weight: 4, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }
          }).addTo(map);
        } else {
          // Fallback: đường thẳng nếu OSRM lỗi
          L.polyline(latlngs, { color:'#10b981', weight:3, opacity:0.7, dashArray:'8 5' }).addTo(map);
        }
      } catch {
        L.polyline(latlngs, { color:'#10b981', weight:3, opacity:0.7, dashArray:'8 5' }).addTo(map);
      }
    }
  })();
  </script>
</body>
</html>`;
}

// ── Map Panel ─────────────────────────────────────────────────
const MapPanel = ({ data, onClose }) => {
  const numDays = parseInt(data.days?.toString().split(' ')[0]) || 3;
  const allDays = buildDayPlaces(data);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapHtml,     setMapHtml]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState('');
  const [panelWidth,  setPanelWidth]  = useState(50); // % màn hình
  const isDragging = React.useRef(false);

  const onDragStart = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      if (!isDragging.current) return;
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const pct = Math.round(((window.innerWidth - clientX) / window.innerWidth) * 100);
      setPanelWidth(Math.min(80, Math.max(20, pct)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onUp);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // Lấy thông tin khách sạn từ data
  const hotelRaw = data.realHotels?.[0] || null;
  const hotelInfo = hotelRaw ? {
    name: hotelRaw.name,
    lat:  hotelRaw.lat || hotelRaw.latitude || null,
    lng:  hotelRaw.lng || hotelRaw.longitude || null,
    thumbnail: hotelRaw.thumbnail || null,
  } : null;

  useEffect(() => {
    let cancelled = false;
    const dayPlaces = allDays[selectedDay] || [];
    setLoading(true);
    setMapHtml('');
    setLoadingMsg('Đang tìm tọa độ địa điểm...');

    resolveMarkers(hotelInfo, dayPlaces, data.location).then(results => {
      if (cancelled) return;
      if (results.length > 0) setLoadingMsg('Đang vẽ tuyến đường...');
      setMapHtml(buildLeafletHtml(results));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedDay, data.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayPlaces = allDays[selectedDay] || [];
  const typeColor = (t) => t === 'tour' ? '#8b5cf6' : '#f97316';
  const typeIcon  = (t) => t === 'tour' ? faMapLocationDot : faUtensils;

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes mbFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes mbSlideIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes mbSpin    { to{transform:rotate(360deg)} }
        .mb-panel   { animation: mbSlideIn 0.3s cubic-bezier(.22,1,.36,1) forwards; }
        .mb-overlay { animation: mbFadeIn  0.2s ease forwards; }
        .mb-daytab:hover   { background:#f0fdf4 !important; }
        .mb-close:hover    { background:#fee2e2 !important; color:#ef4444 !important; }
        .mb-placerow:hover { background:#f8fafc !important; }
        .mb-spin { animation: mbSpin 1s linear infinite; display:inline-block; }
        .mb-drag:hover .mb-drag-bar { background: linear-gradient(to bottom, transparent, #10b981, transparent) !important; }
        .mb-drag:hover .mb-grip     { border-color: #10b981 !important; }
        .mb-drag:hover .mb-dot      { background-color: #10b981 !important; }
      `}</style>

      <div className="mb-overlay" onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', zIndex:999998 }} />

      <div className="mb-panel" style={{ position:'fixed', top:0, right:0, bottom:0, width:`${panelWidth}vw`, minWidth:280, backgroundColor:'white', zIndex:999999, display:'flex', flexDirection:'column', boxShadow:'-20px 0 60px rgba(0,0,0,0.25)' }}>
        
        {/* ── Thanh kéo resize ── */}
        <div className="mb-drag" onMouseDown={onDragStart} onTouchStart={onDragStart} title={`Kéo để thay đổi độ rộng (${panelWidth}%)`} style={{ position:"absolute", left:-8, top:0, bottom:0, width:20, cursor:"col-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="mb-drag-bar" style={{ width:4, height:"100%", background:"linear-gradient(to bottom, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%)", transition:"background 0.15s" }} />
          <div className="mb-grip" style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", width:22, height:52, borderRadius:11, backgroundColor:"white", border:"1.5px solid #d1d5db", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, boxShadow:"0 2px 8px rgba(0,0,0,0.12)", transition:"border-color 0.15s" }}>
            <div className="mb-dot" style={{ width:3, height:3, borderRadius:"50%", backgroundColor:"#9ca3af", transition:"background 0.15s" }} />
            <div className="mb-dot" style={{ width:3, height:3, borderRadius:"50%", backgroundColor:"#9ca3af", transition:"background 0.15s" }} />
            <div className="mb-dot" style={{ width:3, height:3, borderRadius:"50%", backgroundColor:"#9ca3af", transition:"background 0.15s" }} />
          </div>
          {/* Badge hiển thị % khi kéo */}
          {isDragging.current && (
            <div style={{ position:"absolute", left:-52, top:"50%", transform:"translateY(-50%)", background:"#10b981", color:"white", fontSize:11, fontWeight:800, padding:"4px 8px", borderRadius:8, whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(0,0,0,0.2)", pointerEvents:"none" }}>
              {panelWidth}%
            </div>
          )}
        </div>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FontAwesomeIcon icon={faRoute} style={{ color:'white', fontSize:18 }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'#111827' }}>Bản đồ hành trình · {data.location}</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>{numDays} ngày · {dayPlaces.length} địa điểm hôm nay</div>
            </div>
          </div>
          <button className="mb-close" onClick={onClose} style={{ width:38, height:38, borderRadius:'50%', border:'none', backgroundColor:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'0.15s', fontSize:16, color:'#374151' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Tab ngày */}
        <div style={{ display:'flex', gap:8, padding:'14px 24px', borderBottom:'1px solid #f1f5f9', flexShrink:0, overflowX:'auto' }}>
          {Array.from({ length: numDays }, (_, i) => (
            <button key={i} className="mb-daytab" onClick={() => setSelectedDay(i)} style={{ padding:'8px 20px', borderRadius:99, border:'1.5px solid #10b981', background: selectedDay===i ? '#10b981':'white', color: selectedDay===i ? 'white':'#10b981', fontWeight:800, fontSize:14, cursor:'pointer', whiteSpace:'nowrap', transition:'0.15s' }}>
              Ngày {i + 1}
            </button>
          ))}
        </div>

        {/* Map + List */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Bản đồ */}
          <div style={{ flex:'0 0 55%', borderRight:'1px solid #f1f5f9', position:'relative', background:'#f8fafc' }}>
            {loading && (
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:'#9ca3af', zIndex:10 }}>
                <FontAwesomeIcon icon={faSpinner} className="mb-spin" style={{ fontSize:28, color:'#10b981' }} />
                <div style={{ fontSize:13, fontWeight:600 }}>{loadingMsg}</div>
                <div style={{ fontSize:11, color:'#d1d5db' }}>Đang geocode {dayPlaces.length} địa điểm...</div>
              </div>
            )}
            {!loading && mapHtml && (
              <iframe
                key={selectedDay}
                title="leaflet-map"
                width="100%" height="100%"
                style={{ border:0, display:'block' }}
                srcDoc={mapHtml}
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>

          {/* Danh sách */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>

            {/* Điểm xuất phát — Khách sạn */}
            {hotelInfo && (
              <div style={{ marginBottom:4 }}>
                <div style={{ padding:'8px 20px', display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:800, color:'#10b981', textTransform:'uppercase', letterSpacing:'0.5px', position:'sticky', top:0, background:'white', zIndex:1, borderBottom:'1px solid #f8fafc' }}>
                  🏨 Điểm xuất phát
                </div>
                <div style={{ padding:'8px 20px' }}>
                  <div className="mb-placerow" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:12 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'2px solid white' }}>
                      {hotelInfo.thumbnail
                        ? <img src={hotelInfo.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                        : <span style={{ fontSize:14 }}>🏨</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{hotelInfo.name}</div>
                      <div style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>Khách sạn · Điểm O</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {SESSION_META.map((session) => {
              const sp = dayPlaces.filter(p => p.session === session.label);
              return (
                <div key={session.key} style={{ marginBottom:4 }}>
                  <div style={{ padding:'8px 20px', display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:800, color:session.color, textTransform:'uppercase', letterSpacing:'0.5px', position:'sticky', top:0, background:'white', zIndex:1, borderBottom:'1px solid #f8fafc' }}>
                    <FontAwesomeIcon icon={session.icon} /> Buổi {session.label}
                  </div>
                  <div style={{ padding:'4px 20px', position:'relative' }}>
                    {sp.length > 1 && <div style={{ position:'absolute', left:36, top:24, bottom:24, width:2, backgroundColor:'#e2e8f0', zIndex:0 }} />}
                    {sp.map((place, pi) => {
                      const globalIdx = dayPlaces.indexOf(place);
                      return (
                        <div key={pi} className="mb-placerow" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:12, cursor:'default', transition:'0.15s', position:'relative', zIndex:1, marginBottom:2 }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'2px solid white' }}>
                            {place.thumbnail
                              ? <img src={place.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                              : <FontAwesomeIcon icon={typeIcon(place.type)} style={{ color:'white', fontSize:13 }} />}
                          </div>
                          <div style={{ position:'absolute', left:34, top:8, width:14, height:14, borderRadius:'50%', backgroundColor:'white', border:`1.5px solid ${typeColor(place.type)}`, fontSize:8, fontWeight:900, color:typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
                            {globalIdx + 1}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{place.name}</div>
                            <div style={{ fontSize:11, color:typeColor(place.type), fontWeight:700 }}>
                              {place.type === 'tour' ? '📍 Tham quan' : '🍜 Ăn uống'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid #f1f5f9', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'#9ca3af' }}>Bấm ESC hoặc click ra ngoài để đóng</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`} target="_blank" rel="noopener noreferrer"
            style={{ padding:'8px 16px', borderRadius:8, background:'#10b981', color:'white', fontWeight:700, fontSize:12, textDecoration:'none' }}>
            Mở Google Maps ↗
          </a>
        </div>
      </div>
    </>,
    document.body
  );
};

// ── Nút tròn gốc ─────────────────────────────────────────────
const MapBubble = ({ targetOffset = 450, data }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [pulse,     setPulse]     = useState(false);

  useEffect(() => {
    if (data) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(t);
    }
  }, [data]);

  return (
    <>
      <style>{`
        @keyframes mbPulse {
          0%,100% { box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 0 0   rgba(16,185,129,0.6); }
          50%      { box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 0 16px rgba(16,185,129,0); }
        }
      `}</style>
      <div
        onClick={() => { if (data) setOpen(true); else window.scrollTo({ top: targetOffset, behavior: 'smooth' }); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position:'fixed', right:'50px', bottom:'165px',
          width:'100px', height:'100px', borderRadius:'50%',
          cursor:'pointer', zIndex:1999, border:'3px solid white',
          display:'flex', justifyContent:'center', alignItems:'center', overflow:'hidden',
          boxShadow: isHovered ? '0 15px 35px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.3)',
          transition:'0.3s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isHovered ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(0deg)',
          backgroundImage:`url('/map.jpg')`, backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
          filter: isHovered ? 'brightness(1.1)' : 'brightness(1.2)',
          animation: pulse && data ? 'mbPulse 1s ease 3' : 'none',
        }}
        title={data ? 'Xem bản đồ hành trình' : 'Cuộn đến bản đồ'}
      >
        <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', backgroundColor: isHovered ? 'rgba(255,255,255,0.1)':'rgba(255,255,255,0)', transition:'0.3s' }} />
      </div>
      {open && data && <MapPanel data={data} onClose={() => setOpen(false)} />}
    </>
  );
};

export default MapBubble;