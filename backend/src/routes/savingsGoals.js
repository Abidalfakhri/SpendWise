const express = require('express');
const router = express.Router();
// Path disesuaikan: dari src/routes/ ke src/middleware/authMiddleware.js
const authenticateToken = require('../middleware/authMiddleware'); 
// Path disesuaikan: dari src/routes/ ke src/controllers/
const savingsGoalsController = require('../controllers/savingsGoalsController');

// Semua rute di sini memerlukan otentikasi
router.use(authenticateToken);

// GET /api/savings-goals - Ambil semua target tabungan user
router.get('/', savingsGoalsController.getAllSavingsGoals);

// POST /api/savings-goals - Buat target tabungan baru
router.post('/', savingsGoalsController.createSavingsGoal);

// POST /api/savings-goals/:id/add-savings - Tambah tabungan ke goal tertentu
router.post('/:id/add-savings', savingsGoalsController.addSavingsToGoal);

// PUT /api/savings-goals/:id - Update target tabungan
router.put('/:id', savingsGoalsController.updateSavingsGoal);

// DELETE /api/savings-goals/:id - Hapus target tabungan
router.delete('/:id', savingsGoalsController.deleteSavingsGoal);

module.exports = router;