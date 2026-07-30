const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// 公开接口：活动报名（前台使用）
router.post('/:id/register', eventController.register);

// 需要认证的接口
router.use(authenticate);

router.get('/stats', eventController.stats);
router.get('/registrations', eventController.registrationList);
router.put('/registrations/:regId', eventController.updateRegistration);
router.get('/', eventController.list);
router.get('/:id', eventController.detail);
router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

module.exports = router;
