# Albion Online Crafting Profit Calculator - Working Context

## 1. Mục Tiêu Dự Án
Ứng dụng web giúp tính toán lợi nhuận chế tạo (Crafting Profit) trong tựa game Albion Online một cách tự động, lấy giá theo thời gian thực (Real-time Prices) và hỗ trợ đa ngôn ngữ/cụm máy chủ.

## 2. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** React, Vite, TailwindCSS.
- **State Management:** Zustand (quản lý cài đặt, dữ liệu chợ, giỏ hàng).
- **Backend/Scripts:** Node.js, Express, Axios, Fast-XML-Parser (Dùng để cache API và cào dữ liệu game gốc).
- **Data Source API:** `albion-online-data.com`.

## 3. Các Tính Năng Cốt Lõi Đã Hoàn Thành

### Phase 1: Hệ Thống Xử Lý Giá Thông Minh & API Backend
- **Thuật toán `extractValidPrice`:** Khắc phục triệt để lỗi Albion API thỉnh thoảng trả về giá bằng `0`. Logic ưu tiên lấy giá của `Quality 1 (Normal)` và nếu không có sẽ tự động fallback sang các Quality khác có giá trị > 0. (Áp dụng cho cả Frontend và Backend).
- **Tối ưu Backend API:** Chạy độc lập bằng Node.js tại `localhost:3001` (`backend/app.js`), sở hữu in-memory cache giúp không bị Rate-limit, tự động timeout/retry tối đa 3 lần.
- **Đa cụm máy chủ:** Tích hợp tuỳ chọn đổi máy chủ linh hoạt (Europe, Americas/West, Asia/East) tại `SettingsSidebar`.

### Phase 2: Tự Động Hoá Hoàn Toàn 100% Cấu Trúc Dữ Liệu Game
- Đã gỡ bỏ toàn bộ mảng dữ liệu đồ đạc gõ tay (hardcode) trong file `constants.js` ngày xưa.
- **Script Cào Dữ Liệu (`backend/generate_recipes.js`):** Script tải trực tiếp file `items.xml` (gần 10MB) từ mã nguồn gốc của game (`ao-bin-dumps`), dùng `fast-xml-parser` để bóc tách thẻ `<craftingrequirements>`.
- **Thành quả:** Đã tự động chiết xuất ra **hơn 2.600 công thức chế đồ** (Vũ khí, Giáp, Công cụ, Thuốc, Thức ăn...) lưu vào `src/data/recipes.json`.
- Giao diện `DestinyBoard` hiện tại tự động sinh cấu trúc danh mục và cây nhánh thông minh nhờ hàm render linh hoạt trong `ItemService.js`. Mọi thứ giờ đây hoàn toàn "động" (Dynamic).

> **💡 Lưu ý quan trọng:** Bất cứ khi nào game Albion Online cập nhật phiên bản mới (ra thêm vũ khí, áo giáp mới), bạn KHÔNG CẦN phải sửa code. Chỉ cần mở Terminal và chạy lệnh:
> ```bash
> node backend/generate_recipes.js
> ```
> Hệ thống sẽ tự động lên mạng kéo bản cập nhật data mới nhất về và thêm ngay vào Tool của bạn!

## 4. Cấu Trúc Thư Mục Quan Trọng Hiện Tại
- `backend/`
  - `app.js`: Backend server Node.js chạy phụ để cung cấp Cache API.
  - `generate_recipes.js`: Script Node.js thần thánh tự động kéo file XML của game về tạo file `recipes.json` và `localizedNames.json`.
- `frontend/src/`
  - `data/`
    - `recipes.json`: File cơ sở dữ liệu sinh tự động, chứa mọi công thức craft.
    - `localizedNames.json`: Từ điển dịch tên Item sang Tiếng Anh chuẩn (cào từ `localization.xml` gốc).
    - `itemMapping.js`: Logic convert mã Tên Item cũ (Sẽ dần bị thay thế bởi `localizedNames`).
  - `services/`
    - `apiService.js`: Chuyên trách gọi Axios lấy raw data (đã nối sang backend).
    - `priceService.js`: Chứa hàm `extractValidPrice` xử lý logic lọc giá rác.
    - `itemService.js`: Đọc file `recipes.json` và `localizedNames.json` để phân bổ nhánh giao diện.
    - `craftingService.js`: Core tính toán lợi nhuận.

## 5. Những Việc Tiếp Theo (Roadmap)
*   **Gắn Frontend với Backend riêng (Hoàn Thành):** Đã kết nối Frontend sang `http://localhost:3001/api/prices`.
*   **Tối ưu Localized Names (Hoàn Thành):** Đã cào thành công `localization.xml` để lấy tên chuẩn Tiếng Anh (EN-US) cho hàng ngàn Items.
