import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'inactive',
    },
    paymentReference: String,
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      amount: Number,
      channel: String,
      paidAt: Date,
      transactionDate: Date,
    },

    // Add fields for card authorization
    authorization: {
      authorization_code: { type: String, trim: true },
      card_type: { type: String, trim: true },
      last4: { type: String, trim: true },
      exp_month: { type: String, trim: true },
      exp_year: { type: String, trim: true },
      bin: { type: String, trim: true },
      bank: { type: String, trim: true },
      signature: { type: String, trim: true },
      reusable: { type: Boolean },
      country_code: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to set subscription period
subscriptionSchema.methods.activateSubscription = function () {
  this.status = 'active';
  this.paymentStatus = 'completed';
  this.startDate = new Date();
  // Set end date to 30 days from now
  this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

// Add a virtual field to check if subscription is expired
subscriptionSchema.virtual('isExpired').get(function () {
  if (!this.endDate) return true;
  return new Date() > this.endDate;
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
