const express = require('express');
const {
  getPlates,
  getPlateById,
  generatePlatePreview,
  createPlate,
  updatePlate,
  deletePlate,
  checkPlateAvailability,
} = require('../controllers/plateController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getPlates)
  .post(protect, admin, createPlate);

router.post('/preview', generatePlatePreview);
router.get('/check-availability/:text', checkPlateAvailability);

router.route('/:id')
  .get(getPlateById)
  .put(protect, admin, updatePlate)
  .delete(protect, admin, deletePlate);

module.exports = router;