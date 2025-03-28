const { GoogleGenerativeAI } = require('@google/generative-ai');
const { marked } = require('marked');
const pdfParse = require('pdf-parse');

// Lấy API key từ biến môi trường .env (GEN_API_KEY)
const GEN_API_KEY = process.env.GEN_API_KEY;
if (!GEN_API_KEY) {
    console.error("GEN_API_KEY không được định nghĩa trong file .env");
}

// Map để lưu trạng thái cooldown của người dùng (dựa theo IP)
const userCooldowns = new Map();

/**
 * Render giao diện JD (form nhập JD hoặc upload PDF)
 */
exports.renderJDView = async (req, res) => {
    try {
        res.render('jd', {
            title: 'JD Assistant'
        });
    } catch (error) {
        console.error('Error rendering JD view:', error);
        res.status(500).send('Internal Server Error.');
    }
};

/**
 * Xử lý tạo câu hỏi dựa trên JD.
 * - Nếu nội dung không chứa các đặc trưng của JD (nhiệm vụ, trách nhiệm, yêu cầu kỹ năng, …)
 *   thì trả về thông báo "Đầu vào không phải là mô tả công việc (JD)".
 * - Nếu hợp lệ, gợi ý một số câu hỏi phỏng vấn và chọn ra 1 câu hỏi duy nhất để người dùng trả lời.
 */
exports.generateQuestion = async (req, res) => {
    try {
        let { jdText, interviewLanguage } = req.body;
        // Nếu người dùng upload file PDF thì ưu tiên đọc nội dung từ file
        if (req.file) {
            const dataBuffer = req.file.buffer;
            const pdfData = await pdfParse(dataBuffer);
            jdText = pdfData.text;
        }
        console.log(jdText);
        if (!jdText) {
            return res.status(400).json({ error: 'JD text is required.' });
        }
        // Nếu chưa chọn ngôn ngữ phỏng vấn, đặt mặc định là 'vi'
        if (!interviewLanguage) {
            interviewLanguage = 'vi';
        }

        // Kiểm tra cooldown: chỉ cho phép gửi yêu cầu mỗi 5 giây
        const userId = req.ip;
        const now = Date.now();
        const lastRequestTime = userCooldowns.get(userId);
        const cooldownPeriod = 5 * 1000;
        if (lastRequestTime && now - lastRequestTime < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - (now - lastRequestTime)) / 1000);
            return res.status(429).json({ error: `Vui lòng chờ ${remainingTime} giây trước khi gửi yêu cầu mới.` });
        }
        userCooldowns.set(userId, now);

        // Map chuyển đổi code ngôn ngữ phỏng vấn (ví dụ 'vi', 'en', 'zh') sang tên hiển thị
        const languageMap = {
            vi: 'Tiếng Việt',
            en: 'English',
            zh: '中文'
        };
        const targetLanguage = languageMap[interviewLanguage] || 'English';

        // Khởi tạo Google Generative AI client với API key
        const genAI = new GoogleGenerativeAI(GEN_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Tạo prompt dùng một template duy nhất:
        // - Kiểm tra đầu vào có chứa các đặc trưng của JD hay không.
        // - Nếu hợp lệ, gợi ý câu hỏi và chọn ra 1 câu hỏi duy nhất.
        const prompt = `Bạn là trợ lý tạo câu hỏi phỏng vấn dựa trên mô tả công việc (JD) dưới đây.
        Trước tiên, hãy kiểm tra xem nội dung đầu vào có chứa các yếu tố đặc trưng của một mô tả công việc (ví dụ: nhiệm vụ, trách nhiệm, yêu cầu chuyên môn, kỹ năng cần có, …) không.
        - Nếu không, hãy trả lời: "Đầu vào không phải là mô tả công việc (JD)".
        - Nếu hợp lệ, hãy gợi ý một số câu hỏi phỏng vấn phù hợp với lĩnh vực đó, sau đó chọn ra một câu hỏi để người dùng trả lời (nếu JD về lập trình thì có thể hỏi về code).
        Ngôn ngữ trả lời: ${targetLanguage}.

        -----------------------
        ${jdText}
        -----------------------

        Trả lời bằng ngôn ngữ ${targetLanguage}.`;

        // Gọi API của Google Generative AI với prompt đã tạo
        const result = await model.generateContent(prompt);
        const rawMarkdown = result?.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || 'No response from AI.';
        const htmlContent = marked(rawMarkdown);

        // Trả về câu hỏi cùng với nội dung JD ban đầu
        res.json({ question: htmlContent, jdText });
    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Failed to generate question.' });
    }
};

/**
 * Xử lý đánh giá câu trả lời của người dùng.
 * - Dựa trên JD và câu hỏi duy nhất đã tạo, chấm điểm câu trả lời theo thang điểm 10.
 * - Trả về nhận xét chi tiết kèm gợi ý cải thiện (nếu cần).
 */
exports.evaluateAnswer = async (req, res) => {
    try {
        const { jdText, question, answer } = req.body;
        console.log('req', req.body);
        if (!jdText || !question || !answer) {
            return res.status(400).json({ error: 'JD, câu hỏi và câu trả lời đều là bắt buộc.' });
        }

        // Khởi tạo Google Generative AI client với API key
        const genAI = new GoogleGenerativeAI(GEN_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Tạo prompt đánh giá dựa trên JD, câu hỏi đã tạo và câu trả lời của ứng viên.
        // Hướng dẫn chi tiết về cách đánh giá câu trả lời.
        const prompt = `Bạn là một chuyên gia nhân sự giàu kinh nghiệm và rất khó tính, được giao nhiệm vụ đánh giá chi tiết câu trả lời của ứng viên cho câu hỏi phỏng vấn duy nhất dưới đây, được tạo dựa trên mô tả công việc (JD).

            JD: ${jdText}

            Câu hỏi phỏng vấn: ${question}

            Câu trả lời của ứng viên: ${answer}

            Hãy thực hiện các bước sau:
            1. Phân tích nội dung JD để nhận diện các yêu cầu và tiêu chí chính.
            2. Đánh giá mức độ phù hợp của câu trả lời với các tiêu chí đó, sự rõ ràng, logic và tính thực tiễn.
            3. Chấm điểm câu trả lời trên thang điểm 10 (10 là hoàn hảo).
            4. Đưa ra nhận xét chi tiết về điểm mạnh và điểm yếu của câu trả lời.
            5. Nếu điểm dưới 6, hãy đưa ra gợi ý cụ thể để cải thiện; nếu điểm từ 6 trở lên, chỉ cần nhận xét tóm tắt.

            Trả lời bằng ngôn ngữ của Câu hỏi phỏng vấn với phong cách chuyên nghiệp và rõ ràng.`;

        // Gọi API của Google Generative AI để nhận kết quả đánh giá
        const result = await model.generateContent(prompt);
        const rawMarkdown = result?.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || 'No response from AI.';
        const htmlContent = marked(rawMarkdown);

        // Trả về kết quả đánh giá
        res.json({ evaluation: htmlContent });
    } catch (error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ error: 'Failed to evaluate answer.' });
    }
};