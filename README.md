# 🎯 Presentation Generator

**Trình tạo slide PowerPoint thông minh từ tài liệu văn bản** — Chỉ cần thả file vào thư mục `inputs/`, chạy một lệnh duy nhất, nhận ngay file `.pptx` chuyên nghiệp với hiệu ứng và bố cục tự động.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai)](https://openai.com)

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| **Đa định dạng đầu vào** | Hỗ trợ `.md`, `.pdf`, `.docx`, `.xlsx` — tự động nhận diện loại file |
| **Tự động phát hiện chủ đề** | Phân tích nội dung để chọn theme màu phù hợp (tài chính, giáo dục, bán hàng, hiện đại) |
| **Bố cục thông minh** | Tự động chia slide (200 từ/slide), tạo slide tiêu đề, mục, nội dung, biểu đồ, kết thúc |
| **Hiệu ứng chuyên nghiệp** | Title fade-in, bullet fly từng cái, chuyển slide mượt mà |
| **Hỗ trợ AI (LLM)** | Tích hợp OpenAI — gửi nội dung + AGENT.md để thiết kế layout chính xác hơn |
| **Tạo biểu đồ tự động** | Nhận diện bảng có dữ liệu số → tự động tạo slide biểu đồ cột |
| **Watch mode** | Chế độ theo dõi thư mục — thả file là tự động xử lý |
| **Kiểm tra chất lượng** | Tự động validate slide (độ dài, số lượng, tương phản màu WCAG) |

---

## 🚀 Bắt đầu nhanh

### 1. Yêu cầu hệ thống

- **Node.js** phiên bản 18 trở lên
- **npm** (đi kèm Node.js)
- *(Tùy chọn)* **OpenAI API key** — để sử dụng layout thông minh bằng AI

### 2. Cài đặt

```bash
# Clone dự án
git clone https://github.com/Namtran592005/presentation-generator.git
cd presentation-generator

# Cài đặt dependencies
npm install

# Tạo file cấu hình môi trường
cp .env.example .env
# Sau đó mở file .env và điền OPENAI_API_KEY của bạn (nếu có)
```

### 3. Sử dụng

```bash
# Đặt file đầu vào (.md, .pdf, .docx, .xlsx) vào thư mục inputs/

# Cách 1: Xử lý toàn bộ file trong inputs/
npm run start

# Cách 2: Chế độ watch — tự động xử lý khi thả file mới
npm run watch

# Cách 3: Dùng CLI trực tiếp
node src/cli.js generate
node src/cli.js watch
```

Kết quả sẽ được lưu vào thư mục `outputs/` dưới dạng `{tên_file}_presentation.pptx`.

### 4. CLI Commands

```bash
# Xử lý tất cả file trong thư mục đầu vào
ppt-agent generate [inputDir] [outputDir]

# Theo dõi thư mục và tự động xử lý
ppt-agent watch [inputDir] [outputDir]

# Khởi tạo cấu trúc dự án
ppt-agent init

# Các tùy chọn
-t, --template <path>   # Đường dẫn template tùy chỉnh
```

---

## 🧠 Kiến trúc hệ thống

```
inputs/              # (1) Thả file đầu vào
  │
  v
src/parsers/         # (2) Phân tích nội dung theo định dạng
  ├── markdown-parser.js   # .md → text + cấu trúc
  ├── pdf-parser.js        # .pdf → text theo trang
  ├── docx-parser.js       # .docx → heading + bullet
  └── xlsx-parser.js       # .xlsx → bảng + biểu đồ
  │
  v
src/designers/       # (3) Thiết kế bố cục slide
  ├── theme-detector.js    # Phát hiện theme (tài chính/GD/bán hàng)
  ├── layout-planner.js    # Chia slide, sắp xếp nội dung (fallback)
  └── llm-designer.js      # OpenAI: thiết kế layout thông minh
  │
  v
src/validators/      # (4) Kiểm tra chất lượng
  └── slide-validator.js   # Validate độ dài, số lượng, độ tương phản
  │
  v
src/renderers/       # (5) Render PowerPoint
  └── pptx-renderer.js     # Tạo .pptx với hiệu ứng & transition
  │
  v
outputs/             # (6) File kết quả .pptx
```

---

## 🎨 Theme & Phát hiện chủ đề

Hệ thống tự động phân tích nội dung và chọn theme phù hợp:

| Theme | Màu sắc | Từ khóa kích hoạt | Ứng dụng |
|-------|---------|-------------------|----------|
| **Financial** | Xanh dương đậm | revenue, profit, fiscal, Q1-Q4 | Báo cáo tài chính, kinh doanh |
| **Educational** | Nâu ấm + cam | lesson, chapter, lecture, curriculum | Bài giảng, tài liệu học tập |
| **Sales** | Đen + đỏ | product, launch, pricing, conversion | Thuyết trình bán hàng |
| **Default** | Xanh thanh lịch | *(mặc định)* | Mọi loại tài liệu khác |

---

## 🎬 Hiệu ứng & Animation

Áp dụng theo quy tắc trong `AGENT.md`:

| Thành phần | Hiệu ứng | Thời gian | Delay |
|-----------|----------|-----------|-------|
| Tiêu đề slide | Fade in | 1.5s | 0.5s |
| Phụ đề | Fade in | 1.0s | 0.8s |
| Bullet points | Fly từ trái | 0.6s | 0.2s (tăng dần) |
| Biểu đồ / Hình ảnh | Appear | 0.5s | 0s |
| Chuyển slide | Fade | 0.5s | — |

---

## 🔧 Cấu hình

### `config.json`
```json
{
  "templatePath": "./templates/template.json",
  "inputDir": "./inputs",
  "outputDir": "./outputs"
}
```

### `templates/template.json`
Tùy chỉnh màu sắc, font chữ, kích thước, bố cục master, logo.

### `AGENT.md`
File hướng dẫn cho AI — định nghĩa cách phân tích, thiết kế, tạo hiệu ứng.

---

## 📂 Định dạng đầu vào hỗ trợ

| Định dạng | Thư viện | Tính năng |
|-----------|----------|-----------|
| `.md` / `.markdown` | Tự xử lý regex | Heading, bullet, bảng Markdown → biểu đồ |
| `.pdf` | `pdf-parse` | Trích xuất text theo trang, phát hiện heading |
| `.docx` / `.doc` | `mammoth` | HTML → heading, bullet, bảng |
| `.xlsx` / `.xls` | `xlsx` | Đọc sheet, phát hiện cột số → biểu đồ |

---

## ☁️ Tích hợp OpenAI

Đặt API key trong file `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

Khi có key, hệ thống sẽ gửi nội dung tài liệu + quy tắc từ `AGENT.md` cho AI để thiết kế layout slide tối ưu. Nếu không có key, hệ thống tự động dùng bố cục quy tắc (rule-based) vẫn hoạt động đầy đủ.

---

## 📊 Kết quả kiểm thử

| File đầu vào | Theme phát hiện | Số slide | Thời gian |
|-------------|----------------|----------|-----------|
| `sample-financial-report.md` | Financial | 8 | ~80ms |
| `sample-lecture.md` | Educational | 7 | ~30ms |

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo branch tính năng: `git checkout -b feature/amazing-feature`
3. Commit thay đổi: `git commit -m 'Add amazing feature'`
4. Push lên branch: `git push origin feature/amazing-feature`
5. Mở Pull Request

---

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---

## 📬 Liên hệ

**Tác giả:** Nam Tran  
**GitHub:** [Namtran592005](https://github.com/Namtran592005)  
**Dự án:** [github.com/Namtran592005/presentation-generator](https://github.com/Namtran592005/presentation-generator)
