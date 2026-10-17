const Product = require('../models/Product');
const ServiceRecord = require('../models/ServiceRecord');
const { deleteFile } = require('../middleware/upload');

// @desc    Upload document attachment to a product or service
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a file to upload (PDF, JPG, JPEG, or PNG, max 5MB).',
      });
    }

    const { productId, serviceId, documentType = 'other' } = req.body;

    if (!productId && !serviceId) {
      // Clean up orphaned upload
      await deleteFile(req.file.path, req.file.filename);
      return res.status(400).json({
        success: false,
        message: 'Must associate document with either a productId or serviceId.',
      });
    }

    const fileUrl = req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    const newDoc = {
      documentType,
      originalName: req.file.originalname,
      fileUrl,
      publicId: req.file.filename || '',
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date(),
    };

    if (productId) {
      const product = await Product.findOne({
        _id: productId,
        userId: req.user._id,
      });

      if (!product) {
        await deleteFile(req.file.path, req.file.filename);
        return res.status(404).json({
          success: false,
          message: 'Product not found or access unauthorized.',
        });
      }

      product.documents.push(newDoc);
      await product.save();

      return res.status(201).json({
        success: true,
        message: 'Document attached to product successfully.',
        document: newDoc,
      });
    }

    if (serviceId) {
      const service = await ServiceRecord.findOne({
        _id: serviceId,
        userId: req.user._id,
      });

      if (!service) {
        await deleteFile(req.file.path, req.file.filename);
        return res.status(404).json({
          success: false,
          message: 'Service record not found or access unauthorized.',
        });
      }

      service.documents.push(newDoc);
      await service.save();

      return res.status(201).json({
        success: true,
        message: 'Document attached to service record successfully.',
        document: newDoc,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document from product or service
// @route   DELETE /api/documents/:docId
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;

    // Check in products
    const product = await Product.findOne({
      userId: req.user._id,
      'documents._id': docId,
    });

    if (product) {
      const doc = product.documents.id(docId);
      if (doc) {
        await deleteFile(doc.fileUrl, doc.publicId);
        doc.deleteOne();
        await product.save();
        return res.status(200).json({
          success: true,
          message: 'Document deleted from product successfully.',
        });
      }
    }

    // Check in services
    const service = await ServiceRecord.findOne({
      userId: req.user._id,
      'documents._id': docId,
    });

    if (service) {
      const doc = service.documents.id(docId);
      if (doc) {
        await deleteFile(doc.fileUrl, doc.publicId);
        doc.deleteOne();
        await service.save();
        return res.status(200).json({
          success: true,
          message: 'Document deleted from service record successfully.',
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Document not found or access unauthorized.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  deleteDocument,
};
