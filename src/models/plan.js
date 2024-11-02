import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      enum: ['Free Plan', 'Standard Plan', 'Premium Plan', 'Enterprise Plan'],
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      default: 'NGN',
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      default: 'Month',
    },
    features: {
      type: String,
      trim: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to get price in kobo
planSchema.methods.getPriceInKobo = function () {
  return Math.round(this.price * 100);
};

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
