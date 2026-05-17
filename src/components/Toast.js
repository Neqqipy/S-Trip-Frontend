import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

const Toast = ({ message, type, onClose, isDark = false }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000); // Tự đóng sau 3 giây
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  const styles = {
    toast: {
      position: 'fixed', bottom: '30px', right: '30px',
      backgroundColor: isDark ? '#22252a' : 'white',
      padding: '16px 24px', borderRadius: '16px',
      boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.1)', 
      display: 'flex', alignItems: 'center',
      gap: '15px', zIndex: 9999, 
      border: isDark ? '1px solid #3e4451' : 'none',
      borderLeft: `6px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
      animation: 'slideIn 0.3s ease-out'
    },
    message: { 
      fontSize: '16px', 
      fontWeight: '600', 
      color: isDark ? '#ffffff' : '#1f2937'
    },
    icon: { color: isSuccess ? '#10b981' : '#ef4444', fontSize: '20px' }
  };

  return (
    <div style={styles.toast}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <FontAwesomeIcon icon={isSuccess ? faCheckCircle : faCircleExclamation} style={styles.icon} />
      <span style={styles.message}>{message}</span>
      <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: isDark ? '#cbd5e1' : '#9ca3af' }}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
};

export default Toast;