const express = require('express');
const cors = require('cors');

// ==========================================
// 1. BOOKING SERVICE (PORT 8083)
// ==========================================
const bookingApp = express();
bookingApp.use(cors());
bookingApp.use(express.json());

// API: POST /bookings
bookingApp.post('/bookings', (req, res) => {
    const { userId, tourId, quantity } = req.body;
    console.log(`[Port 8083 - Booking] Nhận yêu cầu đặt tour ${tourId} cho user ${userId}`);

    // Giả lập logic xử lý
    const newBooking = {
        bookingId: Math.floor(Math.random() * 10000),
        userId,
        tourId,
        quantity,
        status: 'PENDING'
    };

    res.status(201).json({
        message: "Tạo booking thành công",
        data: newBooking
    });
});

bookingApp.listen(8083, () => {
    console.log('✅ Booking Service đang chạy tại: http://172.16.35.241:8083');
});


// ==========================================
// 2. PAYMENT SERVICE (PORT 8084)
// ==========================================
const paymentApp = express();
paymentApp.use(cors());
paymentApp.use(express.json());

// API: POST /payments
paymentApp.post('/payments', (req, res) => {
    const { bookingId, amount } = req.body;
    console.log(`[Port 8084 - Payment] Đang xử lý thanh toán cho đơn hàng #${bookingId}`);

    // Logic: Random success/fail (Thành công hoặc Thất bại ngẫu nhiên)[cite: 1]
    const isSuccess = Math.random() > 0.3; // 70% tỉ lệ thành công

    if (isSuccess) {
        res.status(200).json({
            status: "SUCCESS",
            message: "Thanh toán thành công"
        });
    } else {
        res.status(400).json({
            status: "FAILED",
            message: "Thanh toán thất bại do số dư không đủ hoặc lỗi hệ thống"
        });
    }
});

paymentApp.listen(8084, () => {
    console.log('✅ Payment Service đang chạy tại: http://172.16.35.241:8084');
});