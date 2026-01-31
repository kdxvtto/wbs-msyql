import pool from "../config/database.js";

const Response = {
    // CREATE - Buat response baru
    async create(data) {
        const { complaint_id, user_id, status, progress, response } = data;
        const [result] = await pool.execute(
            `INSERT INTO responses (complaint_id, user_id, status, progress, response) 
             VALUES (?, ?, ?, ?, ?)`,
            [complaint_id, user_id, status || 'pending', progress || 0, response]
        );
        return result.insertId;
    },

    // READ - Ambil semua responses
    async findAll() {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name, u.role as user_role,
                   c.description as complaint_description, c.status as complaint_status, c.location as complaint_location
            FROM responses r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN complaints c ON r.complaint_id = c.id
            ORDER BY r.created_at DESC
        `);
        return rows;
    },

    // READ - Ambil response by ID
    async findById(id) {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name, u.role as user_role,
                   c.description as complaint_description, c.status as complaint_status, c.location as complaint_location
            FROM responses r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN complaints c ON r.complaint_id = c.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    },

    // READ - Ambil responses by Complaint ID
    async findByComplaintId(complaintId) {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name, u.role as user_role
            FROM responses r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.complaint_id = ?
            ORDER BY r.created_at DESC
        `, [complaintId]);
        return rows;
    },

    // READ - Ambil latest response by Complaint ID
    async findLatestByComplaintId(complaintId) {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as user_name, u.role as user_role
            FROM responses r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.complaint_id = ?
            ORDER BY r.created_at DESC
            LIMIT 1
        `, [complaintId]);
        return rows[0];
    },

    // UPDATE - Update response
    async update(id, data) {
        const fields = [];
        const values = [];

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE responses SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    // DELETE - Hapus response
    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM responses WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    // COUNT by Complaint
    async countByComplaint(complaintId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM responses WHERE complaint_id = ?',
            [complaintId]
        );
        return rows[0].total;
    }
};

export default Response;