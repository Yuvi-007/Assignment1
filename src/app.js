const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const dprRoutes = require('./routes/dpr.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dpr', dprRoutes);


module.exports = app;