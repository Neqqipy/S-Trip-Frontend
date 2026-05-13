import React, { useState, useEffect } from 'react';
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
      <div id="hero-section">
        <Hero onSearch={handleSearch} />
      </div>
      
      <div id="itinerary-section">
        {isLoading && <SkeletonLoader />}
        {searchData && !isLoading && (
          <AiSchedule 
            data={searchData} 
            onSave={() => setToast({ show: true, message: 'Đã lưu vào Dashboard!', type: 'success' })}
            onPlanChange={setEditedPlans}
          />
        )}
      </div>

      <div id="featured-section">
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
  
  const location = useLocation(); // Để theo dõi URL hiện tại

  // --- 1. TỰ ĐỘNG THEO DÕI VỊ TRÍ CUỘN (GIỮ NGUYÊN) ---
  useEffect(() => {
    const handleScroll = () => {
      // Chỉ chạy Scroll Spy khi đang ở trang chủ (path là '/')
      if (location.pathname !== '/' || activeSection === 'dashboard') return;

      const heroSection = document.getElementById('hero-section');
      const itinerarySection = document.getElementById('itinerary-section');
      const featuredSection = document.getElementById('featured-section');
      const threshold = 150;

      if (itinerarySection && searchData) {
        const rect = itinerarySection.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          setActiveSection('schedule');
          return;
        }
      }

      if (featuredSection) {
        const rect = featuredSection.getBoundingClientRect();
        if (rect.top <= threshold) {
          setActiveSection('featured');
          return;
        }
      }

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (rect.top <= threshold) setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, searchData, location.pathname]);

  // --- 2. HÀM ĐIỀU HƯỚNG MƯỢT MÀ (GIỮ NGUYÊN) ---
  const scrollToSection = (id) => {
    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveSection('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 90;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        if (id === 'itinerary-section') setActiveSection('schedule');
        else if (id === 'featured-section') setActiveSection('featured');
        else setActiveSection('home');
      }
    }, 10);
  };

  // --- 3. XỬ LÝ TÌM KIẾM (GIỮ NGUYÊN) ---
  const handleSearch = async (formData) => {
    setIsLoading(true);
    setSearchData(null);
    setEditedPlans(null);
    setActiveSection('home');

    setTimeout(() => {
      const el = document.getElementById('itinerary-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  const hasItinerary = !!searchData && !isLoading;

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