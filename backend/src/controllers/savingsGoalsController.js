
const pool = require('../config/db'); 

// FUNGSI 1: Ambil semua target tabungan user
exports.getAllSavingsGoals = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        
        const result = await pool.query(
            `SELECT * FROM savings_goals 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data target tabungan'
        });
    }
};

// FUNGSI 2: Buat target tabungan baru
exports.createSavingsGoal = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { name, category, target_amount, saved_amount = 0, deadline } = req.body;

        // Validasi input
        if (!name || !category || !target_amount || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi (name, category, target_amount, deadline)'
            });
        }

        if (target_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Target amount harus lebih dari 0'
            });
        }

        const result = await pool.query(
            `INSERT INTO savings_goals 
             (user_id, name, category, target_amount, saved_amount, deadline) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [userId, name, category, target_amount, saved_amount, deadline]
        );

        res.status(201).json({
            success: true,
            message: 'Target tabungan berhasil dibuat',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat target tabungan'
        });
    }
};

// FUNGSI 3: Tambah tabungan (dengan transaksi atomik)
exports.addSavingsToGoal = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const userId = req.user.userId || req.user.id;
        const goalId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Nominal harus lebih dari 0'
            });
        }

        await client.query('BEGIN'); // Mulai transaksi

        // 1. Cek apakah goal milik user ini
        const goalCheck = await client.query(
            'SELECT id, name FROM savings_goals WHERE id = $1 AND user_id = $2',
            [goalId, userId]
        );

        if (goalCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Target tabungan tidak ditemukan'
            });
        }

        const goal = goalCheck.rows[0];

        // 2. Cek saldo user cukup atau tidak
        const userCheck = await client.query(
            'SELECT balance FROM users WHERE id = $1',
            [userId]
        );

        if (userCheck.rows.length === 0 || userCheck.rows[0].balance < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Saldo tidak mencukupi'
            });
        }

        // 3. Update saved_amount di savings_goals
        await client.query(
            `UPDATE savings_goals 
             SET saved_amount = saved_amount + $1, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [amount, goalId]
        );

        // 4. Kurangi balance user dan tambah total_expense (savings diperlakukan sebagai pengeluaran dari balance)
        await client.query(
            `UPDATE users 
             SET balance = balance - $1, 
                 total_expense = total_expense + $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [amount, userId]
        );

        // 5. Catat sebagai transaksi pengeluaran
        const categoryName = `Tabungan - ${goal.name}`;
        await client.query(
            `INSERT INTO transactions 
             (user_id, type, category, amount, date, description, created_at) 
             VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, CURRENT_TIMESTAMP)`,
            [
                userId, 
                'expense', 
                categoryName, 
                amount, 
                `Menabung untuk ${goal.name}`
            ]
        );

        await client.query('COMMIT'); // Commit transaksi jika semua berhasil

        // Ambil data goal yang sudah diupdate
        const updatedGoal = await client.query(
            'SELECT * FROM savings_goals WHERE id = $1',
            [goalId]
        );

        res.json({
            success: true,
            message: 'Tabungan berhasil ditambahkan',
            data: updatedGoal.rows[0]
        });

    } catch (error) {
        // Rollback transaksi jika terjadi kesalahan
        await client.query('ROLLBACK');
        console.error('Error adding savings:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan tabungan'
        });
    } finally {
        // Pastikan koneksi dikembalikan ke pool
        client.release();
    }
};

// FUNGSI 4: Update target tabungan
exports.updateSavingsGoal = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const goalId = req.params.id;
        const { name, category, target_amount, deadline } = req.body;

        // Cek kepemilikan
        const checkOwnership = await pool.query(
            'SELECT id FROM savings_goals WHERE id = $1 AND user_id = $2',
            [goalId, userId]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Target tabungan tidak ditemukan'
            });
        }

        const result = await pool.query(
            `UPDATE savings_goals 
             SET name = $1, 
                 category = $2, 
                 target_amount = $3, 
                 deadline = $4,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING *`,
            [name, category, target_amount, deadline, goalId]
        );

        res.json({
            success: true,
            message: 'Target tabungan berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate target tabungan'
        });
    }
};

// FUNGSI 5: Hapus target tabungan
exports.deleteSavingsGoal = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const goalId = req.params.id;

        // Cek kepemilikan
        const checkOwnership = await pool.query(
            'SELECT id FROM savings_goals WHERE id = $1 AND user_id = $2',
            [goalId, userId]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Target tabungan tidak ditemukan'
            });
        }

        await pool.query(
            'DELETE FROM savings_goals WHERE id = $1',
            [goalId]
        );

        res.json({
            success: true,
            message: 'Target tabungan berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting savings goal:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus target tabungan'
        });
    }
};