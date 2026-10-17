const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All service routes are protected
router.use(protect);

router
  .route('/')
  .get(getServices)
  .post(upload.array('documents', 5), createService);

router
  .route('/:id')
  .get(getServiceById)
  .put(upload.array('documents', 5), updateService)
  .delete(deleteService);

module.exports = router;
