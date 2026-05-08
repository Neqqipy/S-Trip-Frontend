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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO © OpenStreetMap', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    // Màu tươi sáng trên nền Carto Voyager
    const pathColors  = ['#00c9a7','#38bdf8','#fb923c','#c084fc','#f87171','#facc15','#f472b6','#818cf8'];
    const typeColors  = { tour: '#8b5cf6', food: '#f97316', hotel: '#10b981' };
    const latlngs     = markers.map(m => [m.lat, m.lng]);
    const legLayers   = []; // { sh, gl, mn }
    let   activeLeg   = -1;

    // ── Reset ────────────────────────────────────────────────
    function resetRoutes() {
      activeLeg = -1;
      legLayers.forEach(({ sh, gl, mn }) => {
        sh.setStyle({ opacity: 0.10 });
        gl.setStyle({ opacity: 0 });
        mn.setStyle({ opacity: 0.95, weight: 5 });
      });
      // Thông báo React: không có leg nào active
      if (window._onHighlightChange) window._onHighlightChange(-1);
    }

    // ── Highlight 1 leg + thông báo React ────────────────────
    function highlightLeg(legIdx) {
      if (activeLeg === legIdx) { resetRoutes(); return; }
      activeLeg = legIdx;
      legLayers.forEach(({ sh, gl, mn }) => {
        sh.setStyle({ opacity: 0.04 });
        gl.setStyle({ opacity: 0 });
        mn.setStyle({ opacity: 0.22, weight: 4 });
      });
      const leg = legLayers[legIdx];
      if (!leg) return;
      leg.sh.setStyle({ opacity: 0.18 });
      leg.gl.setStyle({ opacity: 0.45, weight: 16 });
      leg.mn.setStyle({ opacity: 1, weight: 7 });
      leg.gl.bringToFront();
      leg.mn.bringToFront();
      // Thông báo React: legIdx đang active → highlight 2 đầu mút
      if (window._onHighlightChange) window._onHighlightChange(legIdx);
    }

    // ── Click marker → leg ĐI RA; điểm CUỐI → leg ĐI VÀO ───
    function highlightMarker(markerIdx) {
      const isLast = markerIdx >= markers.length - 1;
      const legIdx = isLast ? markerIdx - 1 : markerIdx;
      if (legIdx < 0) return;
      highlightLeg(legIdx);
    }

    // Expose ra window để React gọi được
    window.highlightLeg = highlightLeg;
    window.resetRoutes  = resetRoutes;

    // Click nền map → reset + đồng bộ React
    map.on('click', resetRoutes);

    // ── Vẽ routes trước (dưới marker) ───────────────────────
    try {
      const coordStr = markers.map(m => m.lng+','+m.lat).join(';');
      const res  = await fetch(
        'https://router.project-osrm.org/route/v1/driving/'+coordStr
        +'?overview=false&geometries=geojson&steps=true'
      );
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.[0]?.legs) {
        data.routes[0].legs.forEach((leg, i) => {
          const color = pathColors[i % pathColors.length];
          // Gom tọa độ từ steps của leg
          const coords = [];
          (leg.steps || []).forEach(step => {
            (step.geometry?.coordinates || []).forEach(c => {
              const pt = [c[1], c[0]];
              const last = coords[coords.length - 1];
              if (!last || last[0] !== pt[0] || last[1] !== pt[1]) coords.push(pt);
            });
          });
          if (coords.length < 2) { legLayers.push({ sh:L.polyline([]),gl:L.polyline([]),mn:L.polyline([]) }); return; }

          const sh = L.polyline(coords, { color:'#000', weight:10, opacity:0.10, lineJoin:'round', lineCap:'round' }).addTo(map);
          const gl = L.polyline(coords, { color,        weight:16, opacity:0,    lineJoin:'round', lineCap:'round' }).addTo(map);
          const mn = L.polyline(coords, { color,        weight:5,  opacity:0.95, lineJoin:'round', lineCap:'round' }).addTo(map);
          const li = legLayers.length;
          mn.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
          gl.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
          legLayers.push({ sh, gl, mn });
        });
      } else {
        markers.forEach((m, i) => {
          if (!i) return;
          const prev  = markers[i-1];
          const color = pathColors[(i-1) % pathColors.length];
          const coords = [[prev.lat,prev.lng],[m.lat,m.lng]];
          const sh = L.polyline(coords, { color:'#000', weight:10, opacity:0.10, dashArray:'8 5' }).addTo(map);
          const gl = L.polyline(coords, { color,        weight:16, opacity:0 }).addTo(map);
          const mn = L.polyline(coords, { color,        weight:5,  opacity:0.95, dashArray:'8 5' }).addTo(map);
          const li = legLayers.length;
          mn.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
          gl.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
          legLayers.push({ sh, gl, mn });
        });
      }
    } catch {
      markers.forEach((m, i) => {
        if (!i) return;
        const prev  = markers[i-1];
        const color = pathColors[(i-1) % pathColors.length];
        const coords = [[prev.lat,prev.lng],[m.lat,m.lng]];
        const sh = L.polyline(coords, { color:'#000', weight:10, opacity:0.10, dashArray:'8 5' }).addTo(map);
        const gl = L.polyline(coords, { color,        weight:16, opacity:0 }).addTo(map);
        const mn = L.polyline(coords, { color,        weight:5,  opacity:0.95, dashArray:'8 5' }).addTo(map);
        const li = legLayers.length;
        mn.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
        gl.on('click', (e) => { L.DomEvent.stopPropagation(e); highlightLeg(li); });
        legLayers.push({ sh, gl, mn });
      });
    }

    // ── Vẽ markers (trên route) ──────────────────────────────
    let dayIdx = 0;
    markers.forEach((m, i) => {
      const isHotel = m.type === 'hotel';
      const color   = typeColors[m.type] || '#10b981';
      if (!isHotel) dayIdx++;

      let html;
      if (isHotel) {
        html = \`<div style="position:relative;width:42px;height:50px">
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
            <ellipse cx="21" cy="48" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)"/>
            <path d="M21 1C12.2 1 5 8.2 5 17c0 11 16 31 16 31s16-20 16-31C37 8.2 29.8 1 21 1z" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="21" cy="17" r="10" fill="white"/>
            <polygon points="21,9 13,16 29,16" fill="#10b981"/>
            <rect x="16" y="16" width="10" height="8" fill="#10b981"/>
            <rect x="19" y="19" width="4" height="5" fill="white"/>
          </svg>
          <div style="position:absolute;top:-6px;right:-4px;background:#10b981;color:white;font-size:8px;font-weight:900;padding:2px 4px;border-radius:6px;border:1.5px solid white;font-family:sans-serif">KS</div>
        </div>\`;
      } else {
        html = \`<div style="position:relative;width:36px;height:44px">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
            <ellipse cx="18" cy="42" rx="5" ry="2" fill="rgba(0,0,0,0.25)"/>
            <path d="M18 1C10.3 1 4 7.3 4 15c0 9.6 14 27 14 27s14-17.4 14-27C32 7.3 25.7 1 18 1z" fill="\${color}" stroke="white" stroke-width="1.5"/>
            <circle cx="18" cy="15" r="8" fill="white"/>
            <text x="18" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="\${color}" font-family="sans-serif">\${dayIdx}</text>
          </svg>
        </div>\`;
      }

      const icon = L.divIcon({ html, iconSize:isHotel?[42,50]:[36,44], iconAnchor:isHotel?[21,50]:[18,44], popupAnchor:[0,-50], className:'' });
      const sessionLabel = m.session || '';
      const emoji  = isHotel ? '🏨' : (m.type==='tour' ? '📍' : '🍜');
      const label  = isHotel ? 'Điểm xuất phát' : (m.type==='tour' ? 'Tham quan' : 'Ăn uống');

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(\`<div style="font-family:sans-serif;min-width:160px;padding:4px 0">
        <div style="font-size:10px;font-weight:800;color:\${color};text-transform:uppercase;margin-bottom:4px">\${emoji} \${label}\${sessionLabel?' · Buổi '+sessionLabel:''}</div>
        <div style="font-size:14px;font-weight:900;color:#111">\${m.name}</div>
        \${m.thumbnail?'<img src="'+m.thumbnail+'" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-top:8px"/>':''}
      </div>\`, { maxWidth: 220 });

      // Click marker → highlight đường vào + ra
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        highlightMarker(i);
      });
    });

    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
  })();
  </script>
</body>
</html>`;
}

// ── Map Panel ─────────────────────────────────────────────────
const MapPanel = ({ data, editedPlans, currentHotel, onClose }) => {
  const numDays = parseInt(data.days?.toString().split(' ')[0]) || 3;
  const allDays = (editedPlans && editedPlans.length > 0)
    ? editedPlans.map(d => [
        { ...d.morning.tour,   type:'tour', session:'Sáng',  sessionColor:'#f59e0b', sessionIcon:SESSION_META[0].icon },
        { ...d.morning.food,   type:'food', session:'Sáng',  sessionColor:'#f59e0b', sessionIcon:SESSION_META[0].icon },
        { ...d.afternoon.tour, type:'tour', session:'Chiều', sessionColor:'#3b82f6', sessionIcon:SESSION_META[1].icon },
        { ...d.afternoon.food, type:'food', session:'Chiều', sessionColor:'#3b82f6', sessionIcon:SESSION_META[1].icon },
        { ...d.evening.tour,   type:'tour', session:'Tối',   sessionColor:'#8b5cf6', sessionIcon:SESSION_META[2].icon },
        { ...d.evening.food,   type:'food', session:'Tối',   sessionColor:'#8b5cf6', sessionIcon:SESSION_META[2].icon },
      ])
    : buildDayPlaces(data);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapHtml,     setMapHtml]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState('');
  const [panelWidth,  setPanelWidth]  = useState(50);
  const [activeLeg,   setActiveLeg]   = useState(-1); // legIdx đang highlight (-1 = không có)
  const iframeRef  = React.useRef(null);
  const isDragging = React.useRef(false);

  // Gắn callback vào iframe sau khi load — nhận thông báo từ Leaflet
  const onIframeLoad = React.useCallback(() => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      // Leaflet gọi callback này mỗi khi highlight/reset thay đổi
      win._onHighlightChange = (legIdx) => setActiveLeg(legIdx);
    } catch {}
  }, []);

  // Sidebar gọi highlight → đồng bộ cả iframe lẫn activeLeg
  const callHighlight = React.useCallback((legIdx) => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (!win?.highlightLeg) return;
      if (activeLeg === legIdx) {
        win.resetRoutes(); // toggle off → Leaflet sẽ gọi _onHighlightChange(-1)
      } else {
        win.highlightLeg(legIdx); // Leaflet sẽ gọi _onHighlightChange(legIdx)
      }
    } catch {}
  }, [activeLeg]);

  // Tính markerIdx và legIdx cho 1 place trong dayPlaces
  // markers[] = [hotel(0), place0(1), place1(2), ..., placeN(N+1)]
  // leg[i] nối markers[i] → markers[i+1]
  // → place tại globalIdx trong dayPlaces có markerIdx = globalIdx+1
  // → leg đi ra = markerIdx (= globalIdx+1); leg đi vào = markerIdx-1 (= globalIdx)
  // → điểm cuối (markerIdx = markers.length-1) chỉ có leg vào = markerIdx-1
  //
  // Với leg[L]: đầu mút gồm markerIdx=L (từ) và markerIdx=L+1 (đến)
  // → place có globalIdx = L-1 (nếu L>0) và globalIdx = L (nếu L < dayPlaces.length)
  // → hotel (markerIdx=0) là đầu mút của leg[0]
  //
  // isMarkerActive(markerIdx): marker này thuộc đầu mút của activeLeg không?
  const isMarkerActive = (markerIdx) =>
    activeLeg >= 0 && (markerIdx === activeLeg || markerIdx === activeLeg + 1);

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

  // ✅ ĐÃ SỬA: Ưu tiên lấy khách sạn mới (currentHotel) thay vì mặc định
  const hotelRaw = currentHotel || data.realHotels?.[0] || null;
  const hotelInfo = hotelRaw ? {
    name: hotelRaw.name,
    lat:  hotelRaw.lat || hotelRaw.latitude || null,
    lng:  hotelRaw.lng || hotelRaw.longitude || null,
    thumbnail: hotelRaw.thumbnail || null,
  } : null;

  const dayPlacesForEffect = allDays[selectedDay] || [];
  const coordFingerprint = dayPlacesForEffect
    .filter(p => p.lat && p.lng)
    .map(p => `${p.name}:${p.lat},${p.lng}`)
    .join('|');
    
  // ✅ ĐÃ SỬA: Tạo dấu vân tay cho khách sạn để React biết khi nào vẽ lại bản đồ
  const hotelFingerprint = hotelInfo ? `${hotelInfo.name}:${hotelInfo.lat},${hotelInfo.lng}` : 'no-hotel';

  useEffect(() => {
    let cancelled = false;
    const dayPlaces = allDays[selectedDay] || [];
    setLoading(true);
    setMapHtml('');
    setActiveLeg(-1);
    setLoadingMsg('Đang tìm tọa độ địa điểm...');

    resolveMarkers(hotelInfo, dayPlaces, data.location).then(results => {
      if (cancelled) return;
      if (results.length > 0) setLoadingMsg('Đang vẽ tuyến đường...');
      setMapHtml(buildLeafletHtml(results));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedDay, data.location, coordFingerprint, hotelFingerprint]); // Thêm hotelFingerprint vào theo dõi

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
                ref={iframeRef}
                onLoad={onIframeLoad}
                key={selectedDay + coordFingerprint + hotelFingerprint}
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

            {/* Khách sạn — markerIdx=0, là đầu mút của leg[0] */}
            {hotelInfo && (() => {
              const markerIdx = 0;
              const legIdx    = 0; // leg ra từ KS
              const isActive  = isMarkerActive(markerIdx);
              return (
                <div style={{ marginBottom:4 }}>
                  <div style={{ padding:'8px 20px', display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:800, color:'#10b981', textTransform:'uppercase', letterSpacing:'0.5px', position:'sticky', top:0, background:'white', zIndex:1, borderBottom:'1px solid #f8fafc' }}>
                    🏨 Điểm xuất phát
                  </div>
                  <div style={{ padding:'8px 20px' }}>
                    <div
                      className="mb-placerow"
                      onClick={() => callHighlight(legIdx)}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:12, cursor:'pointer', transition:'0.15s', background: isActive ? '#10b98118' : 'transparent', outline: isActive ? '2px solid #10b98150' : 'none' }}
                    >
                      <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background: isActive ? '#059669' : '#10b981', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'2px solid white', transition:'0.15s' }}>
                        {hotelInfo.thumbnail
                          ? <img src={hotelInfo.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                          : <span style={{ fontSize:14 }}>🏨</span>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{hotelInfo.name}</div>
                        <div style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>
                          Khách sạn · Điểm O
                          {isActive && <span style={{ marginLeft:6, fontSize:10, opacity:0.8 }}>↗ highlight</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

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
                      const markerIdx = globalIdx + 1; // +1 vì hotel ở index 0
                      const isLast    = markerIdx >= dayPlaces.length; // điểm cuối
                      // Leg để highlight khi click: ra (markerIdx) hoặc vào nếu là cuối (markerIdx-1)
                      const clickLeg  = isLast ? markerIdx - 1 : markerIdx;
                      // Row sáng nếu marker này là đầu hoặc cuối của activeLeg
                      const isActive  = isMarkerActive(markerIdx);
                      return (
                        <div
                          key={pi}
                          className="mb-placerow"
                          onClick={() => callHighlight(clickLeg)}
                          style={{
                            display:'flex', alignItems:'center', gap:12, padding:'10px 8px',
                            borderRadius:12, cursor:'pointer', transition:'0.15s',
                            position:'relative', zIndex:1, marginBottom:2,
                            background: isActive ? `${session.color}18` : 'transparent',
                            outline: isActive ? `2px solid ${session.color}50` : 'none',
                          }}
                        >
                          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background: isActive ? session.color : typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', border:'2px solid white', transition:'0.15s' }}>
                            {place.thumbnail
                              ? <img src={place.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                              : <FontAwesomeIcon icon={typeIcon(place.type)} style={{ color:'white', fontSize:13 }} />}
                          </div>
                          <div style={{ position:'absolute', left:34, top:8, width:14, height:14, borderRadius:'50%', backgroundColor:'white', border:`1.5px solid ${isActive ? session.color : typeColor(place.type)}`, fontSize:8, fontWeight:900, color: isActive ? session.color : typeColor(place.type), display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, transition:'0.15s' }}>
                            {globalIdx + 1}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:isActive?900:800, color:'#111827', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{place.name}</div>
                            <div style={{ fontSize:11, color: isActive ? session.color : typeColor(place.type), fontWeight:700 }}>
                              {place.type === 'tour' ? '📍 Tham quan' : '🍜 Ăn uống'}
                              {isActive && <span style={{ marginLeft:6, fontSize:10, opacity:0.8 }}>↗ highlight</span>}
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
const MapBubble = ({ targetOffset = 450, data, editedPlans }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [pulse,     setPulse]     = useState(false);
  
  // ✅ ĐÃ SỬA: Quản lý riêng khách sạn để cập nhật mượt mà
  const [currentHotel, setCurrentHotel] = useState(null);

  useEffect(() => {
    if (data?.realHotels?.[0]) setCurrentHotel(data.realHotels[0]);
  }, [data]);

  // ✅ ĐÃ SỬA: Lắng nghe sự kiện khi đổi khách sạn ở màn Lịch trình
  useEffect(() => {
    const handleHotelChange = (e) => setCurrentHotel(e.detail);
    window.addEventListener('sTripHotelChanged', handleHotelChange);
    return () => window.removeEventListener('sTripHotelChanged', handleHotelChange);
  }, []);

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
      
      {/* ✅ ĐÃ SỬA: Truyền currentHotel xuống cho MapPanel để vẽ lại */}
      {open && data && <MapPanel data={data} editedPlans={editedPlans} currentHotel={currentHotel} onClose={() => setOpen(false)} />}
    </>
  );
};

export default MapBubble;