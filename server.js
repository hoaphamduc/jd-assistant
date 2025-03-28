const express = require('express');
const path = require('path');
require('dotenv').config();
const jdRoutes = require('./routes/jdRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình view engine EJS và thư mục views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware để parse dữ liệu POST
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cấu hình thư mục chứa file tĩnh (CSS, JS, hình ảnh, ...)
app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng routes của JD
app.use('/', jdRoutes);

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên http://localhost:${PORT}`);
});