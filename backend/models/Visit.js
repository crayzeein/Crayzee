const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitorId: { 
    type: String, 
    required: true, 
    index: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  path: { 
    type: String, 
    required: true,
    default: '/' 
  },
  referrer: { 
    type: String, 
    default: 'Direct' 
  },
  deviceType: { 
    type: String, 
    enum: ['mobile', 'desktop', 'tablet', 'unknown'], 
    default: 'unknown' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
});

visitSchema.index({ visitorId: 1, createdAt: -1 });
visitSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
