const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartbusai",
    port: 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// test kết nối
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL Connected Successfully");
        conn.release();
    } catch (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
    }
})();

module.exports = pool;