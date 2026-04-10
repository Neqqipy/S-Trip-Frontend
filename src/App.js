import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import AiSchedule from './components/AiSchedule'; 
import './App.css'; 
import ChatAI from './components/ChatAI'; 
import MapBubble from './components/MapBubble';

function App() {
  const [searchData, setSearchData] = useState(null);
  const [activeSection, setActiveSection] = useState('home'); 

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id === 'hero-section' ? 'home' : 'schedule');
    }
  };

  // Hàm xử lý làm mới trang hoàn toàn
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSearch = (data) => {
    setSearchData(data);
    setTimeout(() => {
      scrollToSection('itinerary-section');
    }, 100);
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Truyền hàm handleRefresh vào Navbar */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onRefresh={handleRefresh} 
      />
      
      <div id="hero-section">
        <Hero onSearch={handleSearch} />
      </div>
      
      {searchData && (
        <div id="itinerary-section">
          <AiSchedule data={searchData} />
        </div>
      )}

      <FeaturedDestinations />
      <MapBubble targetOffset={800} data={searchData} />
      <ChatAI />
    </div>
  );
}

export default App;