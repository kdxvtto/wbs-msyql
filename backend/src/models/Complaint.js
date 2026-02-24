import pool from "../config/database.js";

const Complaint = {
    // CREATE - Buat complaint baru
    async create(data) {
        const { user_id, category_id, location, condition, description, status } = data;
        const [result] = await pool.execute(
            `INSERT INTO complaints (user_id, category_id, location, \`condition\`, description, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, category_id, location, condition, description, status || 'pending']
        );
        return result.insertId;
    },

    // READ - Ambil semua complaints dengan relasi
    async findAll() {
        const [rows] = await pool.execute(`
            SELECT c.*, u.name as user_name, u.email as user_email, cat.name as category_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            ORDER BY c.created_at DESC
        `);
        return rows;
    },

    // READ - Ambil complaint by ID dengan relasi
    async findById(id) {
        const [rows] = await pool.execute(`
            SELECT c.*, u.name as user_name, u.email as user_email, cat.name as category_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    },

    // READ - Ambil complaints by User ID
    async findByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT c.*, cat.name as category_name
            FROM complaints c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [userId]);
        return rows;
    },

    // READ - Ambil complaint by ID milik user tertentu
    async findByIdAndUser(id, userId) {
        const [rows] = await pool.execute(`
            SELECT c.*, cat.name as category_name
            FROM complaints c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ? AND c.user_id = ?
        `, [id, userId]);
        return rows[0];
    },

    // READ - Ambil complaints by Status
    async findByStatus(status) {
        const [rows] = await pool.execute(`
            SELECT c.*, u.name as user_name, cat.name as category_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.status = ?
            ORDER BY c.created_at DESC
        `, [status]);
        return rows;
    },

    // UPDATE - Update complaint
    async update(id, data) {
        const fields = [];
        const values = [];
        const allowedFields = new Set(["category_id", "location", "condition", "description", "status"]);

        Object.keys(data).forEach(key => {
            if (allowedFields.has(key) && data[key] !== undefined) {
                // Handle reserved word 'condition'
                const fieldName = key === 'condition' ? '`condition`' : key;
                fields.push(`${fieldName} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    // UPDATE - Update status
    async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE complaints SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    },

    // DELETE - Hapus complaint
    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM complaints WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    // COUNT - Hitung total complaints
    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM complaints');
        return rows[0].total;
    },

    // COUNT by Status
    async countByStatus(status) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM complaints WHERE status = ?', [status]
        );
        return rows[0].total;
    },

    // COUNT by User
    async countByUser(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM complaints WHERE user_id = ?', [userId]
        );
        return rows[0].total;
    }
};

export default Complaint;
