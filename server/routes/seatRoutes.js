const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");

/* GET seats by trip  — /api/seats/trip/:tripId */
router.get("/trip/:tripId",           seatController.getSeatsByTrip);

/* POST generate seats — /api/seats/generate/:tripId */
router.post("/generate/:tripId",      seatController.generateSeats);

/* PUT update seat    — /api/seats/:id */
router.put("/:id",                    seatController.updateSeat);

module.exports = router;
