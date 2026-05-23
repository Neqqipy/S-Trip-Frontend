# S-Trip: Nền Tảng Lập Kế Hoạch Du Lịch Thông Minh

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![Status](https://img.shields.io/badge/Status-Active%20Development-blue.svg)]()

> Khám phá vẻ đẹp Việt Nam thông qua một nền tảng du lịch thông minh, tích hợp AI và công nghệ hiện đại.

## 🌟 Tính Năng Chính

- **🤖 Trợ Lý AI Thông Minh** - Gợi ý lịch trình du lịch được cá nhân hóa bằng ChatAI
- **🗺️ Bản Đồ Tương Tác** - Khám phá điểm đến trên bản đồ trực quan
- **📅 Lập Kế Hoạch Linh Hoạt** - Xây dựng và quản lý lịch trình du lịch chi tiết
- **📑 Xuất PDF** - Lưu trữ và chia sẻ lịch trình dưới dạng tài liệu PDF
- **🌍 Định Vị Địa Điểm** - Tìm kiếm và định vị các địa điểm du lịch nhanh chóng
- **🎨 Giao Diện Hiện Đại** - Thiết kế responsive với Tailwind CSS
- **💾 Lưu Trữ Cloud** - Sử dụng Supabase cho đồng bộ dữ liệu

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v16 hoặc cao hơn
- **npm**: v7 hoặc cao hơn
- **Backend API**: Chạy trên `http://localhost:5000`
- **Supabase**: Tài khoản Supabase để quản lý database

## 🚀 Cài Đặt & Chạy

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/s-trip.git
cd s-trip
```

### 2. Cài Đặt Dependencies
```bash
npm install
npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons
```

### 3. Cấu Hình Biến Môi Trường

Tạo file `.env.local` trong thư mục gốc:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Chạy Development Server
```bash
npm start
```

Ứng dụng sẽ mở tại [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Npm

| Script | Mô Tả |
|--------|-------|
| `npm start` | Chạy development server |
| `npm build` | Build ứng dụng cho production |
| `npm test` | Chạy bộ test |
| `npm eject` | Eject từ Create React App (không thể hoàn tác) |

## 🏗️ Cấu Trúc Dự Án

```
src/
├── components/           # React Components
│   ├── Navbar.js         # Navigation bar
│   ├── Hero.js           # Banner chính
│   ├── Dashboard.js      # Trang chủ chính
│   ├── FeaturedDestinations.js  # Điểm đến nổi bật
│   ├── AiSchedule.js     # Lập kế hoạch bằng AI
│   ├── ChatAI.js         # Chat bot AI
│   ├── MapBubble.js      # Bản đồ tương tác
│   ├── Exportpdf.js      # Xuất PDF
│   ├── Toast.js          # Notification toast
│   ├── SkeletonLoader.js # Loading skeleton
│   ├── Footer.js         # Footer
│   └── NotFound.js       # Trang 404
├── services/             # API & Utilities
│   ├── api.js            # API calls
│   └── geocodeUtils.js   # Geocoding utilities
├── App.js                # Main App component
├── index.js              # Entry point
└── postcss.config.js     # PostCSS config
```

## 🔧 Công Nghệ Sử Dụng

### Frontend
- **React** (v19.2) - UI library
- **React Router DOM** (v7.15) - Routing
- **Tailwind CSS** (v4.2) - Styling
- **Date-fns** (v4.3) - Date manipulation
- **React DatePicker** (v9.1) - Date picking

### Backend Integration
- **Supabase** (v2.106) - Database & Auth
- **Axios/Fetch** - API requests

### Utilities
- **html2canvas** (v1.4) - HTML to image
- **jsPDF** (v4.2) - PDF generation
- **FontAwesome** (v7.2) - Icons

### Testing & Quality
- **React Testing Library** - Component testing
- **Jest** - Test runner
- **ESLint** - Code linting

## 🌐 API Integration

Ứng dụng sử dụng proxy tới backend API:
```
Proxy: http://127.0.0.1:5000
```

Đảm bảo backend server đang chạy trước khi khởi động ứng dụng frontend.

## 🔐 Bảo Mật

- Biến môi Supabase nên được lưu trong `.env.local` (không commit)
- Sử dụng HTTPS trong production
- Validate input ở client và server
- Sử dụng Supabase RLS (Row Level Security) cho database

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Commit Conventions

Tuân theo [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Thay đổi styling
- `refactor:` - Refactor code
- `test:` - Thêm/cập nhật test

## 🐛 Báo Cáo Lỗi

Nếu bạn phát hiện lỗi, vui lòng:
1. Kiểm tra issue đã tồn tại chưa
2. Cung cấp mô tả chi tiết và bước tái hiện
3. Nêu phiên bản browser và OS
4. Thêm screenshot nếu có liên quan

## 📄 License

Dự án này được cấp phép dưới giấy phép MIT. Xem [LICENSE](LICENSE) để biết chi tiết.

## 👨‍💻 Tác Giả

**S-Travel Team**
- Repository: [GitHub](https://github.com/your-repo/s-trip)
- Email: contact@s-trip.com

## 🙏 Lời Cảm Ơn

Cảm ơn tất cả những người đóng góp và người dùng của S-Trip!

---

<div align="center">
  
**[Trang Web](#) • [Issues](https://github.com/your-repo/s-trip/issues) • [Discussions](https://github.com/your-repo/s-trip/discussions)**

Được phát triển với ❤️ tại Việt Nam
</div>
