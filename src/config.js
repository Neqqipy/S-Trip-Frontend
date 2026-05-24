// src/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Nguồn gốc BASE_URL duy nhất cho toàn bộ app (APIs + OAuth).
//
// Dev (npm start):
//   Tạo file .env.local ở gốc project:
//     REACT_APP_BASE_URL=http://localhost:5000
//
// Production (Vercel / Netlify / bất kỳ host nào):
//   Thêm biến môi trường trong dashboard của host:
//     REACT_APP_BASE_URL=https://your-backend.com
//   Build lại app — biến này được nhúng tĩnh lúc build.
//
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = process.env.REACT_APP_BASE_URL || '';
