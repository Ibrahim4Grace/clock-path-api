import mongoose from 'mongoose';

const clockInSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    missedShift: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ClockIn = mongoose.model('ClockIn', clockInSchema);

export default ClockIn;
