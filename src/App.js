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
import NotFound from './components/NotFound';
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
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; 
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

  // --- 4. THÔNG BÁO (TOAST) ---
  const showNotification = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  };

  // --- 5. XỬ LÝ TÌM KIẾM & LOADING ---
  const handleSearch = (data) => {
    setIsLoading(true);
    setSearchData(null); 
    
    setTimeout(() => scrollToSection('itinerary-section'), 100);

    // Giả lập AI xử lý trong 2 giây
    setTimeout(() => {
      setSearchData(data);
      setIsLoading(false);
    }, 2000);
  };

  // --- 6. LƯU LỊCH TRÌNH (LOCALSTORAGE) ---
  const handleSaveTrip = (trip) => {
    const currentSaved = JSON.parse(localStorage.getItem('s_trip_saved_trips') || '[]');
    const isExisted = currentSaved.some(t => t.location === trip.location && t.days === trip.days);
    
    if (!isExisted) {
      localStorage.setItem('s_trip_saved_trips', JSON.stringify([...currentSaved, trip]));
      showNotification('Đã lưu lịch trình vào tài khoản!');
    } else {
      showNotification('Lịch trình này đã tồn tại.', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* NAVBAR SÁT ĐỈNH */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={handleRefresh} 
      />
      
      <div> 
        {/* ĐIỀU HƯỚNG SECTION CHÍNH */}
        {activeSection === 'home' || activeSection === 'schedule' ? (
          <>
            <div id="hero-section">
              <Hero onSearch={handleSearch} />
            </div>
            
            <div id="itinerary-section">
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
        ) : activeSection === 'dashboard' ? (
          <div style={{ paddingTop: '110px' }}>
            <Dashboard onBack={() => scrollToSection('hero-section')} />
          </div>
        ) : (
          /* TRANG 404 */
          <div style={{ paddingTop: '110px' }}>
            <NotFound onBackHome={() => scrollToSection('hero-section')} />
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