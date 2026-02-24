import pool from "../config/database.js";

const User = {
    // CREATE - Buat user baru
    async create(data) {
        const { nik, name, username, email, password, phone, role } = data;
        const [result] = await pool.execute(
            `INSERT INTO users (nik, name, username, email, password, phone, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nik || null, name, username || null, email || null, password, phone || null, role || 'Nasabah']
        );
        return result.insertId;
    },

    // READ - Ambil semua users
    async findAll() {
        const [rows] = await pool.execute('SELECT * FROM users');
        return rows;
    },

    // READ - Ambil user by ID
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?', [id]
        );
        return rows[0];
    },

    // READ - Ambil user by Email
    async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        return rows[0];
    },

    // READ - Ambil user by Username
    async findByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?', [username]
        );
        return rows[0];
    },

    // READ - Ambil user by NIK
    async findByNik(nik) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE nik = ?', [nik]
        );
        return rows[0];
    },

    // READ - Ambil user by Phone
    async findByPhone(phone) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE phone = ?', [phone]
        );
        return rows[0];
    },

    // READ - Ambil user by refresh token hash
    async findByRefreshToken(refreshTokenHash) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE refresh_token = ?', [refreshTokenHash]
        );
        return rows[0];
    },

    // READ - Cari user dengan OR condition (untuk cek duplikat)
    async findByEmailOrUsernameOrNikOrPhone(email, username, nik, phone) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE email = ? OR username = ? OR nik = ? OR phone = ?`,
            [email, username, nik, phone]
        );
        return rows[0];
    },

    // UPDATE - Update user
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
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    // UPDATE - Update refresh token
    async updateRefreshToken(id, refreshToken) {
        const [result] = await pool.execute(
            'UPDATE users SET refresh_token = ? WHERE id = ?',
            [refreshToken, id]
        );
        return result.affectedRows > 0;
    },

    // DELETE - Hapus user
    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    // COUNT - Hitung total users
    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM users');
        return rows[0].total;
    },

    // COUNT by Role
    async countByRole(role) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as total FROM users WHERE role = ?', [role]
        );
        return rows[0].total;
    }
};

export default User;
