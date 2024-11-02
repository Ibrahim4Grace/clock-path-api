import { ServerError, asyncHandler } from '../middlewares/index.js';
import https from 'https';
import { log } from '../utils/index.js';

//function for making Paystack requests
export const makePaystackRequest = (options, params) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new ServerError('Invalid response from payment service'));
        }
      });
    });

    req.on('error', (error) => {
      log.error('Paystack request error:', error);
      reject(new ServerError('Payment service error'));
    });

    if (params) {
      req.write(params);
    }
    req.end();
  });
};

// Handle successful payment
export const handleSuccessfulPayment = asyncHandler(
  async (subscription, paymentData) => {
    subscription.status = 'active';
    subscription.paymentStatus = 'completed';
    subscription.startDate = new Date();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (paymentData.authorization) {
      subscription.authorization = {
        authorization_code: paymentData.authorization.authorization_code,
        card_type: paymentData.authorization.card_type,
        last4: paymentData.authorization.last4,
        exp_month: paymentData.authorization.exp_month,
        exp_year: paymentData.authorization.exp_year,
        bin: paymentData.authorization.bin,
        bank: paymentData.authorization.bank,
        signature: paymentData.authorization.signature,
        reusable: paymentData.authorization.reusable,
        country_code: paymentData.authorization.country_code,
      };
    }

    await subscription.save();
  }
);
