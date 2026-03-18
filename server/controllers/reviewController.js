const db = require("../config/db");

exports.createReview = async (req, res) => {

    const { user_id, trip_id, rating, comment } = req.body;

    if (!user_id || !trip_id || !rating) {
        return res.status(400).json({
            message: "Thiếu dữ liệu"
        });
    }

    try {

        // CHECK REVIEW EXIST
        const [exist] = await db.query(
            "SELECT review_id FROM review WHERE user_id=? AND trip_id=?",
            [user_id, trip_id]
        );

        if (exist.length > 0) {
            return res.status(400).json({
                message: "Bạn đã đánh giá chuyến này rồi"
            });
        }

        // INSERT REVIEW
        await db.query(
            "INSERT INTO review (user_id, trip_id, rating, comment) VALUES (?,?,?,?)",
            [user_id, trip_id, rating, comment]
        );

        res.json({
            message: "Review created"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "DB error"
        });

    }

};