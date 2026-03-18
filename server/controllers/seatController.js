const db = require("../config/db");

/* ===============================
   LẤY GHẾ THEO TRIP
=============================== */
exports.getSeatsByTrip = async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const sql = `
            SELECT
                s.seat_id,
                s.seat_number,
                s.seat_type,
                CASE WHEN COUNT(bd.seat_id) > 0 THEN 1 ELSE 0 END AS isBooked
            FROM trip t
            JOIN bus b ON t.bus_id = b.bus_id
            JOIN seat s ON s.bus_id = b.bus_id
            LEFT JOIN booking bk ON bk.trip_id = t.trip_id AND bk.status IN ('CONFIRMED','PAID')
            LEFT JOIN booking_detail bd ON bd.booking_id = bk.booking_id AND bd.seat_id = s.seat_id
            WHERE t.trip_id = ?
            GROUP BY s.seat_id, s.seat_number, s.seat_type
            ORDER BY LENGTH(s.seat_number), s.seat_number
        `;
        const [result] = await db.query(sql, [tripId]);
        res.json(result);
    } catch (err) {
        console.error("SEAT ERROR:", err);
        res.status(500).json({ message: "Seat error" });
    }
};

/* ===============================
   UPDATE SEAT (type, status)
=============================== */
exports.updateSeat = async (req, res) => {
    try {
        const { id } = req.params;
        const { seat_type } = req.body;
        await db.query("UPDATE seat SET seat_type=? WHERE seat_id=?", [seat_type, id]);
        res.json({ message: "Cập nhật ghế thành công" });
    } catch (err) {
        console.error("UPDATE SEAT ERROR:", err);
        res.status(500).json({ message: "Update seat failed" });
    }
};

/* ===============================
   GENERATE GHẾ THEO TOTAL_SEATS
=============================== */
exports.generateSeats = async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const [[busInfo]] = await db.query(
            "SELECT b.bus_id, b.total_seats FROM trip t JOIN bus b ON t.bus_id = b.bus_id WHERE t.trip_id = ?",
            [tripId]
        );
        if (!busInfo) return res.status(404).json({ message: "Không tìm thấy xe" });

        const { bus_id, total_seats } = busInfo;
        const [[check]] = await db.query("SELECT COUNT(*) AS count FROM seat WHERE bus_id=?", [bus_id]);
        if (check.count > 0) return res.json({ message: "Ghế đã tồn tại" });

        const cols = ["A", "B", "C", "D"];
        const rows = Math.ceil(total_seats / 4);
        const seats = [];
        let created = 0;

        for (let r = 1; r <= rows && created < total_seats; r++) {
            for (let c = 0; c < cols.length && created < total_seats; c++) {
                seats.push([bus_id, cols[c] + r, r <= 2 ? "VIP" : "NORMAL"]);
                created++;
            }
        }

        await db.query("INSERT INTO seat (bus_id, seat_number, seat_type) VALUES ?", [seats]);
        res.json({ message: "Tạo ghế thành công", total: seats.length });
    } catch (err) {
        console.error("GENERATE SEATS ERROR:", err);
        res.status(500).json({ message: "Lỗi tạo ghế" });
    }
};
