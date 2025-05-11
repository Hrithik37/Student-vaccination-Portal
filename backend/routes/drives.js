const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/driveController');

router.use(protect);
router.route('/')
  .get(c.getAll)
  .post(c.create);
router.route('/:id')
  .get(c.getOne)
  .put(c.update);

module.exports = router;
