const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const { authenticate, authorizeAdmin } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, authorizeAdmin, adminRoutes);
app.use('/api/student', authenticate, studentRoutes);

// Database initialization happens inside database.js
require('./database');

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
