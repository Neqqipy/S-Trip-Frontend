import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons';
import { sendChatMessage } from '../services/api';

const TypingIndicator = ({ isDark }) => (
  <div style={{
    display: 'flex', gap: '6px', alignItems: 'center',
    padding: '14px 20px', backgroundColor: isDark ? '#1e293b' : 'white',
    borderRadius: '24px', borderBottomLeftRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)', width: 'fit-content',
  }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', animation: 'bounce 1.2s infinite ease-in-out', animationDelay: `${i * 0.2}s` }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100% { transform:translateY(0); opacity:.4 } 40% { transform:translateY(-8px); opacity:1 } }`}</style>
  </div>
);

const ChatAI = ({ tripData, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Chào bạn! Mình là trợ lý S-Trip 🌏\nBạn muốn hỏi gì về chuyến đi sắp tới không? ✨' }
  ]);
  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    const updated = [...messages, { role: 'user', text: userText }];
    setMessages(updated);
    setIsLoading(true);
    const apiMessages = updated.slice(1).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
    const result = await sendChatMessage(apiMessages, { location: tripData?.location || '', budget: tripData?.budget || '', days: tripData?.days || '' });
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'ai', text: result.success ? result.text : '😓 Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé!', isError: !result.success }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        /* ── Floating button ── */
        .chat-fab {
          position: fixed;
          bottom: 50px; right: 50px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background-color: #10b981;
          color: white;
          display: flex; justify-content: center; align-items: center;
          font-size: 36px;
          cursor: pointer;
          z-index: 2000;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.45);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: none;
        }
        .chat-fab:hover { transform: scale(1.08); box-shadow: 0 16px 40px rgba(16,185,129,0.55); }
        .chat-fab.is-open { transform: scale(0) !important; pointer-events: none; }

        /* ── Chat window ── */
        .chat-window {
          position: fixed;
          bottom: 50px; right: 50px;
          width: 560px; height: 780px;
          background-color: ${isDark ? '#0f172a' : 'white'};
          border-radius: 36px;
          box-shadow: ${isDark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 24px 64px rgba(0,0,0,0.22)'};
          display: flex; flex-direction: column;
          z-index: 2001; overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
          transform: translateY(0) scale(1); opacity: 1;
        }
        .chat-window.is-closed {
          transform: translateY(120px) scale(0.8);
          opacity: 0;
          pointer-events: none;
        }

        /* ── Overlay ── */
        .chat-overlay {
          display: none;
        }

        /* ══════════════════════════════════════
           📱  ChatAI — Mobile responsive
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          /* FAB → smaller, repositioned */
          .chat-fab {
            width: 60px; height: 60px;
            font-size: 26px;
            bottom: 24px; right: 20px;
            box-shadow: 0 8px 24px rgba(16,185,129,0.4);
          }

          /* Chat window → centered modal */
          .chat-window {
            bottom: auto !important; right: auto !important; left: 50% !important; top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 85% !important;
            height: 85dvh !important;
            border-radius: 24px !important;
          }
          .chat-window.is-closed {
            transform: translate(-50%, -40%) scale(0.9) !important;
          }
          .chat-overlay.is-open {
            display: block;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 2000;
            animation: fadeIn 0.3s ease forwards;
          }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 480px) {
          .chat-fab { bottom: 16px; right: 16px; }
        }
      `}</style>

      {/* OVERLAY */}
      <div className={`chat-overlay${isOpen ? ' is-open' : ''}`} onClick={() => setIsOpen(false)} />

      {/* FLOATING BUTTON */}
      <button
        className={`chat-fab${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Mở chat AI"
      >
        <FontAwesomeIcon icon={faCompass} />
      </button>

      {/* CHAT WINDOW */}
      <div className={`chat-window${isOpen ? '' : ' is-closed'}`}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          backgroundColor: isDark ? '#020617' : '#111827',
          color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '22px', flexShrink: 0 }}>
              <FontAwesomeIcon icon={faCompass} />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '20px' }}>Trợ lý S-Trip</div>
              <div style={{ fontSize: '13px', color: '#10b981' }}>● Đang trực tuyến</div>
            </div>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '26px', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsOpen(false)}
            aria-label="Đóng chat"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Trip context banner */}
        {tripData?.location && (
          <div style={{ backgroundColor: isDark ? '#064e3b' : '#ecfdf5', padding: '10px 24px', fontSize: '14px', color: isDark ? '#a7f3d0' : '#065f46', fontWeight: '700', borderBottom: isDark ? '1px solid #065f46' : '1px solid #d1fae5', flexShrink: 0 }}>
            🌏 Đang tư vấn: <strong>{tripData.location}</strong>
            {tripData.days && ` · ${tripData.days}`}{tripData.budget && ` · ${tripData.budget}`}
          </div>
        )}

        {/* Message area */}
        <div style={{
          flex: 1, padding: '20px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '14px',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              maxWidth: '85%', padding: '14px 20px', borderRadius: '22px', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
              alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
              backgroundColor: msg.isError
                ? (isDark ? '#7f1d1d' : '#fef2f2')
                : (msg.role === 'ai' ? (isDark ? '#1e293b' : 'white') : '#10b981'),
              color: msg.isError
                ? (isDark ? '#fecaca' : '#dc2626')
                : (msg.role === 'ai' ? (isDark ? '#f8fafc' : '#111827') : 'white'),
              boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.06)',
              borderBottomLeftRadius: msg.role === 'ai' ? '6px' : '22px',
              borderBottomRightRadius: msg.role === 'user' ? '6px' : '22px',
              border: msg.isError
                ? (isDark ? '1px solid #991b1b' : '1px solid #fecaca')
                : (msg.role === 'ai' && isDark ? '1px solid #334155' : 'none'),
            }}>
              {msg.text}
            </div>
          ))}
          {isLoading && <TypingIndicator isDark={isDark} />}
          <div ref={msgEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '16px 20px',
          borderTop: isDark ? '1px solid #1e293b' : '1px solid #eee',
          display: 'flex', gap: '12px', alignItems: 'center',
          backgroundColor: isDark ? '#0f172a' : 'white',
          flexShrink: 0,
        }}>
          <input
            style={{
              flex: 1, padding: '14px 20px', borderRadius: '99px',
              border: `2px solid ${isLoading ? (isDark ? '#064e3b' : '#d1fae5') : (isDark ? '#334155' : '#f1f5f9')}`,
              outline: 'none', fontSize: '15px',
              color: isDark ? '#f8fafc' : '#111827',
              backgroundColor: isLoading ? (isDark ? '#022c22' : '#f0fdf4') : (isDark ? '#1e293b' : 'white'),
              transition: '0.3s', minHeight: '48px',
            }}
            placeholder={isLoading ? 'Đang trả lời...' : 'Hỏi AI về du lịch...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            style={{
              width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: isLoading ? (isDark ? '#065f46' : '#d1fae5') : '#10b981',
              color: isLoading ? (isDark ? '#022c22' : '#6ee7b7') : 'white',
              border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '18px', transition: '0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={handleSend}
            disabled={isLoading}
            aria-label="Gửi tin nhắn"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatAI;