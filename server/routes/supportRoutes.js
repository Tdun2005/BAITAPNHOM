const express = require("express");
const router  = express.Router();
const supportController = require("../controllers/supportController");

/*
  Base mount trong server.js phải là:
    app.use("/api/support", supportRoutes);

  Khi đó các endpoint đầy đủ sẽ là:
  ┌────────────────────────────────────────────────────────────────┐
  │ POST   /api/support/requests          ← hotro.html gửi yêu cầu│
  │ GET    /api/support/user/:user_id     ← hotro.html xem my reqs │
  │ GET    /api/support/requests          ← support.html admin      │
  │ PUT    /api/support/requests/:id      ← support.html reply      │
  └────────────────────────────────────────────────────────────────┘
*/

// ── Người dùng (passenger) ──────────────────────────────
// Gửi yêu cầu hỗ trợ mới
router.post("/requests", supportController.createRequest);

// Xem danh sách yêu cầu của chính mình
router.get("/user/:user_id", supportController.getUserRequests);

// ── Admin ───────────────────────────────────────────────
// Xem tất cả yêu cầu (dùng GET /requests thay vì /admin/all
// để khớp với support.html đang gọi /api/support/requests)
router.get("/requests", supportController.getAllRequests);

// Admin phản hồi / cập nhật trạng thái
// hotro.html & support.html đều dùng PUT /api/support/requests/:id
router.put("/requests/:id", supportController.replyRequest);

module.exports = router;