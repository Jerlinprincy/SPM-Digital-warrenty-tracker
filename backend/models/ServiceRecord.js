const mongoose = require('mongoose');
const dayjs = require('dayjs');

const serviceDocumentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['receipt', 'invoice', 'report', 'other'],
    default: 'receipt',
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

const serviceRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Associated product is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled service date is required'],
      index: true,
    },
    serviceProvider: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative'],
      default: 0,
    },
    actualCost: {
      type: Number,
      min: [0, 'Actual cost cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Scheduled',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    documents: [serviceDocumentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if scheduled service is overdue
serviceRecordSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'Scheduled') return false;
  return dayjs(this.scheduledDate).endOf('day').isBefore(dayjs());
});

// Compound index for querying user services by status and date
serviceRecordSchema.index({ userId: 1, status: 1, scheduledDate: 1 });
serviceRecordSchema.index({ userId: 1, productId: 1 });

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
