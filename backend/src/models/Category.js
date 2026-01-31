import pool from "../config/database.js";

const Category = {
    // CREATE - Buat category baru
    async create(name) {
        const [result] = await pool.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        return result.insertId;
    },

    // READ - Ambil semua categories
    async findAll() {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY created_at DESC');
        return rows;
    },

    // READ - Ambil category by ID
    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?', [id]
        );
        return rows[0];
    },

    // READ - Ambil category by Name
    async findByName(name) {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE name = ?', [name]
        );
        return rows[0];
    },

    // UPDATE - Update category
    async update(id, name) {
        const [result] = await pool.execute(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.affectedRows > 0;
    },

    // DELETE - Hapus category
    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM categories WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    // COUNT - Hitung total categories
    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM categories');
        return rows[0].total;
    }
};

export default Category;
