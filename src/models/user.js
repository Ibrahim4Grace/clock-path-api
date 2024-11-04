import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, select: false },
    invitedBy: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    accountType: { type: String, default: 'User', immutable: true },
    work_days: {
      type: [String],
      default: ['Mon', 'Sun'],
    },
    shift_duration: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '05:00' },
    },
    image: { imageId: String, imageUrl: String },
    isEmailVerified: { type: Boolean, default: false },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compnay',
      required: true,
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
