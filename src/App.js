import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedDestinations from './components/FeaturedDestinations';
import AiSchedule from './components/AiSchedule'; // Import file mới
import './App.css'; // Quan trọng nhất là dòng này!
import ChatAI from './components/ChatAI'; // Import file mới

function App() {
  const [searchData, setSearchData] = useState(null);

  const handleSearch = (data) => {
    setSearchData(data);
    // Tự động cuộn xuống phần lịch trình cho Nhi xem
    setTimeout(() => {
      window.scrollTo({ top: 700, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <Hero onSearch={handleSearch} />
      
      {/* Chỉ hiện lịch trình khi Nhi đã nhấn nút Tìm kiếm */}
      {searchData && <AiSchedule data={searchData} />}

      <FeaturedDestinations />
      <ChatAI />
    </div>
  );
}

export default App;