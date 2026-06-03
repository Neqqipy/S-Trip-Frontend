import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

const Footer = ({ onNavigate, noMarginTop }) => {
  const styles = {
    footer: { backgroundColor: '#111827', color: 'white', paddingTop: '40px', paddingBottom: '24px', marginTop: noMarginTop ? '0' : '40px', width: '100%' },
    logo: { fontSize: '28px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    heading: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#10b981' },
    linkList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' },
    link: { color: '#9ca3af', textDecoration: 'none', fontSize: '16px', transition: '0.3s', cursor: 'pointer' },
    socialIcon: { fontSize: '24px', color: 'white', cursor: 'pointer', transition: '0.3s', textDecoration: 'none', display: 'flex', alignItems: 'center' },
  };

  return (
    <footer style={styles.footer}>
      <style>{`
        .footer-grid {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto 32px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 50px;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ══════════════════════════════════════
           📱  Footer — Mobile responsive
        ══════════════════════════════════════ */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          /* Brand column spans full width */
          .footer-brand { grid-column: 1 / -1; }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            width: calc(100% - 40px);
          }
          .footer-brand { grid-column: 1; }
          .footer-bottom {
            width: calc(100% - 40px);
            font-size: 12px;
            padding-top: 24px;
          }
          /* Reduce top margin on small screens */
          footer { margin-top: 48px !important; }
        }
      `}</style>

      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={styles.logo} onClick={() => onNavigate('hero-section')}>
            <img src="S.jpg" alt="S-Trip Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
            S-Trip
          </div>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
            Hệ thống lên lịch trình du lịch thông minh bằng AI.
          </p>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faGithub} /></a>
            <a href="https://serpapi.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <img src="https://serpapi.com/favicon.ico" alt="SerpApi" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
            </a>
            <a href="https://google.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faGoogle} /></a>
          </div>
        </div>

        {/* Liên kết */}
        <div>
          <h3 style={styles.heading}>Liên kết</h3>
          <ul style={styles.linkList}>
            <li style={styles.link} onClick={() => onNavigate('hero-section')}>Trang chủ</li>
            <li style={styles.link} onClick={() => onNavigate('itinerary-section')}>Lịch trình</li>
            <li style={styles.link} onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>Khám phá</li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <h3 style={styles.heading}>Hỗ trợ</h3>
          <ul style={styles.linkList}>
            <li style={styles.link}>Chính sách bảo mật</li>
            <li style={styles.link}>Điều khoản dịch vụ</li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 style={styles.heading}>Liên hệ</h3>
          <ul style={styles.linkList}>
            <li><a href="mailto:24120319@student.hcmus.edu.vn" style={{ ...styles.link, display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faEnvelope} /> 24120319@student.hcmus.edu.vn</a></li>
            <li><a href="tel:+84789441629" style={{ ...styles.link, display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faPhone} /> +84 7894 41629</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 S-Trip Project. Được thiết kế bởi Trịnh Nguyễn Huỳnh Nhi - 24120404, Đào Ngọc Hưng - 24120319, Đặng Thuyền Ngọc - 24120391
      </div>
    </footer>
  );
};

export default Footer;