// Load environment variables FIRST - this must be the first import
import "./config/env.js";

import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 3000;

// Test MySQL connection
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Connected to MySQL database: WBS");
        connection.release();
    } catch (error) {
        console.error("❌ MySQL connection error:", error.message);
        process.exit(1);
    }
};

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
