import pool from "../config/database.js";

const ComplaintImage = {
    // CREATE - Tambah image ke complaint
    async create(complaintId, imageUrl) {
        const [result] = await pool.execute(
            'INSERT INTO complaint_images (complaint_id, image_url) VALUES (?, ?)',
            [complaintId, imageUrl]
        );
        return result.insertId;
    },

    // CREATE BULK - Tambah multiple images
    async createMany(complaintId, imageUrls) {
        const insertIds = [];
        for (const url of imageUrls) {
            const [result] = await pool.execute(
                'INSERT INTO complaint_images (complaint_id, image_url) VALUES (?, ?)',
                [complaintId, url]
            );
            insertIds.push(result.insertId);
        }
        return insertIds;
    },

    // READ - Ambil images by Complaint ID
    async findByComplaintId(complaintId) {
        const [rows] = await pool.execute(
            'SELECT * FROM complaint_images WHERE complaint_id = ?',
            [complaintId]
        );
        return rows;
    },

    // DELETE - Hapus image by ID
    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM complaint_images WHERE id = ?', [id]
        );
        return result.affectedRows > 0;
    },

    // DELETE - Hapus semua images by Complaint ID
    async deleteByComplaintId(complaintId) {
        const [result] = await pool.execute(
            'DELETE FROM complaint_images WHERE complaint_id = ?',
            [complaintId]
        );
        return result.affectedRows > 0;
    }
};

export default ComplaintImage;
