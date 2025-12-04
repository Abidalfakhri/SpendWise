// FILE: backend/src/controllers/userController.js
const pool = require('../config/db'); 


// GET user profile
const getProfile = async (req, res) => {
    try {
        // AMBIL ID DARI TOKEN (req.user)
        const id = req.user.id; 

        if (!id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: ID pengguna tidak ditemukan dalam token.' });
        }

        const query = `
          SELECT 
            id, name, email, username, balance, 
            total_income, total_expense, created_at, updated_at
          FROM users
          WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data profile',
            error: error.message
        });
    }
};

// UPDATE user profile
const updateProfile = async (req, res) => {
    try {
        // AMBIL ID DARI TOKEN (req.user)
        const id = req.user.id;
        const { name, email, username } = req.body;
        
        // --- VALIDASI DASAR ---
        if (!id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: ID pengguna tidak ditemukan dalam token.' });
        }
        if (!name || !email || !username) {
            return res.status(400).json({ success: false, message: 'Nama, Email, dan Username wajib diisi.' });
        }
        
        // Query untuk update
        const query = `
          UPDATE users
          SET 
            name = $1,
            email = $2,
            username = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING id, name, email, username, balance, total_income, total_expense
        `;

        const result = await pool.query(query, [name, email, username, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'Profile berhasil diupdate',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error in updateProfile:', error);
        
        // Penanganan error duplikasi (PostgreSQL error code 23505)
        if (error.code === '23505') { 
            return res.status(409).json({ success: false, message: 'Email atau Username sudah digunakan pengguna lain.' });
        }

        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate profile',
            error: error.message
        });
    }
};


// ===============================================
// FUNGSI BERBASIS ID (Kode Lama Anda)
// ===============================================

// GET user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
          SELECT 
            id, name, email, username, balance, 
            total_income, total_expense, created_at, updated_at
          FROM users
          WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({ success: true, data: result.rows[0] });

    } catch (error) {
        console.error('❌ Error in getUserById:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
    }
};

// UPDATE user (hanya untuk route berbasis ID /:id)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, username } = req.body;

        const query = `
          UPDATE users
          SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            username = COALESCE($3, username),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING id, name, email, username, balance, total_income, total_expense
        `;

        const result = await pool.query(query, [name, email, username, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({ success: true, message: 'User berhasil diupdate', data: result.rows[0] });

    } catch (error) {
        console.error('❌ Error in updateUser:', error);
        res.status(500).json({ success: false, message: 'Gagal mengupdate user', error: error.message });
    }
};

// DELETE user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({ success: true, message: 'User berhasil dihapus', data: result.rows[0] });

    } catch (error) {
        console.error('❌ Error in deleteUser:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus user', error: error.message });
    }
};


// Export semua fungsi controller
module.exports = {
    getUserById,
    updateUser,
    deleteUser,
    // Fungsi yang digunakan oleh /api/user/profile
    getProfile, 
    updateProfile 
};