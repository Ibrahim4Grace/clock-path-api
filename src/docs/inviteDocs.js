export const inviteDocs = {
  paths: {
    '/api/v1/admin/invite': {
      post: {
        summary: 'Invite a user via email',
        tags: ['Admin', 'User Invitations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  emails: {
                    type: 'array',
                    items: {
                      type: 'string',
                      example: 'user@example.com',
                    },
                  },
                },
                required: ['emails'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Invitation sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User(s) invited successfully',
                    },
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          status: { type: 'string', example: 'created' },
                          userId: { type: 'string', example: '603d3d8a8a7a4e3f9c3e4f71' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid email format or other validation error',
          },
          409: {
            description: 'User with the given email already exists',
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/invite-bulk': {
      post: {
        summary: 'Invite users in bulk via a CSV or Excel file',
        tags: ['Admin', 'User Invitations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Bulk invitations sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Bulk invitations sent successfully.',
                    },
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          status: { type: 'string', example: 'created' },
                          userId: { type: 'string', example: '603d3d8a8a7a4e3f9c3e4f71' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid CSV format or other validation error' },
          409: {
            description: 'User with one or more emails already exists',
          },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
