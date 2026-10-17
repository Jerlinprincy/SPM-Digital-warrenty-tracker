const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.delete('/:docId', deleteDocument);

module.exports = router;
