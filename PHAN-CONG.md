# Phân công nhóm

Dự án: AI Travel Planner (`travel-planner/`). Bản chia theo người: `travel-planner-team/`.

| STT | Họ và tên | Mã học viên | Module | File phụ trách |
|---|---|---|---|---|
| 1 | Đỗ Thanh Tùng | 2A202601205 | Nền tảng & UI primitive | config build, `main.jsx`, `App.jsx`, `index.css`, `lib/utils.js`, `components/ui/*` |
| 2 | Trần Hải Quân | 2A202601521 | Điều phối pipeline & nhập liệu | `pages/Home.jsx`, `ChatInput.jsx`, `FunctionTrace.jsx` |
| 3 | Hoàng Hải Dương | 2A202601337 | Tầng LLM & minh bạch tool | `lib/groqClient.js`, `AdvisoryCard.jsx`, `PaywallModal.jsx`, `ToolUsageBox.jsx` |
| 4 | Nguyễn Minh Phương | 2A202601947 | API du lịch & thời tiết | `lib/travelApi.js`, `WeatherCard.jsx`, `TripPlanCard.jsx` |
| 5 | Nguyễn Thành Long | 2A202601443 | Dữ liệu POI thật & bản đồ | `lib/osmApi.js`, `MapModal.jsx`, `PlacesCard.jsx`, `HotelCard.jsx` |
| 6 | Phạm Đức Hiệp | 2A202601329 | Vận tải, lịch trình & tài liệu | `TransportCard.jsx`, `ScheduleTable.jsx`, `README.md` |

Mỗi file thuộc đúng một người nên merge 6 module không phát sinh conflict. Merge module 1
trước vì các module còn lại đều import primitive trong `components/ui/`.
