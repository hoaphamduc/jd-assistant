# JD Assistant

JD Assistant là một ứng dụng web giúp tạo ra các câu hỏi phỏng vấn dựa trên mô tả công việc (JD). Ứng dụng sử dụng Google Generative AI để tạo câu hỏi và đánh giá câu trả lời của ứng viên. Công cụ này không chỉ dành cho lập trình mà còn phù hợp với mọi lĩnh vực khác nhau.

## Nội dung

* [Yêu Cầu](#yêu-cầu)
* [Cài Đặt](#cài-đặt)
* [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
* [Cấu Hình](#cấu-hình)
* [Chạy Ứng Dụng](#chạy-ứng-dụng)
* [Cách Sử Dụng](#cách-sử-dụng)
* [Scripts](#scripts)
* [Liên Hệ](#liên-hệ)

## Yêu Cầu

* **Node.js và npm:** Cài đặt phiên bản mới nhất từ [nodejs.org](https://nodejs.org/).
* **Google Generative AI API Key:** Bạn cần đăng ký và lấy API key từ Google.
* **Các package sau (sẽ được cài đặt thông qua npm):**
    * express
    * ejs
    * dotenv
    * multer
    * @google/generative-ai
    * marked
    * pdf-parse
    * nodemon (dành cho phát triển)

## Cài Đặt

1. **Clone Repository hoặc tải về mã nguồn:**

    ```bash
    git clone https://github.com/hoaphamduc/jd-assistant.git
    cd jd-assistant
    ```

2. **Khởi tạo dự án và cài đặt các dependencies:**

    Nếu bạn chưa có file `package.json`, hãy chạy:

    ```bash
    npm init -y
    ```

    Sau đó, cài đặt các package:

    ```bash
    npm install express ejs dotenv multer @google/generative-ai marked pdf-parse
    npm install nodemon --save-dev
    ```

## Cấu Trúc Dự Án

```
jd-assistant/
├── controllers/
│   └── JDController.js       // Xử lý logic tạo câu hỏi và đánh giá câu trả lời
├── routes/
│   └── jdRoutes.js           // Định nghĩa các route của ứng dụng
├── views/
│   └── jd.ejs                // Giao diện người dùng (form nhập JD, upload PDF, chọn ngôn ngữ, editor, …)
├── public/                   // Thư mục chứa các file tĩnh (CSS, JS, hình ảnh, …)
├── .env                      // File cấu hình biến môi trường (GEN_API_KEY, PORT, …)
├── server.js                 // File khởi chạy server Express
├── package.json              // Quản lý các package và scripts
└── README.md                 // Hướng dẫn cài đặt và sử dụng ứng dụng
```

## Cấu Hình

Tạo file `.env` ở thư mục gốc và thêm thông tin sau:

```ini
GEN_API_KEY=your_google_api_key_here
PORT=3000
```

> **Chú ý:** Thay `your_google_api_key_here` bằng API key của bạn. API key lấy tại đây https://aistudio.google.com/apikey

## Chạy Ứng Dụng

Bạn có thể chạy ứng dụng theo các cách sau:

### Chạy bình thường

```bash
npm start
```

### Chạy trong môi trường phát triển (sử dụng nodemon)

```bash
npm run dev
```

### Chạy với PM2 (trong môi trường production)

```bash
npm run pm2
```

Để dừng PM2, sử dụng:

```bash
npm run stoppm2
```

## Cách Sử Dụng

1. **Mở trang web:** Sau khi chạy server, mở trình duyệt và truy cập [http://localhost:3000/](http://localhost:3000/).
2. **Nhập JD hoặc Upload PDF:** Bạn có thể nhập trực tiếp mô tả công việc (JD) hoặc upload file PDF chứa JD.
3. **Chọn ngôn ngữ phỏng vấn:** Sử dụng dropdown để chọn ngôn ngữ phỏng vấn (ví dụ: Tiếng Việt, English, 中文, …).
4. **Tạo câu hỏi:** Nhấn nút "Cho tôi câu hỏi" để tạo ra một câu hỏi phỏng vấn dựa trên JD.
5. **Trả lời câu hỏi:** Sau khi câu hỏi được hiển thị, bạn có thể nhập câu trả lời vào editor (với hỗ trợ chọn ngôn ngữ lập trình nếu cần) và gửi.
6. **Xem kết quả:** Kết quả đánh giá sẽ được hiển thị dựa trên câu trả lời của bạn.

## Scripts

Trong file `package.json`, bạn có các scripts sau:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "pm2": "pm2 start server.js --name jdassistant --env production",
  "stoppm2": "pm2 stop server.js"
}
```

* **start:** Chạy ứng dụng bằng Node.js.
* **dev:** Chạy ứng dụng trong chế độ phát triển sử dụng nodemon để tự động reload.
* **pm2:** Chạy ứng dụng sử dụng PM2 cho môi trường production.
* **stoppm2:** Dừng ứng dụng đang chạy bằng PM2.

## Liên Hệ

Nếu có bất kỳ thắc mắc nào, vui lòng để lại comment hoặc liên hệ qua hoaphamduc2399@gmail.com.

---

**Chúc bạn thành công với dự án JD Assistant!**
