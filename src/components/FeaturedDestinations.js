import React, { useState, useRef, useEffect, useContext, createContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faStarHalfAlt, faSearch, faChevronLeft, faChevronRight,
  faTimes, faMapMarkerAlt, faSpinner, faQuoteLeft,
  faWallet, faImages,
} from '@fortawesome/free-solid-svg-icons';
import { fetchProvinceImages } from '../services/api';

const normalizeForSearch = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Xóa dấu thanh
    .replace(/đ/g, 'd') // Chuyển đ thành d
    .replace(/[^a-z0-9]/g, ''); // Xóa toàn bộ khoảng trắng và ký tự đặc biệt
};

// ─────────────────────────────────────────────
// CACHE ảnh (RAM – tự xóa khi F5)
// ─────────────────────────────────────────────
const imageCache = {};

// ─────────────────────────────────────────────
// THEME CONTEXT (tránh prop drilling qua nhiều tầng)
// ─────────────────────────────────────────────
const ThemeContext = createContext(false);

// ─────────────────────────────────────────────
// Fallback ảnh phong cảnh Việt Nam đẹp (Unsplash)
// ─────────────────────────────────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1590001158193-7ab07fa9707e?q=80&w=800',
  'https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?q=80&w=800',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
  'https://images.unsplash.com/photo-1570197571499-166b36435e9f?q=80&w=800',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=800',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
  'https://images.unsplash.com/photo-1509233725247-49e657c54213?q=80&w=800',
  'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800',
  'https://images.unsplash.com/photo-1571167530149-c1105da4c2c7?q=80&w=800',
  'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?q=80&w=800',
];

function getFallbackImages(provinceName) {
  // Tạo seed ổn định theo tên tỉnh để luôn trả cùng bộ ảnh
  const seed = provinceName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const result = [];
  for (let i = 0; i < 6; i++) {
    result.push(FALLBACK_IMAGES[(seed + i) % FALLBACK_IMAGES.length]);
  }
  return result;
}

// ─────────────────────────────────────────────
// STARS HELPER
// ─────────────────────────────────────────────
const StarRow = ({ rating, size = 13 }) => {
  const n = parseFloat(rating) || 0;
  const full = Math.floor(n);
  const half = n % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={i < full ? faStar : (i === full && half ? faStarHalfAlt : faStar)}
          style={{ color: (i < full || (i === full && half)) ? '#f59e0b' : '#e2e8f0', fontSize: size }}
        />
      ))}
    </span>
  );
};

// ─────────────────────────────────────────────
// DESTINATION CARD
// ─────────────────────────────────────────────
const DestinationCard = ({ item, compact = false, onClick }) => {
  const isDark = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ padding: '8px 4px 12px', boxSizing: 'border-box', width: '100%' }}>
      <div
        onClick={() => onClick && onClick(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isDark ? '#2a2a2a' : '#fff',
          borderRadius: compact ? '16px' : '24px',
          overflow: 'hidden',
          boxShadow: isHovered ? '0 30px 60px rgba(0,0,0,0.2)' : `0 10px 20px rgba(0,0,0,${isDark ? '0.15' : '0.03'})`,
          transition: '0.4s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          cursor: 'pointer',
          border: `1px solid ${isDark ? '#3a3a3a' : '#f1f5f9'}`,
          display: 'flex', flexDirection: 'column', width: '100%',
        }}
      >
        <div style={{ height: compact ? '180px' : '300px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={item.img} alt={item.name}
            data-fixed-h="true"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.8s ease', transform: isHovered ? 'scale(1.12)' : 'scale(1)' }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=800'; }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)',
            opacity: isHovered ? 1 : 0, transition: '0.3s ease',
            display: 'flex', alignItems: 'flex-end', padding: '18px',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px', letterSpacing: '0.3px' }}>
              Xem thư viện ảnh →
            </span>
          </div>
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            backgroundColor: isDark ? '#1a1a1a' : 'white', padding: '5px 10px', borderRadius: '10px',
            fontWeight: '800', fontSize: compact ? '13px' : '15px',
            display: 'flex', alignItems: 'center', gap: '5px', color: isDark ? '#e8e8e8' : '#111827',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <FontAwesomeIcon icon={faStar} style={{ color: '#eab308' }} /> {item.rating}
          </div>
        </div>
        <div style={{ padding: compact ? '16px' : '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: compact ? '17px' : '24px', fontWeight: '900', color: isHovered ? '#10b981' : (isDark ? '#e8e8e8' : '#111827'), margin: '0 0 8px 0', transition: '0.2s' }}>{item.name}</h3>
          <p style={{ fontSize: compact ? '13px' : '15px', color: isDark ? '#9ca3af' : '#64748b', lineHeight: '1.6', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{item.desc}</p>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: isDark ? '#6b7280' : '#9ca3af', textTransform: 'uppercase', marginBottom: '3px' }}>Ngân sách ước tính</div>
            <div style={{ color: '#10b981', fontWeight: '900', fontSize: compact ? '15px' : '18px' }}>{item.budget}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// IMAGE GALLERY (thay thế Google Reviews)
// ─────────────────────────────────────────────
const ImageGallery = ({ item }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // index của ảnh đang xem to
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Kiểm tra cache
    if (imageCache[item.name]) {
      setImages(imageCache[item.name]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadImages = async () => {
      setLoading(true);
      try {
        const imgs = await fetchProvinceImages(item.name);
        if (Array.isArray(imgs) && imgs.length > 0) {
          imageCache[item.name] = imgs;
          setImages(imgs);
        } else {
          throw new Error('empty');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          const fallback = getFallbackImages(item.name);
          imageCache[item.name] = fallback;
          setImages(fallback);
        }
      } finally {
        setLoading(false);
      }
    };

    loadImages();
    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Skeleton loading
  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FontAwesomeIcon icon={faImages} style={{ color: '#10b981', fontSize: '16px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: 0 }}>Thư viện ảnh</h3>
          <FontAwesomeIcon icon={faSpinner} spin style={{ color: '#10b981', fontSize: '14px', marginLeft: 'auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              height: '200px', borderRadius: '12px',
              background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
              animation: 'shimmer 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <FontAwesomeIcon icon={faImages} style={{ color: '#10b981', fontSize: '16px' }} />
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: 0 }}>Thư viện ảnh</h3>
        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '600', marginLeft: 'auto' }}>{images.length} ảnh</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {images.map((src, idx) => (
          <GalleryThumb key={idx} src={src} alt={`${item.name} ${idx + 1}`} onClick={() => setLightbox(idx)} />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(i => (i - 1 + images.length) % images.length); }}
            style={arrowBtnStyle('left')}
          >‹</button>

          <img
            src={images[lightbox]}
            alt={`${item.name} ${lightbox + 1}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '82vw', maxHeight: '82vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGES[0]; }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(i => (i + 1) % images.length); }}
            style={arrowBtnStyle('right')}
          >›</button>

          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '42px', height: '42px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div style={{ position: 'absolute', bottom: '22px', color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontWeight: '600' }}>
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

const arrowBtnStyle = (dir) => ({
  position: 'absolute', [dir === 'left' ? 'left' : 'right']: '16px',
  background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
  width: '52px', height: '52px', borderRadius: '50%',
  fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: '0.2s', backdropFilter: 'blur(4px)',
});

const GalleryThumb = ({ src, alt, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
    >
      <img
        src={src} alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s ease', transform: hov ? 'scale(1.1)' : 'scale(1)' }}
        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGES[0]; }}
      />
      {hov && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: '22px' }}>⤢</span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// NHẬN XÉT MẶC ĐỊNH – biên soạn riêng từng tỉnh
// ─────────────────────────────────────────────
const DEFAULT_REVIEWS = {
  'An Giang': 'An Giang là vùng đất hội tụ cả sông nước lẫn núi non – điều hiếm có ở miền Tây. Rừng tràm Trà Sư vào mùa nước nổi tháng 9–11 là thời điểm đẹp nhất: mặt nước xanh biếc phản chiếu hàng nghìn bông sen trắng, thuyền lướt nhẹ dưới tán tràm mát rượi tạo cảm giác lạc vào chốn bồng lai. Dãy Thất Sơn huyền bí với núi Cấm cao nhất đồng bằng, khí hậu mát mẻ quanh năm, lý tưởng để leo bộ và chiêm bái chùa Vạn Linh linh thiêng. Ẩm thực An Giang đậm đà phong vị Khmer – đừng bỏ qua bún cá Châu Đốc, mắm Châu Đốc nức tiếng và bánh bò thốt nốt.',
  'Bà Rịa - Vũng Tàu': 'Vũng Tàu là "bãi biển của Sài Gòn" – cách trung tâm chưa đến 2 tiếng lái xe nhưng đủ xa để cảm nhận gió biển mát lành. Bãi Sau rộng dài với sóng vừa phải, thích hợp cho cả gia đình. Bãi Trước êm ả hơn, lý tưởng ngắm hoàng hôn. Leo lên Hải Đăng trên Núi Nhỏ vào buổi sáng sớm để ngắm toàn cảnh vịnh mờ sương là trải nghiệm khó quên. Hải sản tươi ngon, giá hợp lý – ghẹ hấp bia, cua rang me và cá mú hấp gừng là những món không thể bỏ lỡ.',
  'Bắc Giang': 'Bắc Giang đẹp nhất vào tháng 6, khi vải thiều Lục Ngạn chín đỏ trải dài hàng nghìn héc-ta. Ngồi giữa vườn vải, nhìn ra bạt ngàn màu đỏ hồng rực rỡ dưới ánh nắng chiều là khoảnh khắc đáng giá cả chuyến đi. Chùa Vĩnh Nghiêm – bảo tàng mộc bản Phật giáo được UNESCO công nhận – là điểm dừng chân không thể bỏ qua. Đừng quên thưởng thức bánh đa Thổ Hà và mì Chũ dẻo thơm đặc trưng của vùng đất này.',
  'Bắc Kạn': 'Hồ Ba Bể là hồ nước ngọt tự nhiên lớn nhất Việt Nam, ẩn mình giữa rừng nguyên sinh hùng vĩ. Chèo thuyền trên mặt hồ trong vắt, len lỏi qua hang Puông để nghe tiếng dơi hàng nghìn con bay rào rào, hay thăm đảo nổi An Mã giữa hồ là những trải nghiệm độc nhất. Người Tày bản địa giữ gìn lối sống và trang phục truyền thống đáng trân quý. Tháng 3–4 và tháng 9–10 là thời điểm lý tưởng nhất để đến Ba Bể.',
  'Bạc Liêu': 'Bạc Liêu gắn liền với giai thoại "Công tử Bạc Liêu" phóng khoáng, nhà công tử trăm năm tuổi vẫn đứng vững bên dòng sông Bạc Liêu như chứng nhân lịch sử. Cánh đồng điện gió ven biển – một trong những dự án lớn nhất Việt Nam – tạo nên khung cảnh hùng tráng lạ mắt, đặc biệt đẹp khi chụp ảnh lúc hoàng hôn. Bạc Liêu cũng là cái nôi của đờn ca tài tử Nam Bộ; đêm nghe ca tài tử bên bờ sông là ký ức khó phai.',
  'Bắc Ninh': 'Bắc Ninh là mảnh đất thiêng của dân ca Quan họ – âm điệu ngọt ngào da diết được UNESCO vinh danh. Hội Lim tháng Giêng là thời điểm liền anh liền chị hát đối đáp trên thuyền, trên đồi, tạo nên không khí lễ hội sống động hiếm có. Đền Đô – nơi thờ tám vị vua triều Lý – uy nghi giữa không gian cây cổ thụ mát rượi. Làng tranh Đông Hồ dù đã thu nhỏ, vẫn còn những nghệ nhân tâm huyết giữ nghề in tranh dân gian độc đáo.',
  'Bến Tre': 'Bến Tre là xứ sở của những rặng dừa xanh mướt trải dài tít tắp. Ngồi xuồng ba lá luồn lách qua những rạch nhỏ râm mát, tay chạm những buồng dừa trĩu quả, nghe tiếng chim hót líu lo – đó là Bến Tre chân thực nhất. Kẹo dừa Bến Tre thơm ngọt, mứt dừa, rượu dừa… đặc sản nào cũng mang đậm hương vị quê nhà. Tháng 4–8 nước cạn, dễ dàng di chuyển và trải nghiệm làng nghề truyền thống.',
  'Bình Định': 'Quy Nhơn – đô thị biển đang "thức dậy" mạnh mẽ – sở hữu những bãi biển hoang sơ chưa bị khai thác ồ ạt. Kỳ Co với vách đá trắng và nước biển xanh ngọc bích được ví như Maldives thu nhỏ, Eo Gió gió thổi mạnh quanh năm lý tưởng cho những bức ảnh sóng gió lãng mạn. Tháp Chàm Bánh Ít và tháp Đôi là di sản Chăm Pa nghìn năm tuổi cần một ngày để khám phá. Hải sản Quy Nhơn tươi rói, bánh xèo tôm nhảy và bún chả cá là linh hồn ẩm thực vùng đất võ.',
  'Bình Dương': 'Bình Dương không chỉ là thành phố công nghiệp – đây là nơi ẩn chứa nhiều bất ngờ thú vị. Khu du lịch Đại Nam hoành tráng với công viên nước, sở thú và chùa dát vàng lộng lẫy. Làng sơn mài Tương Bình Hiệp lưu giữ nghề thủ công truyền thống hàng trăm năm. Phố đi bộ Bình Dương về đêm nhộn nhịp, ẩm thực đa dạng từ bình dân tới cao cấp đủ chiều lòng mọi du khách.',
  'Bình Phước': 'Bình Phước là vùng đất bình yên của những đồi điều, cao su bạt ngàn và những khu rừng nguyên sinh còn nguyên vẹn. Vườn quốc gia Bù Gia Mập là một trong những khu bảo tồn đa dạng sinh học quan trọng nhất Đông Nam Bộ. Trảng cỏ Bù Lạch – cánh đồng cỏ bao la hiếm có ở miền Nam – đặc biệt ấn tượng vào mùa khô khi cỏ chuyển vàng dưới nắng. Thác Mơ và suối Lam là điểm cắm trại lý tưởng cuối tuần.',
  'Bình Thuận': 'Mũi Né – Phan Thiết từ lâu đã là thương hiệu du lịch biển bậc nhất miền Nam. Đồi cát đỏ và đồi cát trắng thay nhau chạy dọc bờ biển, dân lướt ván diều và sandboarding sẽ thấy đây là thiên đường. Suối Tiên uốn lượn qua đồi cát tạo khung cảnh kỳ ảo như bãi biển Trung Đông. Hải sản Phan Thiết nổi tiếng từ bao đời, nhất là mực một nắng, bánh căn nóng hổi và nước mắm Phan Thiết trứ danh.',
  'Cà Mau': 'Cà Mau – mũi đất tận cùng của Tổ quốc – có một vẻ đẹp hoang sơ và hào phóng của thiên nhiên nhiệt đới. Vườn quốc gia Cà Mau với hệ sinh thái rừng đước ngập mặn rộng lớn nhất Đông Nam Á, nơi con người và tự nhiên cùng tồn tại hài hòa. Đặt chân tới mốc toạ độ quốc gia cực Nam – cảm giác đứng ở điểm cuối đất nước thiêng liêng không thể diễn tả. Ba Khía, tôm tích và cua Năm Căn là đặc sản ngon nức tiếng của vùng đất này.',
  'Cần Thơ': 'Cần Thơ – "Tây Đô" của miền sông nước – mang trong mình nhịp đập hào sảng của miệt vườn Nam Bộ. Chợ nổi Cái Răng họp từ 4–5 giờ sáng; ngồi thuyền len lỏi giữa trăm thứ trái cây, hít hương cà phê vợt thơm nức mới thấy trọn vẹn hồn Tây Nam Bộ. Vườn trái cây Mỹ Khánh sum xuê cho phép tự tay hái và thưởng thức tại chỗ. Bún riêu cua đồng, bánh cống Cần Thơ và lẩu mắm miền Tây là những món bắt buộc phải thử.',
  'Cao Bằng': 'Cao Bằng chứa đựng những kỳ quan thiên nhiên hoành tráng bậc nhất Đông Bắc. Thác Bản Giốc đổ ầm ầm xuống ghềnh đá trắng xóa, bên cạnh là màu xanh ngọc bích của sông Quây Sơn – khung cảnh hùng vĩ như tranh vẽ. Hang Pác Bó lịch sử nơi Bác Hồ từng sống và làm việc mang giá trị tâm linh sâu sắc. Đường đến Cao Bằng quanh co uốn lượn qua bát ngát ruộng bậc thang – hành trình tự lái xe đủ mãn nhãn cả chuyến đi.',
  'Đà Nẵng': 'Đà Nẵng là thành phố hội đủ mọi yếu tố của một điểm đến lý tưởng: biển Mỹ Khê trải dài mịn màng, Bán đảo Sơn Trà nguyên sinh ngay sát đô thị, phố cổ Hội An chỉ 30 phút xe. Cầu Rồng thổi lửa và phun nước mỗi cuối tuần là show diễn miễn phí không nơi nào có. Làng cáp treo Bà Nà Hills – nơi có Cầu Vàng biểu tượng – để thoát khỏi cái nóng và lạc vào xứ sở thần tiên Pháp giữa mây mù.',
  'Đắk Lắk': 'Đắk Lắk là thủ phủ cà phê của Việt Nam và cũng là vùng đất của những huyền thoại voi nhà. Hồ Lắk trong xanh êm ả bao quanh bởi những buôn làng Ê Đê truyền thống – buổi sáng sương mù phủ mặt hồ đẹp như cổ tích. Vườn quốc gia Yók Đôn là nơi duy nhất ở Việt Nam có thể gặp voi hoang dã. Cà phê Ban Mê rang xay tươi, thịt nướng và rượu cần bên nhà sàn là trải nghiệm văn hóa Tây Nguyên không thể thay thế.',
  'Đắk Nông': 'Đắk Nông được UNESCO công nhận là Công viên địa chất toàn cầu nhờ hệ thống hang động núi lửa kỳ diệu kéo dài hàng chục km dưới lòng đất – dài nhất Đông Nam Á. Thác Trinh Nữ, Thác Đray Sáp hùng tráng và Hồ Tây giữa đại ngàn là những góc check-in ấn tượng. Người MNông hiền lành, mến khách với nghề dệt thổ cẩm và những lễ hội cồng chiêng đặc sắc. Đây là điểm đến còn nguyên vẻ hoang sơ, phù hợp cho những ai thích khám phá.',
  'Điện Biên': 'Điện Biên Phủ không chỉ là địa danh lịch sử – đây là cả một cuốn sách sống động về cuộc kháng chiến hào hùng. Đồi A1, Hầm De Castries, Nghĩa trang liệt sĩ… mỗi nơi đều khiến lòng người dâng lên niềm tự hào và xúc cảm sâu lắng. Thung lũng Mường Thanh tháng 5 lúa chín vàng rực là một trong những bức tranh đồng quê đẹp nhất miền núi phía Bắc. Ẩm thực Thái với cơm lam, pa pỉnh tộp và rượu cần là phần không thể thiếu.',
  'Đồng Nai': 'Đồng Nai sở hữu Vườn quốc gia Cát Tiên – vùng đệm sinh quyển quan trọng cuối cùng ở Đông Nam Bộ, nơi có thể nghe tiếng vượn hót lúc bình minh. Thác Giang Điền thơ mộng ngay cạnh TP.HCM chưa đến 60km là điểm dã ngoại lý tưởng cuối tuần. Làng bưởi Tân Triều nổi tiếng với bưởi đường ngọt thanh, cù lao Ba Xê thơ mộng trên sông Đồng Nai cho cảm giác hoàn toàn tách biệt khỏi đô thị ồn ào.',
  'Đồng Tháp': 'Đồng Tháp vào mùa nước nổi (tháng 9–11) là thiên đường của sen hồng và bông súng tím. Vườn quốc gia Tràm Chim – "Đồng Tháp Mười thu nhỏ" – là thánh địa của loài sếu đầu đỏ quý hiếm. Làng hoa Sa Đéc nổi tiếng nhất miền Tây với hàng nghìn chậu hoa đua sắc mỗi dịp Tết. Nhà cổ Huỳnh Thủy Lê – nguyên mẫu trong tiểu thuyết "Người tình" của Marguerite Duras – là điểm hành hương của du khách yêu văn học.',
  'Gia Lai': 'Pleiku – thành phố cao nguyên mang vẻ đẹp buồn da diết như những bài thơ của Phạm Tiến Duật. Biển Hồ T\'Nưng yên tĩnh xanh thẳm, sương sớm phủ kín mặt hồ mỗi buổi bình minh tạo khung cảnh huyền ảo. Đồi chè Biển Hồ bạt ngàn xanh mướt, thác Phú Cường hùng vĩ và làng văn hóa Tây Nguyên đặc sắc là những lý do đủ để ghé Gia Lai ít nhất một lần.',
  'Hà Giang': 'Hà Giang là cung đường xe máy đỉnh cao nhất Việt Nam – không phải ai cũng dám thách thức nhưng ai đã đến đều không thể quên. Mã Pì Lèng – "con dốc của sự thử thách sinh tử" – nhìn xuống vực sông Nho Quế xanh biếc là khoảnh khắc nghẹt thở. Cao nguyên đá Đồng Văn với những ngôi nhà trình tường xám cổ kính giữa hoa tam giác mạch tím hồng tháng 10–11 đẹp như cổ tích. Chợ phiên Đồng Văn họp mỗi sáng Chủ nhật rực rỡ sắc thổ cẩm các dân tộc.',
  'Hà Nam': 'Tam Chúc – quần thể chùa lớn nhất thế giới theo Kỷ lục Guinness – được xây dựng giữa hồ nước mênh mông và núi non hùng vĩ. Ngồi thuyền thăm chùa trong làn sương sớm, tiếng chuông ngân vang trên mặt nước là trải nghiệm tâm linh sâu sắc. Kẽm Trống – hang đá và sông nước đan xen – là điểm chèo thuyền kayak thú vị ngay gần Hà Nội. Hà Nam còn là nơi sản xuất thêu ren truyền thống đẹp tinh xảo.',
  'Hà Nội': 'Hà Nội là thành phố sống chậm nhất trong số các đô thị lớn Việt Nam, dù nhịp sống bên ngoài có thể bận rộn đến đâu. Hồ Hoàn Kiếm lúc 6 giờ sáng, khi người dân tập thể dục và du khách chụp ảnh Tháp Rùa trong sương mai – đó là linh hồn Hà Nội. 36 phố phường ẩm thực với phở bò, bún chả, bánh cuốn Thanh Trì, cà phê trứng… đủ choán hết một tuần. Mùa thu Hà Nội – lá vàng rơi và sấu chín – là lý do nhiều người không thể thôi nhớ thành phố này.',
  'Hà Tĩnh': 'Biển Thiên Cầm Hà Tĩnh còn giữ được vẻ hoang sơ mà nhiều bãi biển miền Trung đã đánh mất. Sóng lớn, cát trắng, hàng phi lao rì rào là hình ảnh đặc trưng. Chùa Hương Tích trên đỉnh Hồng Lĩnh 99 ngọn là điểm hành hương nổi tiếng, nhất là vào mùa xuân. Làng Sen Nghĩa Lộc – quê nội Bác Hồ – và Khu lưu niệm Nguyễn Du ở Tiên Điền là hai địa chỉ lịch sử – văn hóa đáng kính.',
  'Hải Dương': 'Xứ Đông ngàn năm văn hiến – Hải Dương là điểm giao thoa của nhiều giá trị văn hóa Bắc Bộ. Côn Sơn – Kiếp Bạc mỗi mùa hội tháng Giêng và tháng Tám thu hút hàng vạn người về tưởng nhớ Trần Hưng Đạo và Nguyễn Trãi. Làng gốm Cậy, làng vàng bạc Châu Khê và bánh đậu xanh Hải Dương là những đặc sản truyền thống không thể bỏ qua khi ghé thăm.',
  'Hải Phòng': 'Hải Phòng – thành phố hoa phượng đỏ – có một tâm hồn lãng mạn riêng giữa bận rộn cảng biển. Đảo Cát Bà và vịnh Lan Hạ là kỳ quan thiên nhiên được mệnh danh "em gái Hạ Long" – nước trong vắt nhìn thấy đáy, đá vôi tai mèo sắc nhọn dựng đứng uy nghi. Bánh mì cay Hải Phòng và bún cá Hải Phòng nổi tiếng khắp cả nước. Phố đi bộ Tam Bạc về đêm nhộn nhịp và thú vị.',
  'Hậu Giang': 'Hậu Giang yên bình và mộc mạc, đậm chất sông nước miền Tây ít bị thương mại hóa. Chợ nổi Ngã Bảy tuy không còn tấp nập như xưa nhưng vẫn giữ được không khí chợ sông đặc trưng Nam Bộ. Khu du lịch sinh thái Lung Ngọc Hoàng – "lá phổi xanh" của đồng bằng – là thánh địa của những loài chim nước quý hiếm. Du lịch làng nghề đan lát Nàng Mau và đặc sản cá thác lác cườm nướng muối ớt là những trải nghiệm địa phương đáng nhớ.',
  'Hòa Bình': 'Thung lũng Mai Châu như một bức tranh thuỷ mặc với những ngôi nhà sàn bản Lác trắng tinh giữa ruộng lúa xanh. Dân tộc Thái trắng ở đây hiếu khách, dệt thổ cẩm và cất giọng dân ca ấm áp đón du khách. Hồ Hòa Bình trải rộng 8.000 ha giữa núi rừng trùng điệp là địa điểm chèo kayak và câu cá thú vị. Thác Bờ huyền thoại và hang động Thác Bờ thêm phần kỳ thú cho hành trình.',
  'Hưng Yên': 'Hưng Yên nhỏ bé nhưng ẩn chứa nhiều giá trị lịch sử – văn hóa đáng trân quý. Phố Hiến xưa từng là đô thị sầm uất bậc nhất Đàng Ngoài thế kỷ 16–17, nay còn lưu giữ hàng trăm di tích đền chùa cổ kính. Mùa nhãn lồng tháng 7–8 thơm ngọt khắp các làng quê, đặc biệt nhãn cùi dày, hạt nhỏ của Phố Hiến đã thành thương hiệu toàn quốc. Bản thảo Thiền uyển tập anh là kho tàng văn học Phật giáo quý hiếm lưu giữ tại nơi này.',
  'Khánh Hòa': 'Nha Trang là thiên đường biển đảo nổi tiếng toàn châu Á, nơi chuỗi đảo san hô tuyệt đẹp chờ được khám phá. Tháp Bà Ponagar nghìn năm tuổi uy nghi bên bờ sông Cái là di sản Chăm Pa còn nguyên vẹn nhất miền Trung. Lặn ngắm san hô ở đảo Mun hay Hòn Tằm trong nước trong vắt đến mức thấy đáy là trải nghiệm không thể bỏ qua. Bún cá Nha Trang, nem nướng Ninh Hòa và tôm hùm Bình Ba là những lý do ẩm thực đáng để quay lại.',
  'Kiên Giang': 'Phú Quốc – Đảo Ngọc – là điểm đến đỉnh cao của du lịch biển đảo Việt Nam. Bãi Sao với cát trắng mịn như bột, nước xanh trong suốt được nhiều tạp chí quốc tế bình chọn là một trong những bãi biển đẹp nhất thế giới. Quần đảo Nam Du và Thổ Chu còn nguyên sơ, chưa bị khai thác du lịch đại trà – lý tưởng cho những ai muốn khám phá hoang đảo thực thụ. Hồ tiêu Phú Quốc và nước mắm Phú Quốc là đặc sản trứ danh thế giới.',
  'Kon Tum': 'Kon Tum là vùng đất của những nhà rông sừng sững, tượng nhà mồ kỳ bí và âm thanh cồng chiêng vang vọng núi rừng. Nhà thờ gỗ Kon Tum – kiến trúc kết hợp Pháp và Bana trên 100 tuổi – là điểm check-in đặc biệt nhất Tây Nguyên. Ngã ba Đông Dương – nơi ba quốc gia Việt – Lào – Campuchia giao nhau – là điểm đến mang ý nghĩa lịch sử và địa lý độc đáo. Sông Đắk Bla ngược dòng chảy là hiện tượng hiếm có thu hút giới nghiên cứu.',
  'Lai Châu': 'Lai Châu ẩn sâu trong dãy Hoàng Liên Sơn hùng vĩ, ít du khách biết đến nhưng những người đã đến đều mê đắm. Đèo Ô Quy Hồ – "Tứ đại đỉnh đèo" của Việt Nam – trải dài hơn 50km, nhiều khúc quanh đứng tim nhưng cảnh vật hai bên đẹp đến nghẹt thở. Bản Vàng Pheo của người Thái gần thị trấn Phong Thổ vẫn còn nguyên nét văn hóa xưa. Đặc sản cá bống vùi tro, thịt trâu gác bếp và rượu Sán Lùng mùa đông ấm lòng.',
  'Lâm Đồng': 'Đà Lạt – thành phố của những mùa hoa – là điểm đến bốn mùa không bao giờ lỗi mốt. Tháng 12 hoa dã quỳ vàng rực, tháng 1–2 mai anh đào nở hồng, tháng 3–4 hoa cẩm tú cầu xanh tím… mỗi mùa một sắc riêng. Thung lũng Tình Yêu, đồi Mimosa, thiền viện Trúc Lâm là những địa điểm du lịch kinh điển. Nhưng điều níu chân thật sự là cà phê bơ Đà Lạt vào buổi sáng se lạnh và dâu tây hái thẳng từ vườn mọng đỏ.',
  'Lạng Sơn': 'Lạng Sơn – cửa ngõ biên giới phía Bắc – có vẻ đẹp kỳ thú của núi đá vôi, hang động và chợ biên giới sầm uất. Động Tam Thanh và Nhị Thanh là kiệt tác thiên nhiên với nhũ đá ngàn năm; thơ khắc trên vách đá nhắc nhớ những tao nhân mặc khách xưa. Chợ Kỳ Lừa buôn bán hàng hóa qua biên giới tạo không khí đặc biệt. Đặc sản thịt lợn quay, vịt quay Lạng Sơn và mắc mật là những hương vị khó quên.',
  'Lào Cai': 'Sapa – mảnh đất của mây mù và ruộng bậc thang – là một trong những điểm du lịch biểu tượng nhất Việt Nam. Chinh phục Fansipan – nóc nhà Đông Dương 3143m – bằng cáp treo hay trekking đều mang lại cảm giác tự hào khác nhau. Bản Cát Cát, Tả Van, Lao Chải của người H\'Mông và Dao đỏ giữ nguyên lối sống và trang phục truyền thống. Thị trấn Sapa về đêm trong sương lạnh với bếp lửa nhà sàn và những cốc rượu táo mèo ấm bụng là ký ức khó phai.',
  'Long An': 'Long An bình dị và mộc mạc, nằm giữa ranh giới Đông Nam Bộ và Tây Nam Bộ nên mang nét đặc trưng của cả hai vùng. Làng nổi Tân Lập – con đường gỗ dài nhất miền Nam xuyên qua rừng tràm xanh mát – được mệnh danh là "set phim điện ảnh thiên nhiên" vì độ đẹp hút hồn. Mùa nước nổi tháng 9–11, cánh đồng lúa ngập tràn hoa súng tím là khung cảnh trữ tình. Đặc sản gạo nàng thơm Chợ Đào và tôm càng xanh sông Vàm Cỏ nức tiếng.',
  'Nam Định': 'Nam Định tự hào là cái nôi của phở bò truyền thống – bát phở Nam Định trong vắt, bánh phở mỏng dai, nước dùng ngọt từ xương bò ninh kỹ là chuẩn mực mà nhiều nơi học theo. Nhà thờ đổ Hải Lý và Hải Triều bên bờ biển Nghĩa Hưng – những tháp nhà thờ bị sóng biển xâm thực chỉ còn trơ vách – tạo nên vẻ đẹp u hoài, rất được giới nhiếp ảnh yêu thích. Phủ Giầy – nơi thờ Mẫu Liễu Hạnh – là trung tâm tín ngưỡng thờ Mẫu lớn nhất miền Bắc.',
  'Nghệ An': 'Nghệ An – quê hương của Chủ tịch Hồ Chí Minh – mang trong mình niềm tự hào dân tộc sâu sắc. Khu di tích Kim Liên, Làng Sen yên bình và nhà Bác Hồ bình dị giữa rặng tre xanh là nơi hàng triệu người con đất Việt muốn một lần ghé thăm. Biển Cửa Lò sóng vỗ ầm ầm, hải sản phong phú; biển Bãi Lữ hoang sơ yên tĩnh hơn. Đồi chè Thanh Chương trải dài như thảm nhung xanh mướt dưới nắng là góc chụp ảnh lý tưởng.',
  'Ninh Bình': 'Ninh Bình là "Hạ Long cạn" của Việt Nam – những ngọn núi đá vôi sừng sững mọc giữa đồng bằng, uốn mình quanh những dòng sông xanh ngọc. Tràng An được UNESCO công nhận là Di sản kép (văn hóa – thiên nhiên) duy nhất tại Đông Nam Á. Bích Động – "Nam thiên đệ nhị động" – huyền ảo trong ánh nến. Hoa Lư cố đô nghìn năm tuổi và cánh đồng lúa mùa vàng Tam Cốc là những khung hình không thể đẹp hơn.',
  'Ninh Thuận': 'Ninh Thuận là vùng đất của những nghịch lý tuyệt đẹp: khô hạn nhất cả nước nhưng sản sinh ra những cảnh quan kỳ vĩ nhất – đồi cát Mũi Dinh đỏ hực, vườn nho Phan Rang trĩu quả, tháp Chàm cổ ngàn năm trầm mặc. Vịnh Vĩnh Hy ngọc lam trong vắt là thiên đường lặn ngắm san hô ít người biết. Thịt cừu Ninh Thuận nướng trên than hồng, rượu nho Phan Rang và bánh gạo Chăm Pa là đặc sản mang hương vị của vùng đất nắng gió.',
  'Phú Thọ': 'Phú Thọ – đất Tổ nghìn năm – là cội nguồn tâm linh của người Việt. Đền Hùng trên núi Nghĩa Lĩnh thờ 18 đời vua Hùng; ngày Giỗ Tổ 10 tháng 3 âm lịch hàng triệu người hành hương về đây trong nghi lễ thống nhất dân tộc sâu sắc nhất. Đồi chè Long Cốc Tân Sơn vào sáng sớm sương phủ trắng là cảnh đẹp làm nao lòng người. Đặc sản bánh sắn, thịt chua Thanh Sơn và cá dầm xứ nức tiếng vùng đồng bằng Trung du.',
  'Phú Yên': 'Phú Yên – vùng đất thơ của "Hoa vàng trên cỏ xanh" – nổi lên thành điểm đến hot sau khi bộ phim cùng tên công chiếu. Gành Đá Đĩa với những cột đá hình lăng trụ xếp tầng tầng lớp lớp là hiện tượng địa chất độc đáo bậc nhất Việt Nam. Đầm Ô Loan và vịnh Xuân Đài yên bình, đẹp hoang sơ như tranh vẽ. Tuy Hòa còn giữ được sự bình yên của một đô thị biển chưa bị du lịch thương mại hóa – điều mà nhiều du khách tìm kiếm.',
  'Quảng Bình': 'Quảng Bình là thủ phủ hang động của thế giới – không chỉ có Sơn Đoòng mà còn hàng trăm hang động lớn nhỏ chưa có tên. Phong Nha – Kẻ Bàng với Thiên Đường và Phong Nha là điểm khám phá hang động dễ tiếp cận nhất; Sơn Đoòng khổng lồ hơn cả một tòa nhà chọc trời cần đặt tour trước nhiều tháng. Biển Nhật Lệ dài trong xanh, đèo Đá Đẽo hùng vĩ trên đường mòn Hồ Chí Minh – Quảng Bình là điểm dừng chân xứng đáng nhất trên hành trình Bắc – Nam.',
  'Quảng Nam': 'Hội An – thành phố đèn lồng – là nơi thời gian như dừng lại giữa những con phố cổ kính, mái ngói rêu phong và ánh đèn màu lung linh dưới đêm rằm. Phố Hội về sáng sớm vắng người là lúc đẹp nhất để đi bộ và ngắm kiến trúc Nhật – Hoa – Việt hòa quyện. Mỹ Sơn cách 40km – thánh địa Chăm Pa ẩn giữa thung lũng xanh – là một thế giới hoàn toàn khác biệt đáng nửa ngày khám phá. Cao Lầu, Mì Quảng và bánh mì Phượng là bộ ba ẩm thực Hội An không thể bỏ lỡ.',
  'Quảng Ngãi': 'Đảo Lý Sơn – "Vương quốc tỏi" giữa biển Đông – có cảnh quan núi lửa độc đáo không nơi nào có. Cổng Tò Vò – vòm đá tự nhiên vươn ra biển – là biểu tượng check-in nổi tiếng nhất đảo. Miệng núi lửa Giếng Tiền đã tắt từ hàng triệu năm nay tạo nên địa hình dị thường hấp dẫn. Tỏi Lý Sơn cay thơm đặc biệt do được trồng trên nền đất san hô – đặc sản mua về làm quà tặng ý nghĩa. Mực khô và hải sản tươi ngon là thế mạnh của đảo.',
  'Quảng Ninh': 'Vịnh Hạ Long – Kỳ quan thiên nhiên thế giới – là niềm tự hào của người Việt và là giấc mơ của triệu triệu du khách quốc tế. Hàng nghìn đảo đá vôi cao thấp lô xô, hang động huyền bí và làng chài nổi là những điều không nơi nào trên Trái Đất có được. Du thuyền đêm trên Hạ Long với bầu trời sao và tiếng sóng vỗ nhẹ là trải nghiệm xa xỉ mà ai cũng nên thử một lần. Yên Tử linh thiêng và Trà Cổ bình yên là hai cực đối lập đáng khám phá.',
  'Quảng Trị': 'Quảng Trị mang một trọng lượng lịch sử đặc biệt – đây là tỉnh chịu tổn thất nặng nề nhất trong chiến tranh nhưng cũng kiên cường đứng dậy mạnh mẽ nhất. Thành cổ Quảng Trị, Địa đạo Vịnh Mốc, nghĩa trang Trường Sơn và sân bay Tà Cơn là những địa danh in đậm trong trang sử dân tộc. Biển Cửa Tùng êm ả đón ánh hoàng hôn đỏ rực, làng nón lá Thổ Ngọa và cầu Hiền Lương – sông Bến Hải lịch sử là những điểm không thể bỏ qua.',
  'Sóc Trăng': 'Sóc Trăng là vùng đất của ba dân tộc Kinh – Khmer – Hoa sống cộng đồng hòa thuận, tạo nên bức tranh văn hóa đa sắc đặc biệt. Chùa Dơi – Wat Sro Loun – thờ hàng nghìn con dơi khổng lồ treo ngủ trên cây cổ thụ là cảnh tượng kỳ lạ không nơi nào có. Chùa Đất Sét độc đáo với toàn bộ nội thất làm từ đất sét nung. Lễ hội Ok-Om-Bok và đua ghe ngo của người Khmer mỗi tháng 10 âm lịch là festival văn hóa đặc sắc bậc nhất Nam Bộ.',
  'Sơn La': 'Mộc Châu – cao nguyên xanh mướt của Sơn La – đẹp quanh năm nhưng mỗi mùa một sắc riêng. Tháng 10–11 hoa cải trắng phủ đầy đồi, tháng 12 hoa mận trắng tinh, tháng 3–4 hoa ban tím trải rộng khắp nơi. Đồi chè trái tim là điểm chụp ảnh lãng mạn nhất cao nguyên. Thác Dải Yếm mùa mưa đổ trắng xóa hùng vĩ. Sữa bò tươi Mộc Châu, sơn tra ngâm mật ong và thịt bò khô hun khói là đặc sản được yêu thích.',
  'Tây Ninh': 'Tây Ninh là điểm đến tâm linh quan trọng bậc nhất miền Nam. Tòa thánh Cao Đài Tây Ninh – kiến trúc hội tụ nhiều phong cách Á – Âu – là ngôi thánh đường của tôn giáo nội sinh Việt Nam với nghi lễ thờ phụng độc đáo không nơi nào có. Núi Bà Đen – đỉnh cao nhất Nam Bộ – với cáp treo dài nhất Đông Nam Á đưa du khách lên chùa linh thiêng giữa mây. Bánh tráng phơi sương, muối tôm và mãng cầu Tây Ninh là đặc sản nức tiếng.',
  'Thái Bình': 'Thái Bình – vựa lúa của đồng bằng châu thổ – có một vẻ đẹp dung dị và chân chất hiếm có. Biển Vô Cực Quang Lang độc đáo ở chỗ khi triều xuống, mặt biển phẳng lặng như gương, người đứng trên bờ in bóng xuống mặt nước tạo ảo giác vô tận tuyệt đẹp. Chùa Keo Thái Bình – kiến trúc gỗ nguyên bản thế kỷ 17 không trùng tu lớn – là kiệt tác kiến trúc Phật giáo miền Bắc. Bánh cáy Thái Bình và giò bò ngon nức danh.',
  'Thái Nguyên': 'Thái Nguyên là thủ phủ của chè Việt Nam – nơi sản xuất ra loại chè ngon bậc nhất cả nước. Đồi chè Tân Cương vào buổi sáng sớm sương mù còn đọng trên búp chè xanh non, tiếng máy hái chè xen lẫn tiếng chim hót – đó là Thái Nguyên thuần túy nhất. Hồ Núi Cốc – "biển hồ miền núi" – gắn liền với huyền thoại tình yêu Nàng Công – Chàng Cốc đẹp như cổ tích. Uống chè Tân Cương ngay tại vườn chè là trải nghiệm không thể quên.',
  'Thanh Hóa': 'Thanh Hóa là tỉnh lớn nhất miền Bắc và ẩn chứa nhiều vẻ đẹp chưa được khám phá đúng mức. Sầm Sơn ồn ào nhộn nhịp mùa hè; Pù Luông ngược lại hoàn toàn – thung lũng ngập trong sương sớm, ruộng bậc thang chín vàng mùa thu và bản làng Thái im ắng bình yên. Suối cá thần Cẩm Lương nơi hàng nghìn con cá anh vũ quý hiếm sống giữa người dân là điểm kỳ thú. Nem chua Thanh Hóa chua ngọt, chả tôm Thanh Hóa và bánh gai Tứ Trụ là đặc sản đáng mua.',
  'Thừa Thiên Huế': 'Huế – cố đô của triều Nguyễn – là thành phố duy nhất ở Việt Nam mang trọn vẹn hồn vía của một thời đại phong kiến. Đại Nội, Lăng Tự Đức, Lăng Khải Định… mỗi công trình là một câu chuyện về sự hào hoa và bi tráng của vương triều cuối cùng. Sông Hương lững lờ trôi giữa hai bờ tre xanh, thuyền rồng trôi trên sông trong tiếng nhã nhạc cung đình là thứ chỉ Huế mới có. Cơm Huế – bữa ăn cung đình tinh tế – với hàng chục món ăn nhỏ xinh là nghệ thuật ẩm thực đáng trải nghiệm.',
  'Tiền Giang': 'Tiền Giang là cổng vào miệt vườn sông nước Nam Bộ – nơi du khách TP.HCM ùn ùn kéo về cuối tuần vì sự gần gũi và thú vị. Cồn Thới Sơn – cồn lớn nhất tứ linh cồn trên sông Tiền – cho phép đạp xe, nghe đờn ca tài tử, tát mương bắt cá và ăn cá tai tượng chiên xù cùng cơm mẻ ngay tại chỗ. Chợ nổi Cái Bè dù thu nhỏ vẫn giữ nét sông nước đặc trưng Nam Bộ. Chợ Mỹ Tho bán hủ tiếu Mỹ Tho – tô bún ngon nức tiếng cả nước.',
  'TP Hồ Chí Minh': 'Sài Gòn – "Hòn ngọc Viễn Đông" – là đô thị không bao giờ ngủ, nơi cái cổ kính và hiện đại đan xen trong từng con hẻm. Nhà thờ Đức Bà, Bưu điện Thành phố và Bảo tàng Chứng tích Chiến tranh là ba điểm không thể bỏ qua. Chợ Bến Thành về đêm rực rỡ ánh đèn, hẻm ẩm thực Lý Tự Trọng thơm phức mùi phở và bún bò. Bảo tàng Áo Dài, khu phố Bùi Viện và các quán cà phê sân thượng view đẹp là những địa chỉ mới nổi đáng khám phá.',
  'Trà Vinh': 'Trà Vinh là "Sóc Trăng thứ hai" với mật độ chùa Khmer cao nhất Việt Nam – hơn 140 ngôi chùa lớn nhỏ rải rác khắp tỉnh. Ao Bà Om – hồ nước cổ nghìn năm tuổi bao quanh bởi những gốc cây cổ thụ sừng sững – là điểm tụ họp thiêng liêng của người Khmer. Biển Ba Động bãi cát dài, sóng êm và ít đông đúc là nơi nghỉ dưỡng lý tưởng. Bún nước lèo Trà Vinh chua cay thơm đặc trưng và bánh ống Trà Vinh ngọt thơm là đặc sản nhất định phải thử.',
  'Tuyên Quang': 'Tuyên Quang bước lên bản đồ du lịch Việt Nam nhờ Lễ hội rước đèn Trung Thu lớn nhất nước – những chiếc đèn khổng lồ cao hàng chục mét diễu hành qua phố rực rỡ sắc màu, được Kỷ lục Guinness ghi nhận. Khu di tích lịch sử Tân Trào – ATK Sơn Dương là "thủ đô kháng chiến" thời kháng Pháp, nơi Chủ tịch Hồ Chí Minh đã ở và làm việc. Thác Mơ và Khu bảo tồn Na Hang – hồ sinh thái núi rừng tuyệt đẹp – đang là điểm đến hot mới nổi.',
  'Vĩnh Long': 'Vĩnh Long là điểm du lịch sinh thái sông nước êm đềm nhất vùng đồng bằng. Cù lao An Bình – hòn đảo giữa sông Cổ Chiên – ngập tràn vườn cây trái xanh tốt, có thể thuê xe đạp đi khắp đảo trong một buổi sáng. Những lò gạch gốm cổ ven sông đỏ au phản chiếu xuống mặt nước là cảnh tượng thơ mộng đặc trưng của Vĩnh Long. Chợ nổi Trà Ôn và làng hoa Mỹ Phước mỗi dịp Tết rực rỡ muôn màu không kém Đà Lạt.',
  'Vĩnh Phúc': 'Tam Đảo – "Sa Pa của miền Bắc" – mang vẻ đẹp châu Âu thu nhỏ với những dãy nhà Pháp cổ kính ẩn trong sương mù quanh năm. Bước lên thị trấn Tam Đảo là bước vào không gian se lạnh mát mẻ hoàn toàn khác biệt dù chỉ cách Hà Nội 80km. Thiền viện Trúc Lâm Tây Thiên và suối Giải Oan trong ngắt giữa rừng thông là điểm tham quan tâm linh và thiên nhiên yêu thích. Gà đồi Tam Đảo và sắn dây Bình Xuyên là đặc sản không thể bỏ lỡ.',
  'Yên Bái': 'Mù Cang Chải vào tháng 9–10 khi lúa chín vàng là một trong những cảnh quan ruộng bậc thang đẹp nhất Đông Nam Á. Những thửa ruộng xếp tầng leo lên tận đỉnh núi, đổ dài xuống thung lũng, ánh nắng chiều xiên khoai tô vàng từng bậc thang – khung hình đó đã đoạt vô số giải thưởng nhiếp ảnh quốc tế. Đèo Khau Phạ – "cổng trời" của Tây Bắc – mây vờn quanh đỉnh đèo quanh năm. Chợ phiên La Pán Tẩn mỗi sáng Chủ nhật đủ sắc thổ cẩm các dân tộc.',
};

// ─────────────────────────────────────────────
// REVIEW MODAL (đã refactor: bỏ AI + Google, thêm Gallery + Default Review)
// ─────────────────────────────────────────────
const ReviewModal = ({ item, onClose }) => {
  const isDark = useContext(ThemeContext);
  const backdropRef = useRef();
  const handleBackdrop = (e) => { if (e.target === backdropRef.current) onClose(); };

  const defaultReview = DEFAULT_REVIEWS[item.name] || item.desc;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background: isDark ? '#2a2a2a' : '#fff', borderRadius: '28px',
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 50px 100px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', height: '260px', flexShrink: 0 }}>
          <img
            src={item.img} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=800'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.05) 50%)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)', border: 'none', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div style={{ position: 'absolute', bottom: '22px', left: '28px', right: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#10b981', color: '#fff', fontWeight: '800', fontSize: '13px', padding: '4px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faStar} style={{ color: '#fde68a' }} /> {item.rating} / 5.0
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff', fontWeight: '600', fontSize: '13px', padding: '4px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faWallet} /> {item.budget}
              </span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '30px', fontWeight: '900', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '10px', color: '#34d399', fontSize: '22px' }} />
              {item.name}
            </h2>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '28px 28px 32px', backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>

          {/* ── NHẬN XÉT MẶC ĐỊNH (thay thế AI) ── */}
          <div style={{
            background: isDark ? 'linear-gradient(135deg, #0d3326, #0a2a1f)' : 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: `1.5px solid ${isDark ? '#1a5c3a' : '#a7f3d0'}`, borderRadius: '20px',
            padding: '22px 24px', marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FontAwesomeIcon icon={faQuoteLeft} style={{ color: '#fff', fontSize: '15px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: isDark ? '#34d399' : '#065f46' }}>Nhận xét về {item.name}</div>
                <div style={{ fontSize: '12px', color: '#34d399' }}>Được biên soạn tỉ mỉ bởi đội ngũ biên tập</div>
              </div>
              <StarRow rating={item.rating} size={14} />
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.82', color: isDark ? '#a7f3d0' : '#064e3b', margin: 0 }}>
              {defaultReview}
            </p>
          </div>

          {/* ── THƯ VIỆN ẢNH (thay thế Google Reviews) ── */}
          <ImageGallery item={item} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MOBILE CARD – kiểu "truyện hay" TruyenQQ
// Ảnh dọc 2:3 + tên + rating, cuộn ngang tự nhiên
// ─────────────────────────────────────────────
const MobileDestCard = ({ item, onClick }) => {
  const isDark = useContext(ThemeContext);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onClick={() => onClick && onClick(item)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        flexShrink: 0,
        width: '140px',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: 'transform 0.12s ease',
      }}
    >
      <div style={{
        borderRadius: '18px',
        overflow: 'hidden',
        background: isDark ? '#0f172a' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        boxShadow: isDark ? '0 10px 18px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '140px',
          overflow: 'hidden',
          background: isDark ? '#0f172a' : '#f1f5f9',
        }}>
          <img
            src={item.img}
            alt={item.name}
            data-fixed-h="true"
            style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=400'; }}
          />

          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#0f766e',
            borderRadius: '999px',
            padding: '4px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#ecfdf5',
            boxShadow: '0 10px 20px rgba(15,23,42,0.18)',
          }}>
            <FontAwesomeIcon icon={faStar} style={{ fontSize: '10px', color: '#a7f3d0' }} />
            {item.rating}
          </div>
        </div>

        <div style={{ padding: '8px 10px 10px', textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#111827',
            lineHeight: '1.2',
            marginBottom: '4px',
            minHeight: '28px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.name}
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#10b981',
            marginBottom: '4px',
          }}>
            {item.budget}
          </div>
          <div style={{
            fontSize: '11px',
            color: isDark ? '#cbd5e1' : '#64748b',
            lineHeight: '1.35',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '20px',
          }}>
            {item.desc}
          </div>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// COMPONENT CHÍNH
// ─────────────────────────────────────────────
const FeaturedDestinations = ({ isDark = false, onNavigate }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CARDS_VISIBLE = windowWidth <= 480 ? 1 : windowWidth <= 768 ? 2 : 4;
  const CARD_PCT = windowWidth <= 480 ? 100 : windowWidth <= 768 ? 50 : 25;
  const CARD_GAP = windowWidth <= 768 ? 16 : 32;
  const MAX_PREVIEW = 8;

  const generateFileName = (name) => {
      return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .replace(/đ/g, "d") // Chuyển chữ đ
        .replace(/[^a-z0-9]/g, "-") // Thay khoảng trắng/ký tự lạ bằng dấu gạch ngang
        .replace(/-+/g, "-").replace(/^-|-$/g, ""); // Dọn dẹp gạch ngang thừa
    };

  const rawProvinces = [
    {
      name: 'An Giang', landmark: 'Rừng tràm Trà Sư An Giang', rating: '4.6',
      desc: 'Vùng đất bình yên với Rừng tràm Trà Sư và dãy Thất Sơn hùng vĩ, mang đậm dấu ấn văn hóa miền Tây.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Bà Rịa - Vũng Tàu', landmark: 'bãi biển Vũng Tàu', rating: '4.7',
      desc: 'Thành phố biển năng động, điểm đến lý tưởng cho những chuyến nghỉ dưỡng cuối tuần thư giãn.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Bắc Giang', landmark: 'vườn vải thiều Lục Ngạn Bắc Giang', rating: '4.4',
      desc: 'Nổi tiếng với miệt vườn vải thiều Lục Ngạn và những ngôi chùa cổ kính mang bề dày lịch sử.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Bắc Kạn', landmark: 'hồ Ba Bể Bắc Kạn', rating: '4.5',
      desc: 'Hồ Ba Bể xanh biếc giữa đại ngàn nguyên sinh, bức tranh thủy mặc tuyệt đẹp của núi rừng Đông Bắc.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Bạc Liêu', landmark: 'cánh đồng điện gió Bạc Liêu', rating: '4.5',
      desc: 'Vùng đất của những giai thoại Công tử Bạc Liêu và cánh đồng điện gió đẹp như trời Tây.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Bắc Ninh', landmark: 'đình làng quan họ Bắc Ninh', rating: '4.6',
      desc: 'Cái nôi của dân ca Quan họ, quê hương của những làng nghề truyền thống và đình chùa cổ.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Bến Tre', landmark: 'vườn dừa Bến Tre miệt vườn', rating: '4.7',
      desc: 'Xứ dừa miệt vườn thanh bình, thích hợp trải nghiệm chèo xuồng ba lá và thưởng thức kẹo dừa.',
      budget: '1.2 - 2.5tr',
    },
    {
      name: 'Bình Định', landmark: 'Kỳ Co Quy Nhơn Bình Định', rating: '4.8',
      desc: 'Thành phố biển Quy Nhơn hiền hòa với Kỳ Co, Eo Gió - thiên đường Maldives thu nhỏ của Việt Nam.',
      budget: '2.5 - 4.5tr',
    },
    {
      name: 'Bình Dương', landmark: 'khu du lịch Đại Nam Bình Dương', rating: '4.3',
      desc: 'Thành phố công nghiệp phát triển, sở hữu những khu du lịch sinh thái và công viên quy mô lớn.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Bình Phước', landmark: 'Vườn quốc gia Bù Gia Mập Bình Phước', rating: '4.2',
      desc: 'Hòa mình vào thiên nhiên với Vườn quốc gia Bù Gia Mập và trảng cỏ Bù Lạch hoang sơ.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Bình Thuận', landmark: 'đồi cát Mũi Né Phan Thiết', rating: '4.8',
      desc: 'Phan Thiết vẫy gọi với đồi cát Mũi Né óng ả và bờ biển lộng gió dành cho những tâm hồn tự do.',
      budget: '2.5 - 4.5tr',
    },
    {
      name: 'Cà Mau', landmark: 'rừng đước Cà Mau mũi đất', rating: '4.6',
      desc: 'Mũi đất tận cùng Tổ quốc với rừng đước xanh bạt ngàn và hệ sinh thái ngập mặn phong phú.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Cần Thơ', landmark: 'chợ nổi Cái Răng Cần Thơ', rating: '4.8',
      desc: 'Thủ phủ miền Tây với chợ nổi Cái Răng và những vườn trái cây mênh mông trĩu quả.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Cao Bằng', landmark: 'thác Bản Giốc Cao Bằng', rating: '4.7',
      desc: 'Thác Bản Giốc hùng vĩ đổ trắng xóa và hang Pác Bó ghi dấu lịch sử cách mạng hào hùng.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Đà Nẵng', landmark: 'cầu Rồng Đà Nẵng bãi biển Mỹ Khê', rating: '4.9',
      desc: 'Thành phố đáng sống nhất Việt Nam, nơi biển xanh, núi Ngũ Hành Sơn và cầu Rồng phun lửa.',
      budget: '2.5 - 5.0tr',
    },
    {
      name: 'Đắk Lắk', landmark: 'hồ Lắk buôn làng Ê Đê Đắk Lắk', rating: '4.7',
      desc: 'Cao nguyên đại ngàn với hồ Lắk thơ mộng, buôn làng Ê Đê và lễ hội cồng chiêng vang vọng.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Đắk Nông', landmark: 'hang động núi lửa Đắk Nông', rating: '4.5',
      desc: 'Công viên địa chất toàn cầu Đắk Nông với hệ thống hang động núi lửa độc đáo bậc nhất.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Điện Biên', landmark: 'chiến trường Điện Biên Phủ lịch sử', rating: '4.6',
      desc: 'Chiến trường Điện Biên Phủ lịch sử và những bản làng dân tộc thiểu số đầy màu sắc.',
      budget: '2.5 - 4.0tr',
    },
    {
      name: 'Đồng Nai', landmark: 'Vườn quốc gia Cát Tiên Đồng Nai', rating: '4.4',
      desc: 'Vườn quốc gia Cát Tiên bảo tồn đa dạng sinh học và thác Giang Điền thơ mộng.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Đồng Tháp', landmark: 'Vườn quốc gia Tràm Chim Đồng Tháp sen hồng', rating: '4.6',
      desc: 'Tháp Mười mùa nước nổi, sen hồng ngút ngàn và Vườn quốc gia Tràm Chim chim trời rộn tiếng.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Gia Lai', landmark: 'Biển Hồ Pleiku Gia Lai', rating: '4.6',
      desc: 'Biển Hồ T\'Nưng mặt nước xanh lặng và những đồi chè bạt ngàn trên cao nguyên Pleiku.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Hà Giang', landmark: 'cao nguyên đá Đồng Văn Mã Pì Lèng Hà Giang', rating: '4.9',
      desc: 'Cao nguyên đá Đồng Văn, Mã Pì Lèng - cung đường hiểm trở nhất Đông Nam Á đầy huyền bí.',
      budget: '3.0 - 5.0tr',
    },
    {
      name: 'Hà Nam', landmark: 'chùa Tam Chúc Hà Nam', rating: '4.4',
      desc: 'Tam Chúc - quần thể chùa lớn nhất thế giới uy nghiêm bên hồ nước xanh mênh mông.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Hà Nội', landmark: 'hồ Hoàn Kiếm phố cổ Hà Nội', rating: '4.9',
      desc: 'Thủ đô nghìn năm văn hiến, hồ Hoàn Kiếm lung linh và phố cổ 36 phố phường độc đáo.',
      budget: '2.5 - 5.0tr',
    },
    {
      name: 'Hà Tĩnh', landmark: 'biển Thiên Cầm Hà Tĩnh', rating: '4.5',
      desc: 'Thiên Cầm biển xanh cát trắng và Chùa Hương Tích trên núi Hồng Lĩnh linh thiêng.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Hải Dương', landmark: 'chùa Côn Sơn Kiếp Bạc Hải Dương', rating: '4.4',
      desc: 'Bánh đậu xanh thơm phức và chùa Côn Sơn - Kiếp Bạc linh thiêng giữa lòng xứ Đông.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Hải Phòng', landmark: 'đảo Cát Bà Hải Phòng vịnh Lan Hạ', rating: '4.7',
      desc: 'Đảo Cát Bà nguyên sơ, Đồ Sơn sóng vỗ và hải sản tươi ngon bên bờ vịnh Hạ Long.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Hậu Giang', landmark: 'chợ nổi Ngã Bảy Hậu Giang', rating: '4.3',
      desc: 'Khu du lịch sinh thái Lung Ngọc Hoàng và chợ nổi Ngã Bảy tấp nập trên sông.',
      budget: '1.2 - 2.0tr',
    },
    {
      name: 'Hòa Bình', landmark: 'Mai Châu Hòa Bình thung lũng ruộng bậc thang', rating: '4.6',
      desc: 'Mai Châu thung lũng mơ màng và hồ Hòa Bình xanh ngắt bao la giữa núi rừng Tây Bắc.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Hưng Yên', landmark: 'phố Hiến Hưng Yên nhãn lồng', rating: '4.3',
      desc: 'Nhãn lồng ngọt ngào đặc sản và phố Hiến xưa - một thời đô thị sầm uất nhất Đàng Ngoài.',
      budget: '1.0 - 1.5tr',
    },
    {
      name: 'Khánh Hòa', landmark: 'vịnh Nha Trang Khánh Hòa', rating: '4.9',
      desc: 'Nha Trang biển ngọc, đảo san hô và những resort sang trọng bên vịnh biển đẹp nhất châu Á.',
      budget: '3.0 - 6.0tr',
    },
    {
      name: 'Kiên Giang', landmark: 'Phú Quốc bãi Sao Kiên Giang', rating: '4.9',
      desc: 'Phú Quốc - Đảo ngọc với bãi Sao trắng mịn và cánh rừng nguyên sinh chưa chạm tay người.',
      budget: '3.5 - 7.0tr',
    },
    {
      name: 'Kon Tum', landmark: 'nhà rông Kon Tum Tây Nguyên', rating: '4.5',
      desc: 'Núi rừng Tây Nguyên hùng vĩ với làng gỗ cổ và nhà rông truyền thống dân tộc Ba Na.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Lai Châu', landmark: 'đèo Ô Quy Hồ Lai Châu Tây Bắc', rating: '4.6',
      desc: 'Đèo Ô Quy Hồ tráng lệ mây mù bao phủ và đồi chè Tân Uyên xanh ngát mắt.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Lâm Đồng', landmark: 'Đà Lạt thành phố hoa Lâm Đồng', rating: '5.0',
      desc: 'Đà Lạt - Thành phố ngàn hoa rực rỡ, nơi trút bỏ mọi muộn phiền để hòa mình vào thanh xuân.',
      budget: '2.5 - 4.5tr',
    },
    {
      name: 'Lạng Sơn', landmark: 'động Tam Thanh Lạng Sơn', rating: '4.5',
      desc: 'Nàng Tô Thị hóa đá chờ chồng, động Tam Thanh kỳ bí và thiên đường mua sắm biên giới.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Lào Cai', landmark: 'Sapa ruộng bậc thang Fansipan Lào Cai', rating: '4.9',
      desc: 'Sapa chìm trong biển mây, nóc nhà Đông Dương Fansipan hùng vĩ chờ người chinh phục.',
      budget: '3.0 - 5.0tr',
    },
    {
      name: 'Long An', landmark: 'rừng tràm Tân Lập Long An', rating: '4.4',
      desc: 'Làng nổi Tân Lập với con đường xuyên rừng tràm đẹp như bối cảnh phim điện ảnh.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Nam Định', landmark: 'nhà thờ đổ Nam Định biển', rating: '4.5',
      desc: 'Thủ phủ của phở bò truyền thống và những nhà thờ đổ hoang sơ bên bờ biển.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Nghệ An', landmark: 'biển Cửa Lò Nghệ An', rating: '4.6',
      desc: 'Quê Bác Làng Sen yên bình, biển Cửa Lò sóng vỗ và đồi chè Thanh Chương bạt ngàn.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Ninh Bình', landmark: 'Tràng An Tam Cốc Ninh Bình', rating: '4.9',
      desc: 'Tràng An non nước hữu tình, Tam Cốc bích động đưa ta về với không gian cố đô mộc mạc.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Ninh Thuận', landmark: 'tháp Chàm vườn nho Ninh Thuận', rating: '4.7',
      desc: 'Vịnh Vĩnh Hy tuyệt mỹ, tháp Chàm trầm mặc và những vườn nho trĩu quả rực nắng.',
      budget: '2.5 - 4.0tr',
    },
    {
      name: 'Phú Thọ', landmark: 'đền Hùng Phú Thọ', rating: '4.5',
      desc: 'Về thăm đền Hùng linh thiêng cội nguồn dân tộc và khám phá đồi chè Long Cốc ảo diệu.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Phú Yên', landmark: 'Gành Đá Đĩa hoa vàng cỏ xanh Phú Yên', rating: '4.8',
      desc: 'Hoa vàng trên cỏ xanh, Gành Đá Đĩa kỳ thú và những bờ biển hoang sơ chưa vướng bụi trần.',
      budget: '2.5 - 4.5tr',
    },
    {
      name: 'Quảng Bình', landmark: 'hang Sơn Đoòng Phong Nha Quảng Bình', rating: '4.9',
      desc: 'Vương quốc hang động Phong Nha - Kẻ Bàng, Sơn Đoòng vĩ đại vươn tầm kỳ quan thế giới.',
      budget: '3.0 - 5.5tr',
    },
    {
      name: 'Quảng Nam', landmark: 'phố cổ Hội An đèn lồng Quảng Nam', rating: '4.9',
      desc: 'Hội An đèn lồng rực rỡ, Thánh địa Mỹ Sơn cổ kính ẩn chứa những bí ẩn ngàn năm.',
      budget: '2.5 - 4.5tr',
    },
    {
      name: 'Quảng Ngãi', landmark: 'đảo Lý Sơn Quảng Ngãi', rating: '4.6',
      desc: 'Đảo Lý Sơn - Vương quốc tỏi giữa biển khơi với cổng Tò Vò và màu nước xanh màu ngọc bích.',
      budget: '2.5 - 4.0tr',
    },
    {
      name: 'Quảng Ninh', landmark: 'vịnh Hạ Long Quảng Ninh', rating: '5.0',
      desc: 'Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới, thiên đường du thuyền và hải sản tươi rói.',
      budget: '3.5 - 6.0tr',
    },
    {
      name: 'Quảng Trị', landmark: 'biển Cửa Tùng Quảng Trị', rating: '4.4',
      desc: 'Thăm lại chiến trường xưa oai hùng, biển Cửa Tùng êm ả đón ánh hoàng hôn đỏ rực.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Sóc Trăng', landmark: 'chùa Dơi Sóc Trăng văn hóa Khmer', rating: '4.5',
      desc: 'Văn hóa Khmer đậm đà với chùa Dơi kỳ bí và chợ nổi Ngã Năm tấp nập thuyền bè.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Sơn La', landmark: 'Mộc Châu hoa cải trắng Sơn La', rating: '4.6',
      desc: 'Mộc Châu mùa hoa cải trắng tinh khôi, đồi chè trái tim và dòng thác Dải Yếm mượt mà.',
      budget: '2.0 - 3.5tr',
    },
    {
      name: 'Tây Ninh', landmark: 'Núi Bà Đen Tòa thánh Cao Đài Tây Ninh', rating: '4.5',
      desc: 'Hành hương Núi Bà Đen linh thiêng và Tòa thánh Cao Đài với kiến trúc độc nhất vô nhị.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Thái Bình', landmark: 'biển Thái Bình cánh đồng lúa', rating: '4.3',
      desc: 'Biển vô cực Quang Lang độc đáo và những cánh đồng lúa thẳng cánh cò bay.',
      budget: '1.0 - 2.0tr',
    },
    {
      name: 'Thái Nguyên', landmark: 'đồi chè Tân Cương Thái Nguyên', rating: '4.4',
      desc: 'Đệ nhất danh trà Tân Cương và Hồ Núi Cốc gắn liền với truyền thuyết tình yêu lãng mạn.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Thanh Hóa', landmark: 'biển Sầm Sơn Pù Luông Thanh Hóa', rating: '4.6',
      desc: 'Sầm Sơn ồn ào náo nhiệt, Pù Luông ruộng bậc thang thanh bình ẩn mình trong mây.',
      budget: '2.0 - 4.0tr',
    },
    {
      name: 'Thừa Thiên Huế', landmark: 'kinh thành Huế sông Hương', rating: '4.8',
      desc: 'Kinh thành rêu phong, nhã nhạc cung đình và tà áo dài tím bên dòng sông Hương lững lờ.',
      budget: '2.5 - 4.0tr',
    },
    {
      name: 'Tiền Giang', landmark: 'cồn Thới Sơn Tiền Giang miệt vườn', rating: '4.5',
      desc: 'Du ngoạn cồn Thới Sơn, tát mương bắt cá và thưởng thức trái cây miệt vườn tươi ngon.',
      budget: '1.2 - 2.5tr',
    },
    {
      name: 'TP Hồ Chí Minh', landmark: 'Sài Gòn nhà thờ Đức Bà Bến Nghé', rating: '4.8',
      desc: 'Sài Gòn không ngủ, hòn ngọc Viễn Đông pha trộn giữa nét đẹp hiện đại và hoài cổ.',
      budget: '2.5 - 5.5tr',
    },
    {
      name: 'Trà Vinh', landmark: 'chùa Khmer Trà Vinh ao Bà Om', rating: '4.4',
      desc: 'Rợp bóng cây xanh cổ thụ, những ngôi chùa Khmer rực rỡ và ao Bà Om đầy huyền thoại.',
      budget: '1.2 - 2.5tr',
    },
    {
      name: 'Tuyên Quang', landmark: 'lễ hội đèn lồng Tuyên Quang Tân Trào', rating: '4.5',
      desc: 'Căn cứ địa Cách Mạng Tân Trào và Lễ hội rước đèn Trung Thu khổng lồ độc nhất.',
      budget: '1.5 - 2.5tr',
    },
    {
      name: 'Vĩnh Long', landmark: 'cồn An Bình Vĩnh Long miệt vườn sông', rating: '4.4',
      desc: 'Cù lao An Bình ngập tràn cây trái, những lò gạch gốm mang sắc đỏ au ven sông cổ chiên.',
      budget: '1.2 - 2.0tr',
    },
    {
      name: 'Vĩnh Phúc', landmark: 'Tam Đảo Vĩnh Phúc sương mây', rating: '4.7',
      desc: 'Tam Đảo mờ sương, thị trấn nhỏ bé mang phong cách Châu Âu ngay sát vách Hà Nội.',
      budget: '1.5 - 3.0tr',
    },
    {
      name: 'Yên Bái', landmark: 'Mù Cang Chải ruộng bậc thang Yên Bái', rating: '4.7',
      desc: 'Mù Cang Chải với những sóng lúa bậc thang chín vàng óng ả vươn tới tận đỉnh trời.',
      budget: '2.0 - 4.0tr',
    },
  ];

  const allProvinces = rawProvinces.map(prov => ({
    ...prov,
    img: `/images_provinces/${generateFileName(prov.name)}.jpg`
  }));

  const sortedProvinces = [...allProvinces].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

  // ─────────────────────────────────────────────
  // DỮ LIỆU THEO TAB
  // ─────────────────────────────────────────────
  // Hiển thị top rated, tự xoay vòng carousel
  const filteredData = sortedProvinces.slice(0, MAX_PREVIEW);
  const maxStartIndex = Math.min(filteredData.length - CARDS_VISIBLE, MAX_PREVIEW - CARDS_VISIBLE);

  // Auto-slide mỗi 3 giây (hỗ trợ cả Desktop & Mobile)
  React.useEffect(() => {
    const timer = setInterval(() => {
      // Logic Desktop
      setStartIndex(prev => {
        const max = maxStartIndex < 0 ? 0 : maxStartIndex;
        return prev >= max ? 0 : prev + 1;
      });
      
      // Logic Mobile
      if (window.innerWidth <= 768 && mobileScrollRef.current) {
        const el = mobileScrollRef.current;
        // Nếu cuộn đến cuối, quay lại đầu. Nếu chưa, cuộn sang 1 thẻ (~150px)
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 150, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [maxStartIndex]);
  const safeStart = Math.max(0, Math.min(startIndex, maxStartIndex < 0 ? 0 : maxStartIndex));

  // ─────────────────────────────────────────────
  // LỌC DỮ LIỆU ĐÃ CHUẨN HÓA KHÔNG DẤU (Trong Modal)
  // ─────────────────────────────────────────────
  const normalizedModalSearch = normalizeForSearch(modalSearch);
  const modalFiltered = sortedProvinces.filter(p => normalizeForSearch(p.name).includes(normalizedModalSearch));
  
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) setShowAll(false); };

  const ArrowBtn = ({ dir, onClick, disabled }) => {
    const [hov, setHov] = useState(false);
    const isActive = !disabled;
    return (
      <button onClick={isActive ? onClick : undefined} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        width: isMobile ? '38px' : '56px', height: isMobile ? '38px' : '56px', borderRadius: isMobile ? '18px' : '28px', border: '1px solid rgba(255,255,255,0.36)',
        backgroundColor: isActive ? (hov ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.48)') : 'rgba(255,255,255,0.24)',
        color: isActive ? '#111827' : 'rgba(17,24,39,0.52)',
        cursor: isActive ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '13px' : '24px',
        boxShadow: isActive && hov ? '0 10px 24px rgba(0,0,0,0.18)' : '0 6px 14px rgba(0,0,0,0.08)',
        transition: '0.25s all ease', opacity: 0.95, pointerEvents: 'auto',
        transform: isActive && hov ? 'scale(1.05)' : 'scale(1)', flexShrink: 0,
      }}>
        <FontAwesomeIcon icon={dir === 'left' ? faChevronLeft : faChevronRight} />
      </button>
    );
  };

  const isMobile = windowWidth <= 768;
  const mobileScrollRef = useRef(null);

  const scrollMobile = (direction) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const offset = 150; // 1 thẻ (140px) + khoảng cách (10px)
    el.scrollBy({ left: direction === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  return (
    <ThemeContext.Provider value={isDark}>
    <section style={{ padding: isMobile ? '20px 12px 32px' : '80px 40px', maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes shimmer { 0%,100% { opacity: 0.45 } 50% { opacity: 1 } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px 20px; box-sizing: border-box; }
        .modal-box { background: ${isDark ? '#2a2a2a' : '#fff'}; border-radius: 28px; width: 100%; max-width: 1200px; max-height: calc(100vh - 48px); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.2); animation: fadeSlideIn 0.3s ease; }
        .modal-header { padding: 32px 40px 20px; flex-shrink: 0; border-bottom: 1px solid ${isDark ? '#3a3a3a' : '#f1f5f9'}; }
        .modal-body { flex: 1; overflow-y: auto; padding: 24px 40px 32px; background: ${isDark ? '#2a2a2a' : '#fff'}; }
        .modal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 900px) { .modal-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .modal-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
        .fd-search-box { width: 380px; }
        @media (max-width: 768px) {
          .fd-search-box { width: 100% !important; }
          .fd-header-h2 { font-size: 22px !important; }
          .fd-dots-row { flex-direction: column !important; gap: 12px !important; }
          .modal-header { padding: 16px 16px 12px !important; }
          .modal-body { padding: 12px 10px 16px !important; }
          .modal-box { border-radius: 20px !important; }
        }
        .see-all-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 50px; background: #f0fdf4; border: 2px solid #10b981; color: #10b981; font-weight: 800; font-size: 15px; cursor: pointer; transition: 0.25s all ease; }
        .see-all-btn:hover { background: #10b981; color: #fff; box-shadow: 0 8px 24px rgba(16,185,129,0.3); transform: translateY(-2px); }
        .dot { width: 8px; height: 8px; border-radius: 50%; transition: 0.25s all ease; cursor: pointer; border: none; }
        .mob-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* HEADER */}
      <div style={{
        marginBottom: isMobile ? '16px' : '32px',
        padding: isMobile ? '0 16px' : '0',
      }}>
        {/* Tiêu đề + mô tả giới thiệu VN */}
        <div style={{ marginBottom: '0' }}>
          <h2 className="fd-header-h2" style={{ fontSize: isMobile ? '22px' : '48px', fontWeight: '900', color: isDark ? '#e8e8e8' : '#111827', margin: '0 0 8px 0' }}>Khám phá Việt Nam</h2>
          {/* Đã xóa điều kiện {!isMobile} để hiển thị dòng mô tả ở cả Mobile/Desktop */}
          <p style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: '12px', fontSize: isMobile ? '14px' : '18px' }}>Từ miền núi cao hùng vĩ đến những bãi biển xanh ngọc bích.</p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SLIDER LAYOUT – Tách riêng Mobile và Desktop
          ══════════════════════════════════════ */}
      {isMobile ? (
        // ── MOBILE LAYOUT (Kiểu TruyenQQ) ──
        <div style={{ position: 'relative', minHeight: '260px' }}>
          <div
            ref={mobileScrollRef}
            className="mob-scroll"
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '16px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          >
            {filteredData.map((item) => (
              <div key={item.name} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <MobileDestCard item={item} onClick={setSelectedItem} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollMobile('left')}
            style={{
              position: 'absolute',
              top: '100px',
              left: '10px',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '50px',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.16)',
              color: 'rgba(17,24,39,0.82)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(18px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: 0.68,
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '18px' }} />
          </button>
          <button
            onClick={() => scrollMobile('right')}
            style={{
              position: 'absolute',
              top: '100px',
              right: '10px',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '50px',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.16)',
              color: 'rgba(17,24,39,0.82)',
              boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(18px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: 0.68,
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '18px' }} />
          </button>

          <div className="fd-dots-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
            {/* Đã bỏ các ô dots trên mobile, chỉ giữ lại nút bấm */}
            <button className="see-all-btn" onClick={() => { setShowAll(true); setModalSearch(''); }}
              style={{ fontSize: '13px', padding: '10px 18px' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Xem tất cả {allProvinces.length} tỉnh thành
            </button>
          </div>
        </div>
      ) : (
        // ── DESKTOP LAYOUT (Slider thông thường) ──
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <ArrowBtn dir="left" disabled={false} onClick={() => setStartIndex(i => i <= 0 ? (maxStartIndex < 0 ? 0 : maxStartIndex) : i - 1)} />
            </div>
            <div style={{
              flex: 1, overflow: 'hidden',
              paddingTop: '12px', marginTop: '-12px',
              paddingBottom: '16px', marginBottom: '-16px',
              borderRadius: '8px',
            }}>
              {filteredData.length > 0 ? (
                <div style={{
                  display: 'flex', gap: `${CARD_GAP}px`,
                  transform: `translateX(calc(-${safeStart} * (${CARD_PCT}% + ${CARD_GAP / CARDS_VISIBLE}px)))`,
                  transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'transform',
                }}>
                  {filteredData.slice(0, MAX_PREVIEW).map((item) => (
                    <div key={item.name} style={{ minWidth: `calc(${CARD_PCT}% - ${CARD_GAP * (CARDS_VISIBLE-1)/CARDS_VISIBLE}px)`, maxWidth: `calc(${CARD_PCT}% - ${CARD_GAP * (CARDS_VISIBLE-1)/CARDS_VISIBLE}px)`, flexShrink: 0 }}>
                      <DestinationCard item={item} compact={false} onClick={setSelectedItem} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '60px 40px', fontSize: '18px', color: '#9ca3af', textAlign: 'center' }}>
                  Không có địa điểm nào trong mục này.
                </div>
              )}
            </div>
            <div>
              <ArrowBtn dir="right" disabled={false} onClick={() => setStartIndex(i => i >= (maxStartIndex < 0 ? 0 : maxStartIndex) ? 0 : i + 1)} />
            </div>
          </div>

          {filteredData.length > 0 && (
            <div className="fd-dots-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '36px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {Array.from({ length: maxStartIndex + 1 }).map((_, i) => (
                  <button key={i} className="dot" onClick={() => setStartIndex(i)}
                    style={{ background: i === safeStart ? '#10b981' : '#d1fae5', width: i === safeStart ? '20px' : '8px', borderRadius: '4px' }} />
                ))}
              </div>
              <button className="see-all-btn" onClick={() => { setShowAll(true); setModalSearch(''); }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Xem tất cả {allProvinces.length} tỉnh thành
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL XEM TẤT CẢ */}
      {showAll && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {/* Header cố định — không scroll */}
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? '10px' : '16px' }}>
                <div>
                  <h3 style={{ fontSize: isMobile ? '18px' : '32px', fontWeight: '900', color: isDark ? '#e8e8e8' : '#111827', margin: 0 }}>Tất cả tỉnh thành</h3>
                  <p style={{ color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px', fontSize: isMobile ? '12px' : '15px' }}>{modalFiltered.length} / {allProvinces.length} địa điểm</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: isMobile ? 1 : 'unset' }}>
                  <div style={{ position: 'relative', flex: isMobile ? 1 : 'unset' }}>
                    <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '13px' }} />
                    <input type="text" placeholder="Tìm kiếm..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)}
                      style={{ padding: isMobile ? '10px 12px 10px 36px' : '12px 16px 12px 42px', borderRadius: '40px', border: `1px solid ${isDark ? '#3a3a3a' : '#e2e8f0'}`, fontSize: '15px', outline: 'none', width: isMobile ? '100%' : '240px', backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#e8e8e8' : '#111827', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={() => setShowAll(false)} style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', border: `1px solid ${isDark ? '#3a3a3a' : '#e2e8f0'}`, background: isDark ? '#333' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#9ca3af' : '#64748b', fontSize: '15px' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            </div>
            {/* Body scroll — thanh cuộn nằm trong modal */}
            <div className="modal-body">
              {modalFiltered.length > 0 ? (
                <div className="modal-grid">
                  {modalFiltered.map((item, i) => (
                    <div key={item.name} style={{ animation: `fadeSlideIn 0.3s ease ${Math.min(i, 11) * 0.03}s both` }}>
                      <DestinationCard item={item} compact onClick={(it) => { setShowAll(false); setSelectedItem(it); }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '17px' }}>Không tìm thấy &ldquo;{modalSearch}&rdquo;</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {selectedItem && <ReviewModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
    </ThemeContext.Provider>
  );
};

export default FeaturedDestinations;