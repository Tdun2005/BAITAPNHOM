console.log("🔥 ĐANG CHẠY SERVER ĐÚNG FILE");

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

/* ================= DATABASE ================= */
const db = require("./config/db");

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FRONTEND ================= */
app.use(express.static(path.join(__dirname, "../public")));

/* ================= ROUTES ================= */
const authRoutes     = require("./routes/authRoutes");
const tripRoutes     = require("./routes/tripRoutes");
const bookingRoutes  = require("./routes/bookingRoutes");
const userRoutes     = require("./routes/userRoutes");
const reviewRoutes   = require("./routes/reviewRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const supportRoutes  = require("./routes/supportRoutes");
const seatRoutes     = require("./routes/seatRoutes");
const busRoutes      = require("./routes/busRoutes");

/* ================= USE ROUTES ================= */
app.use("/api/auth",      authRoutes);
app.use("/api/trips",     tripRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/reviews",   reviewRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/support",   supportRoutes);
app.use("/api/seats",     seatRoutes);
app.use("/api/buses",     busRoutes);

/* ================= DB TEST ================= */
app.get("/api/db-test", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1");
        res.json({ status: "success", message: "Database connected", data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Database connection failed" });
    }
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/auth/login.html"));
});

/* ================= DEBUG REQUEST LOG ================= */
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
    res.status(404).json({ message: "API not found" });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
});

/* ================= START SERVER ================= */
const PORT = 2704;
app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 SmartBus Server Running");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("=================================");
});
