export const userRoutesDocs = {
  paths: {
    '/api/v1/user/clock-in': {
      post: {
        summary: 'Clock in the user for their shift',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: 'Clocked in successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Clocked in successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'string', example: 'User ID' },
                        clockInTime: {
                          type: 'string',
                          example: '2024-10-29T12:34:56.789Z',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Already clocked in' },
          404: { description: 'User not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/user/clock-out': {
      post: {
        summary: 'Clock out the user from their shift',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Clocked out successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Clocked out successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'string', example: 'User ID' },
                        clockInTime: {
                          type: 'string',
                          example: '2024-10-29T12:34:56.789Z',
                        },
                        clockOutTime: {
                          type: 'string',
                          example: '2024-10-29T13:34:56.789Z',
                        },
                        missedShift: { type: 'boolean', example: false },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'No active session to clock out' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/user/request': {
      post: {
        summary: 'Create a user request',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requestType: { type: 'string', example: 'Leave' },
                  reason: { type: 'string', example: 'Sick leave' },
                  note: { type: 'string', example: 'Doctor appointment' },
                  startDate: {
                    type: 'string',
                    example: '2024-10-29T09:00:00.000Z',
                  },
                  endDate: {
                    type: 'string',
                    example: '2024-10-29T17:00:00.000Z',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Request created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Request created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'string', example: 'User ID' },
                        requestId: { type: 'string', example: 'Request ID' },
                      },
                    },
                  },
                },
              },
            },
          },
          409: {
            description: 'A request already exists within this date range',
          },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/user/edit-profile': {
      post: {
        summary: 'Edit user profile',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  full_name: { type: 'string', example: 'John Doe' },
                  role: { type: 'string', example: 'Admin' },
                  work_days: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Monday', 'Tuesday'],
                  },
                  shift_duration: {
                    type: 'object',
                    properties: {
                      start: { type: 'string', example: '09:00' },
                      end: { type: 'string', example: '17:00' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string', example: 'User ID' },
                        full_name: { type: 'string', example: 'John Doe' },
                        email: {
                          type: 'string',
                          example: 'john.doe@example.com',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'User not found or update failed' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};

export const userPasswordDocs = {
  paths: {
    '/api/v1/user/passwords': {
      put: {
        summary: 'Manage user password',
        tags: ['User', 'User Management'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  current_password: {
                    type: 'string',
                    example: 'oldPassword123',
                  },
                  new_password: { type: 'string', example: 'newPassword123' },
                  confirm_password: {
                    type: 'string',
                    example: 'newPassword123',
                  },
                },
                required: [
                  'current_password',
                  'new_password',
                  'confirm_password',
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User password updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User password updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'user_id_123' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              'Invalid input, such as incorrect current password or password mismatch.',
          },
          404: {
            description: 'User not found.',
          },
          500: {
            description: 'Server error while updating password.',
          },
        },
      },
    },
  },
};
