const db = require("../config/db");

/* ===============================
   THỐNG KÊ TỔNG QUAN
=============================== */
exports.getStats = async (req, res) => {
    try {
        const sql = `
            SELECT
                (SELECT IFNULL(SUM(total_amount),0) FROM booking WHERE status='PAID') AS totalRevenue,
                (SELECT COUNT(*) FROM booking)                                         AS totalBookings,
                (SELECT COUNT(*) FROM users)                                           AS totalUsers,
                (SELECT COUNT(*) FROM bus_operator WHERE status='ACTIVE')              AS totalOperators
        `;
        const [result] = await db.query(sql);
        res.json(result[0]);
    } catch (err) {
        console.error("GET STATS ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* ===============================
   DOANH THU 6 THÁNG
=============================== */
exports.getRevenue6Months = async (req, res) => {
    try {
        const sql = `
            SELECT
                DATE_FORMAT(booking_time,'%m/%Y') AS month,
                SUM(total_amount)                  AS revenue
            FROM booking
            WHERE status='PAID'
              AND booking_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY booking_time
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error("GET REVENUE ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* ===============================
   ĐẶT VÉ THEO NGÀY
=============================== */
exports.getBookingsPerDay = async (req, res) => {
    try {
        const sql = `
            SELECT DATE(booking_time) AS date, COUNT(*) AS count
            FROM booking
            GROUP BY date
            ORDER BY date DESC
            LIMIT 10
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error("GET BOOKINGS PER DAY ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* ===============================
   TUYẾN PHỔ BIẾN
=============================== */
exports.getTopRoutes = async (req, res) => {
    try {
        const sql = `
            SELECT
                CONCAT(r.origin,' - ',r.destination) AS route,
                COUNT(b.booking_id)                  AS count
            FROM booking b
            JOIN trip t ON b.trip_id = t.trip_id
            JOIN route r ON t.route_id = r.route_id
            GROUP BY r.route_id
            ORDER BY count DESC
            LIMIT 5
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error("GET TOP ROUTES ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

/* ===============================
   REVIEW GẦN ĐÂY
=============================== */
exports.getReviews = async (req, res) => {
    try {
        const sql = `
            SELECT u.full_name AS user, rv.rating, rv.comment
            FROM review rv
            JOIN users u ON rv.user_id = u.user_id
            ORDER BY rv.created_at DESC
            LIMIT 5
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error("GET REVIEWS ERROR:", err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getTopAIRecommendations = async (req, res) => {
    try {
        const sql = `
            SELECT
                CONCAT(r.origin,' - ',r.destination) AS route,
                COUNT(ar.recommend_id)               AS count
            FROM ai_recommendation ar
            JOIN trip t ON ar.trip_id = t.trip_id
            JOIN route r ON t.route_id = r.route_id
            GROUP BY r.route_id
            ORDER BY count DESC
            LIMIT 5
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getTopActiveUsers = async (req, res) => {
    try {
        const sql = `
            SELECT u.full_name, COUNT(ub.behavior_id) AS actions
            FROM user_behavior ub
            JOIN users u ON ub.user_id = u.user_id
            GROUP BY ub.user_id
            ORDER BY actions DESC
            LIMIT 5
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getPeakBookingHour = async (req, res) => {
    try {
        const sql = `
            SELECT HOUR(booking_time) AS hour, COUNT(*) AS count
            FROM booking
            GROUP BY hour
            ORDER BY hour
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getBusOccupancy = async (req, res) => {
    try {
        const sql = `
            SELECT
                b.bus_id,
                b.total_seats,
                COUNT(bd.booking_detail_id) AS booked
            FROM bus b
            LEFT JOIN trip t ON b.bus_id = t.bus_id
            LEFT JOIN booking bk ON bk.trip_id = t.trip_id
            LEFT JOIN booking_detail bd ON bd.booking_id = bk.booking_id
            GROUP BY b.bus_id
        `;
        const [result] = await db.query(sql);
        const data = result.map(r => ({
            bus: r.bus_id,
            rate: ((r.booked || 0) / r.total_seats * 100).toFixed(1)
        }));
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getTripStatus = async (req, res) => {
    try {
        const sql = "SELECT status, COUNT(*) AS count FROM trip GROUP BY status";
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

exports.getGrowthRate = async (req, res) => {
    try {
        const sql = `
            SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, COUNT(*) AS users
            FROM users
            GROUP BY month
            ORDER BY month
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DB error" });
    }
};

/* ===============================
   BOOKING STATUS BREAKDOWN
=============================== */
exports.getBookingStatus = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT status, COUNT(*) AS count FROM booking GROUP BY status");
        const result = {};
        rows.forEach(r => { result[r.status.toLowerCase()] = r.count; });
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   PAYMENT METHODS
=============================== */
exports.getPaymentMethods = async (req, res) => {
    try {
        // Fallback if no payment table — return booking count by status
        const [rows] = await db.query("SELECT status, COUNT(*) AS count FROM booking GROUP BY status");
        res.json(rows);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   REVENUE 12 MONTHS
=============================== */
exports.getRevenue12Months = async (req, res) => {
    try {
        const sql = `
            SELECT DATE_FORMAT(booking_time,'%m/%Y') AS month, SUM(total_amount) AS revenue
            FROM booking
            WHERE status='PAID' AND booking_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month ORDER BY booking_time
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   REVENUE BY OPERATOR
=============================== */
exports.getRevenueByOperator = async (req, res) => {
    try {
        const sql = `
            SELECT o.name AS operator, SUM(b.total_amount) AS revenue
            FROM booking b
            JOIN trip t ON b.trip_id = t.trip_id
            JOIN bus bs ON t.bus_id = bs.bus_id
            JOIN bus_operator o ON bs.operator_id = o.operator_id
            WHERE b.status='PAID'
            GROUP BY o.operator_id ORDER BY revenue DESC LIMIT 8
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   REVENUE BY BUS TYPE
=============================== */
exports.getRevenueByBusType = async (req, res) => {
    try {
        const sql = `
            SELECT bs.bus_type AS type, SUM(b.total_amount) AS revenue, COUNT(b.booking_id) AS bookings
            FROM booking b
            JOIN trip t ON b.trip_id = t.trip_id
            JOIN bus bs ON t.bus_id = bs.bus_id
            WHERE b.status='PAID'
            GROUP BY bs.bus_type ORDER BY revenue DESC
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   RECENT TRIPS
=============================== */
exports.getRecentTrips = async (req, res) => {
    try {
        const sql = `
            SELECT t.trip_id, r.origin, r.destination, t.departure_time, t.status,
                   o.name AS operator_name, b.total_seats,
                   (b.total_seats - COUNT(DISTINCT bd.seat_id)) AS available_seats
            FROM trip t
            JOIN route r ON t.route_id = r.route_id
            JOIN bus b ON t.bus_id = b.bus_id
            JOIN bus_operator o ON b.operator_id = o.operator_id
            LEFT JOIN booking bk ON bk.trip_id = t.trip_id AND bk.status='PAID'
            LEFT JOIN booking_detail bd ON bd.booking_id = bk.booking_id
            GROUP BY t.trip_id ORDER BY t.departure_time DESC LIMIT 10
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   RECENT USERS
=============================== */
exports.getRecentUsers = async (req, res) => {
    try {
        const [result] = await db.query(
            "SELECT user_id, full_name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 10"
        );
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   USER STATS
=============================== */
exports.getUserStats = async (req, res) => {
    try {
        const sql = `
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN role='PASSENGER' THEN 1 ELSE 0 END) AS passengers,
                SUM(CASE WHEN role='OPERATOR' THEN 1 ELSE 0 END)  AS operators,
                SUM(CASE WHEN role='ADMIN' THEN 1 ELSE 0 END)     AS admins,
                SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END)  AS active,
                SUM(CASE WHEN status!='ACTIVE' THEN 1 ELSE 0 END) AS inactive
            FROM users
        `;
        const [[result]] = await db.query(sql);
        res.json(result);
    } catch (err) { res.status(500).json({ message: "DB error" }); }
};

/* ===============================
   USER BEHAVIOR
=============================== */
exports.getUserBehavior = async (req, res) => {
    try {
        const sql = `
            SELECT action, COUNT(*) AS count
            FROM user_behavior
            GROUP BY action ORDER BY count DESC LIMIT 8
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        // table may not exist yet
        res.json([]);
    }
};

/* ===============================
   AI STATS
=============================== */
exports.getAIStats = async (req, res) => {
    try {
        const sql = `
            SELECT COUNT(*) AS total_recommendations
            FROM ai_recommendation
        `;
        const [[result]] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.json({ total_recommendations: 0 });
    }
};
