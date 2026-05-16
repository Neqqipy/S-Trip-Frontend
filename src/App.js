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
import Dashboard from './components/Dashboard';
import SkeletonLoader from './components/SkeletonLoader';
import Toast from './components/Toast';
import { fetchTripPlan } from './services/api';
import { enrichPlacesWithCoords } from './services/geocodeUtils';
import './App.css';

// Component bọc logic trang chủ để giữ nguyên tính năng Scroll Spy
const HomePage = ({ 
  handleSearch, isLoading, searchData, editedPlans, setEditedPlans, 
  setActiveSection, setToast, scrollToSection 
}) => {
  return (
    <>
      <div id="hero-section" style={{ scrollMarginTop: '110px' }}>
        <Hero onSearch={handleSearch} />
      </div>
      
      <div id="itinerary-section" style={{ scrollMarginTop: '110px' }}>
        {isLoading && <SkeletonLoader />}
        {searchData && !isLoading && (
          <AiSchedule 
            data={searchData} 
            onSave={() => setToast({ show: true, message: 'Đã lưu vào Dashboard!', type: 'success' })}
            onPlanChange={setEditedPlans}
          />
        )}
      </div>

      <div id="featured-section" style={{ scrollMarginTop: '110px' }}>
        <FeaturedDestinations onNavigate={scrollToSection} />
      </div>
    </>
  );
};

function AppContent() {
  // --- GIỮ NGUYÊN TOÀN BỘ TRẠNG THÁI CŨ ---
  const [searchData, setSearchData] = useState(null);
  const [editedPlans, setEditedPlans] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Flag để tạm dừng scroll spy khi user vừa click nav
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  // Dùng ref để scroll spy luôn đọc giá trị mới nhất mà không cần re-register listener
  const activeSectionRef = useRef(activeSection);
  const searchDataRef = useRef(searchData);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);
  useEffect(() => { searchDataRef.current = searchData; }, [searchData]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  const location = useLocation(); // Để theo dõi URL hiện tại

  // --- 1. TỰ ĐỘNG THEO DÕI VỊ TRÍ CUỘN ---
  useEffect(() => {
    let scrollStopTimer;

    const handleScroll = () => {
      // Đang cuộn tự động bằng click Nav -> Bỏ qua
      if (isScrollingRef.current) {
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(() => { isScrollingRef.current = false; }, 150);
        return;
      }

      if (location.pathname !== '/' || activeSectionRef.current === 'dashboard') return;

      const hero = document.getElementById('hero-section');
      const itinerary = document.getElementById('itinerary-section');
      const featured = document.getElementById('featured-section');

      // Hàm kiểm tra xem section đã chạm/vượt qua mốc Navbar chưa
      const isPastNavbar = (el) => el && el.getBoundingClientRect().top <= 150;

      // Ưu tiên check từ dưới lên trên (Vì khi bạn cuộn xuống cuối, Featured sẽ nổi lên)
      if (isPastNavbar(featured)) {
        setActiveSection('featured');
      } 
      else if (isPastNavbar(itinerary) && (searchDataRef.current || isLoadingRef.current)) {
        setActiveSection('schedule');
      } 
      else if (hero) {
        setActiveSection('home'); // Mặc định là Trang chủ
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
    // Xóa timeout cũ để không bị đụng độ
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    // Khóa Scroll Spy ngay lập tức
    isScrollingRef.current = true;

    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false; }, 800);
      return;
    }

    // Đổi state active cho Navbar đổi màu ngay tức khắc
    if (id === 'hero-section') setActiveSection('home');
    else if (id === 'itinerary-section') setActiveSection('schedule');
    else if (id === 'featured-section') setActiveSection('featured');

    // Cuộn mượt mà
    setTimeout(() => {
      if (id === 'hero-section') {
        // Cuộn thẳng lên đỉnh màn hình (áp dụng cho Trang chủ)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        // Dùng scrollIntoView, CSS scrollMarginTop ở trên sẽ tự động chừa chỗ cho Navbar
        if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // Mở khóa Scroll Spy sau khi dự kiến cuộn xong
      scrollTimeoutRef.current = setTimeout(() => { 
        isScrollingRef.current = false; 
      }, 800);
    }, 50); // Delay 50ms để React kịp mount DOM nếu bạn vừa nhảy từ Dashboard về
  };

  // --- 3. XỬ LÝ TÌM KIẾM ---
  const handleSearch = async (formData) => {
    setIsLoading(true);
    setSearchData(null);
    setEditedPlans(null);
    // Set 'schedule' để nav active đúng ngay khi search
    setActiveSection('schedule');

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isScrollingRef.current = true;
    
    setTimeout(() => {
      const el = document.getElementById('itinerary-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      
      // Clear và set lại fallback timeout
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false; }, 800);
    }, 100);

    const result = await fetchTripPlan(
      formData.location, formData.budget, formData.days,
      formData.origin, formData.passengers, formData.departureDate
    );

    if (result) {
      setSearchData({
        ...formData,
        realHotels: result.hotels || [],
        realFlights: result.flights || [],
        realTours: result.tours || [],
        realFoods: result.foods || [],
        transport: result.transport || null,
      });
      setToast({ show: true, message: 'Đã AI hóa lịch trình thực tế cho bạn!', type: 'success' });

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
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, padding: 0 }}>
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={() => {
          window.location.hash = '/'; // 1. Đưa đường dẫn về trang chủ
          window.location.reload();   // 2. Tải lại toàn bộ trang để xóa Cache/State cũ
        }} 
        hasItinerary={hasItinerary}
      />
      
      <div> 
        <Routes>
          {/* ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN */}
          <Route path="/" element={
            activeSection !== 'dashboard' ? (
              <HomePage 
                handleSearch={handleSearch} isLoading={isLoading} 
                searchData={searchData} editedPlans={editedPlans} 
                setEditedPlans={setEditedPlans} setActiveSection={setActiveSection}
                setToast={setToast} scrollToSection={scrollToSection}
              />
            ) : (
              <div style={{ paddingTop: '110px' }}>
                <Dashboard onBack={() => setActiveSection('home')} />
              </div>
            )
          } />

          {/* TRANG XEM TẤT CẢ 63 TỈNH THÀNH */}
          <Route path="/destinations" element={
            <div style={{ paddingTop: '100px' }}>
              <FeaturedDestinations onNavigate={scrollToSection} />
            </div>
          } />
        </Routes>

        <MapBubble targetOffset={800} data={searchData} editedPlans={editedPlans} />
        <ChatAI tripData={searchData} />
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

// Wrap toàn bộ app trong Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;