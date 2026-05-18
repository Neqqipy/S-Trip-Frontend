// exportPdf.js — Export lịch trình S-Trip thành PDF
// Dùng: html2canvas + jsPDF (CDN hoặc npm)
// npm install html2canvas jspdf

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const _pad = (n) => String(n).padStart(2, '0');
const _dateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}${_pad(d.getMonth() + 1)}${_pad(d.getDate())}`;
};

// Chụp 1 DOM element thành canvas, trả về { canvas, width, height }
const _captureEl = async (el, scale = 2) => {
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,          // cho phép ảnh cross-origin (Google proxy)
    allowTaint: false,
    backgroundColor: null,  // giữ trong suốt nếu có
    logging: false,
  });
  return canvas;
};

// ─────────────────────────────────────────────────────────────
// exportTripPdf
// Tham số:
//   scheduleRef   — React ref trỏ đến <div> bọc toàn bộ AiSchedule
//   initialData   — { location, days, startDate, ... }
//   options       — { filename, quality }
// ─────────────────────────────────────────────────────────────
export const exportTripPdf = async (scheduleRef, initialData = {}, options = {}) => {
  const el = scheduleRef?.current;
  if (!el) throw new Error('scheduleRef.current không tồn tại');

  const loc      = initialData.location || 'S-Trip';
  const filename = options.filename
    || `s-trip-${loc.toLowerCase().replace(/\s+/g, '-')}-${_dateStr()}.pdf`;
  const quality  = options.quality ?? 0.92;       // JPEG quality 0–1

  // A4 landscape (mm)
  const PAGE_W = 297;
  const PAGE_H = 210;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Trang 1: Tiêu đề ─────────────────────────────────────
  pdf.setFillColor(16, 185, 129);           // #10b981
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(36);
  pdf.text(`Ha trinh tai ${loc}`, PAGE_W / 2, PAGE_H / 2 - 18, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  const days = parseInt(String(initialData.days || '3').split(' ')[0]);
  pdf.text(`${days} ngay ${days - 1} dem • Xuat tu S-Trip App`, PAGE_W / 2, PAGE_H / 2 + 4, { align: 'center' });

  if (initialData.startDate) {
    pdf.setFontSize(13);
    pdf.text(`Khoi hanh: ${initialData.startDate}`, PAGE_W / 2, PAGE_H / 2 + 18, { align: 'center' });
  }

  // Footer trang 1
  pdf.setFontSize(10);
  pdf.setTextColor(209, 250, 229);
  pdf.text('S-Trip • AI Travel Planner', PAGE_W / 2, PAGE_H - 10, { align: 'center' });

  // ── Trang 2+: Chụp toàn bộ schedule ─────────────────────
  // Tạm thời force nền trắng để html2canvas hoạt động tốt hơn
  const origBg = el.style.background;
  el.style.background = '#ffffff';

  let canvas;
  try {
    canvas = await _captureEl(el, 2);
  } finally {
    el.style.background = origBg;
  }

  // Chia canvas lớn thành nhiều trang A4
  const imgW   = canvas.width;
  const imgH   = canvas.height;

  // Tỉ lệ: chiều rộng canvas → chiều rộng trang PDF (có margin 8mm mỗi bên)
  const MARGIN  = 8;
  const pdfContentW = PAGE_W - MARGIN * 2;                    // mm
  const scale       = pdfContentW / imgW;                      // mm/px (canvas px)
  const totalH_mm   = imgH * scale;                            // tổng chiều cao quy ra mm
  const pageContent = PAGE_H - MARGIN * 2;                    // mm nội dung mỗi trang

  let yOffset = 0;   // đã xử lý bao nhiêu mm

  while (yOffset < totalH_mm) {
    pdf.addPage('a4', 'landscape');

    // Cắt một "slice" của canvas tương ứng với 1 trang
    const sliceH_mm  = Math.min(pageContent, totalH_mm - yOffset);
    const sliceH_px  = Math.round(sliceH_mm / scale);   // px trong canvas
    const sliceY_px  = Math.round(yOffset / scale);

    // Tạo canvas phụ cho slice
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width  = imgW;
    sliceCanvas.height = sliceH_px;
    const ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, -sliceY_px);

    const imgData = sliceCanvas.toDataURL('image/jpeg', quality);
    pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, pdfContentW, sliceH_mm);

    // Số trang ở góc phải
    const pageNum = pdf.internal.getNumberOfPages();
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(`Trang ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 4, { align: 'right' });
    pdf.setTextColor(0);

    yOffset += sliceH_mm;
  }

  pdf.save(filename);
  return filename;
};

// ─────────────────────────────────────────────────────────────
// PdfButton — nút xuất PDF tích hợp sẵn, dùng cùng kiểu ICalButton
// Props:
//   scheduleRef  — React ref
//   initialData  — object (location, days, startDate)
//   isDark       — bool
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';

export const PdfButton = ({ scheduleRef, initialData, isDark }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleClick = async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      await exportTripPdf(scheduleRef, initialData);
      setStatus('success');
    } catch (err) {
      console.error('[PdfButton]', err);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const cfgMap = {
    idle:    { label: 'Xuất PDF',        bg: '#7c3aed', shadow: '0 12px 30px rgba(124,58,237,0.35)', emoji: '📄' },
    loading: { label: 'Đang xuất...',    bg: '#6d28d9', shadow: 'none',                              emoji: '⏳' },
    success: { label: 'Đã tải xuống!',  bg: '#059669', shadow: 'none',                              emoji: '✅' },
    error:   { label: 'Có lỗi xảy ra',  bg: '#dc2626', shadow: 'none',                              emoji: '❌' },
  };
  const cfg = cfgMap[status];

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      title="Xuất lịch trình ra file PDF"
      style={{
        backgroundColor: cfg.bg,
        color: 'white',
        padding: '22px 50px',
        borderRadius: '99px',
        border: 'none',
        fontWeight: '800',
        fontSize: '22px',
        cursor: status === 'loading' ? 'wait' : 'pointer',
        boxShadow: cfg.shadow,
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        opacity: status === 'loading' ? 0.8 : 1,
      }}
    >
      {cfg.emoji} {cfg.label}
    </button>
  );
};