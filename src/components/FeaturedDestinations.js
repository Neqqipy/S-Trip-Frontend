import React, { useState } from 'react';
// Import Font Awesome để đồng bộ icon với các phần khác
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const DestinationCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    card: { 
      backgroundColor: '#ffffff', 
      borderRadius: '32px', // Bo tròn mạnh hơn (24->32)
      overflow: 'hidden',
      boxShadow: isHovered ? '0 30px 60px rgba(0,0,0,0.12)' : '0 10px 20px rgba(0,0,0,0.02)',
      transition: '0.5s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      transform: isHovered ? 'translateY(-20px)' : 'translateY(0)',
      cursor: 'pointer',
      border: '1px solid #f1f5f9'
    },
    imgContainer: { 
      height: '350px', // PHÓNG TO CHIỀU CAO ẢNH (240->350)
      position: 'relative',
      overflow: 'hidden'
    },
    img: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover',
      transition: '0.8s all ease',
      transform: isHovered ? 'scale(1.15)' : 'scale(1)'
    },
    badge: {
      position: 'absolute', top: '25px', right: '25px',
      backgroundColor: 'white', padding: '8px 16px',
      borderRadius: '16px', fontWeight: '800', fontSize: '18px',
      display: 'flex', alignItems: 'center', gap: '8px', color: '#111827',
      zIndex: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    content: { padding: '40px' }, // Tăng padding nội dung (24->40)
    cardTitle: { 
      fontSize: '32px', // PHÓNG TO TIÊU ĐỀ (24->32)
      fontWeight: '900', 
      color: isHovered ? '#10b981' : '#111827',
      marginBottom: '15px',
      transition: '0.3s color'
    },
    cardDesc: { 
      fontSize: '22px', // PHÓNG TO MÔ TẢ (20->22)
      color: '#6b7280', 
      lineHeight: '1.7', 
      marginBottom: '30px',
      height: '110px', // Giữ chiều cao cố định để các ô đều nhau
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    budgetLabel: { 
      fontSize: '16px', 
      fontWeight: '800', 
      color: '#9ca3af', 
      textTransform: 'uppercase', 
      marginBottom: '10px',
      letterSpacing: '1px'
    },
    budgetValue: { 
      color: '#10b981', 
      fontWeight: '900', 
      fontSize: '24px' // PHÓNG TO GIÁ TIỀN (16->24)
    }
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imgContainer}>
        <img src={item.img} alt={item.name} style={styles.img} />
        <div style={styles.badge}>
          <FontAwesomeIcon icon={faStar} style={{ color: '#eab308' }} /> {item.rating}
        </div>
      </div>
      <div style={styles.content}>
        <h3 style={styles.cardTitle}>{item.name}</h3>
        <p style={styles.cardDesc}>{item.desc}</p>
        <div style={styles.budgetLabel}>Ngân sách ước tính</div>
        <div style={styles.budgetValue}>{item.budget}</div>
      </div>
    </div>
  );
};

const FeaturedDestinations = () => {
  const destinations = [
    { name: 'Đà Lạt', rating: '4.9', desc: 'Thành phố sương mù với khí hậu se lạnh và cảnh quan thơ mộng bậc nhất Việt Nam.', budget: '2.000.000 - 3.500.000đ', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800' },
    { name: 'Phố cổ Hội An', rating: '4.8', desc: 'Nét đẹp cổ kính của những ngôi nhà lợp rêu phong và ánh đèn lồng rực rỡ về đêm.', budget: '2.500.000 - 4.000.000đ', img: 'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800' },
    { name: 'Đà Nẵng', rating: '4.9', desc: 'Thành phố đáng sống với những bãi biển quyến rũ và cây cầu Vàng kỳ vĩ trên đỉnh Bà Nà.', budget: '3.000.000 - 5.000.000đ', img: 'https://images.unsplash.com/photo-1559592481-74488ea01cf2?q=80&w=800' },
    { name: 'Đảo Phú Quốc', rating: '5.0', desc: 'Thiên đường nghỉ dưỡng với những bãi biển cát trắng trải dài và làn nước trong xanh.', budget: '4.500.000 - 7.000.000đ', img: 'https://images.unsplash.com/photo-1583275484600-34162b2975d6?q=80&w=800' }
  ];

  return (
    <section style={{ padding: '120px 40px', maxWidth: '1700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div>
          <h2 style={{ fontSize: '56px', fontWeight: '900', color: '#111827', margin: 0 }}>Địa điểm được yêu thích</h2>
          <p style={{ color: '#6b7280', marginTop: '20px', fontSize: '24px' }}>Những điểm đến được du khách bình chọn nhiều nhất trên hệ thống S-Trip.</p>
        </div>
        <a href="#" style={{ color: '#10b981', fontWeight: '800', textDecoration: 'none', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Xem tất cả <FontAwesomeIcon icon={faArrowRight} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
        {destinations.map((item, index) => (
          <DestinationCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedDestinations;