export const planDocs = {
  paths: {
    '/api/v1/admin/plans': {
      post: {
        summary: 'Create a new plan',
        tags: ['Admin', 'Plans'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Basic Plan' },
                  price: { type: 'string', example: '9.99' },
                  currency: { type: 'string', example: 'NGN' },
                  duration: { type: 'string', example: 'Monthly' },
                  features: {
                    type: 'string',
                    example: 'Feature1, Feature2, Feature3',
                  },
                },
                required: ['name', 'price', 'currency', 'duration', 'features'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Plan created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Plan created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60c72b2f9e1d1f0012d2e3b4',
                        },
                        name: { type: 'string', example: 'Basic Plan' },
                        price: { type: 'string', example: '9.99' },
                        currency: { type: 'string', example: 'NGN' },
                        duration: { type: 'string', example: 'Monthly' },
                        features: {
                          type: 'array',
                          items: { type: 'string', example: 'Feature1' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              'Plan with this name already exists or validation error',
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/plans': {
      get: {
        summary: 'Retrieve active plans',
        tags: ['Plans'],
        responses: {
          200: {
            description: 'A list of active plans',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        example: '60c72b2f9e1d1f0012d2e3b4',
                      },
                      name: { type: 'string', example: 'Basic Plan' },
                      price: { type: 'string', example: '9.99' },
                      currency: { type: 'string', example: 'USD' },
                      duration: { type: 'string', example: 'Monthly' },
                      features: {
                        type: 'array',
                        items: { type: 'string', example: 'Feature1' },
                      },
                      isActive: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
