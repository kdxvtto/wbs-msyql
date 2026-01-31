import dotenv from "dotenv";
import app from "./app.js";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
if (!process.env.DB_HOST) {
    const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
    dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });
}

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