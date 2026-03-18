const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");

/* ── Overview ── */
router.get("/stats",               admin.getStats);

/* ── Revenue ── */
router.get("/revenue-6months",     admin.getRevenue6Months);
router.get("/revenue-12months",    admin.getRevenue12Months);
router.get("/revenue-by-operator", admin.getRevenueByOperator);
router.get("/revenue-by-bustype",  admin.getRevenueByBusType);

/* ── Bookings ── */
router.get("/bookings-per-day",    admin.getBookingsPerDay);
router.get("/booking-status",      admin.getBookingStatus);

/* ── Routes & Trips ── */
router.get("/top-routes",          admin.getTopRoutes);
router.get("/trip-status",         admin.getTripStatus);
router.get("/recent-trips",        admin.getRecentTrips);

/* ── Users ── */
router.get("/growth-rate",         admin.getGrowthRate);
router.get("/top-users",           admin.getTopActiveUsers);
router.get("/recent-users",        admin.getRecentUsers);
router.get("/user-stats",          admin.getUserStats);

/* ── Operations ── */
router.get("/peak-hours",          admin.getPeakBookingHour);
router.get("/bus-occupancy",       admin.getBusOccupancy);
router.get("/payment-methods",     admin.getPaymentMethods);

/* ── Reviews ── */
router.get("/reviews",             admin.getReviews);

/* ── AI ── */
router.get("/ai-top-routes",       admin.getTopAIRecommendations);
router.get("/user-behavior",       admin.getUserBehavior);
router.get("/ai-stats",            admin.getAIStats);

module.exports = router;
