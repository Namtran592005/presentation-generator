# Presentation Generator

Trình tạo slide PowerPoint thông minh từ tài liệu văn bản. Thả file vào thư mục `inputs/`, chạy một lệnh, nhận file `.pptx` chuyên nghiệp với hiệu ứng và bố cục tự động.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai)](https://openai.com)

---

## Tính năng

- **Đa định dạng đầu vào** -- Hỗ trợ `.md`, `.pdf`, `.docx`, `.xlsx`, tự động nhận diện loại file
- **Tự động phát hiện chủ đề** -- Phân tích nội dung chọn theme phù hợp (tài chính, giáo dục, bán hàng, hiện đại)
- **Bố cục thông minh** -- Tự động chia slide (200 từ/slide), tạo slide tiêu đề, mục, nội dung, biểu đồ, kết thúc
- **Hiệu ứng chuyên nghiệp** -- Title fade-in, bullet fly từng cái, chuyển slide mượt mà
- **Hỗ trợ LLM** -- Tích hợp OpenAI, gửi nội dung + AGENT.md để thiết kế layout chính xác
- **Tạo biểu đồ tự động** -- Nhận diện bảng có dữ liệu số, tự động tạo slide biểu đồ cột
- **Watch mode** -- Theo dõi thư mục, thả file là tự động xử lý
- **Kiểm tra chất lượng** -- Tự động validate slide (độ dài, số lượng, tương phản màu WCAG)

---

## Bắt đầu nhanh

### Yêu cầu

- Node.js 18+
- npm
- (Tùy chọn) OpenAI API key

### Cài đặt

```bash
git clone https://github.com/Namtran592005/presentation-generator.git
cd presentation-generator
npm install
cp .env.example .env   # Thêm OPENAI_API_KEY nếu có
```

### Sử dụng

```bash
# Xử lý toàn bộ file trong inputs/
npm run start

# Watch mode -- tự động khi có file mới
npm run watch

# CLI trực tiếp
node src/cli.js generate
node src/cli.js watch
```

Kết quả lưu trong `outputs/` với định dạng `{ten_file}_presentation.pptx`.

### CLI

```
ppt-agent generate [inputDir] [outputDir]
ppt-agent watch [inputDir] [outputDir]
ppt-agent init
  -t, --template <path>   Đường dẫn template tùy chỉnh
```

---

## Kiến trúc hệ thống

```
inputs/              ->  src/parsers/
                            markdown-parser.js   (.md)
                            pdf-parser.js        (.pdf)
                            docx-parser.js       (.docx)
                            xlsx-parser.js       (.xlsx)
                        src/designers/
                            theme-detector.js    (phát hiện theme)
                            layout-planner.js    (bố cục fallback)
                            llm-designer.js      (OpenAI layout)
                        src/validators/
                            slide-validator.js   (kiểm tra chất lượng)
                        src/renderers/
                            pptx-renderer.js     (tạo .pptx + hiệu ứng)
                     -> outputs/
```

---

## Theme & Phát hiện chủ đề

| Theme | Màu sắc | Từ khóa kích hoạt | Ứng dụng |
|-------|---------|-------------------|----------|
| Financial | Xanh dương đậm | revenue, profit, fiscal, Q1-Q4 | Báo cáo tài chính |
| Educational | Nâu ấm + cam | lesson, chapter, lecture, curriculum | Bài giảng, tài liệu |
| Sales | Đen + đỏ | product, launch, pricing, conversion | Thuyết trình bán hàng |
| Default | Xanh thanh lịch | (mặc định) | Mọi loại tài liệu khác |

---

## Hiệu ứng & Animation

| Thành phần | Hiệu ứng | Thời gian | Delay |
|-----------|----------|-----------|-------|
| Tiêu đề slide | Fade in | 1.5s | 0.5s |
| Phụ đề | Fade in | 1.0s | 0.8s |
| Bullet points | Fly từ trái | 0.6s | 0.2s (tăng dần) |
| Biểu đồ / Hình ảnh | Appear | 0.5s | 0s |
| Chuyển slide | Fade | 0.5s | - |

---

## Cấu hình

**config.json**
```json
{
  "templatePath": "./templates/template.json",
  "inputDir": "./inputs",
  "outputDir": "./outputs"
}
```

**templates/template.json** -- Màu sắc, font chữ, kích thước, layout master, logo.

**AGENT.md** -- Hướng dẫn cho AI: cách phân tích, thiết kế, tạo hiệu ứng.

---

## Định dạng đầu vào hỗ trợ

| Định dạng | Thư viện | Tính năng |
|-----------|----------|-----------|
| `.md` / `.markdown` | Tự xử lý regex | Heading, bullet, bảng Markdown -> biểu đồ |
| `.pdf` | pdf-parse | Trích xuất text theo trang, phát hiện heading |
| `.docx` / `.doc` | mammoth | HTML -> heading, bullet, bảng |
| `.xlsx` / `.xls` | xlsx | Đọc sheet, phát hiện cột số -> biểu đồ |

---

## Tích hợp OpenAI

Thêm key trong `.env`:

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
```

Khi có key, hệ thống gửi nội dung + quy tắc từ AGENT.md cho AI để thiết kế layout tối ưu. Nếu không có key, hệ thống dùng bố cục quy tắc (rule-based) vẫn hoạt động đầy đủ.

---

## Kết quả kiểm thử

| File đầu vào | Theme | Số slide | Thời gian |
|-------------|-------|----------|-----------|
| sample-financial-report.md | Financial | 8 | ~80ms |
| sample-lecture.md | Educational | 7 | ~30ms |

---

## Đóng góp

1. Fork dự án
2. Tạo branch tính năng: `git checkout -b feature/amazing-feature`
3. Commit thay đổi: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Mở Pull Request

---

## Liên hệ

**Tác giả:** Nam Tran
**GitHub:** Namtran592005
**Dự án:** github.com/Namtran592005/presentation-generator
