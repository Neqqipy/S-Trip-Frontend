import React, { useState, useEffect, useRef } from 'react';
// 1. Import Router
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import AiSchedule from './components/AiSchedule';
import ChatAI from './components/ChatAI';
import MapBubble from './components/MapBubble';
import Footer from './components/Footer';
import ProfilePage from './components/Profilepage';
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import { fetchTripPlan } from './services/api';
import { enrichPlacesWithCoords } from './services/geocodeUtils';
import './App.css';

const BASE_URL = ''; // proxy qua React dev server

// Component bọc logic trang chủ để giữ nguyên tính năng Scroll Spy
const HomePage = ({ 
  handleSearch, isLoading, searchData, editedPlans, setEditedPlans, 
  setActiveSection, setToast, scrollToSection, isDark
}) => {
  return (
    <>
      <div id="hero-section" style={{ scrollMarginTop: '110px' }}>
        <Hero onSearch={handleSearch} isDark={isDark} />
      </div>
      
      <div id="itinerary-section" style={{ scrollMarginTop: '110px' }}>
        {isLoading && <SkeletonLoader />}
        {searchData && !isLoading && (
          <AiSchedule 
            data={searchData} 
            onPlanChange={setEditedPlans}
            isDark={isDark}
            onSave={async () => {
              try {
                const res = await fetch('/api/schedules/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    title: `Khám phá ${searchData.location}`,
                    location: searchData.location,
                    days: parseInt(String(searchData.days || '3').split(' ')[0]),
                    data_json: { searchData, editedPlans }
                  })
                });
                const data = await res.json();
                
                if (data.success) {
                  setToast({ show: true, message: 'Đã lưu thành công vào Hồ sơ của bạn!', type: 'success' });
                } else {
                  setToast({ show: true, message: data.error || 'Lỗi khi lưu!', type: 'error' });
                }
              } catch (err) {
                setToast({ show: true, message: 'Lỗi kết nối đến máy chủ', type: 'error' });
              }
            }}
          />
        )}
      </div>

      <div id="featured-section" style={{ scrollMarginTop: '110px' }}>
        <FeaturedDestinations onNavigate={scrollToSection} isDark={isDark} />
      </div>
    </>
  );
};

function AppContent() {
  const [searchData, setSearchData] = useState(() => {
    const savedData = localStorage.getItem('s_trip_last_search');
    return savedData ? JSON.parse(savedData) : null;
  });
  const [editedPlans, setEditedPlans] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isDark, setIsDark] = useState(() => {
  const savedTheme = localStorage.getItem('sTripTheme');
    return savedTheme === 'dark'; // Trả về true nếu đã lưu dark
  });

  useEffect(() => {
    localStorage.setItem('sTripTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // user state nâng lên AppContent để chia sẻ giữa Navbar và ProfilePage
  const [user, setUser] = useState(null);

  // Flag để tạm dừng scroll spy khi user vừa click nav
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const activeSectionRef = useRef(activeSection);
  const searchDataRef = useRef(searchData);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);
  useEffect(() => { searchDataRef.current = searchData; }, [searchData]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // ✅ [THÊM MỚI] Kiểm tra session khi app load (chuyển từ Navbar sang đây)
  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user); })
      .catch(() => {});

    // Xử lý Google OAuth redirect ?auth_success=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success')) {
      fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' })
        .then(r => r.json())
        .then(d => { if (d.success) setUser(d.user); });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const location = useLocation();

  // --- 1. TỰ ĐỘNG THEO DÕI VỊ TRÍ CUỘN ---
  useEffect(() => {
    let scrollStopTimer;

    const handleScroll = () => {
      if (isScrollingRef.current) {
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(() => { isScrollingRef.current = false; }, 150);
        return;
      }

      if (location.pathname !== '/' || activeSectionRef.current === 'dashboard') return;

      const hero = document.getElementById('hero-section');
      const itinerary = document.getElementById('itinerary-section');
      const featured = document.getElementById('featured-section');

      const isPastNavbar = (el) => el && el.getBoundingClientRect().top <= 150;

      if (isPastNavbar(featured)) {
        setActiveSection('featured');
      } 
      else if (isPastNavbar(itinerary) && (searchDataRef.current || isLoadingRef.current)) {
        setActiveSection('schedule');
      } 
      else if (hero) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollStopTimer);
    };
  }, [location.pathname]);

  // --- 2. HÀM ĐIỀU HƯỚNG MƯỢT MÀ ---
  const scrollToSection = (id) => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    isScrollingRef.current = true;

    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false; }, 800);
      return;
    }

    if (id === 'hero-section') setActiveSection('home');
    else if (id === 'itinerary-section') setActiveSection('schedule');
    else if (id === 'featured-section') setActiveSection('featured');

    setTimeout(() => {
      if (id === 'hero-section') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      scrollTimeoutRef.current = setTimeout(() => { 
        isScrollingRef.current = false; 
      }, 800);
    }, 50);
  };

  // --- 3. XỬ LÝ TÌM KIẾM ---
  const handleSearch = async (formData) => {
    setIsLoading(true);
    setSearchData(null);
    setEditedPlans(null);
    setActiveSection('schedule');

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isScrollingRef.current = true;
    
    setTimeout(() => {
      const el = document.getElementById('itinerary-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false; }, 800);
    }, 100);

    const result = await fetchTripPlan(
      formData.location, formData.budget, formData.days,
      formData.origin, formData.passengers, formData.departureDate
    );

    if (result) {
      const fullPlan = {
        ...formData,
        realHotels: result.hotels || [],
        realFlights: result.flights || [],
        realTours: result.tours || [],
        realFoods: result.foods || [],
        transport: result.transport || null,
      };
      setSearchData(fullPlan);
      localStorage.setItem('s_trip_last_search', JSON.stringify(fullPlan));
      setToast({ show: true, message: 'Đã AI hóa lịch trình thực tế cho bạn!', type: 'success' });

      // 💾 Lưu lịch sử tìm kiếm vào DB (chạy nền, không block UI)
      fetch(`${BASE_URL}/api/search-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          origin: formData.origin || '',
          destination: formData.location || '',
          days: parseInt(String(formData.days || '3').split(' ')[0]),
          passengers: parseInt(formData.passengers || 1),
        }),
      }).catch(() => {}); // silent fail nếu chưa đăng nhập

      enrichPlacesWithCoords(formData.location, result.tours || [], result.foods || [])
        .then(({ tours: enrichedTours, foods: enrichedFoods }) => {
          setSearchData(prev => prev ? { ...prev, realTours: enrichedTours, realFoods: enrichedFoods } : prev);
        }).catch(() => {});
    } else {
      setToast({ show: true, message: 'Lỗi kết nối Backend!', type: 'error' });
    }
    setIsLoading(false);
  };

  const hasItinerary = !!searchData || isLoading;

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'} style={{ backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', color: isDark ? '#e8e8e8' : '#111827', minHeight: '100vh', margin: 0, padding: 0, transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={() => {
          setActiveSection('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasItinerary={hasItinerary}
        isDark={isDark}
        onToggleTheme={() => setIsDark(prev => !prev)}
        // ✅ [THÊM MỚI] Truyền user và callback cập nhật xuống Navbar
        user={user}
        onUserChange={setUser}
      />
      
      <div> 
        <Routes>
          <Route path="/" element={
            activeSection !== 'dashboard' ? (
              <HomePage 
                handleSearch={handleSearch} isLoading={isLoading} 
                searchData={searchData} editedPlans={editedPlans} 
                setEditedPlans={setEditedPlans} setActiveSection={setActiveSection}
                setToast={setToast} scrollToSection={scrollToSection}
                isDark={isDark}
              />
            ) : (
              <div style={{ paddingTop: '110px' }}>
                {/* ✅ [THÊM MỚI] Truyền onUserChange để ProfilePage cập nhật avatar lên Navbar */}
                <ProfilePage
                  onBack={() => setActiveSection('home')}
                  isDark={isDark}
                  user={user}
                  onUserChange={setUser}
                  onLoadSchedule={(dataJson) => {
                    if (!dataJson) { setActiveSection('home'); return; }
                    setSearchData(dataJson.searchData);
                    setEditedPlans(dataJson.editedPlans);
                    setActiveSection('home');
                    setTimeout(() => {
                      const el = document.getElementById('itinerary-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                />
              </div>
            )
          } />

          <Route path="/destinations" element={
            <div style={{ paddingTop: '100px' }}>
              <FeaturedDestinations onNavigate={scrollToSection} isDark={isDark} />
            </div>
          } />
        </Routes>

        <MapBubble targetOffset={800} data={searchData} editedPlans={editedPlans} isDark={isDark} />
        <ChatAI tripData={searchData} isDark={isDark}/>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} isDark={isDark} />
      )}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;