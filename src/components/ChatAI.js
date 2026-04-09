import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Chào bạn! Mình là trợ lý S-Trip. Bạn muốn mình tư vấn gì cho chuyến đi sắp tới không? ✨' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Cảm ơn bạn nhé! Mình đang nghiên cứu lịch trình tốt nhất cho bạn đây. Chờ mình xíu nha! 🚀' 
      }]);
    }, 1000);
  };

  const styles = {
    floatingBtn: {
      position: 'fixed', bottom: '50px', right: '50px',
      width: '100px', height: '100px', borderRadius: '50%', // Nút tròn to hơn
      backgroundColor: '#10b981', color: 'white',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '45px', cursor: 'pointer', zIndex: 2000,
      boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)',
      transition: '0.3s all ease',
      transform: isOpen ? 'scale(0)' : 'scale(1)'
    },
    chatWindow: {
      position: 'fixed', bottom: '50px', right: '50px',
      width: '650px', // PHÓNG TO CHIỀU RỘNG (450 -> 650)
      height: '850px', // PHÓNG TO CHIỀU CAO (650 -> 850)
      backgroundColor: 'white',
      borderRadius: '45px', boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', zIndex: 2001,
      overflow: 'hidden', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(150px) scale(0)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'all' : 'none'
    },
    header: { 
      padding: '35px', backgroundColor: '#111827', color: 'white', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
    },
    msgArea: { 
      flex: 1, padding: '30px', overflowY: 'auto', 
      display: 'flex', flexDirection: 'column', gap: '25px', 
      backgroundColor: '#f8fafc' 
    },
    bubble: (role) => ({
      maxWidth: '85%', padding: '20px 30px', borderRadius: '30px', 
      fontSize: '22px', // CHỮ TRONG CHAT TO HƠN (18 -> 22)
      lineHeight: '1.6',
      alignSelf: role === 'ai' ? 'flex-start' : 'flex-end',
      backgroundColor: role === 'ai' ? 'white' : '#10b981',
      color: role === 'ai' ? '#111827' : 'white',
      boxShadow: '0 6px 15px rgba(0,0,0,0.06)',
      borderBottomLeftRadius: role === 'ai' ? '6px' : '30px',
      borderBottomRightRadius: role === 'user' ? '6px' : '30px'
    }),
    inputArea: { 
      padding: '30px', borderTop: '1px solid #eee', 
      display: 'flex', gap: '20px', alignItems: 'center' 
    },
    input: { 
      flex: 1, padding: '22px 30px', borderRadius: '99px', 
      border: '3px solid #f1f5f9', outline: 'none', 
      fontSize: '22px' // CHỮ NHẬP LIỆU TO HƠN
    },
    sendBtn: { 
      width: '70px', height: '70px', borderRadius: '50%', 
      backgroundColor: '#10b981', color: 'white', border: 'none', 
      cursor: 'pointer', fontSize: '26px' 
    }
  };

  return (
    <>
      <div style={styles.floatingBtn} onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon icon={faRobot} />
      </div>
      <div style={styles.chatWindow}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px' }}>
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
        <div style={styles.msgArea}>
          {messages.map((msg, i) => <div key={i} style={styles.bubble(msg.role)}>{msg.text}</div>)}
        </div>
        <div style={styles.inputArea}>
          <input style={styles.input} placeholder="Hỏi AI về du lịch..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
          <button style={styles.sendBtn} onClick={handleSend}><FontAwesomeIcon icon={faPaperPlane} /></button>
        </div>
      </div>
    </>
  );
};

export default ChatAI;