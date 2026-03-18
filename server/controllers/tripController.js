const db = require("../config/db");

/* ===============================
   BASE SELECT (ĐẾM GHẾ CHUẨN)
=============================== */
const baseSelect = `
    SELECT
        t.trip_id,
        r.origin,
        r.destination,
        r.distance_km,
        t.departure_time,
        t.arrival_time,
        t.base_price,
        t.status,
        b.bus_id,
        b.plate_number,
        b.bus_type,
        b.total_seats,
        o.operator_id,
        o.name AS operator_name,
        COUNT(DISTINCT bd.seat_id) AS booked_seats,
        (b.total_seats - COUNT(DISTINCT bd.seat_id)) AS available_seats,
        IFNULL(AVG(rv.rating), 0) AS avg_rating,
        COUNT(DISTINCT rv.review_id) AS review_count
    FROM trip t
    JOIN route r ON t.route_id = r.route_id
    JOIN bus b ON t.bus_id = b.bus_id
    JOIN bus_operator o ON b.operator_id = o.operator_id
    LEFT JOIN booking bk ON bk.trip_id = t.trip_id AND bk.status = 'PAID'
    LEFT JOIN booking_detail bd ON bd.booking_id = bk.booking_id
    LEFT JOIN review rv ON rv.trip_id = t.trip_id
`;

/* ===============================
   LẤY TẤT CẢ CHUYẾN XE
=============================== */
exports.getTrips = async (req, res) => {
    try {
        const { bus_id, operator_id } = req.query;
        let sql = baseSelect;
        const params = [];
        const wheres = [];
        if (bus_id)      { wheres.push("t.bus_id = ?");      params.push(bus_id); }
        if (operator_id) { wheres.push("o.operator_id = ?"); params.push(operator_id); }
        if (wheres.length) sql += " WHERE " + wheres.join(" AND ");
        sql += " GROUP BY t.trip_id ORDER BY t.departure_time ASC";
        const [result] = await db.query(sql, params);
        res.json(result);
    } catch (err) {
        console.error("GET TRIPS ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   SEARCH TRIP
=============================== */
exports.searchTrips = async (req, res) => {
    try {
        const { origin, destination, date, busType, sort } = req.query;
        let sql = baseSelect + " WHERE 1=1";
        const params = [];

        if (origin)      { sql += " AND r.origin LIKE ?";           params.push(`%${origin}%`); }
        if (destination) { sql += " AND r.destination LIKE ?";       params.push(`%${destination}%`); }
        if (date)        { sql += " AND DATE(t.departure_time) = ?"; params.push(date); }
        if (busType)     { sql += " AND b.bus_type = ?";             params.push(busType); }

        sql += " GROUP BY t.trip_id";
        if (sort === "asc")       sql += " ORDER BY t.base_price ASC";
        else if (sort === "desc") sql += " ORDER BY t.base_price DESC";
        else                      sql += " ORDER BY t.departure_time ASC";

        const [result] = await db.query(sql, params);
        res.json(result);
    } catch (err) {
        console.error("SEARCH ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   GET TRIP BY ID
=============================== */
exports.getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = baseSelect + " WHERE t.trip_id = ? GROUP BY t.trip_id";
        const [result] = await db.query(sql, [id]);
        if (result.length === 0) return res.status(404).json({ message: "Trip not found" });
        res.json(result[0]);
    } catch (err) {
        console.error("GET TRIP BY ID ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   CREATE TRIP (Operator)
=============================== */
exports.createTrip = async (req, res) => {
    try {
        const { route_id, bus_id, departure_time, arrival_time, base_price } = req.body;
        if (!route_id || !bus_id || !departure_time || !arrival_time || !base_price) {
            return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
        }
        const [result] = await db.query(
            `INSERT INTO trip (route_id, bus_id, departure_time, arrival_time, base_price, status)
             VALUES (?, ?, ?, ?, ?, 'OPEN')`,
            [route_id, bus_id, departure_time, arrival_time, base_price]
        );
        res.status(201).json({ message: "Tạo chuyến xe thành công", trip_id: result.insertId });
    } catch (err) {
        console.error("CREATE TRIP ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   UPDATE TRIP
=============================== */
exports.updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { route_id, bus_id, departure_time, arrival_time, base_price, status } = req.body;
        await db.query(
            `UPDATE trip SET route_id=?, bus_id=?, departure_time=?, arrival_time=?, base_price=?, status=?
             WHERE trip_id=?`,
            [route_id, bus_id, departure_time, arrival_time, base_price, status, id]
        );
        res.json({ message: "Cập nhật chuyến xe thành công" });
    } catch (err) {
        console.error("UPDATE TRIP ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   UPDATE TRIP STATUS
=============================== */
exports.updateTripStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query("UPDATE trip SET status=? WHERE trip_id=?", [status, id]);
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        console.error("UPDATE TRIP STATUS ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   UPDATE TRIP PRICE
=============================== */
exports.updateTripPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;
        await db.query("UPDATE trip SET base_price=? WHERE trip_id=?", [price, id]);
        res.json({ message: "Cập nhật giá thành công" });
    } catch (err) {
        console.error("UPDATE TRIP PRICE ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};

/* ===============================
   DELETE TRIP
=============================== */
exports.deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM trip WHERE trip_id=?", [id]);
        res.json({ message: "Xóa chuyến xe thành công" });
    } catch (err) {
        console.error("DELETE TRIP ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
};
