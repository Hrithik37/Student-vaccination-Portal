const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/studentController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router.use(protect);
router.route('/')
  .get(c.getAll)
  .post(c.create);
router.post('/bulk', upload.single('file'), c.bulkCreate);
router.route('/:id')
  .get(c.getOne)
  .put(c.update);

module.exports = router;
