const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

/* GET all bookings  — /api/bookings */
router.get("/",          bookingController.getAllBookings);

/* GET by user       — /api/bookings/user/:id */
router.get("/user/:id",  bookingController.getBookingsByUser);

/* POST create       — /api/bookings */
router.post("/",         bookingController.createBooking);

/* POST pay           — /api/bookings/:id/pay  (before /:id to avoid clash) */
router.post("/:id/pay",  bookingController.payBooking);

/* PUT update status — /api/bookings/:id */
router.put("/:id",       bookingController.updateBookingStatus);

module.exports = router;
