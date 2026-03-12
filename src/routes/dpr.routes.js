const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
    createDPR,
    listDPRs
} = require('../controllers/dpr.controller');

// All routes require login
router.use(verifyToken);

router.post('/', createDPR);
router.get('/', listDPRs);

module.exports = router;