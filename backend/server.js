require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/students');
const driveRoutes = require('./routes/drives');
const vaccRoutes = require('./routes/vaccinations');
const reportRoutes = require('./routes/reports');
const connectDB  = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();      
// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/drives', vaccRoutes);           // POST /api/drives/:id/vaccinate
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));