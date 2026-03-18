const express = require("express");
const router = express.Router();
const operatorController = require("../controllers/operatorController");

/* ── Admin CRUD ── */
router.get("/",    operatorController.getOperators);
router.post("/",   operatorController.createOperator);
router.put("/:id", operatorController.updateOperator);
router.delete("/:id", operatorController.deleteOperator);

/* ── Operator Dashboard ── */
router.get("/dashboard/stats",          operatorController.getDashboardStats);
router.get("/dashboard/revenue",        operatorController.getRevenue);
router.get("/dashboard/routes",         operatorController.getTopRoutes);
router.get("/dashboard/booking-status", operatorController.getBookingStatus);
router.get("/dashboard/seat-occupancy", operatorController.getSeatOccupancy);
router.get("/dashboard/recent-trips",   operatorController.getRecentTrips);
router.get("/dashboard/buses",          operatorController.getBuses);
router.get("/dashboard/reviews",        operatorController.getReviews);
router.get("/dashboard/payments",       operatorController.getPayments);
router.get("/dashboard/bookings",       operatorController.getBookingsSummary);

module.exports = router;
