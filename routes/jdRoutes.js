const express = require('express');
const router = express.Router();
const JDController = require('../controllers/JDController');
const multer = require('multer');

// Sử dụng multer với bộ nhớ tạm để xử lý upload file PDF
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route hiển thị giao diện JD
router.get('/', JDController.renderJDView);

// Route tạo câu hỏi: hỗ trợ nhận file PDF (field name: pdfFile) và/hoặc jdText
router.post('/jd/generate-question', upload.single('pdfFile'), JDController.generateQuestion);

// Route đánh giá câu trả lời
router.post('/jd/evaluate-answer', upload.none(), JDController.evaluateAnswer);

module.exports = router;