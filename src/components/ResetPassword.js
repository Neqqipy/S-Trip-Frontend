import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

const ResetPassword = ({ isDark }) => {
  const [token, setToken]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    // Lấy token từ URL: /#/reset-password?token=xxx
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const t = params.get('token') || '';
    setToken(t);
    if (!t) setError('Link không hợp lệ hoặc đã hết hạn.');
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const bg    = isDark ? '#0f172a' : 'white';
  const text  = isDark ? '#f8fafc' : '#111827';
  const sub   = isDark ? '#94a3b8' : '#6b7280';
  const input = { width: '100%', padding: '18px 24px', borderRadius: 20, fontSize: 18, outline: 'none', boxSizing: 'border-box', border: isDark ? '2px solid #1e293b' : '2px solid #f1f5f9', backgroundColor: isDark ? '#1e293b' : '#f9fafb', color: text };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6', padding: 24 }}>
      <div style={{ backgroundColor: bg, borderRadius: 32, padding: '50px 60px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <img src="/S.jpg" alt="S-Trip" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>S-Trip</span>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: text, fontWeight: 900, marginBottom: 12 }}>Đặt lại thành công!</h2>
            <p style={{ color: sub, marginBottom: 32 }}>Mật khẩu của bạn đã được cập nhật.</p>
            <button
              onClick={() => window.location.href = '/'}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '16px 40px', borderRadius: 9999, fontWeight: 800, fontSize: 18, border: 'none', cursor: 'pointer', width: '100%' }}
            >
              Về trang chủ & Đăng nhập
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ color: text, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>Đặt mật khẩu mới</h2>
            <p style={{ color: sub, textAlign: 'center', marginBottom: 32, fontSize: 16 }}>Nhập mật khẩu mới cho tài khoản của bạn</p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: 16, padding: '14px 20px', color: '#dc2626', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <input
                type="password" placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                style={input} value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <input
                type="password" placeholder="Xác nhận mật khẩu"
                style={input} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              onClick={handleSubmit} disabled={loading || !token}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '18px', borderRadius: 9999, fontWeight: 800, fontSize: 20, border: 'none', cursor: 'pointer', width: '100%', opacity: (loading || !token) ? 0.7 : 1 }}
            >
              {loading ? '⏳ Đang xử lý...' : 'Xác nhận đặt lại mật khẩu'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 24, color: sub, fontSize: 16 }}>
              <span
                style={{ color: '#10b981', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => window.location.href = '/'}
              >
                ← Quay lại trang chủ
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;