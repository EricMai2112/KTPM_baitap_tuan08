const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Địa chỉ IP của các thành viên (Giữ nguyên như bạn đã cấu hình)
const USER_SVC = 'http://172.16.35.47:8081';
const TOUR_SVC = 'http://172.16.35.42:8082';
const BOOKING_SVC = 'http://172.16.35.241:8083';
const PAYMENT_SVC = 'http://172.16.35.241:8084';

// --- 1. LUỒNG ĐĂNG NHẬP (Bắc cầu sang Người 3) ---
app.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SVC}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Lỗi kết nối User Service" });
    }
});

// --- 2. LUỒNG XEM DANH SÁCH TOUR (Bắc cầu sang Người 4) ---
app.get('/tours', async (req, res) => {
    try {
        const response = await axios.get(`${TOUR_SVC}/api/tours`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Không thể lấy danh sách Tour" });
    }
});

// --- 3. LUỒNG ĐIỀU PHỐI ĐẶT TOUR (Nghiệp vụ chính của Người 2) ---
app.post('/book-tour', async (req, res) => {
    const { userId, tourId, paymentMethod } = req.body;
    console.log("🚀 Đang điều phối đặt Tour cho User:", userId);

    try {
        // Bước 1: Check User
        const user = await axios.get(`${USER_SVC}/users/${userId}`);
        
        // Bước 2: Check Tour
        const tour = await axios.get(`${TOUR_SVC}/api/tours/${tourId}`);
        
        // Bước 3: Tạo Booking
        const booking = await axios.post(`${BOOKING_SVC}/bookings`, {
            userId: user.data.id,
            tourId: tour.data.id,
            price: tour.data.price
        });

        // Bước 4: Thanh toán
        const payment = await axios.post(`${PAYMENT_SVC}/payments`, {
            bookingId: booking.data.id,
            amount: tour.data.price,
            method: paymentMethod
        });

        res.json({
            status: "Success",
            message: "Đặt tour thành công!",
            details: {
                orderId: booking.data.id,
                customer: user.data.name,
                tour: tour.data.name,
                transactionId: payment.data.transactionId
            }
        });
    } catch (error) {
        console.error("❌ Lỗi điều phối:", error.message);
        res.status(500).json({ status: "Failed", message: error.message });
    }
});

app.listen(8080, () => console.log("🧠 Central Orchestrator running on port 8080"));