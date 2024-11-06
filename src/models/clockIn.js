import mongoose from 'mongoose';

const clockInSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledStart: Date,
    scheduledEnd: Date,
    isLate: Boolean,
    isEarlyDeparture: Boolean,
    hoursWorked: Number,
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    missedShift: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    clockOutLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

clockInSchema.index({ location: '2dsphere' });
clockInSchema.index({ clockOutLocation: '2dsphere' });

const ClockIn = mongoose.model('ClockIn', clockInSchema);

export default ClockIn;
