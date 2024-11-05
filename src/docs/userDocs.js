export const userRoutesDocs = {
  paths: {
    '/api/v1/user/clock-in': {
      post: {
        summary: 'Clock in the user for their shift',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  longitude: { type: 'number', example: -73.935242 },
                  latitude: { type: 'number', example: 40.73061 },
                },
                required: ['longitude', 'latitude'],
              },
            },
          },
        },
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
                        location: {
                          type: 'object',
                          properties: {
                            type: { type: 'string', example: 'Point' },
                            coordinates: {
                              type: 'array',
                              items: { type: 'number' },
                              example: [-73.935242, 40.73061],
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Already clocked in or invalid coordinates' },
          404: { description: 'User or company not found' },
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

export const userProfileDocs = {
  paths: {
    '/api/v1/user/profile': {
      post: {
        summary: 'Create user profile',
        tags: ['User', 'Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  work_days: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                            'Sunday',
                          ],
                          example: 'Monday',
                        },
                        shift: {
                          type: 'object',
                          properties: {
                            start: {
                              type: 'string',
                              format: 'time',
                              example: '08:00',
                            },
                            end: {
                              type: 'string',
                              format: 'time',
                              example: '17:00',
                            },
                          },
                          required: ['start', 'end'],
                        },
                      },
                      required: ['day', 'shift'],
                    },
                  },
                  full_name: { type: 'string', example: 'John Doe' },
                  role: { type: 'string', example: 'Manager' },
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Profile created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Profile created successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        _id: {
                          type: 'string',
                          example: '603d3d8a8a7a4e3f9c3e4f71',
                        },
                        full_name: { type: 'string', example: 'John Doe' },
                        role: { type: 'string', example: 'Manager' },
                        work_days: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              day: { type: 'string', example: 'Monday' },
                              shift: {
                                type: 'object',
                                properties: {
                                  start: { type: 'string', example: '08:00' },
                                  end: { type: 'string', example: '17:00' },
                                },
                              },
                            },
                          },
                        },
                        image: {
                          type: 'object',
                          properties: {
                            imageId: { type: 'string', example: 'abc123' },
                            imageUrl: {
                              type: 'string',
                              example:
                                'https://cloudinary.com/image/upload/abc123',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid request format or validation error' },
          500: { description: 'Server error' },
        },
      },
      put: {
        summary: 'Update user profile',
        tags: ['User', 'Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  work_days: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: {
                          type: 'string',
                          enum: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                            'Sunday',
                          ],
                          example: 'Tuesday',
                        },
                        shift: {
                          type: 'object',
                          properties: {
                            start: {
                              type: 'string',
                              format: 'time',
                              example: '09:00',
                            },
                            end: {
                              type: 'string',
                              format: 'time',
                              example: '18:00',
                            },
                          },
                          required: ['start', 'end'],
                        },
                      },
                      required: ['day', 'shift'],
                    },
                  },
                  full_name: { type: 'string', example: 'John Doe' },
                  role: { type: 'string', example: 'Manager' },
                  email: { type: 'string', example: 'johndoe@example.com' },
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Profile updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        _id: {
                          type: 'string',
                          example: '603d3d8a8a7a4e3f9c3e4f71',
                        },
                        full_name: { type: 'string', example: 'John Doe' },
                        role: { type: 'string', example: 'Manager' },
                        work_days: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              day: { type: 'string', example: 'Tuesday' },
                              shift: {
                                type: 'object',
                                properties: {
                                  start: { type: 'string', example: '09:00' },
                                  end: { type: 'string', example: '18:00' },
                                },
                              },
                            },
                          },
                        },
                        image: {
                          type: 'object',
                          properties: {
                            imageId: { type: 'string', example: 'abc123' },
                            imageUrl: {
                              type: 'string',
                              example:
                                'https://cloudinary.com/image/upload/abc123',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid request format or validation error' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/user/work-schedule': {
      get: {
        summary: 'Get user work schedule',
        tags: ['User', 'Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User work schedule retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User work days' },
                    data: {
                      type: 'object',
                      properties: {
                        work_days: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              day: { type: 'string', example: 'Monday' },
                              shift: {
                                type: 'object',
                                properties: {
                                  start: { type: 'string', example: '08:00' },
                                  end: { type: 'string', example: '17:00' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'User not found' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
