const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  // ✅ ADD THESE FIELDS
  sellerId: {
    type: String,
    default: null
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  },
  rejectedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  }],
  items: [{
    medicineId: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    manufacturer: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  prescriptionImage: {
    type: String,
    default: null
  },
  prescriptionImages: {
    type: [String],
    default: []
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'confirmed', 'packing', 'waiting_for_rider', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'scheduled'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveryAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);


