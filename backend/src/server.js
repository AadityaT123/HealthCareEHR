import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import { connectDB } from "./config/database.js";

import patientRoutes           from './routes/patient.route.js';
import appointmentRoutes       from './routes/appointment.route.js';
import authRoutes              from "./routes/auth.route.js";
import roleRoutes              from "./routes/role.route.js";
import doctorRoutes            from "./routes/doctor.route.js";
import medicationRoutes        from "./routes/medication.route.js";
import medicalHistoryRoutes    from './routes/medicalHistory.route.js';
import encounterNoteRoutes     from './routes/encounterNote.route.js';
import prescriptionRoutes      from "./routes/prescription.route.js";
import labOrderRoutes          from './routes/labOrder.route.js';
import labResultRoutes         from './routes/labResult.route.js';
import progressNoteRoutes      from './routes/progressNote.route.js';
import documentTemplateRoutes  from './routes/documentTemplate.route.js';

import errorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status:   'OK',
        message:  'EHR System API is Running',
        database: 'PostgreSQL (Sequelize)',
        version:  '2.0.0',
        time:     new Date().toISOString()
    });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/roles',           roleRoutes);
app.use('/api/patients',        patientRoutes);
app.use('/api/appointments',    appointmentRoutes);
app.use('/api/doctors',         doctorRoutes);
app.use('/api/medications',     medicationRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/encounters',      encounterNoteRoutes);
app.use('/api/prescriptions',   prescriptionRoutes);
app.use('/api/lab-orders',       labOrderRoutes);
app.use('/api/lab-results',      labResultRoutes);
app.use('/api/progress-notes',   progressNoteRoutes);
app.use('/api/templates',        documentTemplateRoutes);

// ── Error Handlers ─────────────────────────────────────────────────────────────
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({
        success:  false,
        message:  'Internal Server Error',
        error:    process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log('\n═══════════════════════════════════════════════════');
        console.log(`  EHR System API  v2.0.0 (Sequelize + PostgreSQL)`);
        console.log(`  Running on http://localhost:${PORT}`);
        console.log('═══════════════════════════════════════════════════');
        console.log(`  GET  /health`);
        console.log(`  ---  Auth & Roles  ---`);
        console.log(`  POST /api/auth/register`);
        console.log(`  POST /api/auth/login`);
        console.log(`  GET  /api/roles`);
        console.log(`  ---  Core Clinical  ---`);
        console.log(`  GET  /api/patients`);
        console.log(`  GET  /api/doctors`);
        console.log(`  GET  /api/appointments`);
        console.log(`  GET  /api/medical-history`);
        console.log(`  GET  /api/encounters`);
        console.log(`  ---  Clinical Docs (Phase 1)  ---`);
        console.log(`  GET  /api/progress-notes`);
        console.log(`  GET  /api/templates`);
        console.log(`  ---  Medication  ---`);
        console.log(`  GET  /api/medications`);
        console.log(`  GET  /api/prescriptions`);
        console.log(`  ---  Lab  ---`);
        console.log(`  GET  /api/lab-orders`);
        console.log(`  GET  /api/lab-results`);
        console.log('═══════════════════════════════════════════════════\n');
    });
};

startServer();