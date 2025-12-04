const pool = require("../config/db");

// PERHATIAN: Kode ini mengasumsikan kolom 'user_id' sudah ada di tabel 'categories'
// dan middleware otentikasi telah menyetel req.user.id.

/**
 * GET ALL CATEGORIES
 * Endpoint: GET /api/categories?type=...
 */
exports.getAllCategories = async (req, res) => {
    try {
        // 🟢 Ambil ID pengguna dari request (user-scope)
        const userId = req.user.id; 
        const { type } = req.query;

        // Query dasar: Filter berdasarkan user_id
        let query = "SELECT * FROM categories WHERE user_id = $1";
        const params = [userId];

        // Filter by type if provided
        if (type && (type === "income" || type === "expense")) {
            // Gunakan $2 karena $1 sudah dipakai untuk user_id
            query += " AND type = $2"; 
            params.push(type);
        }

        query += " ORDER BY name ASC";

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("❌ Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil kategori",
            error: error.message,
        });
    }
};

/**
 * GET CATEGORY BY ID
 * Endpoint: GET /api/categories/:id
 */
exports.getCategoryById = async (req, res) => {
    try {
        // 🟢 Ambil ID pengguna dari request
        const userId = req.user.id; 
        const { id } = req.params;

        const result = await pool.query(
            // 🟢 Filter: Hanya ambil jika ID dan user_id cocok
            "SELECT * FROM categories WHERE id = $1 AND user_id = $2", 
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Get category error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil kategori",
            error: error.message,
        });
    }
};

/**
 * CREATE CATEGORY
 * Endpoint: POST /api/categories
 */
exports.createCategory = async (req, res) => {
    try {
        // 🟢 Ambil ID pengguna dari request
        const userId = req.user.id; 
        const { name, type, icon, color } = req.body;

        // Validasi
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "name dan type wajib diisi",
            });
        }

        if (type !== "income" && type !== "expense") {
            return res.status(400).json({
                success: false,
                message: "type harus 'income' atau 'expense'",
            });
        }

        // Cek duplikat: harus unik per pengguna
        const checkDuplicate = await pool.query(
            // 🟢 Filter: Cek duplikat hanya di antara kategori milik pengguna ini
            "SELECT * FROM categories WHERE name = $1 AND type = $2 AND user_id = $3", 
            [name, type, userId]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Kategori dengan nama dan type ini sudah ada untuk Anda",
            });
        }

        // Insert category
        const result = await pool.query(
            // 🟢 Tambahkan user_id ke kolom INSERT
            `INSERT INTO categories (name, type, icon, color, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, type, icon || null, color || null, userId] // 🟢 Masukkan nilai userId
        );

        console.log(`✅ Category created: ${name} (${type}) by User ${userId}`);

        res.status(201).json({
            success: true,
            message: "Kategori berhasil ditambahkan",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Create category error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat menambahkan kategori",
            error: error.message,
        });
    }
};


exports.updateCategory = async (req, res) => {
    try {
   
        const userId = req.user.id; 
        const { id } = req.params;
        const { name, type, icon, color } = req.body;

        // Cek apakah kategori ada dan MILIK USER INI
        const checkResult = await pool.query(
            "SELECT * FROM categories WHERE id = $1 AND user_id = $2", 
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan atau Anda tidak memiliki akses",
            });
        }

        // Update category
        const result = await pool.query(
            `UPDATE categories
             SET name = COALESCE($1, name),
                 type = COALESCE($2, type),
                 icon = COALESCE($3, icon),
                 color = COALESCE($4, color)
             WHERE id = $5 AND user_id = $6 
             RETURNING *`, // 🟢 Filter: Tambahkan filter user_id di klausa WHERE
            [name, type, icon, color, id, userId] 
        );

        console.log(`✅ Category updated: ${id} by User ${userId}`);

        res.status(200).json({
            success: true,
            message: "Kategori berhasil diupdate",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("❌ Update category error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengupdate kategori",
            error: error.message,
        });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        // 🟢 Ambil ID pengguna dari request
        const userId = req.user.id; 
        const { id } = req.params;

        // Cek apakah kategori ada dan MILIK USER INI
        const checkResult = await pool.query(
            "SELECT * FROM categories WHERE id = $1 AND user_id = $2", 
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan atau Anda tidak memiliki akses",
            });
        }

        await pool.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [id, userId]); 

        console.log(`✅ Category deleted: ${id} by User ${userId}`);

        res.status(200).json({
            success: true,
            message: "Kategori berhasil dihapus",
        });
    } catch (error) {
        console.error("❌ Delete category error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat menghapus kategori",
            error: error.message,
        });
    }
};