import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons';
import { sendChatMessage } from '../services/api';

// ── Hiệu ứng 3 chấm đang gõ ─────────────────────────────────
const TypingIndicator = () => (
  <div style={{
    display: 'flex', gap: '6px', alignItems: 'center',
    padding: '20px 25px', backgroundColor: 'white',
    borderRadius: '30px', borderBottomLeftRadius: '6px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.06)', width: 'fit-content',
  }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: '10px', height: '10px', borderRadius: '50%',
        backgroundColor: '#10b981', display: 'inline-block',
        animation: 'bounce 1.2s infinite ease-in-out',
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
    <style>{`@keyframes bounce {
      0%,80%,100% { transform:translateY(0); opacity:.4 }
      40%          { transform:translateY(-8px); opacity:1 }
    }`}</style>
  </div>
);

// ════════════════════════════════════════════════════════════
// ChatAI — Component chính
// Props: tripData — ngữ cảnh chuyến đi hiện tại (optional)
// ════════════════════════════════════════════════════════════
const ChatAI = ({ tripData }) => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages,  setMessages]  = useState([
    { role: 'ai', text: 'Chào bạn! Mình là trợ lý S-Trip 🌏\nBạn muốn hỏi gì về chuyến đi sắp tới không? ✨' }
  ]);
  const msgEndRef = useRef(null);

  // Tự cuộn xuống cuối khi có tin nhắn mới
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

    // Chuyển sang định dạng Claude API (bỏ tin chào đầu)
    const apiMessages = updated
      .slice(1)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

    const result = await sendChatMessage(apiMessages, {
      location: tripData?.location || '',
      budget  : tripData?.budget   || '',
      days    : tripData?.days     || '',
    });

    setIsLoading(false);
    setMessages(prev => [...prev, {
      role    : 'ai',
      text    : result.success
        ? result.text
        : '😓 Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé!',
      isError : !result.success,
    }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Styles (giữ 100% thiết kế gốc) ──────────────────────
  const styles = {
    floatingBtn: {
      position: 'fixed', bottom: '50px', right: '50px',
      width: '100px', height: '100px', borderRadius: '50%',
      backgroundColor: '#10b981', color: 'white',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '45px', cursor: 'pointer', zIndex: 2000,
      boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)',
      transition: '0.3s all ease',
      transform: isOpen ? 'scale(0)' : 'scale(1)',
    },
    chatWindow: {
      position: 'fixed', bottom: '50px', right: '50px',
      width: '650px', height: '850px', backgroundColor: 'white',
      borderRadius: '45px', boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', zIndex: 2001,
      overflow: 'hidden', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(150px) scale(0)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'all' : 'none',
    },
    header: {
      padding: '35px', backgroundColor: '#111827', color: 'white',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    msgArea: {
      flex: 1, padding: '30px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: '20px',
      backgroundColor: '#f8fafc',
    },
    bubble: (role, isError) => ({
      maxWidth: '85%', padding: '20px 28px', borderRadius: '30px',
      fontSize: '22px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
      alignSelf: role === 'ai' ? 'flex-start' : 'flex-end',
      backgroundColor: isError ? '#fef2f2' : (role === 'ai' ? 'white' : '#10b981'),
      color: isError ? '#dc2626' : (role === 'ai' ? '#111827' : 'white'),
      boxShadow: '0 6px 15px rgba(0,0,0,0.06)',
      borderBottomLeftRadius : role === 'ai'   ? '6px'  : '30px',
      borderBottomRightRadius: role === 'user' ? '6px'  : '30px',
      border: isError ? '1px solid #fecaca' : 'none',
    }),
    inputArea: {
      padding: '30px', borderTop: '1px solid #eee',
      display: 'flex', gap: '20px', alignItems: 'center',
    },
    input: {
      flex: 1, padding: '22px 30px', borderRadius: '99px',
      border: `3px solid ${isLoading ? '#d1fae5' : '#f1f5f9'}`,
      outline: 'none', fontSize: '22px',
      backgroundColor: isLoading ? '#f0fdf4' : 'white',
      transition: '0.3s',
    },
    sendBtn: {
      width: '70px', height: '70px', borderRadius: '50%',
      backgroundColor: isLoading ? '#d1fae5' : '#10b981',
      color: isLoading ? '#6ee7b7' : 'white',
      border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
      fontSize: '26px', transition: '0.3s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
  };

  return (
    <>
      <div style={styles.floatingBtn} onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon icon={faRobot} />
      </div>

      <div style={styles.chatWindow}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px',
            }}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '28px' }}>S-Trip AI</div>
              <div style={{ fontSize: '18px', color: '#10b981' }}>● Đang trực tuyến</div>
            </div>
          </div>
          <FontAwesomeIcon
            icon={faXmark}
            style={{ fontSize: '35px', cursor: 'pointer', color: '#9ca3af' }}
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Context banner */}
        {tripData?.location && (
          <div style={{
            backgroundColor: '#ecfdf5', padding: '12px 30px',
            fontSize: '18px', color: '#065f46', fontWeight: '700',
            borderBottom: '1px solid #d1fae5',
          }}>
            🌏 Đang tư vấn: <strong>{tripData.location}</strong>
            {tripData.days   && ` · ${tripData.days}`}
            {tripData.budget && ` · ${tripData.budget}`}
          </div>
        )}

        {/* Khu vực tin nhắn */}
        <div style={styles.msgArea}>
          {messages.map((msg, i) => (
            <div key={i} style={styles.bubble(msg.role, msg.isError)}>
              {msg.text}
            </div>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            placeholder={isLoading ? 'Đang trả lời...' : 'Hỏi AI về du lịch...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={isLoading}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatAI;