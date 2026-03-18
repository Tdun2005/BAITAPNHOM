const db = require("../config/db");

/* =====================================================
   GET ALL BOOKINGS (Admin / Operator)
===================================================== */
exports.getAllBookings = async (req, res) => {
    try {
        const sql = `
            SELECT
                b.booking_id,
                b.user_id,
                u.full_name,
                u.email,
                b.trip_id,
                b.booking_time,
                b.total_amount,
                b.status,
                t.departure_time,
                r.origin,
                r.destination
            FROM booking b
            JOIN users u ON b.user_id = u.user_id
            JOIN trip t ON b.trip_id = t.trip_id
            JOIN route r ON t.route_id = r.route_id
            ORDER BY b.booking_id DESC
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error("GET ALL BOOKINGS ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* =====================================================
   GET BOOKINGS BY USER
===================================================== */
exports.getBookingsByUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const sql = `
            SELECT
                b.booking_id,
                b.total_amount,
                b.status,
                b.booking_time,
                t.departure_time,
                t.arrival_time,
                r.origin,
                r.destination,
                bus.bus_type,
                bus.plate_number,
                o.name AS operator_name
            FROM booking b
            JOIN trip t ON b.trip_id = t.trip_id
            JOIN route r ON t.route_id = r.route_id
            JOIN bus ON t.bus_id = bus.bus_id
            JOIN bus_operator o ON bus.operator_id = o.operator_id
            WHERE b.user_id = ?
            ORDER BY b.booking_id DESC
        `;
        const [result] = await db.query(sql, [userId]);
        res.json(result);
    } catch (err) {
        console.error("GET BOOKINGS BY USER ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* =====================================================
   CREATE BOOKING (Transaction)
===================================================== */
exports.createBooking = async (req, res) => {
    const { user_id, trip_id, seats, status: reqStatus, payment_method } = req.body;
    const bookingStatus = (reqStatus === "PENDING") ? "PENDING" : "PAID";

    if (!user_id || !trip_id || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const normalizedSeats = seats.map(s => {
        if (typeof s === "number") return { id: s, type: "NORMAL" };
        return { id: parseInt(s.id), type: s.type || "NORMAL" };
    });

    const seatIds = normalizedSeats.map(s => s.id);
    if (seatIds.some(id => !id || isNaN(id))) {
        return res.status(400).json({ message: "Seat không hợp lệ" });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[trip]] = await conn.query(
            "SELECT base_price, bus_id FROM trip WHERE trip_id = ? FOR UPDATE",
            [trip_id]
        );
        if (!trip) {
            await conn.rollback();
            return res.status(404).json({ message: "Trip not found" });
        }

        const basePrice = trip.base_price;

        // Check ghế chưa được đặt (gồm cả PENDING để tránh double-book)
        const [bookedSeats] = await conn.query(
            `SELECT bd.seat_id FROM booking_detail bd
             JOIN booking bk ON bd.booking_id = bk.booking_id
             WHERE bk.trip_id = ? AND bk.status IN ('CONFIRMED','PAID','PENDING') AND bd.seat_id IN (?)
             FOR UPDATE`,
            [trip_id, seatIds]
        );

        if (bookedSeats.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: "Một hoặc nhiều ghế đã bị đặt" });
        }

        let total = 0;
        normalizedSeats.forEach(s => {
            total += s.type === "VIP" ? basePrice * 1.5 : basePrice;
        });

        const [bookingResult] = await conn.query(
            `INSERT INTO booking (user_id, trip_id, booking_time, total_amount, status)
             VALUES (?, ?, NOW(), ?, ?)`,
            [user_id, trip_id, total, bookingStatus]
        );
        const bookingId = bookingResult.insertId;

        const values = normalizedSeats.map(s => [
            bookingId,
            s.id,
            s.type === "VIP" ? basePrice * 1.5 : basePrice
        ]);
        await conn.query(
            "INSERT INTO booking_detail (booking_id, seat_id, price) VALUES ?",
            [values]
        );

        await conn.commit();
        res.status(201).json({ message: "Đặt vé thành công", booking_id: bookingId, total });

    } catch (err) {
        await conn.rollback();
        console.error("CREATE BOOKING ERROR:", err);
        res.status(500).json({ message: "Lỗi server" });
    } finally {
        conn.release();
    }
};

/* =====================================================
   UPDATE BOOKING STATUS (Huỷ vé / Xác nhận)
===================================================== */
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query("UPDATE booking SET status=? WHERE booking_id=?", [status, id]);
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        console.error("UPDATE BOOKING STATUS ERROR:", err);
        res.status(500).json({ message: "Update failed" });
    }
};

/* =====================================================
   PAY BOOKING (PENDING → PAID, ghi nhận thanh toán)
===================================================== */
exports.payBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body; // CASH | MOMO | ZALOPAY | BANK

        const [rows] = await db.query(
            "SELECT booking_id, total_amount, status FROM booking WHERE booking_id=?", [id]
        );
        if (!rows.length) return res.status(404).json({ message: "Booking không tồn tại" });
        if (rows[0].status === "CANCELED") return res.status(400).json({ message: "Vé đã bị huỷ" });
        if (rows[0].status === "PAID") return res.status(400).json({ message: "Vé đã được thanh toán" });

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query("UPDATE booking SET status='PAID' WHERE booking_id=?", [id]);
            // Ghi nhận vào bảng payment (map CASH→BANK nếu enum không có CASH)
            const payMethod = (method === "CASH") ? "BANK" : (method || "BANK");
            await conn.query(
                `INSERT INTO payment (booking_id, method, amount, status, payment_time)
                 VALUES (?, ?, ?, 'SUCCESS', NOW())`,
                [id, payMethod, rows[0].total_amount]
            );
            await conn.commit();
            res.json({ message: "Thanh toán thành công" });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error("PAY BOOKING ERROR:", err);
        res.status(500).json({ message: "Lỗi thanh toán" });
    }
};
