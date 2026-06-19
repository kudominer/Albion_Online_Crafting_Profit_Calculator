# Albion Online Crafting Profit Calculator

## Mô tả Tool
Đây là công cụ giúp tính toán lợi nhuận chế tạo (crafting profit) trong game Albion Online. 
Được xây dựng bằng **React**, **Vite**, và **Tailwind CSS**, ứng dụng cung cấp giao diện trực quan cho phép người dùng tính toán chi phí nguyên vật liệu, thuế, trả về tài nguyên, và dự tính được lợi nhuận cuối cùng khi bán trang bị.

## Cách chạy Tool

### Yêu cầu trước khi chạy
- Máy tính của bạn cần cài đặt sẵn [Node.js](https://nodejs.org/).

### Các bước cài đặt và khởi động
1. **Mở terminal** (như Command Prompt, PowerShell, hoặc terminal tích hợp trong VS Code) tại thư mục chứa dự án:
   `c:\Users\User\Documents\CODE\Albion_Online_Crafting_Profit_Calculator`

2. **Cài đặt thư viện (dependencies)**:
   Gõ lệnh sau vào terminal và nhấn Enter:
   ```bash
   npm install
   ```

3. **Chạy ứng dụng (Môi trường phát triển)**:
   Gõ lệnh sau vào terminal:
   ```bash
   npm run dev
   ```

4. **Sử dụng Tool**:
   Sau khi lệnh chạy thành công, terminal sẽ cung cấp cho bạn một đường link (thường là `http://localhost:5173`). Bạn chỉ cần copy đường link này và dán vào trình duyệt web (Chrome, Edge, Firefox,...) để bắt đầu sử dụng công cụ.

### 🔄 Cập nhật Dữ liệu (Khi game ra phiên bản mới)
Ứng dụng tự động kéo 100% công thức ghép đồ từ file gốc của Albion. Khi game có update thêm đồ mới, bạn chỉ cần chạy lệnh sau để làm mới dữ liệu (Không cần sửa code):
```bash
node backend/generate_recipes.js
```

### Các lệnh hữu ích khác
- `npm run build`: Đóng gói ứng dụng để chuẩn bị đưa lên môi trường thật (Production).
- `npm run preview`: Xem trước giao diện của bản build.
- `npm run lint`: Chạy công cụ kiểm tra lỗi code (ESLint).

---
**Author:** [kudominer](https://github.com/kudominer)
