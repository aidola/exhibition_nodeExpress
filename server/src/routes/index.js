const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/exhibitions', require('./exhibitions'));
router.use('/customers', require('./customers'));
router.use('/events', require('./events'));
router.use('/dashboard', require('./dashboard'));
router.use('/upload', require('./upload'));

module.exports = router;
