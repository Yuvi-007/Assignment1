const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const {
    createProject,
    listProjects,
    getProject,
    updateProject,
    deleteProject
} = require('../controllers/project.controller');

// All routes require login
router.use(verifyToken);

router.post('/', requireRole('admin', 'manager'), createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', requireRole('admin', 'manager'), updateProject);
router.delete('/:id', requireRole('admin'), deleteProject);

module.exports = router;