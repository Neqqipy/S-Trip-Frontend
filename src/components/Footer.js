import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAmericas, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';

const Footer = ({ onNavigate }) => { // Nhận hàm điều hướng từ App
  const styles = {
    footer: { backgroundColor: '#111827', color: 'white', padding: '80px 0 40px 0', marginTop: '100px', width: '100%' },
    container: { width: '90%', maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '60px', marginBottom: '60px' },
    logo: { fontSize: '36px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    logoIcon: { backgroundColor: '#10b981', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' },
    heading: { fontSize: '22px', fontWeight: '700', marginBottom: '25px', color: '#10b981' },
    linkList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' },
    link: { color: '#9ca3af', textDecoration: 'none', fontSize: '18px', transition: '0.3s', cursor: 'pointer' },
    socialIcon: { fontSize: '28px', color: 'white', cursor: 'pointer', transition: '0.3s', textDecoration: 'none' },
    bottomBar: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '16px' }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nhấn Logo quay về đầu trang */}
          <div style={styles.logo} onClick={() => onNavigate('hero-section')}>
            <div style={styles.logoIcon}><FontAwesomeIcon icon={faEarthAmericas} /></div>
            S-Trip
          </div>
          <p style={{ color: '#9ca3af', fontSize: '18px', lineHeight: '1.6' }}>Hệ thống lên lịch trình du lịch thông minh bằng AI.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Các liên kết mạng xã hội thực tế */}
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={styles.socialIcon}><FontAwesomeIcon icon={faGithub} /></a>
          </div>
        </div>

        {/* LIÊN KẾT: Sử dụng onNavigate để cuộn trang mượt mà */}
        <div>
          <h3 style={styles.heading}>Liên kết</h3>
          <ul style={styles.linkList}>
            <li style={styles.link} onClick={() => onNavigate('hero-section')}>Trang chủ</li>
            <li style={styles.link} onClick={() => onNavigate('itinerary-section')}>Lịch trình</li>
            <li style={styles.link} onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>Địa điểm hot</li>
          </ul>
        </div>

        <div>
          <h3 style={styles.heading}>Hỗ trợ</h3>
          <ul style={styles.linkList}>
            <li style={styles.link}>Chính sách bảo mật</li>
            <li style={styles.link}>Điều khoản dịch vụ</li>
          </ul>
        </div>

        <div>
          <h3 style={styles.heading}>Liên hệ</h3>
          <ul style={styles.linkList}>
            {/* Click vào Email/SĐT sẽ tự mở app tương ứng */}
            <li><a href="mailto:contact@s-trip.vn" style={styles.link}><FontAwesomeIcon icon={faEnvelope} /> contact@s-trip.vn</a></li>
            <li><a href="tel:+84789441629" style={styles.link}><FontAwesomeIcon icon={faPhone} /> +84 7894 41629</a></li>
          </ul>
        </div>
      </div>

      <div style={styles.bottomBar}>
            © 2026 S-Trip Project.Được thiết kế bởi Trịnh Nguyễn Huỳnh Nhi - 24120404
                                                    Đào Ngọc Hưng - 24120319
                                                    Đặng Thuyền Ngọc - 24120391
      </div>
    </footer>
  );
};

export default Footer;