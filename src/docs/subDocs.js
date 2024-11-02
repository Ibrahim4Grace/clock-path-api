export const subscriptionDocs = {
  paths: {
    '/api/v1/admin/subscriptions/initialize': {
      post: {
        summary: 'Initialize a subscription',
        tags: ['Admin', 'Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  planId: {
                    type: 'string',
                    example: '60c72b2f9e1d1f0012d2e3b4',
                  },
                },
                required: ['planId'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Subscription initialized successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    authorization_url: {
                      type: 'string',
                      example: 'https://paystack.com/authorize/...',
                    },
                    reference: {
                      type: 'string',
                      example: 'paystack_reference_123',
                    },
                    subscription: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        admin: { type: 'string', example: 'admin_id' },
                        plan: { type: 'string', example: 'plan_id' },
                        paymentReference: {
                          type: 'string',
                          example: 'paystack_reference_123',
                        },
                        amount: { type: 'number', example: 999 },
                        paymentStatus: { type: 'string', example: 'pending' },
                        status: { type: 'string', example: 'inactive' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid plan ID or plan not found',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/admin/subscriptions/verify/{reference}': {
      get: {
        summary: 'Verify a subscription payment',
        tags: ['Admin', 'Subscriptions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'reference',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: 'paystack_reference_123',
            },
          },
        ],
        responses: {
          200: {
            description:
              'Payment verified successfully and subscription activated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Subscription activated successfully',
                    },
                    subscription: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        admin: { type: 'string', example: 'admin_id' },
                        plan: { type: 'string', example: 'plan_id' },
                        paymentReference: {
                          type: 'string',
                          example: 'paystack_reference_123',
                        },
                        amount: { type: 'number', example: 999 },
                        paymentDetails: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number', example: 9.99 },
                            channel: { type: 'string', example: 'card' },
                            paidAt: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                            transactionDate: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                          },
                        },
                        paymentStatus: { type: 'string', example: 'active' },
                        status: { type: 'string', example: 'active' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description:
              'Subscription not found or payment verification failed',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/admin/subscriptions/charge-card': {
      post: {
        summary: 'Charge a card for a subscription',
        tags: ['Admin', 'Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  planId: {
                    type: 'string',
                    example: '60c72b2f9e1d1f0012d2e3b4',
                  },
                  card: {
                    type: 'object',
                    properties: {
                      number: { type: 'string', example: '1234567890123456' },
                      cvv: { type: 'string', example: '123' },
                      expiryMonth: { type: 'string', example: '12' },
                      expiryYear: { type: 'string', example: '25' },
                    },
                    required: ['number', 'cvv', 'expiryMonth', 'expiryYear'],
                  },
                },
                required: ['planId', 'card'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Card charged successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Payment successful' },
                    subscription: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        admin: { type: 'string', example: 'admin_id' },
                        plan: { type: 'string', example: 'plan_id' },
                        paymentReference: {
                          type: 'string',
                          example: 'paystack_reference_123',
                        },
                        amount: { type: 'number', example: 999 },
                        paymentStatus: { type: 'string', example: 'pending' },
                        status: { type: 'string', example: 'inactive' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid card details or payment failed',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/admin/subscriptions/submit-pin': {
      post: {
        summary: 'Submit PIN for payment verification',
        tags: ['Admin', 'Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reference: {
                    type: 'string',
                    example: 'paystack_reference_123',
                  },
                  pin: { type: 'string', example: '1234' },
                },
                required: ['reference', 'pin'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'PIN submitted successfully and payment verified',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Payment successful' },
                    subscription: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        admin: { type: 'string', example: 'admin_id' },
                        plan: { type: 'string', example: 'plan_id' },
                        paymentReference: {
                          type: 'string',
                          example: 'paystack_reference_123',
                        },
                        amount: { type: 'number', example: 999 },
                        paymentDetails: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number', example: 9.99 },
                            channel: { type: 'string', example: 'card' },
                            paidAt: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                            transactionDate: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                          },
                        },
                        paymentStatus: { type: 'string', example: 'active' },
                        status: { type: 'string', example: 'active' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid reference or PIN submission failed',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/admin/subscriptions/submit-otp': {
      post: {
        summary: 'Submit OTP for payment verification',
        tags: ['Admin', 'Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reference: {
                    type: 'string',
                    example: 'paystack_reference_123',
                  },
                  otp: { type: 'string', example: '123456' },
                },
                required: ['reference', 'otp'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP submitted successfully and payment verified',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Payment successful' },
                    subscription: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        admin: { type: 'string', example: 'admin_id' },
                        plan: { type: 'string', example: 'plan_id' },
                        paymentReference: {
                          type: 'string',
                          example: 'paystack_reference_123',
                        },
                        amount: { type: 'number', example: 999 },
                        paymentDetails: {
                          type: 'object',
                          properties: {
                            amount: { type: 'number', example: 9.99 },
                            channel: { type: 'string', example: 'card' },
                            paidAt: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                            transactionDate: {
                              type: 'string',
                              example: '2024-01-01T12:00:00Z',
                            },
                          },
                        },
                        paymentStatus: { type: 'string', example: 'active' },
                        status: { type: 'string', example: 'active' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid reference or OTP submission failed',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
  },
};
