const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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
      default: null,
    },
    serviceRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRecord',
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'warranty_expiring_30',
        'warranty_expiring_7',
        'warranty_expiring_1',
        'warranty_expired',
        'service_upcoming',
        'service_overdue',
        'service_scheduled',
        'system',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    deduplicationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 90, // Auto remove after 90 days (MongoDB TTL)
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user notification center queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
