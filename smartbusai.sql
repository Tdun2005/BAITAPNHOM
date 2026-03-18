-- =====================================================
--  SmartBusAI — Full Database Schema
--  Khớp 100% với ERD
--  Chạy lệnh: mysql -u root -p smartbusai < smartbusai.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS smartbusai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartbusai;

-- ─────────────────────────────────────────
--  1. BUS_OPERATOR
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus_operator (
  operator_id INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150) NOT NULL,
  address     VARCHAR(255),
  phone       VARCHAR(20),
  email       VARCHAR(100) UNIQUE,
  status      ENUM('ACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  2. BUS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus (
  bus_id       INT          NOT NULL AUTO_INCREMENT,
  operator_id  INT          NOT NULL,
  plate_number VARCHAR(20)  NOT NULL UNIQUE,
  bus_type     VARCHAR(50)  NOT NULL,
  total_seats  INT          NOT NULL DEFAULT 40,
  status       ENUM('AVAILABLE','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  PRIMARY KEY (bus_id),
  FOREIGN KEY (operator_id) REFERENCES bus_operator(operator_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  3. ROUTE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route (
  route_id    INT          NOT NULL AUTO_INCREMENT,
  origin      VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  distance_km FLOAT,
  PRIMARY KEY (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  4. SEAT
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seat (
  seat_id     INT         NOT NULL AUTO_INCREMENT,
  bus_id      INT         NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_type   ENUM('NORMAL','VIP') NOT NULL DEFAULT 'NORMAL',
  PRIMARY KEY (seat_id),
  UNIQUE KEY uq_bus_seat (bus_id, seat_number),
  FOREIGN KEY (bus_id) REFERENCES bus(bus_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  5. USERS  (mở rộng từ ERD, thêm các trường hồ sơ)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id        INT          NOT NULL AUTO_INCREMENT,
  username       VARCHAR(50)  UNIQUE,
  full_name      VARCHAR(150) NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  gender         ENUM('MALE','FEMALE','OTHER'),
  birth_date     DATE,
  province       VARCHAR(100),
  district       VARCHAR(100),
  address_detail VARCHAR(255),
  role           ENUM('PASSENGER','OPERATOR','ADMIN') NOT NULL DEFAULT 'PASSENGER',
  status         ENUM('ACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  6. TRIP
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip (
  trip_id        INT      NOT NULL AUTO_INCREMENT,
  bus_id         INT      NOT NULL,
  route_id       INT      NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time   DATETIME NOT NULL,
  base_price     FLOAT    NOT NULL,
  status         ENUM('OPEN','FULL','CANCELED') NOT NULL DEFAULT 'OPEN',
  PRIMARY KEY (trip_id),
  FOREIGN KEY (bus_id)   REFERENCES bus(bus_id)   ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES route(route_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  7. BOOKING
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking (
  booking_id   INT      NOT NULL AUTO_INCREMENT,
  user_id      INT      NOT NULL,
  trip_id      INT      NOT NULL,
  booking_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount FLOAT    NOT NULL,
  status       ENUM('PENDING','PAID','CANCELED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (booking_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trip(trip_id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  8. BOOKING_DETAIL
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_detail (
  booking_detail_id INT   NOT NULL AUTO_INCREMENT,
  booking_id        INT   NOT NULL,
  seat_id           INT   NOT NULL,
  price             FLOAT NOT NULL,
  PRIMARY KEY (booking_detail_id),
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id)    REFERENCES seat(seat_id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  9. REVIEW
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review (
  review_id  INT  NOT NULL AUTO_INCREMENT,
  user_id    INT  NOT NULL,
  trip_id    INT  NOT NULL,
  rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE KEY uq_user_trip_review (user_id, trip_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trip(trip_id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  10. USER_BEHAVIOR
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_behavior (
  behavior_id INT         NOT NULL AUTO_INCREMENT,
  user_id     INT         NOT NULL,
  action      VARCHAR(100) NOT NULL,
  action_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (behavior_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  11. PAYMENT
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment (
  payment_id   INT   NOT NULL AUTO_INCREMENT,
  booking_id   INT   NOT NULL,
  method       ENUM('BANK','MOMO','ZALOPAY') NOT NULL,
  amount       FLOAT NOT NULL,
  status       ENUM('SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
  payment_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  12. SUPPORT_REQUEST
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_request (
  request_id  INT  NOT NULL AUTO_INCREMENT,
  user_id     INT  NOT NULL,
  booking_id  INT,
  type        ENUM('GENERAL','BOOKING','PAYMENT','REFUND','TECHNICAL','COMPLAINT','OTHER') NOT NULL DEFAULT 'GENERAL',
  title       VARCHAR(255) NOT NULL,
  content     TEXT         NOT NULL,
  status      ENUM('PENDING','PROCESSING','RESOLVED','CLOSED') NOT NULL DEFAULT 'PENDING',
  admin_reply TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (request_id),
  FOREIGN KEY (user_id)    REFERENCES users(user_id)     ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  13. AI_RECOMMENDATION
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_recommendation (
  recommend_id INT   NOT NULL AUTO_INCREMENT,
  user_id      INT   NOT NULL,
  trip_id      INT   NOT NULL,
  score        FLOAT NOT NULL DEFAULT 0,
  reason       TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (recommend_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trip(trip_id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================
--  SAMPLE DATA — Dữ liệu mẫu để test
-- =====================================================

-- ── Bus Operators ──
INSERT IGNORE INTO bus_operator (operator_id, name, address, phone, email, status) VALUES
(1, 'Phương Trang',    '1A Nguyễn Văn Cừ, Quận 1, TP.HCM',   '0283822222', 'futa@smartbusai.vn',      'ACTIVE'),
(2, 'Hoàng Long',      '18 Lê Văn Lương, Hà Nội',              '02438226688', 'hoanlong@smartbusai.vn', 'ACTIVE'),
(3, 'Thành Bưởi',      '265 Điện Biên Phủ, TP.HCM',            '02838336333', 'thanbuoi@smartbusai.vn', 'ACTIVE'),
(4, 'Sao Việt',        '40 Trần Phú, Đà Nẵng',                 '02363636363', 'saoviet@smartbusai.vn',  'ACTIVE'),
(5, 'Kumho Samco',     '97 Lý Thường Kiệt, Quận 10, TP.HCM',  '02838394141', 'kumho@smartbusai.vn',    'ACTIVE'),
(6, 'Mai Linh Express','64 Cách Mạng Tháng 8, TP.HCM',         '02838440404', 'mailinh@smartbusai.vn',  'ACTIVE'),
(7, 'Hà Sơn – Hải Vân','99 Nguyễn Trãi, Hà Nội',              '02432123456', 'hason@smartbusai.vn',    'ACTIVE'),
(8, 'An Phú Limousine', '5 Phan Đình Phùng, Đà Lạt',           '02633823823', 'anphu@smartbusai.vn',    'SUSPENDED');

-- ── Buses ──
INSERT IGNORE INTO bus (bus_id, operator_id, plate_number, bus_type, total_seats, status) VALUES
(1,  1, '51B-11111', 'Sleeper',   40, 'AVAILABLE'),
(2,  1, '51B-22222', 'Limousine', 34, 'AVAILABLE'),
(3,  2, '30A-33333', 'Sleeper',   40, 'AVAILABLE'),
(4,  2, '30A-44444', 'VIP',       28, 'AVAILABLE'),
(5,  3, '51B-55555', 'Express',   44, 'AVAILABLE'),
(6,  3, '51B-66666', 'Sleeper',   36, 'MAINTENANCE'),
(7,  4, '43C-77777', 'Sleeper',   40, 'AVAILABLE'),
(8,  4, '43C-88888', 'Limousine', 34, 'AVAILABLE'),
(9,  5, '51C-99999', 'VIP',       28, 'AVAILABLE'),
(10, 5, '51C-10101', 'Express',   44, 'AVAILABLE'),
(11, 6, '79B-11211', 'Sleeper',   36, 'AVAILABLE'),
(12, 7, '29B-22322', 'VIP',       28, 'AVAILABLE'),
(13, 8, '49A-33433', 'Limousine', 34, 'AVAILABLE');

-- ── Routes ──
INSERT IGNORE INTO route (route_id, origin, destination, distance_km) VALUES
( 1, 'Hà Nội',    'TP.HCM',   1726),
( 2, 'Hà Nội',    'Đà Nẵng',   791),
( 3, 'TP.HCM',    'Đà Lạt',    300),
( 4, 'TP.HCM',    'Cần Thơ',   180),
( 5, 'TP.HCM',    'Vũng Tàu',  125),
( 6, 'Hà Nội',    'Hải Phòng', 105),
( 7, 'Hà Nội',    'Sapa',      320),
( 8, 'Đà Nẵng',   'Huế',        97),
( 9, 'Đà Nẵng',   'Hội An',     30),
(10, 'TP.HCM',    'Phan Thiết', 200),
(11, 'TP.HCM',    'Nha Trang',  440),
(12, 'Hà Nội',    'Ninh Bình', 100),
(13, 'Cần Thơ',   'Cà Mau',    180);

-- ── Users ──
INSERT IGNORE INTO users
  (user_id, username, full_name, email, password_hash, phone, gender, role, status, created_at)
VALUES
(1, 'admin',    'Admin SmartBus',  'admin@smartbusai.vn',    '123456', '0901000001', 'MALE',   'ADMIN',     'ACTIVE', NOW()),
(2, 'operator1','Trần Văn Hùng',   'operator@smartbusai.vn', '123456', '0902000002', 'MALE',   'OPERATOR',  'ACTIVE', NOW()),
(3, 'user1',    'Nguyễn Thị Lan',  'lan@gmail.com',          '123456', '0903000003', 'FEMALE', 'PASSENGER', 'ACTIVE', NOW());

-- ── Generate seats for buses 1-13 (4 cols A-D, rows until total_seats) ──
-- Thay vì chạy vòng lặp, dùng stored procedure tạm thời:
DROP PROCEDURE IF EXISTS sp_generate_seats;
DELIMITER $$
CREATE PROCEDURE sp_generate_seats()
BEGIN
  DECLARE v_bus_id    INT;
  DECLARE v_total     INT;
  DECLARE v_row       INT;
  DECLARE v_col       CHAR(1);
  DECLARE v_created   INT;
  DECLARE done        INT DEFAULT 0;
  DECLARE cur CURSOR FOR SELECT bus_id, total_seats FROM bus;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_bus_id, v_total;
    IF done THEN LEAVE read_loop; END IF;
    -- Skip nếu đã có ghế
    IF (SELECT COUNT(*) FROM seat WHERE bus_id = v_bus_id) = 0 THEN
      SET v_row = 1;
      SET v_created = 0;
      WHILE v_created < v_total DO
        SET v_col = 'A';
        WHILE v_col <= 'D' AND v_created < v_total DO
          INSERT IGNORE INTO seat (bus_id, seat_number, seat_type)
          VALUES (v_bus_id, CONCAT(v_col, v_row),
                  IF(v_row <= 2, 'VIP', 'NORMAL'));
          SET v_created = v_created + 1;
          SET v_col = CHAR(ASCII(v_col) + 1);
        END WHILE;
        SET v_row = v_row + 1;
      END WHILE;
    END IF;
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;
CALL sp_generate_seats();
DROP PROCEDURE IF EXISTS sp_generate_seats;

-- ── Trips ──
INSERT IGNORE INTO trip (trip_id, bus_id, route_id, departure_time, arrival_time, base_price, status) VALUES
(1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY),    DATE_ADD(NOW(), INTERVAL 2 DAY),    450000, 'OPEN'),
(2, 2, 2, DATE_ADD(NOW(), INTERVAL 2 HOUR),   DATE_ADD(NOW(), INTERVAL 14 HOUR),  280000, 'OPEN'),
(3, 5, 3, DATE_ADD(NOW(), INTERVAL 3 HOUR),   DATE_ADD(NOW(), INTERVAL 9 HOUR),   220000, 'OPEN'),
(4, 9, 4, DATE_ADD(NOW(), INTERVAL 1 HOUR),   DATE_ADD(NOW(), INTERVAL 4 HOUR),   150000, 'OPEN'),
(5, 3, 5, DATE_ADD(NOW(), INTERVAL 4 HOUR),   DATE_ADD(NOW(), INTERVAL 6 HOUR),   130000, 'OPEN'),
(6, 7, 6, DATE_ADD(NOW(), INTERVAL 5 HOUR),   DATE_ADD(NOW(), INTERVAL 7 HOUR),   120000, 'OPEN'),
(7, 4, 7, DATE_ADD(NOW(), INTERVAL 6 HOUR),   DATE_ADD(NOW(), INTERVAL 11 HOUR),  250000, 'OPEN'),
(8, 11,11, DATE_ADD(NOW(), INTERVAL -2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR),   380000, 'CANCELED');

-- ── Bookings ──
INSERT IGNORE INTO booking (booking_id, user_id, trip_id, booking_time, total_amount, status) VALUES
(1,  3, 1, DATE_SUB(NOW(), INTERVAL 3 DAY),  450000, 'PAID'),
(2,  3, 2, DATE_SUB(NOW(), INTERVAL 2 DAY),  560000, 'PAID'),
(3,  3, 3, DATE_SUB(NOW(), INTERVAL 1 DAY),  220000, 'CANCELED'),
(4,  3, 4, DATE_SUB(NOW(), INTERVAL 5 DAY),  300000, 'PAID'),
(5,  3, 5, DATE_SUB(NOW(), INTERVAL 6 DAY),  130000, 'PAID'),
(6,  3, 6, DATE_SUB(NOW(), INTERVAL 7 DAY),  240000, 'PAID'),
(7,  3, 7, DATE_SUB(NOW(), INTERVAL 8 DAY),  500000, 'PAID'),
(8,  3, 1, DATE_SUB(NOW(), INTERVAL 9 DAY),  450000, 'PAID'),
(9,  3, 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 280000, 'PAID'),
(10, 3, 3, DATE_SUB(NOW(), INTERVAL 11 DAY), 220000, 'PAID');

-- ── Booking details (ghế từ booking) ──
INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 1, seat_id, 450000 FROM seat WHERE bus_id=1 AND seat_number IN ('A1','B1') LIMIT 2;

INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 2, seat_id, 280000 FROM seat WHERE bus_id=2 AND seat_number IN ('A1','B1','C1','D1') LIMIT 4;

INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 4, seat_id, 150000 FROM seat WHERE bus_id=9 AND seat_number IN ('A1','B1') LIMIT 2;

INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 5, seat_id, 130000 FROM seat WHERE bus_id=3 AND seat_number IN ('A1') LIMIT 1;

INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 6, seat_id, 120000 FROM seat WHERE bus_id=7 AND seat_number IN ('A1','B1') LIMIT 2;

INSERT IGNORE INTO booking_detail (booking_id, seat_id, price)
SELECT 7, seat_id, 250000 FROM seat WHERE bus_id=4 AND seat_number IN ('A1','B1') LIMIT 2;

-- ── Reviews ──
INSERT IGNORE INTO review (review_id, user_id, trip_id, rating, comment, created_at) VALUES
(1, 3, 1, 5, 'Xe rất sạch, lái xe thân thiện, đúng giờ!', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 3, 2, 4, 'Dịch vụ tốt nhưng hơi trễ 15 phút.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 3, 4, 5, 'Tuyệt vời, sẽ đặt lại lần sau.', NOW());

-- ── Payments ──
INSERT IGNORE INTO payment (payment_id, booking_id, method, amount, status, payment_time) VALUES
(1, 1, 'MOMO',     450000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 'BANK',     560000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 4, 'ZALOPAY',  300000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 5, 'MOMO',     130000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 6, 'BANK',     240000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(6, 7, 'ZALOPAY',  500000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 8, 'MOMO',     450000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(8, 9, 'BANK',     280000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(9,10, 'MOMO',     220000, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 11 DAY));

-- ── User behavior ──
INSERT IGNORE INTO user_behavior (behavior_id, user_id, action, action_time) VALUES
(1, 3, 'SEARCH', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, 'BOOKING', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 3, 'VIEW_TRIP', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── Support requests ──
INSERT IGNORE INTO support_request
  (request_id, user_id, booking_id, type, title, content, status, admin_reply, created_at)
VALUES
(1, 3, 1, 'BOOKING',   'Hỏi về vé đã đặt',        'Tôi muốn đổi ngày đặt vé booking #1.',     'RESOLVED', 'Quý khách vui lòng liên hệ hotline để đổi vé.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 3, 2, 'REFUND',    'Yêu cầu hoàn tiền',         'Chuyến #2 bị trễ, tôi muốn hoàn tiền.',   'PROCESSING', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 3, NULL,'GENERAL', 'Góp ý dịch vụ',             'Nên có thêm tuyến xe đêm TP.HCM - Đà Lạt.','PENDING', NULL, NOW()),
(4, 3, 3, 'PAYMENT',   'Đã thanh toán nhưng chưa có vé', 'Tôi đã chuyển khoản nhưng chưa nhận vé.', 'PENDING', NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 3, NULL,'TECHNICAL','Lỗi trang đặt vé',          'Trang booking báo lỗi khi chọn ghế VIP.',  'PENDING', NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 3, 4, 'COMPLAINT', 'Xe không sạch',              'Xe chuyến Hà Nội-TP.HCM không đạt chất lượng.','PENDING', NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(7, 3, NULL,'OTHER',   'Câu hỏi khác',               'SmartBusAI có app di động không?',         'RESOLVED','Hiện tại chỉ có web, app đang phát triển.', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ── AI Recommendations ──
INSERT IGNORE INTO ai_recommendation (recommend_id, user_id, trip_id, score, reason, created_at) VALUES
(1, 3, 1, 0.92, 'Dựa trên lịch sử đặt vé tuyến Hà Nội - TP.HCM', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 3, 3, 0.85, 'Tuyến phổ biến phù hợp với lịch trình của bạn',   DATE_SUB(NOW(), INTERVAL 1 DAY));
