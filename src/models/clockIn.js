import mongoose from 'mongoose';

const clockInSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    missedShift: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    }
  },
  {
    timestamps: true,
  }
);

clockInSchema.index({ location: 'Lagos' });

const ClockIn = mongoose.model('ClockIn', clockInSchema);

export default ClockIn;
