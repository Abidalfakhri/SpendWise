const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
    'https://spend-wise-ruby.vercel.app', 
    'https://spend-wise-605bcb2dl-abid-alfakhris-projects.vercel.app', 
    'https://spend-wise-o105nhs58-abid-alfakhris-projects.vercel.app', // Origin Vercel baru
    'http://localhost:5173', 
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    credentials: true, 
    optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authenticateToken = require('./src/middleware/authMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SpendWise API is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack); 
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
});

// Start server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`✅ Server running and listening for requests on port ${PORT}`);
});

module.exports = app;