const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All product routes are protected
router.use(protect);

router
  .route('/')
  .get(getProducts)
  .post(upload.array('documents', 5), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(upload.array('documents', 5), updateProduct)
  .delete(deleteProduct);

module.exports = router;
