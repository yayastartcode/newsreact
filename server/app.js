const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { startViewSync, syncBeforeExit } = require('./jobs/viewSyncJob');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded by other domains
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:4321', 'http://localhost:5173']; // Defaults for dev

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
// Serve uploads with cross-origin headers explicity
app.use('/uploads', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', publicRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);

    // Start view sync job
    startViewSync();
});

// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Gracefully shutting down...`);
    await syncBeforeExit();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
