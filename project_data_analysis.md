# Báo Cáo Phân Tích Dữ Liệu Albion Online Crafting Profit Calculator

Báo cáo này phân tích chi tiết dữ liệu hiện có trong dự án, được trích xuất tự động từ file [recipes.json](file:///d:/Documents/CODE/Albion_Online_Crafting_Profit_Calculator/frontend/src/data/recipes.json).

---

## 1. Tổng Quan Dữ Liệu
* **Tổng số vật phẩm chế tạo (Thành phẩm):** `4,803` vật phẩm (đây là các món đồ có công thức chế tác cụ thể trong file `recipes.json`).
* **Tổng số nguyên liệu phục vụ chế tạo:** `546` loại nguyên liệu độc bản (được thu thập từ trường `materials` của các công thức).
  * Trong đó, có **`375` loại nguyên liệu** cũng chính là vật phẩm chế tạo được (đã nằm trong danh sách 4,803 thành phẩm ở trên, ví dụ: ván gỗ tinh chế, thỏi kim loại tinh chế...).
  * Còn lại **`171` loại nguyên liệu** là nguyên liệu thuần túy không thể chế chế tạo (ví dụ: quặng thô, gỗ thô, da sống, hoặc token phó bản...).
* **Tổng số vật phẩm cần quét giá thực tế (Thành phẩm + Nguyên liệu thuần túy):** **`4,974` vật phẩm** (`4,803 + 171`).
* **Nguồn dữ liệu:** Được cào tự động trực tiếp từ file dữ liệu gốc của game (`items.xml`) thông qua script `backend/generate_recipes.js`.

---

## 2. Số Lượng Vật Phẩm Theo Cấp Độ (Tier & Enchantment)

Trong Albion Online, mỗi vật phẩm được phân cấp theo:
* **Tier (Cấp độ cơ bản):** Từ Tier 1 đến Tier 8.
* **Enchantment (Nấc cường hóa):** Từ `.0` đến `.4` (còn gọi là nấc .1, .2, .3, .4).

### 2.1. Phân bố theo Tier (Cấp độ)
| Cấp độ | Số lượng vật phẩm chế tạo |
| :--- | :---: |
| **Tier 1** | 40 |
| **Tier 2** | 21 |
| **Tier 3** | 54 |
| **Tier 4** | 1,113 |
| **Tier 5** | 897 |
| **Tier 6** | 900 |
| **Tier 7** | 890 |
| **Tier 8** | 888 |
| **Tổng** | **4,803** |

### 2.2. Phân bố theo Enchantment Level (Nấc cường hóa)
| Cường hóa | Số lượng vật phẩm |
| :--- | :---: |
| **Enchantment .0** (Cơ bản) | 2,136 |
| **Enchantment .1** | 690 |
| **Enchantment .2** | 676 |
| **Enchantment .3** | 676 |
| **Enchantment .4** | 625 |

### 2.3. Chi tiết tổ hợp Tier & Enchantment (Cấp độ.Nấc)
Dưới đây là số lượng vật phẩm chế tạo tương ứng với từng cấp độ cụ thể:

* **Tier 1 & Tier 2 & Tier 3:**
  * `T1.0`: 34 | `T1.1`: 2 | `T1.2`: 2 | `T1.3`: 2
  * `T2.0`: 15 | `T2.1`: 2 | `T2.2`: 2 | `T2.3`: 2
  * `T3.0`: 27 | `T3.1`: 9 | `T3.2`: 9 | `T3.3`: 9

* **Tier 4:**
  * `T4.0`: 586 | `T4.1`: 136 | `T4.2`: 133 | `T4.3`: 133 | `T4.4`: 125
* **Tier 5:**
  * `T5.0`: 367 | `T5.1`: 137 | `T5.2`: 134 | `T5.3`: 134 | `T5.4`: 125
* **Tier 6:**
  * `T6.0`: 373 | `T6.1`: 136 | `T6.2`: 133 | `T6.3`: 133 | `T6.4`: 125
* **Tier 7:**
  * `T7.0`: 366 | `T7.1`: 135 | `T7.2`: 132 | `T7.3`: 132 | `T7.4`: 125
* **Tier 8:**
  * `T8.0`: 368 | `T8.1`: 133 | `T8.2`: 131 | `T8.3`: 131 | `T8.4`: 125

---

## 3. Thống Kê Nguyên Liệu Chế Tạo (Materials)
Nguyên liệu là các tài nguyên cần thiết để chế tạo ra các trang bị/vật phẩm trên.

* **Tổng số nguyên liệu chế tạo độc bản (Unique Material IDs):** `546` loại nguyên liệu.
* **Phân bố nguyên liệu theo Tier của chúng:**
  * **Tier 1:** 14 loại
  * **Tier 2:** 12 loại
  * **Tier 3:** 25 loại
  * **Tier 4:** 87 loại
  * **Tier 5:** 100 loại
  * **Tier 6:** 92 loại
  * **Tier 7:** 97 loại
  * **Tier 8:** 101 loại
  * **Đặc biệt / Khác (Rác phó bản, Token Avalon...):** 18 loại

---

## 4. Phân Bố Theo Nhóm Vật Phẩm (Category)
Số lượng vật phẩm chế tạo được phân chia theo danh mục chức năng trong game:

| Danh mục (Category) | Số lượng vật phẩm | Mô tả ngắn |
| :--- | :---: | :--- |
| **armor** | 900 | Các trang bị phòng thủ (áo, mũ, giày vải/da/sắt) |
| **artefacts** | 610 | Các mảnh cổ vật dùng để chế đồ artifact |
| **melee** | 600 | Các loại vũ khí cận chiến (kiếm, rìu, chùy, giáo...) |
| **gatherergear** | 600 | Trang bị chuyên dụng cho dân thu hoạch tài nguyên |
| **magic** | 450 | Vũ khí phép thuật (gậy phép, sách phép...) |
| **consumables** | 397 | Đồ tiêu thụ nhanh (thuốc lắc, thức ăn, bánh mì...) |
| **accessories** | 359 | Trang bị phụ trợ (túi xách, áo choàng các thành phố) |
| **token** | 231 | Các loại huy hiệu/token |
| **resources** | 230 | Các tài nguyên đã qua tinh chế (gỗ tấm, kim loại thỏi...) |
| **ranged** | 151 | Vũ khí tầm xa (cung, nỏ) |
| **offhand** | 76 | Vật phẩm cầm tay phụ (khiên, sừng, sách...) |
| **tools** | 70 | Các loại công cụ thu hoạch (rìu, cuốc, dao lột da...) |
| **mounts** | 52 | Thú cưỡi (ngựa, bò, sói...) |
| **furniture** | 33 | Nội thất, rương hòm, đồ trang trí đảo cá nhân |
| **materials** | 25 | Nguyên liệu thô thô hoặc phụ gia chế tạo |
| **products** | 18 | Các sản phẩm nông nghiệp chế biến |
| **trophies** | 1 | Cúp danh vọng |
