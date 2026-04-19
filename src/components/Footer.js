import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEarthAmericas, 
  faEnvelope, 
  faPhone 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faInstagram, 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '80px 0 40px 0',
      marginTop: '100px',
      width: '100%'
    },
    container: {
      width: '90%',
      maxWidth: '1600px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1.5fr', // Chia cột
      gap: '60px',
      marginBottom: '60px'
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    logo: {
      fontSize: '36px',
      fontWeight: '900',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      backgroundColor: '#10b981',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px'
    },
    heading: {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '25px',
      color: '#10b981'
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    link: {
      color: '#9ca3af',
      textDecoration: 'none',
      fontSize: '18px',
      transition: '0.3s'
    },
    socialGrid: {
      display: 'flex',
      gap: '20px',
      marginTop: '10px'
    },
    socialIcon: {
      fontSize: '28px',
      color: 'white',
      cursor: 'pointer',
      transition: '0.3s'
    },
    bottomBar: {
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingTop: '40px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '16px'
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* GIỚI THIỆU */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <FontAwesomeIcon icon={faEarthAmericas} />
            </div>
            S-Trip
          </div>
          <p style={{ color: '#9ca3af', fontSize: '18px', lineHeight: '1.6' }}>
            Hệ thống lên lịch trình du lịch thông minh bằng AI. <br />
            Khám phá những vùng đất mới cùng người thương.
          </p>
          <div style={styles.socialGrid}>
            <FontAwesomeIcon icon={faFacebook} style={styles.socialIcon} />
            <FontAwesomeIcon icon={faInstagram} style={styles.socialIcon} />
            <FontAwesomeIcon icon={faGithub} style={styles.socialIcon} />
          </div>
        </div>

        {/* ĐIỀU HƯỚNG NHANH */}
        <div>
          <h3 style={styles.heading}>Liên kết</h3>
          <ul style={styles.linkList}>
            <li><a href="#" style={styles.link}>Trang chủ</a></li>
            <li><a href="#" style={styles.link}>Về chúng tôi</a></li>
            <li><a href="#" style={styles.link}>Địa điểm</a></li>
            <li><a href="#" style={styles.link}>Tin tức</a></li>
          </ul>
        </div>

        {/* HỖ TRỢ */}
        <div>
          <h3 style={styles.heading}>Hỗ trợ</h3>
          <ul style={styles.linkList}>
            <li><a href="#" style={styles.link}>Trung tâm trợ giúp</a></li>
            <li><a href="#" style={styles.link}>Chính sách bảo mật</a></li>
            <li><a href="#" style={styles.link}>Điều khoản dịch vụ</a></li>
            <li><a href="#" style={styles.link}>Liên hệ</a></li>
          </ul>
        </div>

        {/* LIÊN HỆ */}
        <div>
          <h3 style={styles.heading}>Liên hệ</h3>
          <ul style={styles.linkList}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af' }}>
              <FontAwesomeIcon icon={faEnvelope} /> contact@s-trip.vn
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af' }}>
              <FontAwesomeIcon icon={faPhone} /> +84 7894 41629
            </li>
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