const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");

/* GET all buses — /api/buses?operator_id=X */
router.get("/",            busController.getBuses);

/* POST create bus */
router.post("/",           busController.createBus);

/* PUT update status — specific before /:id */
router.put("/status/:id",  busController.updateBusStatus);

/* GET bus by id */
router.get("/:id",         busController.getBusById);

/* PUT update bus */
router.put("/:id",         busController.updateBus);

/* DELETE bus */
router.delete("/:id",      busController.deleteBus);

module.exports = router;
