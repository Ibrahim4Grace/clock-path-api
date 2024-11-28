import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const workDaySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
  shift: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
});

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    invitedBy: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    accountType: { type: String, default: 'User', immutable: true },
    work_days: [workDaySchema],
    image: { imageId: String, imageUrl: String },
    isEmailVerified: { type: Boolean, default: false },
    deviceToken: [String],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    reminders: {
      clockIn: { type: String },
      clockOut: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
