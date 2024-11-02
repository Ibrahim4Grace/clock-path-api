import { Subscription, Plan } from '../models/index.js';
import { customEnv } from '../config/index.js';
import https from 'https';
import { sendJsonResponse } from '../helper/index.js';
import {
  makePaystackRequest,
  handleSuccessfulPayment,
  log,
} from '../utils/index.js';
import {
  asyncHandler,
  ServerError,
  BadRequest,
  ResourceNotFound,
} from '../middlewares/index.js';

export const initializeSubscription = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const admin = req.currentAdmin;

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ResourceNotFound('Plan not found');
  }

  // Convert price string to number and remove commas if present
  const priceInNaira = Number(plan.price.toString().replace(/,/g, ''));
  const priceInKobo = priceInNaira * 100;

  if (isNaN(priceInKobo) || priceInKobo <= 0) {
    throw new Error('Invalid price calculation');
  }

  // Initialize Paystack transaction
  const params = JSON.stringify({
    email: admin.email,
    amount: priceInKobo,
    callback_url: `${customEnv.frontendDevUrl}/payment/callback`,
    metadata: {
      admin_id: admin._id,
      plan_id: planId,
    },
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customEnv.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const paystackRequest = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          const result = JSON.parse(data);
          log.info('Paystack parsed response:', result);

          if (result.status) {
            const subscription = await Subscription.create({
              admin: admin._id,
              plan: planId,
              paymentReference: result.data.reference,
              amount: priceInNaira,
              paymentStatus: 'pending',
              status: 'inactive',
            });

            res.json({
              success: true,
              authorization_url: result.data.authorization_url,
              reference: result.data.reference,
              subscription: subscription,
            });
            resolve();
          } else {
            throw new ResourceNotFound('Payment initialization failed');
          }
        } catch (error) {
          log.error('Error processing Paystack response:', error);
          reject(error);
        }
      });
    });

    paystackRequest.on('error', (error) => {
      log.error('Paystack request error:', error);
      reject(new ServerError('Payment service error'));
    });

    paystackRequest.write(params);
    paystackRequest.end();
  });
});

export const verifySubscription = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${customEnv.paystackSecret}`,
    },
  };

  return new Promise((resolve, reject) => {
    const verifyRequest = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          const result = JSON.parse(data);
          log.info('Paystack verification response:', result);

          if (result.status && result.data.status === 'success') {
            const subscription = await Subscription.findOne({
              paymentReference: reference,
            });

            if (!subscription) {
              throw new ResourceNotFound('Subscription not found');
            }

            // Use the new method to activate subscription
            subscription.activateSubscription();

            // Add payment details Convert back to Naira
            subscription.paymentDetails = {
              amount: result.data.amount / 100,
              channel: result.data.channel,
              paidAt: new Date(result.data.paid_at),
              transactionDate: new Date(result.data.transaction_date),
            };

            await subscription.save();

            sendJsonResponse(
              res,
              200,
              'Subscription activated successfully',
              subscription
            );
            resolve();
          } else {
            throw new BadRequest(
              `Payment verification failed: ${
                result.message || 'Unknown error'
              }`
            );
          }
        } catch (error) {
          log.error('Error processing verification:', error);
          reject(error);
        }
      });
    });

    verifyRequest.on('error', (error) => {
      log.error('Verification request error:', error);
      reject(new ServerError('Verification service error'));
    });

    verifyRequest.end();
  });
});

export const chargeCard = asyncHandler(async (req, res) => {
  const { planId, card } = req.body;
  const admin = req.currentAdmin;

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ResourceNotFound('Plan not found');
  }

  // Convert price to kobo (Paystack uses kobo)
  const priceInNaira = Number(plan.price.toString().replace(/,/g, ''));
  const priceInKobo = priceInNaira * 100;

  const params = JSON.stringify({
    email: admin.email,
    amount: priceInKobo,
    card: {
      number: card.number,
      cvv: card.cvv,
      expiry_month: card.expiryMonth,
      expiry_year: card.expiryYear,
    },
    metadata: {
      admin_id: admin._id.toString(),
      plan_id: planId,
    },
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/charge',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customEnv.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await makePaystackRequest(options, params);

  if (!result.status) {
    throw new ResourceNotFound(
      result.message || 'Payment initialization failed'
    );
  }

  const subscription = await Subscription.create({
    admin: admin._id,
    plan: planId,
    paymentReference: result.data.reference,
    amount: priceInNaira,
    paymentStatus: 'pending',
    status: 'inactive',
  });

  // Handle different response scenarios
  if (result.data.status === 'success') {
    await handleSuccessfulPayment(subscription, result.data);

    res.json({
      success: true,
      message: 'Payment successful',
      subscription,
    });
  } else if (result.data.status === 'send_pin') {
    res.json({
      success: true,
      message: 'Please enter PIN',
      reference: result.data.reference,
      subscription,
    });
  } else if (result.data.status === 'send_otp') {
    res.json({
      success: true,
      message: 'Please enter OTP',
      reference: result.data.reference,
      subscription,
    });
  } else {
    throw new Error(`Unexpected payment status: ${result.data.status}`);
  }
});

export const submitPin = asyncHandler(async (req, res) => {
  const { reference, pin } = req.body;

  const subscription = await Subscription.findOne({
    paymentReference: reference,
  });
  if (!subscription) {
    throw new ResourceNotFound('Subscription not found');
  }

  const params = JSON.stringify({ reference, pin });
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/charge/submit_pin',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customEnv.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makePaystackRequest(options, params);

    if (result.data.status === 'success') {
      await handleSuccessfulPayment(subscription, result.data);
      res.json({
        success: true,
        message: 'Payment successful',
        subscription,
      });
    } else if (result.data.status === 'send_otp') {
      res.json({
        success: true,
        message: 'Please enter OTP',
        reference: result.data.reference,
      });
    } else {
      throw new ResourceNotFound(result.message || 'PIN verification failed');
    }
  } catch (error) {
    log.error('Error processing PIN submission:', error);
    throw new ServerError(error.message || 'PIN verification failed');
  }
});

export const submitOtp = asyncHandler(async (req, res) => {
  const { reference, otp } = req.body;

  const subscription = await Subscription.findOne({
    paymentReference: reference,
  });
  if (!subscription) {
    throw new ResourceNotFound('Subscription not found');
  }

  const params = JSON.stringify({ reference, otp });
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/charge/submit_otp',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customEnv.paystackSecret}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const result = await makePaystackRequest(options, params);

    if (result.data.status === 'success') {
      await handleSuccessfulPayment(subscription, result.data);
      res.json({
        success: true,
        message: 'Payment successful',
        subscription,
      });
    } else {
      throw new ResourceNotFound(result.message || 'OTP verification failed');
    }
  } catch (error) {
    log.error('Error processing OTP submission:', error);
    throw new ServerError(error.message || 'OTP verification failed');
  }
});
