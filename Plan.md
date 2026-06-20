# Kế Hoạch Triển Khai: Tự Động Quét và Lưu Trữ Giá Vật Phẩm Ngoại Tuyến

Kế hoạch này giải quyết yêu cầu xây dựng cơ chế quét ngầm tự động 4,803 vật phẩm (mỗi phút quét 50 vật phẩm), lưu trữ ngoại tuyến vào các tệp JSON riêng biệt theo máy chủ, hỗ trợ ghi nhớ tiến trình (checkpoint) khi khởi động lại, và cung cấp giá ngoại tuyến trực tiếp cho Frontend.

---

## 1. Thiết Kế Cơ Chế Quét (Scanning Mechanism)

### 1.1. Cấu trúc tệp dữ liệu lưu trữ
* **Vị trí lưu giá cả:** `backend/data/prices_east.json`, `backend/data/prices_west.json`, `backend/data/prices_europe.json`.
* **Cấu trúc dữ liệu trong file:**
  ```json
  {
    "T4_2H_TOOL_PICK": {
      "Black Market": {
        "item_id": "T4_2H_TOOL_PICK",
        "city": "Black Market",
        "sell_price_min": 1050,
        "buy_price_max": 950,
        "updatedAt": 1787123456789
      },
      "Caerleon": {
        "item_id": "T4_2H_TOOL_PICK",
        "city": "Caerleon",
        "sell_price_min": 1100,
        "buy_price_max": 1000,
        "updatedAt": 1787123456789
      }
    }
  }
  ```

### 1.2. Lưu trữ tiến trình quét (Scanner State)
* **Vị trí lưu trạng thái:** `backend/data/scanner_state.json`.
* **Cấu trúc file trạng thái:**
  ```json
  {
    "currentServer": "east",
    "currentIndex": 0,
    "lastRunTimestamp": 1787123456789
  }
  ```

### 1.3. Cơ chế hoạt động ngầm (Background Loop)
1. Khi khởi chạy server backend (`node backend/app.js`), một vòng lặp `setInterval` chu kỳ **60 giây (1 phút)** sẽ được kích hoạt ngầm.
2. Mỗi chu kỳ, tiến trình quét thực hiện các bước sau:
   * **Bước 1:** Đọc danh sách tất cả mã vật phẩm duy nhất từ `frontend/src/data/recipes.json`.
   * **Bước 2:** Đọc trạng thái quét hiện tại từ `backend/data/scanner_state.json`. Nếu file chưa tồn tại, mặc định bắt đầu từ `currentIndex = 0` và `currentServer = "east"`.
   * **Bước 3:** Cắt ra một danh sách **50 vật phẩm** bắt đầu từ `currentIndex`.
     * Nếu danh sách bị tràn (currentIndex + 50 vượt quá tổng số vật phẩm), lấy phần còn lại và nối tiếp từ đầu danh sách (vòng lặp vô hạn).
   * **Bước 4:** Gửi **1 request duy nhất** lên API Albion Online Data tương ứng với `currentServer`, chứa 50 vật phẩm này và danh sách thành phố: `Caerleon,Martlock,Bridgewatch,Lymhurst,Fort Sterling,Thetford,Black Market`.
   * **Bước 5:** Lấy kết quả, lọc giá bằng logic `extractValidPrice()` để loại bỏ giá rác (`= 0`), sau đó lưu đè/cập nhật vào file giá tương ứng (ví dụ: `backend/data/prices_east.json`).
   * **Bước 6:** Lưu chỉ số `currentIndex` mới (`currentIndex + 50`) và cập nhật thời gian quét vào `backend/data/scanner_state.json`.

---

## 2. Các Thay Đổi Chi Tiết Trong Code

### 2.1. [MODIFY] [app.js](file:///d:/Documents/CODE/Albion_Online_Crafting_Profit_Calculator/backend/app.js)
* **Bổ sung thư viện** `fs` và `path` để đọc ghi file dữ liệu.
* **Tích hợp module Scanner ngầm:**
  * Hàm `loadUniqueItemIds()`: Đọc `recipes.json` ở frontend và trích xuất các ID duy nhất.
  * Hàm `runScannerTick()`: Thực thi logic quét 50 vật phẩm, gọi API Albion, xử lý dữ liệu và lưu vào `backend/data/prices_{server}.json` và `backend/data/scanner_state.json`.
  * Khởi chạy vòng lặp ngầm thông qua `setInterval(runScannerTick, 60000)`.
* **Thay đổi Route `GET /api/prices`:**
  * Thay vì gọi API Albion Online trực tiếp như trước, API này giờ đây sẽ đọc trực tiếp từ tệp lưu trữ ngoại tuyến tương ứng `backend/data/prices_{server}.json`.
  * Nếu vật phẩm hoặc địa điểm chưa được quét, trả về giá trị mặc định là `0` (theo đúng lựa chọn offline-first).

---

## 3. Kế Hoạch Xác Minh (Verification Plan)

### 3.1. Xác minh tự động & thủ công
1. **Kiểm tra khởi chạy:** 
   * Chạy backend `node backend/app.js` và xác nhận log hiển thị tiến trình quét ngầm bắt đầu khởi động.
2. **Kiểm tra tệp trạng thái và giá cả:**
   * Sau 1 phút, kiểm tra xem thư mục `backend/data/` có tự động tạo ra file `scanner_state.json` và `prices_east.json` hay không.
   * Xác nhận `scanner_state.json` cập nhật `currentIndex` lên 50.
3. **Kiểm tra khả năng khôi phục khi ngắt quãng (Fail-safe):**
   * Tắt tiến trình backend giữa chừng.
   * Xem giá trị `currentIndex` trong `scanner_state.json` (ví dụ: đang là 150).
   * Khởi động lại backend, xác nhận log hiển thị quét tiếp tục từ vật phẩm thứ 150.
4. **Kiểm tra tích hợp API:**
   * Gọi thử `GET http://localhost:3001/api/prices?items=T4_2H_TOOL_PICK&locations=Black Market&server=east` để đảm bảo API trả về giá lưu trong file JSON.
