import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import patientRoutes from './routes/patient.route.js';
import appointmentRoutes from './routes/appointment.route.js';
import authRoutes from "./routes/auth.route.js";
import roleRoutes from "./routes/role.route.js";
import doctorRoutes from "./routes/doctor.route.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import medicationRoutes from "./routes/medication.route.js";
import medicalHistoryRoutes from './routes/medicalHistory.route.js';
import encounterNoteRoutes from './routes/encounterNote.route.js';
import prescriptionRoutes from "./routes/prescription.route.js";
import labOrderRoutes from './routes/labOrder.route.js';
import labResultRoutes from './routes/labResult.route.js';


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'EHR System API is Running',
        time: new Date().toISOString()
    });
});

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/encounters", encounterNoteRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab-orders", labOrderRoutes);
app.use("/api/lab-results", labResultRoutes);


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
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Patients: http://localhost:${PORT}/api/patients`);
    console.log(`Appointments: http://localhost:${PORT}/api/appointments`);
    console.log(`Auth: http://localhost:${PORT}/api/auth`);
    console.log(`Roles: http://localhost:${PORT}/api/roles`);
    console.log(`Doctors: http://localhost:${PORT}/api/doctors`);
    console.log(`Medications: http://localhost:${PORT}/api/medications`);
    console.log(`Medical History: http://localhost:${PORT}/api/medical-history`);
    console.log(`Encounters: http://localhost:${PORT}/api/encounters`);
    console.log(`Prescriptions: http://localhost:${PORT}/api/prescriptions`);
    console.log(`Lab Orders: http://localhost:${PORT}/api/lab-orders`);
    console.log(`Lab Results: http://localhost:${PORT}/api/lab-results`);
});