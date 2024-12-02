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
                      example: 'Clocked in successfully (Late arrival)',
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
                        scheduledStart: {
                          type: 'string',
                          example: '2024-10-29T09:00:00.000Z',
                        },
                        scheduledEnd: {
                          type: 'string',
                          example: '2024-10-29T17:00:00.000Z',
                        },
                        isLate: { type: 'boolean', example: true },
                        missedShift: { type: 'boolean', example: false },
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
                      example: 'Clocked out successfully (Early departure)',
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
                          example: '2024-10-29T17:34:56.789Z',
                        },
                        hoursWorked: { type: 'number', example: 8.5 },
                        isEarlyDeparture: { type: 'boolean', example: true },
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
    '/api/v1/user/reminder': {
      post: {
        summary: 'Set clock-in and clock-out reminders for today',
        tags: ['User', 'Reminders'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  clockInReminder: { type: 'string', example: '08:00' },
                  clockOutReminder: { type: 'string', example: '16:00' },
                },
                required: ['clockInReminder', 'clockOutReminder'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Reminder set successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Reminder updated successfully',
                    },
                    reminders: {
                      type: 'object',
                      properties: {
                        clockIn: { type: 'string', example: '08:00 AM' },
                        clockOut: { type: 'string', example: '04:00 PM' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              'Invalid reminder time or no work schedule found for today.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example:
                        'Clock-in reminder must be before shift start time.',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'User not found' },
                  },
                },
              },
            },
          },
          500: { description: 'Server error' },
        },
      },
      get: {
        summary: 'Get current clock-in and clock-out reminders',
        tags: ['User', 'Reminders'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Reminders retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Reminders retrieved successfully',
                    },
                    reminders: {
                      type: 'object',
                      properties: {
                        clockIn: { type: 'string', example: '08:00 AM' },
                        clockOut: { type: 'string', example: '04:00 PM' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found or no reminders set.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example: 'No reminders set for the user',
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
    '/api/v1/user/recent-activity': {
      get: {
        summary: 'Get the users recent clock-in and clock-out activity',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Recent activity retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Recent activity retrieved successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: { type: 'string', example: '2024-10-29' },
                              clockInTime: {
                                type: 'string',
                                example: '12:34 PM',
                              },
                              clockOutTime: {
                                type: 'string',
                                example: '05:34 PM',
                              },
                              status: { type: 'string', example: 'On Time' },
                              hoursWorked: { type: 'number', example: 8.5 },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'number', example: 1 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'User not found or no activity available' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/user/requests': {
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
    '/api/v1/user/requests': {
      get: {
        summary: 'Get all user requests',
        tags: ['User Requests'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            required: false,
            schema: {
              type: 'integer',
              example: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page for pagination',
            required: false,
            schema: {
              type: 'integer',
              example: 10,
            },
          },
        ],
        responses: {
          200: {
            description: 'User requests retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User requests retrieved successfully',
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          requestType: { type: 'string', example: 'vacation' },
                          reason: { type: 'string', example: 'Personal' },
                          note: { type: 'string', example: 'Family event' },
                          startDate: {
                            type: 'string',
                            example: '2024-11-07T10:00:00Z',
                          },
                          endDate: {
                            type: 'string',
                            example: '2024-11-08T10:00:00Z',
                          },
                          createdAt: {
                            type: 'string',
                            example: '2024-11-01T12:00:00Z',
                          },
                        },
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'integer', example: 1 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description:
              'No requests found for the user or paginated results not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example: 'No requests found for this user.',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
  },
};

export const userPasswordDocs = {
  paths: {
    '/api/v1/user/passwords': {
      post: {
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
                  image: { type: 'string', format: 'binary' },
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
    '/api/v1/user/logout': {
      post: {
        summary: 'Log out a user by clearing their authentication cookies',
        tags: ['User', 'Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User successfully logged out and cookies cleared.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Logout successful',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or expired token',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/user/work-schedule': {
      get: {
        summary: 'Get user work schedule',
        tags: ['User', 'Profile'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            required: false,
            schema: {
              type: 'integer',
              example: 1,
            },
          },
        ],
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
                              date: { type: 'string', example: '2024-11-17' },
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
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'integer', example: 1 },
                            totalPages: { type: 'integer', example: 2 },
                            totalItems: { type: 'integer', example: 7 },
                            perPage: { type: 'integer', example: 6 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found or no workdays available.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example: 'User not found or no workdays available.',
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
    '/api/v1/user/notifications': {
      get: {
        summary: 'Get user notifications and reminders',
        tags: ['User', 'Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination (default is 1)',
            required: false,
            schema: { type: 'integer', example: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page (default is 10)',
            required: false,
            schema: { type: 'integer', example: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Notifications and reminders retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notifications: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string', example: 'request' },
                          status: { type: 'string', example: 'accepted' },
                          message: {
                            type: 'string',
                            example:
                              'Your vacation request for 2024-11-01 to 2024-11-05 has been accepted',
                          },
                          date: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    reminders: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string', example: 'reminder' },
                          category: { type: 'string', example: 'clockIn' },
                          message: {
                            type: 'string',
                            example: 'Daily clock-in reminder set for 08:00 AM',
                          },
                          time: { type: 'string', example: '08:00 AM' },
                        },
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'integer', example: 1 },
                        totalPages: { type: 'integer', example: 5 },
                        totalItems: { type: 'integer', example: 50 },
                        itemsPerPage: { type: 'integer', example: 10 },
                        hasNextPage: { type: 'boolean', example: true },
                        hasPrevPage: { type: 'boolean', example: false },
                        nextPage: { type: 'integer', example: 2 },
                        prevPage: { type: 'integer', example: null },
                      },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        totalNotifications: { type: 'integer', example: 45 },
                        totalReminders: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized: Invalid or missing token' },
          500: { description: 'Internal server error' },
        },
      },
    },
  },
};
