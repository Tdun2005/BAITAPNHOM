const db = require("../config/db");

// =================================
// CHECK EMAIL EXISTS (for forgot-password step 1)
// =================================
exports.checkEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Thiếu email" });
    try {
        const [rows] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }
        return res.json({ message: "Email hợp lệ" });
    } catch (err) {
        console.error("Check email error:", err);
        return res.status(500).json({ message: "Database error" });
    }
};

// =================================
// RESET PASSWORD
// =================================
exports.resetPassword = async (req, res) => {
    const { email, new_password } = req.body;
    if (!email || !new_password) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (new_password.length < 6) {
        return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });
    }
    try {
        const [rows] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }
        await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [new_password, email]);
        return res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ message: "Database error" });
    }
};

// =================================
// REGISTER USER
// =================================
exports.register = async (req, res) => {
    const {
        username, full_name, email, password,
        phone, gender, birth_date,
        province, district, address_detail
    } = req.body;

    console.log(req.body);

    if (!username || !full_name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // CHECK AGE >= 15
    if (birth_date) {
        const today = new Date();
        const birth = new Date(birth_date);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 15) {
            return res.status(400).json({ message: "User must be at least 15 years old" });
        }
    }

    try {
        // CHECK USERNAME EXISTS
        const [existUser] = await db.query(
            "SELECT user_id FROM users WHERE username = ?", [username]
        );
        if (existUser.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // INSERT USER
        const [result] = await db.query(
            `INSERT INTO users
             (username, full_name, email, password_hash, phone, gender, birth_date, province, district, address_detail)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username, full_name, email, password,
                phone || null, gender || null, birth_date || null,
                province || null, district || null, address_detail || null
            ]
        );

        return res.status(201).json({
            message: "Register successful",
            user_id: result.insertId
        });

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
        }
        console.error("Register error:", err);
        return res.status(500).json({ message: "Database error" });
    }
};


// =================================
// LOGIN USER
// =================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    }

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email or password incorrect" });
        }

        const user = rows[0];

        if (user.password_hash !== password) {
            return res.status(401).json({ message: "Email or password incorrect" });
        }

        return res.json({
            message: "Login successful",
            user: {
                user_id:   user.user_id,
                username:  user.username,
                full_name: user.full_name,
                email:     user.email,
                role:      user.role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Database error" });
    }
};