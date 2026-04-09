import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEarthAmericas, 
  faArrowRightToBracket, 
  faXmark, 
  faLock 
} from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

const Navbar = () => {
  const [showAuth, setShowAuth] = useState(false); // Trạng thái ẩn/hiện Modal
  const [isLogin, setIsLogin] = useState(true);   // Chuyển đổi giữa Đăng nhập & Đăng ký

  const styles = {
    header: { height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, width: '100%', zIndex: 50, background: 'rgba(0,0,0,0.1)' },
    container: { width: '98%', maxWidth: '1600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' },
    logo: { fontSize: '48px', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' },
    logoIcon: { backgroundColor: '#10b981', width: '65px', height: '65px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '35px', color: 'white' },
    nav: { display: 'flex', gap: '45px', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '22px' },
    loginBtn: { backgroundColor: '#10b981', color: 'white', padding: '16px 40px', borderRadius: '9999px', fontWeight: '800', fontSize: '20px', border: 'none', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '12px' },

    // === MODAL STYLES ===
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      backdropFilter: 'blur(12px)' 
    },
    modal: { 
      backgroundColor: 'white', 
      width: '750px', // Tăng chiều rộng cực đại (550px -> 750px)
      borderRadius: '50px', // Bo tròn mạnh hơn cho sang
      padding: '70px', // Tăng padding nội dung (50px -> 70px)
      position: 'relative', 
      boxShadow: '0 30px 70px rgba(0,0,0,0.4)' 
    },
    closeBtn: { 
      position: 'absolute', top: '40px', right: '45px', 
      background: 'none', border: 'none', fontSize: '40px', // Phóng to nút X
      color: '#9ca3af', cursor: 'pointer' 
    },
    title: { 
      fontSize: '52px', // Phóng to tiêu đề chính (40px -> 52px)
      fontWeight: '900', 
      color: '#111827', marginBottom: '15px', textAlign: 'center' 
    },
    subtitle: { 
      color: '#6b7280', 
      fontSize: '24px', // Phóng to tiêu đề phụ (18px -> 24px)
      textAlign: 'center', marginBottom: '50px' 
    },
    inputGroup: { marginBottom: '30px', position: 'relative' },
    inputIcon: { 
      position: 'absolute', left: '30px', top: '50%', 
      transform: 'translateY(-50%)', color: '#9ca3af', 
      fontSize: '26px' // Phóng to icon trong ô nhập
    },
    input: { 
      width: '100%', 
      padding: '25px 30px 25px 80px', // Nới rộng không gian nhập liệu
      borderRadius: '25px', 
      border: '3px solid #f1f5f9', // Viền dày hơn tí cho chắc chắn
      fontSize: '22px', // Phóng to chữ đang nhập (18px -> 22px)
      outline: 'none', transition: '0.3s', boxSizing: 'border-box' 
    },
    submitBtn: { 
      width: '100%', backgroundColor: '#111827', color: 'white', 
      padding: '25px', // Nút bấm to hơn
      borderRadius: '25px', 
      fontSize: '24px', // Chữ trong nút to hơn (20px -> 24px)
      fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '15px' 
    },
    switchText: { 
      textAlign: 'center', marginTop: '40px', 
      fontSize: '20px', // Chữ gợi ý to hơn
      color: '#4b5563' 
    },
    switchLink: { 
      color: '#10b981', fontWeight: '800', 
      cursor: 'pointer', textDecoration: 'underline', marginLeft: '10px' 
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <a href="/" style={styles.logo}>
          <div style={styles.logoIcon}><FontAwesomeIcon icon={faEarthAmericas} /></div>
          S-Trip
        </a>

        <nav style={styles.nav}>
          <a href="#" style={styles.link}>Trang chủ</a>
          <a href="#" style={styles.link}>Lịch trình</a>
          <button style={styles.loginBtn} onClick={() => setShowAuth(true)}>
            Đăng nhập
            <FontAwesomeIcon icon={faArrowRightToBracket} />
          </button>
        </nav>
      </div>

      {/* === MODAL ĐĂNG NHẬP / ĐĂNG KÝ === */}
      {showAuth && (
        <div style={styles.overlay} onClick={() => setShowAuth(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowAuth(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <h2 style={styles.title}>{isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
            <p style={styles.subtitle}>
              {isLogin ? 'Đăng nhập để khám phá lịch trình của bạn' : 'Tham gia cùng cộng đồng S-Trip ngay hôm nay'}
            </p>

            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}><FontAwesomeIcon icon={faUser} /></div>
              <input type="text" placeholder="Tên tài khoản hoặc Email" style={styles.input} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
              <input type="password" placeholder="Mật khẩu" style={styles.input} />
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <div style={styles.inputIcon}><FontAwesomeIcon icon={faLock} /></div>
                <input type="password" placeholder="Xác nhận mật khẩu" style={styles.input} />
              </div>
            )}

            <button style={styles.submitBtn}>
              {isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
            </button>

            <div style={styles.switchText}>
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản S-Trip?'}
              <span style={styles.switchLink} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Đăng ký' : 'Đăng nhập ngay'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;