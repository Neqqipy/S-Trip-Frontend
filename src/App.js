import React, { useState, useEffect } from 'react';
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
import './App.css';

function App() {
  // --- QUẢN LÝ TRẠNG THÁI ---
  const [searchData, setSearchData] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- 1. TỰ ĐỘNG THEO DÕI VỊ TRÍ CUỘN (SCROLL SPY) ---
  useEffect(() => {
    const handleScroll = () => {
      // Không spy khi đang ở trang Dashboard
      if (activeSection === 'dashboard') return;

      const heroSection = document.getElementById('hero-section');
      const itinerarySection = document.getElementById('itinerary-section');
      const featuredSection = document.getElementById('featured-section');
      const threshold = 150; // Ngưỡng kích hoạt dưới Navbar

      // Kiểm tra theo thứ tự ưu tiên ngược từ dưới lên
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
        if (rect.top <= threshold) {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, searchData]); // Lắng nghe searchData để biết khi nào Lịch trình xuất hiện

  // --- 2. HÀM ĐIỀU HƯỚNG MƯỢT MÀ ---
  const scrollToSection = (id) => {
    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Nếu quay về Home, đưa trạng thái về home ngay
    setActiveSection('home');
    
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 90; // Khoảng cách trừ hao cho Navbar cố định
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
        
        // Cập nhật trạng thái Active dựa trên mục tiêu cuộn
        if (id === 'itinerary-section') setActiveSection('schedule');
        else if (id === 'featured-section') setActiveSection('featured');
        else setActiveSection('home');
      }
    }, 10);
  };

  // --- 3. XỬ LÝ TÌM KIẾM (Gửi đủ 5 tham số đồng bộ) ---
  const handleSearch = async (formData) => {
    setIsLoading(true);
    setSearchData(null); 
    setActiveSection('home');

    // Tự động cuộn chờ (giống code tham khảo)
    setTimeout(() => {
      const el = document.getElementById('itinerary-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const result = await fetchTripPlan(
      formData.location, 
      formData.budget, 
      formData.days,
      formData.origin,
      formData.passengers,
      formData.departureDate
    );

    if (result) {
      setSearchData({
        ...formData,
        realHotels:  result.hotels  || [],
        realFlights: result.flights || [],
        realTours:   result.tours   || [],
        realFoods:   result.foods   || [],
      });
      setToast({ show: true, message: 'Đã AI hóa lịch trình thực tế cho bạn!', type: 'success' });
    } else {
      setToast({ show: true, message: 'Lỗi kết nối Backend!', type: 'error' });
    }
    setIsLoading(false);
  };

  // Biến kiểm tra để Navbar biết khi nào được mở khóa nút Lịch trình
  const hasItinerary = !!searchData && !isLoading;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* NAVBAR: Nhận prop hasItinerary để xử lý trạng thái nút */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={() => window.location.reload()}
        hasItinerary={hasItinerary}
      />
      
      <div> 
        {/* ĐIỀU HƯỚNG SECTION CHÍNH */}
        {activeSection !== 'dashboard' ? (
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
                />
              )}
            </div>

            <div id="featured-section">
              <FeaturedDestinations onNavigate={scrollToSection} />
            </div>
          </>
        ) : (
          /* TRANG DASHBOARD */
          <div style={{ paddingTop: '110px' }}>
            <Dashboard onBack={() => scrollToSection('hero-section')} />
          </div>
        )}

        <MapBubble targetOffset={800} data={searchData} />
        <ChatAI tripData={searchData} />
      </div>

      {/* HIỂN THỊ THÔNG BÁO */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

export default App;