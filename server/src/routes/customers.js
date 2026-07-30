const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', customerController.stats);
router.post('/batch-import', customerController.batchImport);
router.get('/', customerController.list);
router.get('/:id', customerController.detail);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

module.exports = router;
