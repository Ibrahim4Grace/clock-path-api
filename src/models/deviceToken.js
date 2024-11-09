import mongoose from 'mongoose';

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  deviceToken: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);

export default DeviceToken;
