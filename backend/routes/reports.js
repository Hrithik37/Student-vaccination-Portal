const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { metrics, getRecords, exportRecords  } = require('../controllers/reportController');
router.use(protect);
router.get('/metrics', metrics);
router.get('/records', getRecords);                // JSON data + pagination
router.get('/records/export', exportRecords);      // ?type=csv|excel|pdf
module.exports = router;
