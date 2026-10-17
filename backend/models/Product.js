const mongoose = require('mongoose');
const { calculateWarrantyExpiryDate, getWarrantyStatus } = require('../utils/warrantyCalculator');

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['invoice', 'warranty_card', 'receipt', 'other'],
    default: 'other',
  },
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Electronics', 'Home Appliances', 'Furniture', 'Kitchen Appliances', 'Other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'Other',
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    modelNumber: {
      type: String,
      required: [true, 'Model number is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    seller: {
      type: String,
      trim: true,
      default: '',
    },
    warrantyDurationMonths: {
      type: Number,
      required: [true, 'Warranty duration is required'],
      min: [0, 'Warranty duration cannot be negative'],
      default: 0,
    },
    warrantyStartDate: {
      type: Date,
      required: [true, 'Warranty start date is required'],
    },
    warrantyExpiryDate: {
      type: Date,
      default: null,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    documents: [documentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-calculate warrantyExpiryDate before saving
productSchema.pre('save', function (next) {
  if (this.isModified('warrantyStartDate') || this.isModified('warrantyDurationMonths')) {
    this.warrantyExpiryDate = calculateWarrantyExpiryDate(
      this.warrantyStartDate,
      this.warrantyDurationMonths
    );
  }
  next();
});

// Virtual for dynamic warranty status & remaining days
productSchema.virtual('warrantyStatus').get(function () {
  return getWarrantyStatus(this);
});

// Compound indexes for user queries
productSchema.index({ userId: 1, warrantyExpiryDate: 1 });
productSchema.index({ userId: 1, category: 1 });
productSchema.index({ userId: 1, productName: 'text', brand: 'text', modelNumber: 'text' });

module.exports = mongoose.model('Product', productSchema);
