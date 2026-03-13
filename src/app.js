const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const dprRoutes = require('./routes/dpr.routes');

const app = express();

// Parse incoming JSON request bodies — required for reading req.body in controllers
app.use(express.json());

// Parse cookies from incoming requests — required for reading the JWT from req.cookies.token
app.use(cookieParser());


// --- Route Mounting ---
// All routes are prefixed with /api to namespace them away from any future static
// assets or frontend routes that may be served from the same server

app.use('/api/auth', authRoutes);       // POST /api/auth/register, /api/auth/login, /api/auth/seed-admin
app.use('/api/projects', projectRoutes); // CRUD operations on projects
app.use('/api/dpr', dprRoutes);          // Create and list Daily Progress Reports


module.exports = app;