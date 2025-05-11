const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { vaccinate } = require('../controllers/vaccinationController');

router.use(protect);
router.post('/:id/vaccinate', vaccinate);

module.exports = router;
