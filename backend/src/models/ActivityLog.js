import pool from "../config/database.js";

const ActivityLog = {
    // CREATE - Buat log baru
    async create(data) {
        const { action, resource, resource_name, resource_id, user_id, user_name } = data;
        const [result] = await pool.execute(
            `INSERT INTO activity_logs (action, resource, resource_name, resource_id, user_id, user_name) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [action, resource, resource_name, resource_id, user_id, user_name]
        );
        return result.insertId;
    },

    // READ - Ambil semua logs
    async findAll(limit = 50) {
        const [rows] = await pool.execute(`
            SELECT * FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT ?
        `, [limit]);
        return rows;
    },

    // READ - Ambil logs by Resource
    async findByResource(resource, resourceId) {
        const [rows] = await pool.execute(`
            SELECT * FROM activity_logs 
            WHERE resource = ? AND resource_id = ?
            ORDER BY created_at DESC
        `, [resource, resourceId]);
        return rows;
    },

    // READ - Ambil logs by User
    async findByUser(userId, limit = 50) {
        const [rows] = await pool.execute(`
            SELECT * FROM activity_logs 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [userId, limit]);
        return rows;
    },

    // READ - Ambil logs by Action
    async findByAction(action, limit = 50) {
        const [rows] = await pool.execute(`
            SELECT * FROM activity_logs 
            WHERE action = ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [action, limit]);
        return rows;
    },

    // DELETE - Hapus logs lama (cleanup)
    async deleteOlderThan(days) {
        const [result] = await pool.execute(`
            DELETE FROM activity_logs 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [days]);
        return result.affectedRows;
    },

    // COUNT - Hitung total logs
    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM activity_logs');
        return rows[0].total;
    }
};

export default ActivityLog;
