import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ExploreVietnam from './ExploreVietnam/ExploreVietnam';

const AboutPage = ({ isDark, onNavigate, setActiveSection }) => {
  const navigate = useNavigate();
  const accentColor = '#08B2A6';
  const secondaryAccent = '#8b5cf6';

  const textColor = isDark ? '#f8fafc' : '#1e293b';
  const bgColor = isDark ? '#050914' : '#f1f5f9';

  const features = [
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>,
      title: 'Bản đồ trực quan sinh động',
      desc: 'Trải nghiệm giao diện bản đồ thông minh, cho phép bạn tương tác trực tiếp, dễ dàng tra cứu khoảng cách và định vị hàng ngàn điểm đến hấp dẫn trên toàn quốc.',
      color: accentColor,
      iconBg: 'rgba(8,178,166,0.1)',
      iconBorder: 'rgba(8,178,166,0.25)',
      n: '01',
      img: '/images_provinces/da-nang.jpg',
      date: 'Cập nhật liên tục',
      author: 'S-Trip',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
      title: 'Lịch trình cá nhân hóa',
      desc: 'Chỉ cần chia sẻ sở thích, ngân sách và thời gian, hệ thống sẽ tự động phân tích và phác thảo một chuyến đi hoàn hảo, chi tiết đến từng giờ dành riêng cho bạn.',
      color: secondaryAccent,
      iconBg: 'rgba(139,92,246,0.1)',
      iconBorder: 'rgba(139,92,246,0.25)',
      n: '02',
      img: '/images_provinces/ha-noi.jpg',
      date: 'AI Powered',
      author: 'Smart System',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>,
      title: 'Văn hóa & Bản địa',
      desc: 'Hơn 10,000 điểm đến được số hóa tỉ mỉ, kết nối bạn với những câu chuyện lịch sử hào hùng, nét văn hóa đặc sắc và bí kíp du lịch chân thực từ người dân địa phương.',
      color: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.1)',
      iconBorder: 'rgba(245,158,11,0.25)',
      n: '03',
      img: '/images_provinces/thua-thien-hue.jpg',
      date: 'Chân thực',
      author: 'Local Guide',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
      title: 'Trải nghiệm trọn vẹn',
      desc: 'Đồng hành cùng bạn trên mọi nẻo đường với các gợi ý điểm dừng chân lý tưởng, quán ăn đặc sản và mẹo hay thực tế để bạn luôn an tâm tận hưởng chuyến đi.',
      color: '#ec4899',
      iconBg: 'rgba(236,72,153,0.1)',
      iconBorder: 'rgba(236,72,153,0.25)',
      n: '04',
      img: '/images_provinces/quang-ninh.jpg',
      date: 'Hỗ trợ 24/7',
      author: 'S-Trip',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      title: 'Cộng đồng xê dịch',
      desc: 'Kết nối với hàng ngàn tín đồ du lịch khác, tham khảo đánh giá chân thực và lưu giữ những khoảnh khắc đáng nhớ của riêng bạn.',
      color: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.1)',
      iconBorder: 'rgba(59,130,246,0.25)',
      n: '05',
      img: '/images_provinces/tp-ho-chi-minh.jpg',
      date: 'Mạng xã hội',
      author: 'Cộng đồng',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>,
      title: 'Tối ưu ngân sách',
      desc: 'Công cụ thông minh giúp bạn phân bổ chi tiêu hợp lý, gợi ý các phương án di chuyển và lưu trú để chuyến đi vừa trọn vẹn vừa tiết kiệm nhất.',
      color: '#10b981',
      iconBg: 'rgba(16,185,129,0.1)',
      iconBorder: 'rgba(16,185,129,0.25)',
      n: '06',
      img: '/images_provinces/ninh-binh.jpg',
      date: 'Tiết kiệm',
      author: 'Smart System',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></svg>,
      title: 'Dẫn đường thông minh',
      desc: 'Hệ thống tự động vẽ sẵn lộ trình tối ưu trên bản đồ, hướng dẫn chi tiết từng ngã rẽ giúp bạn di chuyển dễ dàng mà không lo lạc bước.',
      color: '#14b8a6',
      iconBg: 'rgba(20,184,166,0.1)',
      iconBorder: 'rgba(20,184,166,0.25)',
      n: '07',
    },
    {
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="12" y1="7" x2="12" y2="13"></line></svg>,
      title: 'Đánh giá thực tế',
      desc: 'Hệ thống nhận xét trực tiếp từ hàng triệu du khách. Đọc review và xem hình ảnh thực tế để ra quyết định chính xác trước khi đi.',
      color: '#f43f5e',
      iconBg: 'rgba(244,63,94,0.1)',
      iconBorder: 'rgba(244,63,94,0.25)',
      n: '08',
    },
  ];

  const borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const subtleText = isDark ? 'rgba(255,255,255,0.5)' : '#475569';
  const labelText = isDark ? 'rgba(8,178,166,0.85)' : 'rgba(8,178,166,1)';
  // Ghost numbers & outline text — rõ hơn ở cả 2 mode
  const outlineStroke = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)';
  // Ghost number màu tint để vừa thấy vừa không chói
  const ghostNumColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(30,41,59,0.06)';

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          animation: floatOrb 20s infinite alternate ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 {
          width: 800px; height: 800px;
          background: radial-gradient(circle, ${isDark ? 'rgba(8,178,166,0.2)' : 'rgba(8,178,166,0.25)'} 0%, transparent 70%);
          top: -10%; left: -10%;
          filter: blur(40px);
        }
        .orb-2 {
          width: 900px; height: 900px;
          background: radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.2)'} 0%, transparent 70%);
          top: 30%; right: -20%;
          animation-delay: -5s;
          filter: blur(50px);
        }
        .orb-3 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, ${isDark ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.2)'} 0%, transparent 70%);
          bottom: -10%; left: 10%;
          animation-delay: -10s;
          filter: blur(40px);
        }
        @keyframes floatOrb {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(50px, 80px) scale(1.08); }
          66%  { transform: translate(-30px, 120px) scale(0.93); }
          100% { transform: translate(80px, -30px) scale(1.05); }
        }

        /* Drum */
        .mdigi-drum {
          position: absolute;
          top: -1000px;
          left: 50%;
          width: 2000px;
          height: 2000px;
          background-image: url('/hoa-tiet-trong-dong.jpg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          
          /* Xử lý ảnh JPG nền trắng thành trong suốt bằng CSS Blend Mode */
          filter: ${isDark ? 'invert(1)' : 'grayscale(100%)'};
          mix-blend-mode: ${isDark ? 'screen' : 'multiply'};
          opacity: ${isDark ? 0.15 : 0.12};
          
          pointer-events: none;
          z-index: 1;
          animation: spinSlowly 240s linear infinite;
          
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
        }
        @keyframes spinSlowly {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .mdigi-drum { width: 1400px; height: 1400px; top: -700px; }
        }
        @media (max-width: 768px) {
          .mdigi-drum { width: 900px; height: 900px; top: -450px; opacity: ${isDark ? 0.08 : 0.15}; }
        }

        /* Ticker */
        .ticker-track {
          display: flex;
          gap: 0;
          white-space: nowrap;
          width: max-content;
          animation: ticker 28s linear infinite;
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .ticker-set {
          display: flex;
          gap: 60px;
          padding-right: 60px;
          flex-shrink: 0;
        }
        .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: ${labelText};
          flex-shrink: 0;
        }
        .ticker-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: ${accentColor};
          flex-shrink: 0;
        }

        /* Mission / Vision grid */
        .mv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .mv-grid { grid-template-columns: 1fr; }
        }

        /* Feature Bento Grid */
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding-bottom: 80px;
        }
        .bento-0 { grid-column: span 2; }
        .bento-1 { grid-column: span 1; }
        .bento-2 { grid-column: span 1; }
        .bento-3 { grid-column: span 2; }
        .bento-4 { grid-column: span 2; }
        .bento-5 { grid-column: span 1; }
        .bento-6 { grid-column: span 1; }
        .bento-7 { grid-column: span 2; }

        @media (max-width: 1024px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
          .bento-0, .bento-1, .bento-2, .bento-3, .bento-4, .bento-5, .bento-6, .bento-7 {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          .bento-0 { grid-column: span 2 !important; }
        }
        @media (max-width: 640px) {
          .feat-grid { display: flex; flex-direction: column; }
        }

        /* Feature card (Bento Card) */
        .feat-card {
          background: ${isDark ? 'linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(241,245,249,0.9) 100%)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: ${isDark ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 20px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)'};
          border-radius: 32px;
          overflow: hidden;
          position: relative;
          padding: 40px;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
        }

        .feat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px var(--hover-box-shadow), inset 0 1px 0 rgba(255,255,255,0.1);
          z-index: 10;
        }
        
        /* Spotlight Effect on Hover */
        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 50% 0%, var(--card-color-light), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .feat-card:hover::before {
          opacity: 1;
        }
        
        .feat-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Icon Tilt on Hover */
        .feat-icon-wrapper {
          transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: center;
        }
        .feat-card:hover .feat-icon-wrapper {
          transform: rotate(10deg) scale(1.08);
        }
      `}</style>

      {/* ── BACKGROUND ORBS ── */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      
      {/* ── BACKGROUND DRUM ── */}
      <div className="mdigi-drum" />

      {/* ── 1. TICKER BAR (BANNER) ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: `1px solid ${isDark ? 'rgba(8,178,166,0.2)' : 'rgba(8,178,166,0.3)'}`,
        borderBottom: `1px solid ${isDark ? 'rgba(8,178,166,0.2)' : 'rgba(8,178,166,0.3)'}`,
        background: isDark ? 'rgba(8,178,166,0.04)' : 'rgba(8,178,166,0.06)',
        padding: '13px 0',
        overflow: 'hidden',
      }}>
        <div className="ticker-track" aria-hidden="true">
          {/* Lặp 4 set để luôn lấp đầy màn hình, animate translateX(-25%) = 1 set */}
          {[0, 1, 2, 3].map(setIdx => (
            <div key={setIdx} className="ticker-set">
              {['Du lịch thông minh', 'Bản đồ tương tác', '10,000+ điểm đến', 'Lịch trình cá nhân hóa', 'Khám phá Việt Nam'].map((t, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-dot" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── 0. HERO SECTION ── */}
      <section style={{ 
        position: 'relative', zIndex: 2, 
        padding: '160px 24px 80px', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' 
      }}>
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '100px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            marginBottom: '10px'
          }}
        >
          <span>✨</span>
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: subtleText }}>
            NỀN TẢNG DU LỊCH S-TRIP
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: '900', lineHeight: 1.15,
            letterSpacing: '-1.5px', marginTop: 0, marginBottom: '24px', color: textColor,
          }}
        >
          Hệ sinh thái <br/>
          <span style={{ color: '#10b981' }}>Du lịch thông minh</span>
        </motion.h1>

        {/* Desc */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: '17px', lineHeight: 1.7, color: subtleText,
            maxWidth: '660px', margin: '0 auto 40px'
          }}
        >
          Đồng hành cùng hàng triệu du khách khám phá mảnh đất hình chữ S với công cụ lập lịch trình AI, bản đồ tương tác và mạng lưới điểm đến khổng lồ.
        </motion.p>

        {/* Small Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '48px'
          }}
        >
          {[
            { 
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, 
              text: '63 Tỉnh thành' 
            },
            { 
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>, 
              text: 'Lịch trình AI' 
            },
            { 
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>, 
              text: '10,000+ Điểm đến' 
            }
          ].map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '8px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              fontSize: '13px', fontWeight: '600', color: subtleText
            }}>
              <span style={{ display: 'flex' }}>{b.icon}</span> {b.text}
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button 
            onClick={() => {
              if (setActiveSection) setActiveSection('home');
              window.scrollTo(0, 0);
              navigate('/');
            }}
            style={{
              padding: '16px 32px', borderRadius: '12px', border: 'none',
              background: '#10b981', color: 'white', fontWeight: '700', fontSize: '16px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: `0 8px 24px rgba(16, 185, 129, 0.4)`, transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Khám phá ngay <span style={{ fontSize: '18px' }}>→</span>
          </button>
        </motion.div>
      </section>

      {/* ── 2. MISSION & VISION ── */}
      <section style={{ padding: '160px 5% 96px', position: 'relative', zIndex: 2 }}>
        <div className="mv-grid">

          {/* Sứ Mệnh */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            style={{
              padding: '64px 56px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '32px',
              position: 'relative',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              overflow: 'hidden',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.05)',
            }}
          >
            {/* Watermark 01 */}
            <div style={{
              position: 'absolute', bottom: '-40px', right: '-20px',
              fontSize: '240px', fontWeight: '900', lineHeight: '0.8',
              color: isDark ? '#ffffff' : '#000000', opacity: 0.03,
              userSelect: 'none', pointerEvents: 'none',
              zIndex: 0,
            }}>01</div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: subtleText, fontStyle: 'italic', marginBottom: '32px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ display: 'block', width: '20px', height: '1px', background: subtleText }} />
                Sứ mệnh
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: '900',
                marginBottom: '24px', color: accentColor, lineHeight: 1.15,
              }}>
                Đơn giản hóa<br />hành trình của bạn
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.85', color: subtleText, maxWidth: '420px' }}>
                Mang đến trải nghiệm lên kế hoạch du lịch dễ dàng và liền mạch nhất — kết nối du khách với cảnh sắc hùng vĩ và con người Việt Nam, giúp mỗi chuyến đi không chỉ là một kỳ nghỉ mà còn là một kỷ niệm khó quên.
              </p>
            </div>
          </motion.div>

          {/* Tầm Nhìn */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true }}
            style={{
              padding: '64px 56px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '32px',
              position: 'relative',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              overflow: 'hidden',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.05)',
            }}
          >
            {/* Watermark 02 */}
            <div style={{
              position: 'absolute', bottom: '-40px', right: '-20px',
              fontSize: '240px', fontWeight: '900', lineHeight: '0.8',
              color: isDark ? '#ffffff' : '#000000', opacity: 0.03,
              userSelect: 'none', pointerEvents: 'none',
              zIndex: 0,
            }}>02</div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: subtleText, fontStyle: 'italic', marginBottom: '32px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ display: 'block', width: '20px', height: '1px', background: subtleText }} />
                Tầm nhìn
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: '900',
                marginBottom: '24px', color: secondaryAccent, lineHeight: 1.15,
              }}>
                Nền tảng du lịch<br />hàng đầu Việt Nam
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.85', color: subtleText }}>
                Trở thành nền tảng du lịch thông minh hàng đầu, nơi bất kỳ ai cũng có thể tương tác với hệ thống bản đồ trực quan, tự do lên kế hoạch và cảm nhận trọn vẹn tinh hoa văn hóa của mảnh đất hình chữ S.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Separator */}
      <div style={{ width: '60px', height: '1px', background: `rgba(8,178,166,0.4)`, margin: '0 auto 80px', position: 'relative', zIndex: 2 }} />

      {/* ── 3. FEATURES ── */}
      <section style={{ padding: '0 2% 160px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Section header */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', textAlign: 'center', marginBottom: '100px', letterSpacing: '-1px' }}
          >
            Điều Gì Làm Nên Sự <span style={{ color: '#10b981' }}>Khác Biệt?</span>
          </motion.h2>

          {/* Card grid */}
          <div className="feat-grid">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className={`bento-${idx}`}
                style={{ width: '100%', height: '100%' }}
              >
                <div
                  className="feat-card"
                  style={{
                    '--card-color': item.color,
                    '--card-color-light': item.color + '30',
                    '--hover-box-shadow': isDark 
                      ? `0 40px 60px ${item.color}20` 
                      : `0 40px 60px ${item.color}30`
                  }}
                >
                  <div className="feat-card-content">
                    {/* Icon with Circle Background */}
                    <div className="feat-icon-wrapper" style={{
                      width: '64px', height: '64px',
                      borderRadius: '50%',
                      background: item.iconBg || (item.color + '15'),
                      border: `1px solid ${item.iconBorder || (item.color + '30')}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color,
                      marginBottom: '32px',
                    }}>
                      {item.icon}
                    </div>

                    {/* Title */}
                    <h4 style={{ 
                      fontSize: idx === 0 ? 'clamp(24px, 3vw, 32px)' : '22px', 
                      fontWeight: '900', marginBottom: '16px', color: textColor, lineHeight: 1.3 
                    }}>
                      {item.title}
                    </h4>

                    {/* Desc */}
                    <p style={{ 
                      fontSize: idx === 0 ? '17px' : '15px', 
                      lineHeight: '1.7', color: subtleText, margin: 0 
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. HERO SECTION — Text + Map (UNCHANGED) ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px 200px 24px',
        zIndex: 1,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '40px',
          position: 'relative',
        }}>

          {/* Text column */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 20 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '900',
                lineHeight: '1.1',
                marginBottom: '20px',
                color: textColor,
              }}>
                Khám Phá Việt Nam <br />
                <span style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}>
                  Qua Lăng Kính Mới
                </span>
              </h2>

              <p style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                lineHeight: '1.6',
                color: isDark ? '#94a3b8' : '#475569',
                marginBottom: '40px',
                maxWidth: '600px',
              }}>
                S-Trip là nền tảng du lịch thông minh, đồng hành cùng bạn trên mọi nẻo đường. Với hệ thống bản đồ sinh động cùng công cụ thiết kế lịch trình cá nhân hóa, chúng tôi biến mỗi ý tưởng xê dịch của bạn thành một hành trình hoàn hảo và trọn vẹn nhất.
              </p>
            </motion.div>
          </div>

          {/* Map column */}
          <div style={{ flex: '1 1 40%', minWidth: '320px', position: 'relative', height: '750px' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '0',
              transform: 'translateY(-50%)',
              width: '160%',
              height: '130vh',
              minHeight: '900px',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                <ExploreVietnam isEmbedded={true} mode="hero" />
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default AboutPage;