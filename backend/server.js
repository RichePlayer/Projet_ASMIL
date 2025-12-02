const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient({});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Organisation par module

// Authentification
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Gestion des étudiants
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

// Gestion des formations et catégories
const formationRoutes = require('./routes/formationRoutes');
app.use('/api/formations', formationRoutes);

// Gestion des enseignants
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teachers', teacherRoutes);

// Gestion des sessions
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// Gestion des inscriptions
const enrollmentRoutes = require('./routes/enrollmentRoutes');
app.use('/api/enrollments', enrollmentRoutes);

// Gestion financière (factures et paiements)
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

// Gestion académique (présences et notes)
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
app.use('/api/attendances', attendanceRoutes);
app.use('/api/grades', gradeRoutes);

// Gestion des certificats
const certificateRoutes = require('./routes/certificateRoutes');
app.use('/api/certificates', certificateRoutes);

// Gestion des annonces
const announcementRoutes = require('./routes/announcementRoutes');
app.use('/api/announcements', announcementRoutes);

// Upload de fichiers
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Example Route to test DB connection
app.get('/api/db-check', async (req, res) => {
    try {
        // Try to query something simple, e.g., count users
        // Note: This table might be empty, but if the query succeeds, the connection is good.
        const userCount = await prisma.user.count();
        res.json({ status: 'ok', message: 'Database connection successful', userCount });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});