import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import AiSchedule from './components/AiSchedule'; 
import ChatAI from './components/ChatAI'; 
import MapBubble from './components/MapBubble';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import './App.css'; 

function App() {
  const [searchData, setSearchData] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 

  // --- CƠ CHẾ SCROLL SPY CHÍNH XÁC 100% ---
  useEffect(() => {
    const handleScroll = () => {
      // Nếu đang ở Dashboard thì không cần theo dõi cuộn
      if (activeSection === 'dashboard') return;

      const heroSection = document.getElementById('hero-section');
      const itinerarySection = document.getElementById('itinerary-section');
      
      // Ngưỡng kích hoạt: Ngay khi Section cách đỉnh màn hình 120px (vừa khít dưới Navbar)
      const threshold = 120; 

      if (itinerarySection) {
        const rect = itinerarySection.getBoundingClientRect();
        // Nếu đỉnh của Itinerary đã cuộn lên gần sát Navbar
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

  // Giữ nguyên cấu trúc scrollToSection của Hưng
  const scrollToSection = (id) => {
    if (id === 'dashboard') {
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveSection('home');
    const element = document.getElementById(id);
    if (element) {
      // Tính toán vị trí cuộn trừ đi chiều cao Navbar để không bị che tiêu đề
      const offset = 100; 
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setActiveSection(id === 'hero-section' ? 'home' : 'schedule');
    }
  };

  const handleRefresh = () => window.location.reload();

  const handleSearch = (data) => {
    setSearchData(data);
    setTimeout(() => scrollToSection('itinerary-section'), 100);
  };

  const handleSaveTrip = (trip) => {
    const currentSaved = JSON.parse(localStorage.getItem('s_trip_saved_trips') || '[]');
    const isExisted = currentSaved.some(t => t.location === trip.location && t.days === trip.days);
    if (!isExisted) {
      localStorage.setItem('s_trip_saved_trips', JSON.stringify([...currentSaved, trip]));
      alert('Đã lưu lịch trình!');
    } else {
      alert('Lịch trình đã tồn tại.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, padding: 0 }}>
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={handleRefresh} 
      />
      
      {/* 1. XÓA paddingTop: '80px' ở đây để ảnh nền Hero bắt đầu từ sát mép trên */}
      <div> 
        {activeSection === 'dashboard' ? (
          <div style={{ paddingTop: '110px' }}> {/* Chỉ Dashboard mới cần đẩy xuống */}
            <Dashboard onBack={() => scrollToSection('hero-section')} />
          </div>
        ) : (
          <>
            <div id="hero-section">
              {/* 2. Chúng ta sẽ thêm padding vào BÊN TRONG Hero ở bước dưới */}
              <Hero onSearch={handleSearch} />
            </div>
            
            <div style={{ paddingTop: '50px' }}> {/* Tạo khoảng cách cho các phần dưới */}
              {searchData && (
                <div id="itinerary-section">
                  <AiSchedule data={searchData} onSave={() => handleSaveTrip(searchData)} />
                </div>
              )}
              <FeaturedDestinations />
            </div>
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