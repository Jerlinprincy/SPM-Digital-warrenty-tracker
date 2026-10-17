const Product = require('../models/Product');
const ServiceRecord = require('../models/ServiceRecord');
const { deleteFile } = require('../middleware/upload');
const dayjs = require('dayjs');

// @desc    Get all user products with search, filter, and sorting
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      expiringWithinDays,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { userId: req.user._id };

    // Search by product name, brand, or model number
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { productName: searchRegex },
        { brand: searchRegex },
        { modelNumber: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by warranty expiration window (7, 15, 30 days)
    if (expiringWithinDays) {
      const days = parseInt(expiringWithinDays, 10);
      if (!isNaN(days) && days > 0) {
        const now = dayjs().startOf('day').toDate();
        const futureDate = dayjs().add(days, 'day').endOf('day').toDate();
        query.warrantyDurationMonths = { $gt: 0 };
        query.warrantyExpiryDate = { $gte: now, $lte: futureDate };
      }
    }

    // Sorting
    const sortField = ['purchaseDate', 'warrantyExpiryDate', 'createdAt', 'productName', 'purchasePrice'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    let products = await Product.find(query).sort({ [sortField]: sortDirection });

    // Filter by calculated status if requested
    if (status && status !== 'All') {
      products = products.filter((p) => p.warrantyStatus.status === status);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details with service history
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access unauthorized.',
      });
    }

    // Fetch associated service records for complete product view
    const services = await ServiceRecord.find({
      productId: product._id,
      userId: req.user._id,
    }).sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      product,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      category,
      brand,
      modelNumber,
      serialNumber,
      purchaseDate,
      purchasePrice,
      seller,
      warrantyDurationMonths,
      warrantyStartDate,
      description,
    } = req.body;

    // Validate required fields
    if (!productName || !brand || !modelNumber || !purchaseDate || purchasePrice === undefined || !warrantyStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product details: name, brand, model, purchase date, price, and warranty start date.',
      });
    }

    const newProduct = new Product({
      userId: req.user._id,
      productName,
      category: category || 'Other',
      brand,
      modelNumber,
      serialNumber: serialNumber || '',
      purchaseDate,
      purchasePrice: Number(purchasePrice),
      seller: seller || '',
      warrantyDurationMonths: warrantyDurationMonths !== undefined ? Number(warrantyDurationMonths) : 0,
      warrantyStartDate,
      description: description || '',
      documents: [],
    });

    // Handle single or multiple file attachments if uploaded via multipart
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileUrl = file.path.startsWith('http')
          ? file.path
          : `/uploads/${file.filename}`;
        
        newProduct.documents.push({
          documentType: req.body.documentType || 'invoice',
          originalName: file.originalname,
          fileUrl: fileUrl,
          publicId: file.filename || '',
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product registered successfully.',
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access unauthorized.',
      });
    }

    // Editable fields
    const fields = [
      'productName',
      'category',
      'brand',
      'modelNumber',
      'serialNumber',
      'purchaseDate',
      'purchasePrice',
      'seller',
      'warrantyDurationMonths',
      'warrantyStartDate',
      'description',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // If new files uploaded in update request
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileUrl = file.path.startsWith('http')
          ? file.path
          : `/uploads/${file.filename}`;

        product.documents.push({
          documentType: req.body.documentType || 'warranty_card',
          originalName: file.originalname,
          fileUrl: fileUrl,
          publicId: file.filename || '',
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product and its associated services and files
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access unauthorized.',
      });
    }

    // Delete associated documents from disk or cloud
    if (product.documents && product.documents.length > 0) {
      for (const doc of product.documents) {
        await deleteFile(doc.fileUrl, doc.publicId);
      }
    }

    // Delete associated service records and their files
    const associatedServices = await ServiceRecord.find({ productId: product._id });
    for (const service of associatedServices) {
      if (service.documents && service.documents.length > 0) {
        for (const doc of service.documents) {
          await deleteFile(doc.fileUrl, doc.publicId);
        }
      }
    }
    await ServiceRecord.deleteMany({ productId: product._id });

    // Delete product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and associated records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
