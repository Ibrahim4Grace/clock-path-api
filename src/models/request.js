import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestType: { type: String, required: true, trim: true },
    reason: { type: String, trim: true },
    note: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
