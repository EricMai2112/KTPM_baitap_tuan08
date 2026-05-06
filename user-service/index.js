const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. CẤU HÌNH KẾT NỐI MONGODB
// ==========================================
// Đổi chuỗi này thành URI của bạn:
// - Dùng Compass (Local): 'mongodb://localhost:27017/travel_booking'
// - Dùng Atlas (Cloud): 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/travel_booking'
const MONGO_URI = 'mongodb+srv://nguyen123:Pvn123@cluster0.vljmyww.mongodb.net/bookings?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Đã kết nối thành công tới MongoDB!'))
    .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// ==========================================
// 2. ĐỊNH NGHĨA MODEL USER
// ==========================================
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String },
    email: { type: String },
    role: { type: String, default: 'customer' }
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

// ==========================================
// 3. CÁC API THEO YÊU CẦU
// ==========================================

// API 1: Xử lý đăng nhập
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ username và password' });
        }

        // Tìm user trong database
        const user = await User.findOne({ username, password });

        if (user) {
            // Chuyển object mongoose thành plain JSON và loại bỏ password
            const userObj = user.toObject();
            delete userObj.password;

            return res.status(200).json({
                message: 'Đăng nhập thành công',
                data: userObj
            });
        } else {
            return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// API 3: POST /register - Xử lý đăng ký người dùng mới
app.post('/register', async (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;

        // 1. Kiểm tra đầu vào (Validation cơ bản)
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Vui lòng cung cấp ít nhất username và password' 
            });
        }

        // 2. Kiểm tra xem username đã tồn tại trong database chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác' 
            });
        }

        // 3. Tạo user mới (mặc định role là 'customer')
        const newUser = await User.create({
            username,
            password, // Lưu ý: Trong thực tế nên mã hóa mật khẩu (ví dụ: dùng bcrypt) trước khi lưu
            fullName,
            email
        });

        // 4. Trả về kết quả (loại bỏ password vì lý do bảo mật)
        const userObj = newUser.toObject();
        delete userObj.password;

        return res.status(201).json({
            message: 'Đăng ký người dùng thành công',
            data: userObj
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Lỗi server khi đăng ký', 
            error: error.message 
        });
    }
});

// API 2: Lấy thông tin user theo ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Tìm user theo ObjectID của MongoDB
        const user = await User.findById(userId);

        if (user) {
            const userObj = user.toObject();
            delete userObj.password;

            return res.status(200).json({
                message: 'Lấy thông tin người dùng thành công',
                data: userObj
            });
        } else {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        // Xử lý lỗi nếu ID truyền vào không đúng định dạng ObjectID của MongoDB
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// ==========================================
// 4. KHỞI ĐỘNG SERVER LAN
// ==========================================
const PORT = 8081;
const HOST = '172.16.35.47'; 

app.listen(PORT, HOST, () => {
    console.log(`User Service đang chạy tại: http://${HOST}:${PORT}`);
    console.log(`- POST http://${HOST}:${PORT}/login`);
    console.log(`- GET  http://${HOST}:${PORT}/users/:id`);
});