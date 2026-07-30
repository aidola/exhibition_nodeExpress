const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', exhibitionController.stats);
router.get('/all', exhibitionController.all);
router.get('/', exhibitionController.list);
router.get('/:id', exhibitionController.detail);
router.post('/', exhibitionController.create);
router.put('/:id', exhibitionController.update);
router.delete('/:id', exhibitionController.delete);

module.exports = router;
