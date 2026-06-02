import React from 'react';
import { motion } from 'framer-motion';
import ExploreVietnam from './ExploreVietnam/ExploreVietnam';

const AboutPage = ({ isDark, onNavigate }) => {
  const accentColor = '#08B2A6';
  const secondaryAccent = '#8b5cf6'; // Màu tím để phối gradient

  // Màu chữ và nền tổng thể
  const textColor = isDark ? '#f8fafc' : '#1e293b';
  const bgColor = isDark ? '#050914' : '#f1f5f9';

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. MESH GRADIENT & CSS PARTICLES BACKGROUND */}
      <style>{`
        /* Mesh Gradient Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          animation: floatOrb 20s infinite alternate ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 {
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, ${isDark ? 'rgba(8,178,166,0.15)' : 'rgba(8,178,166,0.2)'} 0%, transparent 70%);
          top: -20%;
          left: -20%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.15)'} 0%, transparent 70%);
          top: 30%;
          right: -30%;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, ${isDark ? 'rgba(56,189,248,0.1)' : 'rgba(56,189,248,0.15)'} 0%, transparent 70%);
          bottom: -10%;
          left: 10%;
          animation-delay: -10s;
        }
        
        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(50px, 80px) scale(1.1) rotate(45deg); }
          66% { transform: translate(-30px, 120px) scale(0.9) rotate(-45deg); }
          100% { transform: translate(80px, -30px) scale(1.05) rotate(20deg); }
        }

        /* Tweak Liquid Glass Styles */
        .liquid-glass {
          background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'};
          box-shadow: ${isDark ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 20px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)'};
          border-radius: 32px;
          overflow: hidden;
          position: relative;
        }
        
        /* Glossy Highlight */
        .liquid-glass::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)'} 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          animation: shine 8s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        
        .fade-bottom {
          mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
      `}</style>

      {/* Orbs in background */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* The original Hero section has been moved to the bottom of the page */}

      {/* 3. ASYMMETRICAL MISSION & VISION */}
      <section style={{ padding: '120px 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '100px' }}>
          
          {/* Sứ Mệnh - Nằm lệch phải, to hơn */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="liquid-glass"
              style={{ width: '90%', maxWidth: '1000px', padding: '80px', borderRadius: '40px' }}
            >
              <div style={{ fontSize: '120px', position: 'absolute', top: '-40px', right: '40px', opacity: isDark ? 0.05 : 0.1, fontWeight: '900', userSelect: 'none' }}>01</div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', marginBottom: '24px', color: accentColor }}>Sứ Mệnh</h2>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '1.8', color: isDark ? '#cbd5e1' : '#334155', maxWidth: '800px' }}>
                Đơn giản hóa quá trình lên kế hoạch du lịch bằng công nghệ AI tối tân, mang lại 
                các lịch trình cá nhân hóa sâu sắc, giúp chuyến đi của bạn an toàn, tiết kiệm thời gian 
                và tối ưu chi phí.
              </p>
            </motion.div>
          </div>

          {/* Tầm Nhìn - Nằm lệch trái, đè lên Sứ Mệnh */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', position: 'relative', marginTop: '-60px' }}>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="liquid-glass"
              style={{ width: '80%', maxWidth: '800px', padding: '60px', borderRadius: '40px', background: isDark ? 'rgba(139,92,246,0.03)' : 'rgba(139,92,246,0.05)' }}
            >
              <div style={{ fontSize: '120px', position: 'absolute', top: '-40px', left: '40px', opacity: isDark ? 0.05 : 0.1, fontWeight: '900', userSelect: 'none' }}>02</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', marginBottom: '24px', color: secondaryAccent }}>Tầm Nhìn</h2>
              <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: '1.8', color: isDark ? '#cbd5e1' : '#334155' }}>
                Trở thành nền tảng công nghệ du lịch hàng đầu tại Việt Nam, nơi bất kỳ ai 
                cũng có thể tương tác với không gian 3D chân thực và cảm nhận trọn vẹn văn hóa 
                của mảnh đất hình chữ S.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 4. ZIGZAG HIGHLIGHTS (Staggered Layout) */}
      <section style={{ padding: '120px 5%', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', textAlign: 'center', marginBottom: '100px', letterSpacing: '-1px' }}
          >
            Điều Gì Làm Nên Sự Khác Biệt?
          </motion.h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
            {[
              { icon: '🗺️', title: 'Bản Đồ 3D Độc Quyền', desc: 'Trải nghiệm xoay, thu phóng và tương tác trực tiếp với mô hình 3D của toàn bộ Việt Nam.', color: accentColor },
              { icon: '🤖', title: 'Trợ Lý AI Tinh Tuệ', desc: 'Chỉ cần nhập sở thích, AI sẽ tính toán và xuất ra lịch trình chi tiết từng phút cho bạn.', color: secondaryAccent },
              { icon: '📚', title: 'Di Sản Văn Hóa Sâu', desc: '10,000+ địa danh được số hóa kèm theo lịch sử và mẹo du lịch bí truyền của người dân bản địa.', color: '#f59e0b' },
              { icon: '🛡️', title: 'Bảo Vệ Hành Trình', desc: 'Đánh giá địa hình, cảnh báo thời tiết và rủi ro trực tiếp trên từng cung đường bạn qua.', color: '#ec4899' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="liquid-glass"
                style={{
                  flex: '1 1 300px',
                  maxWidth: '350px',
                  padding: '50px 40px',
                  // Tạo hiệu ứng zigzag bằng margin top xen kẽ
                  marginTop: idx % 2 === 1 ? '80px' : '0px',
                  borderTop: `4px solid ${item.color}`,
                  cursor: 'pointer',
                  transition: '0.4s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-15px)';
                  e.currentTarget.style.boxShadow = isDark ? `0 40px 60px ${item.color}20` : `0 40px 60px ${item.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: textColor }}>{item.title}</h4>
                <p style={{ fontSize: '16px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.7' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HERO SECTION MOVED TO BOTTOM (Text + Map) */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px 200px 24px', // Tăng padding bottom để bản đồ không đè Footer
        zIndex: 1
      }}>
        {/* 1. Mở rộng Max-Width và Căn giữa */}
        <div style={{
          width: '100%',
          maxWidth: '1400px', // Cho rộng hơn chút để bản đồ có không gian
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '40px',
          position: 'relative'
        }}>
          
          {/* 2. Cột trái (Text) */}
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
                color: textColor
              }}>
                Khám Phá Việt Nam <br/>
                <span style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  Qua Lăng Kính Mới
                </span>
              </h2>
              
              <p style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                lineHeight: '1.6',
                color: isDark ? '#94a3b8' : '#475569',
                marginBottom: '40px',
                maxWidth: '600px'
              }}>
                S-Trip là nền tảng du lịch thông minh tiên phong ứng dụng Trí tuệ Nhân tạo (AI). Chúng tôi tự hào mang đến cho bạn trải nghiệm khám phá vẻ đẹp Việt Nam một cách hoàn toàn mới thông qua bản đồ 3D tương tác chân thực, cùng khả năng thiết kế lịch trình cá nhân hóa tối ưu nhất.
              </p>
            </motion.div>
          </div>

          {/* 3. Cột phải (Bản đồ) - Khổng lồ đè 4 hướng */}
          <div style={{ flex: '1 1 40%', minWidth: '320px', position: 'relative', height: '750px' }}>
            <div style={{ 
              position: 'absolute',
              top: '50%',
              right: '0', // Neo vừa vặn lề phải, không bị cắt bởi overflow: hidden
              transform: 'translateY(-50%)',
              width: '160%', // Chiếm 160% chiều rộng cột, lan sang trái đè text
              height: '130vh', // Rất cao để đè lên trên/dưới
              minHeight: '900px',
              pointerEvents: 'none', // Cho phép click xuyên qua vùng trong suốt
              zIndex: 10
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
