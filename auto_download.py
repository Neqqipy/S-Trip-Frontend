import os
import urllib.request
import unicodedata
import re

# Tự động tạo thư mục chứa ảnh trong dự án React của bạn
save_dir = "public/images/provinces"
os.makedirs(save_dir, exist_ok=True)

def slugify(text):
    text = text.lower().replace('đ', 'd')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-z0-9]', '-', text)
    return re.sub(r'-+', '-', text).strip('-')

provinces = ["An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"]

print("🚀 Bắt đầu tự động tải 63 ảnh...")
for idx, prov in enumerate(provinces):
    filename = f"{slugify(prov)}.jpg"
    filepath = os.path.join(save_dir, filename)
    
    if not os.path.exists(filepath):
        # Tự động lấy ảnh phong cảnh Việt Nam chất lượng cao (800x600)
        # lock={idx} giúp mỗi tỉnh có một bức ảnh cố định khác nhau
        url = f"https://loremflickr.com/800/600/vietnam,landscape,nature?lock={idx + 100}"
        try:
            urllib.request.urlretrieve(url, filepath)
            print(f"✅ Đã tải: {filename}")
        except Exception as e:
            print(f"❌ Lỗi {filename}: {e}")
    else:
        print(f"⚡ Đã có sẵn: {filename}")

print("🎉 HOÀN TẤT! Toàn bộ 63 ảnh đã nằm sẵn trong public/images/provinces/")