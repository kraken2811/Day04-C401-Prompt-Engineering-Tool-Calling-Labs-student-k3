# Module 1 — Đỗ Thanh Tùng

| | |
|---|---|
| Họ và tên | Đỗ Thanh Tùng |
| Mã học viên | 2A202601205 |
| Vai trò | Nền tảng dự án & UI primitive |

Scaffold Vite + Tailwind, theme cam đỏ/đen, router và auth wrapper, các primitive kiểu shadcn/ui mà mọi thẻ khác dùng lại.

## File phụ trách

- `.gitignore`
- `.env.example`
- `index.html`
- `package.json`
- `package-lock.json`
- `postcss.config.js`
- `tailwind.config.js`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/lib/utils.js`
- `src/components/ui/button.jsx`
- `src/components/ui/card.jsx`
- `src/components/ui/input.jsx`
- `src/components/ui/slider.jsx`

## Phụ thuộc

Không phụ thuộc module nào để build. App.jsx nối vào Home (module 2) và groqClient (module 3).

## Merge

Thư mục này sắp xếp y hệt cấu trúc dự án chính. Khi merge, copy toàn bộ nội dung
của nó vào thư mục gốc `travel-planner/`. Không file nào trùng với module khác
nên hợp nhất 6 module sẽ ra đúng dự án hoàn chỉnh, không có conflict.


# Module 5 — Nguyễn Thành Long

| | |
|---|---|
| Họ và tên | Nguyễn Thành Long |
| Mã học viên | 2A202601443 |
| Vai trò | Dữ liệu POI thật & bản đồ |

Lấy khách sạn/nhà hàng có thật từ OpenStreetMap qua Photon và Overpass, modal bản đồ Google Maps, hai thẻ hiển thị POI.

## File phụ trách

- `src/lib/osmApi.js`
- `src/components/chatbot/MapModal.jsx`
- `src/components/chatbot/PlacesCard.jsx`
- `src/components/chatbot/HotelCard.jsx`

## Phụ thuộc

Dùng ui primitive của module 1.

## Merge

Thư mục này sắp xếp y hệt cấu trúc dự án chính. Khi merge, copy toàn bộ nội dung
của nó vào thư mục gốc `travel-planner/`. Không file nào trùng với module khác
nên hợp nhất 6 module sẽ ra đúng dự án hoàn chỉnh, không có conflict.
