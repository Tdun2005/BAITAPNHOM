# 🚍 SmartBusAI – Hệ thống đặt vé xe trực tuyến tích hợp AI-Agent

## 📌 Giới thiệu

**SmartBusAI** là hệ thống đặt vé xe trực tuyến thông minh, cho phép người dùng tìm kiếm chuyến xe, đặt vé, thanh toán và nhận gợi ý cá nhân hóa từ **AI-Agent**.

Hệ thống được thiết kế theo mô hình **Client – Server**, sử dụng:

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js (Express)
* **Database**: MySQL
* **AI Module**: Gợi ý chuyến đi dựa trên hành vi người dùng

---

## 🎯 Tính năng chính

### 👤 Người dùng (Passenger)

* Đăng ký / Đăng nhập
* Tìm kiếm chuyến xe theo tuyến
* Chọn ghế trực quan (seat map)
* Đặt vé & thanh toán
* Xem lịch sử đặt vé
* Đánh giá chuyến đi
* Nhận gợi ý chuyến từ AI

### 🏢 Nhà xe (Operator)

* Quản lý xe
* Quản lý chuyến đi
* Quản lý đặt vé
* Xem doanh thu

### 🛠️ Admin

* Quản lý người dùng
* Quản lý nhà xe
* Xử lý yêu cầu hỗ trợ
* Theo dõi hệ thống

### 🤖 AI-Agent

* Phân tích hành vi người dùng
* Đưa ra gợi ý chuyến đi phù hợp
* Cá nhân hóa trải nghiệm

---

## 🧠 Kiến trúc hệ thống

```
Frontend (HTML/CSS/JS)
        ↓
Backend (Node.js + Express)
        ↓
Database (MySQL)
        ↓
AI Recommendation Module
```

---

## 🗄️ Thiết kế cơ sở dữ liệu (ERD)

Hệ thống bao gồm các bảng chính:

* `USER` – Người dùng
* `BUS_OPERATOR` – Nhà xe
* `BUS` – Xe
* `SEAT` – Ghế
* `ROUTE` – Tuyến đường
* `TRIP` – Chuyến đi
* `BOOKING` – Đặt vé
* `BOOKING_DETAIL` – Chi tiết vé
* `PAYMENT` – Thanh toán
* `REVIEW` – Đánh giá
* `USER_BEHAVIOR` – Hành vi người dùng
* `AI_RECOMMENDATION` – Gợi ý AI
* `SUPPORT_REQUEST` – Yêu cầu hỗ trợ

👉 Quan hệ chính:

* 1 User → nhiều Booking
* 1 Bus → nhiều Seat
* 1 Route → nhiều Trip
* 1 Booking → nhiều Seat
* AI dựa vào `USER_BEHAVIOR` để tạo `AI_RECOMMENDATION`

---

## ⚙️ Cài đặt & chạy dự án

### 1. Clone project

```bash
git clone <repo-url>
cd smartbusai
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình database

Tạo database:

```sql
CREATE DATABASE smartbusai;
```

Import file SQL (nếu có)

Cập nhật file:

```
/config/db.js
```

```js
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartbusai",
    port: 3306
});
```

---

### 4. Chạy server

```bash
node server.js
```

Server chạy tại:

```
http://localhost:2704
```

---

## 📁 Cấu trúc thư mục

```
smartbusai/
│
├── config/
│   └── db.js
│
├── controllers/
│   └── busController.js
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── data/
│   └── pages/
│       ├── admin/
│       ├── operator/
│       └── ...
│
├── server.js
├── package.json
└── README.md
```

---

## 🔌 API tiêu biểu

### 🚍 Bus

* `GET /api/bus` – Lấy danh sách xe
* `GET /api/bus/:id` – Lấy chi tiết xe
* `POST /api/bus` – Tạo xe

### 📅 Trip

* `GET /api/trips`
* `POST /api/trips`

### 🎟️ Booking

* `POST /api/bookings`
* `GET /api/bookings/:user_id`

### 💳 Payment

* `POST /api/payment`

---

## 🧩 AI Recommendation (Cốt lõi đề tài)

### Cách hoạt động:

1. Thu thập hành vi:

   * Tìm kiếm
   * Đặt vé
   * Click

2. Lưu vào:

```
USER_BEHAVIOR
```

3. Phân tích:

* Tuyến hay đi
* Thời gian đặt vé
* Giá phù hợp

4. Sinh gợi ý:

```
AI_RECOMMENDATION
```

---

## 🎨 Giao diện nổi bật

* Sơ đồ ghế trực quan
* UI đặt vé hiện đại
* Dashboard quản lý
* Chat/AI hướng dẫn (nếu có)

---

## 🚀 Hướng phát triển

* Tích hợp chatbot AI (GPT API)
* Gợi ý nâng cao bằng Machine Learning
* Thanh toán online (Momo, ZaloPay)
* App mobile (React Native / Flutter)
* Realtime tracking (GPS xe)

---

## 👨‍💻 Nhóm phát triển

* Sinh viên thực hiện đồ án
* Chuyên ngành: Công nghệ thông tin

---

## 📄 License

Dự án phục vụ mục đích học tập và nghiên cứu.

---




