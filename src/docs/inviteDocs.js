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
                      example: 'Invitation(s) sent successfully.',
                    },
                    invites: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          status: { type: 'string', example: 'pending' },
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
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/invite-bulk': {
      post: {
        summary: 'Invite users in bulk via a CSV or excel file',
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
                    invites: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          status: { type: 'string', example: 'pending' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid CSV format or other validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/accept-invite': {
      post: {
        summary: 'Accept an invitation',
        tags: ['User', 'User Invitations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string', example: 'INVITE_TOKEN' },
                },
                required: ['token'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Invite accepted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Invite accepted successfully.',
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Invite not found or already accepted' },
          409: { description: 'Email is already registered' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/decline-invite': {
      post: {
        summary: 'Decline an invitation',
        tags: ['User', 'User Invitations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string', example: 'INVITE_TOKEN' },
                },
                required: ['token'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Invite declined successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Invite declined successfully.',
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Invite not found' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
