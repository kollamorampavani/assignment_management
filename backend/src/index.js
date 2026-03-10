const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const initScheduler = require('./utils/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

// Initialize background tasks
initScheduler();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Assignment Management System API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
