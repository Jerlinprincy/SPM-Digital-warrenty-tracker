const ServiceRecord = require('../models/ServiceRecord');
const Product = require('../models/Product');
const { deleteFile } = require('../middleware/upload');
const dayjs = require('dayjs');

// @desc    Get all services for the logged in user with filters
// @route   GET /api/services
// @access  Private
const getServices = async (req, res, next) => {
  try {
    const { status, productId, filter } = req.query;

    const query = { userId: req.user._id };

    if (productId) {
      query.productId = productId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    // Specific filters: upcoming, overdue, completed
    if (filter === 'upcoming') {
      query.status = 'Scheduled';
      query.scheduledDate = { $gte: dayjs().startOf('day').toDate() };
    } else if (filter === 'overdue') {
      query.status = 'Scheduled';
      query.scheduledDate = { $lt: dayjs().startOf('day').toDate() };
    } else if (filter === 'completed') {
      query.status = 'Completed';
    }

    const services = await ServiceRecord.find(query)
      .populate('productId', 'productName brand modelNumber category')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service record
// @route   GET /api/services/:id
// @access  Private
const getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceRecord.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('productId', 'productName brand modelNumber category');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or access unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a new service maintenance appointment
// @route   POST /api/services
// @access  Private
const createService = async (req, res, next) => {
  try {
    const {
      productId,
      title,
      description,
      scheduledDate,
      serviceProvider,
      estimatedCost,
      notes,
    } = req.body;

    if (!productId || !title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide associated product, service title, and scheduled date.',
      });
    }

    // Verify product exists and belongs to current user
    const product = await Product.findOne({
      _id: productId,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Associated product does not exist or does not belong to you.',
      });
    }

    const newService = new ServiceRecord({
      userId: req.user._id,
      productId: product._id,
      title,
      description: description || '',
      scheduledDate,
      serviceProvider: serviceProvider || '',
      estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
      status: 'Scheduled',
      notes: notes || '',
      documents: [],
    });

    // Handle uploaded receipts if present
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileUrl = file.path.startsWith('http')
          ? file.path
          : `/uploads/${file.filename}`;

        newService.documents.push({
          documentType: 'receipt',
          originalName: file.originalname,
          fileUrl: fileUrl,
          publicId: file.filename || '',
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    await newService.save();

    res.status(201).json({
      success: true,
      message: 'Service appointment scheduled successfully.',
      service: newService,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service appointment
// @route   PUT /api/services/:id
// @access  Private
const updateService = async (req, res, next) => {
  try {
    const service = await ServiceRecord.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or access unauthorized.',
      });
    }

    const {
      title,
      description,
      scheduledDate,
      serviceProvider,
      estimatedCost,
      actualCost,
      status,
      notes,
      completedAt,
    } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (scheduledDate !== undefined) service.scheduledDate = scheduledDate;
    if (serviceProvider !== undefined) service.serviceProvider = serviceProvider;
    if (estimatedCost !== undefined) service.estimatedCost = Number(estimatedCost);
    if (notes !== undefined) service.notes = notes;

    // Status management
    if (status !== undefined) {
      service.status = status;
      if (status === 'Completed') {
        service.completedAt = completedAt || new Date();
        if (actualCost !== undefined) {
          service.actualCost = Number(actualCost);
        }
      } else if (status === 'Scheduled') {
        service.completedAt = null;
      }
    }

    if (actualCost !== undefined) {
      service.actualCost = Number(actualCost);
    }

    // Attach uploaded receipts if any
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileUrl = file.path.startsWith('http')
          ? file.path
          : `/uploads/${file.filename}`;

        service.documents.push({
          documentType: 'receipt',
          originalName: file.originalname,
          fileUrl: fileUrl,
          publicId: file.filename || '',
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service record updated successfully.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service appointment
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = async (req, res, next) => {
  try {
    const service = await ServiceRecord.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or access unauthorized.',
      });
    }

    // Delete associated document files
    if (service.documents && service.documents.length > 0) {
      for (const doc of service.documents) {
        await deleteFile(doc.fileUrl, doc.publicId);
      }
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
