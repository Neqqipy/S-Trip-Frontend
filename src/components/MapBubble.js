import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

const MapBubble = ({ targetOffset = 450 }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = () => {
    window.scrollTo({
      top: targetOffset,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      onClick={handleScroll}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        right: '50px',
        bottom: '165px', 
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 1999,
        border: '3px solid white', // Thêm viền trắng cho nổi bật
        
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',

        boxShadow: isHovered 
          ? '0 15px 35px rgba(0, 0, 0, 0.4)' 
          : '0 10px 25px rgba(0, 0, 0, 0.3)',
        
        transition: '0.3s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isHovered ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(0deg)',
        
        backgroundImage: `url('/map.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',

        // CÁCH 1: Dùng filter để tăng độ sáng (brightness) và độ tươi (saturate)
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1.2)', 
      }}
    >
      {/* Lớp Overlay làm sáng nền thay vì làm tối */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        // CÁCH 2: Chỉnh rgba về 0 để không làm tối ảnh, hoặc dùng màu trắng rất nhạt
        backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0)', 
        transition: '0.3s',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
      </div>
    </div>
  );
};

export default MapBubble;