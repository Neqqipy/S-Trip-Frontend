import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import AiSchedule from './components/AiSchedule'; 
import ChatAI from './components/ChatAI'; 
import MapBubble from './components/MapBubble';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import SkeletonLoader from './components/SkeletonLoader'; // Thành phần mới bổ sung
import './App.css'; 

function App() {
  // --- QUẢN LÝ TRẠNG THÁI ---
  const [searchData, setSearchData] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 
  const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ AI

  // --- 1. TỰ ĐỘNG THEO DÕI VỊ TRÍ CUỘN (SCROLL SPY) ---
  useEffect(() => {
    const handleScroll = () => {
      if (activeSection === 'dashboard') return;

      const heroSection = document.getElementById('hero-section');
      const itinerarySection = document.getElementById('itinerary-section');
      const threshold = 120; // Ngưỡng kích hoạt dưới Navbar

      if (itinerarySection) {
        const rect = itinerarySection.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          setActiveSection('schedule');
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
  }, [activeSection, searchData]);

  // --- 2. HÀM ĐIỀU HƯỚNG MƯỢT MÀ ---
  const scrollToSection = (id) => {
    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveSection('home');
    // Chờ một chút để React render lại trang Home trước khi cuộn
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; // Khoảng cách trừ hao cho Navbar
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
        setActiveSection(id === 'hero-section' ? 'home' : 'schedule');
      }
    }, 10);
  };

  // --- 3. LÀM MỚI TRANG (NÚT LOGO) ---
  const handleRefresh = () => {
    window.location.reload();
  };

  // --- 4. XỬ LÝ TÌM KIẾM & GIẢ LẬP LOADING ---
  const handleSearch = (data) => {
    setIsLoading(true);
    setSearchData(null); // Tạm ẩn kết quả cũ
    
    // Cuộn xuống vùng kết quả để thấy Skeleton
    setTimeout(() => scrollToSection('itinerary-section'), 100);

    // Giả lập thời gian AI "suy nghĩ" 2 giây
    setTimeout(() => {
      setSearchData(data);
      setIsLoading(false);
    }, 2000);
  };

  // --- 5. LƯU LỊCH TRÌNH VÀO LOCALSTORAGE (PHẦN 2) ---
  const handleSaveTrip = (trip) => {
    const currentSaved = JSON.parse(localStorage.getItem('s_trip_saved_trips') || '[]');
    const isExisted = currentSaved.some(t => t.location === trip.location && t.days === trip.days);
    
    if (!isExisted) {
      localStorage.setItem('s_trip_saved_trips', JSON.stringify([...currentSaved, trip]));
      alert('Đã lưu lịch trình vào tài khoản của bạn!');
    } else {
      alert('Lịch trình này đã tồn tại trong danh sách lưu.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* NAVBAR SÁT MÉP TRÊN */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={handleRefresh} 
      />
      
      {/* KHÔNG DÙNG padding ở đây để ảnh nền Hero bắt đầu sát đỉnh */}
      <div> 
        {activeSection === 'dashboard' ? (
          /* TRANG CÁ NHÂN (Cần padding riêng để không bị đè) */
          <div style={{ paddingTop: '110px' }}>
            <Dashboard onBack={() => scrollToSection('hero-section')} />
          </div>
        ) : (
          /* TRANG CHỦ */
          <>
            <div id="hero-section">
              {/* Lưu ý: Hưng cần thêm paddingTop: '110px' vào Hero.js để khớp nội dung */}
              <Hero onSearch={handleSearch} />
            </div>
            
            <div id="itinerary-section">
              {/* HIỂN THỊ SKELETON KHI ĐANG TẢI */}
              {isLoading && <SkeletonLoader />}
              
              {searchData && !isLoading && (
                <AiSchedule 
                  data={searchData} 
                  onSave={() => handleSaveTrip(searchData)} 
                />
              )}
            </div>

            <FeaturedDestinations />
          </>
        )}

        <MapBubble targetOffset={800} data={searchData} />
        <ChatAI />
      </div>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

export default App;