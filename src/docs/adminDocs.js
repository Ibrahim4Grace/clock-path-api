export const dashboardStats = {
  paths: {
    '/api/v1/admin/dashboard-stats': {
      get: {
        summary: 'Retrieve statistics for the admin dashboard',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Admin stats retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Admin stats retrieved successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'number', example: 100 },
                        totalPendingRequests: { type: 'number', example: 5 },
                        totalClockIns: { type: 'number', example: 200 },
                        totalMissedShifts: { type: 'number', example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};

export const employeeDocs = {
  paths: {
    '/api/v1/admin/users': {
      get: {
        summary: 'Retrieve paginated list of all users',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Users fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'user123' },
                              fullName: { type: 'string', example: 'John Doe' },
                              email: {
                                type: 'string',
                                example: 'john@example.com',
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'number', example: 1 },
                            totalPages: { type: 'number', example: 10 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Paginated results not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/users/{id}': {
      get: {
        summary: 'Retrieve a specific user by ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User fetched successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'user123' },
                        email: { type: 'string', example: 'john@example.com' },
                        fullName: { type: 'string', example: 'John Doe' },
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
      put: {
        summary: 'Edit a user by ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  full_name: { type: 'string', example: 'John Doe' },
                  role: { type: 'string', example: 'user' },
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
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
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
                        id: { type: 'string', example: 'user123' },
                        email: { type: 'string', example: 'john@example.com' },
                        fullName: { type: 'string', example: 'John Doe' },
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
          404: { description: 'User not found or update failed' },
          500: { description: 'Server error' },
        },
      },
      delete: {
        summary: 'Delete a user by ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User ID',
          },
        ],
        responses: {
          201: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'User deleted successfully',
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

export const requestDocs = {
  paths: {
    '/api/v1/admin/clock-in': {
      get: {
        summary: 'Retrieve all clock-in records',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Clock-in records retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Clock-in records retrieved successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        records: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              _id: {
                                type: 'string',
                                example: '60c72b2f5f1b2c001c4e0a65',
                              },
                              user: {
                                type: 'string',
                                example: '60c72b2f5f1b2c001c4e0a66',
                              },
                              clockInTime: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-10-01T08:00:00Z',
                              },
                              clockOutTime: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-10-01T17:00:00Z',
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            totalPages: { type: 'integer', example: 5 },
                            currentPage: { type: 'integer', example: 1 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/requests': {
      get: {
        summary: 'Retrieve user requests',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Requests fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Requests fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        Requests: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              _id: {
                                type: 'string',
                                example: '60c72b2f5f1b2c001c4e0a67',
                              },
                              requestType: { type: 'string', example: 'Leave' },
                              reason: { type: 'string', example: 'Medical' },
                              duration: {
                                type: 'string',
                                format: 'date-time',
                                example: '2023-10-01T08:00:00Z',
                              },
                              note: {
                                type: 'string',
                                example: 'Need to take leave',
                              },
                              status: { type: 'string', example: 'pending' },
                              user: {
                                type: 'object',
                                properties: {
                                  full_name: {
                                    type: 'string',
                                    example: 'John Doe',
                                  },
                                  role: { type: 'string', example: 'User' },
                                },
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'integer', example: 1 },
                            totalPages: { type: 'integer', example: 3 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/requests/{id}': {
      get: {
        summary: 'Retrieve request by ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the request to retrieve',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Request details fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Request details fetched successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        note: { type: 'string', example: 'Need to take leave' },
                        user: { type: 'string', example: 'John Doe' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Request not found' },
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/requests/{id}/status': {
      patch: {
        summary: 'Update request status',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the request to update',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['accepted', 'declined'],
                    example: 'accepted',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Request status updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Request accepted successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        requestId: {
                          type: 'string',
                          example: '60c72b2f5f1b2c001c4e0a67',
                        },
                        status: { type: 'string', example: 'accepted' },
                        user: {
                          type: 'object',
                          properties: {
                            full_name: { type: 'string', example: 'John Doe' },
                            role: { type: 'string', example: 'User' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid status' },
          404: { description: 'Request not found' },
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/admin/users': {
      post: {
        summary: 'Update admin profile',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', example: 'Admin User' },
                  email: { type: 'string', example: 'admin@example.com' },
                  password: { type: 'string', example: 'securepassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Admin updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Admin updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        full_name: { type: 'string', example: 'Admin User' },
                        email: { type: 'string', example: 'admin@example.com' },
                        image: {
                          type: 'object',
                          properties: {
                            imageId: {
                              type: 'string',
                              example: 'cloudinary_image_id',
                            },
                            imageUrl: {
                              type: 'string',
                              example: 'https://example.com/image.jpg',
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
          401: { description: 'Unauthorized access' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};

export const attendanceDocs = {
  paths: {
    '/api/v1/admin/attendance-summary': {
      get: {
        summary: 'Get attendance summary for users',
        tags: ['Admin', 'Attendance'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Attendance summary retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Attendance summary retrieved successfully',
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          user: { type: 'string', example: 'Korex Korex' },
                          role: { type: 'string', example: 'Manager' },
                          daysPresent: { type: 'integer', example: 1 },
                          missedShifts: { type: 'integer', example: 1 },
                          lateEntries: { type: 'integer', example: 1 },
                          attendancePercentage: {
                            type: 'string',
                            example: '20.00%',
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
            description: 'No attendance data found for the requested users.',
          },
          500: {
            description: 'Server error while retrieving attendance summary.',
          },
        },
      },
    },
    '/api/v1/admin/export-summary': {
      get: {
        summary: 'Export attendance summary as PDF',
        tags: ['Admin', 'Attendance'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'PDF of attendance summary generated successfully.',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          500: {
            description: 'Server error while generating PDF.',
          },
        },
      },
    },
  },
};

export const adminPasswordDocs = {
  paths: {
    '/api/v1/admin/passwords': {
      put: {
        summary: 'Manage admin password',
        tags: ['Admin', 'User Management'],
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
            description: 'Admin password updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Admin password updated successfully',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'admin_id_123' },
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
            description: 'Admin not found.',
          },
          500: {
            description: 'Server error while updating password.',
          },
        },
      },
    },
    '/api/v1/admin/logout': {
      post: {
        summary: 'Log out a admin by clearing their authentication cookies',
        tags: ['Admin', 'Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Admin successfully logged out and cookies cleared.',
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
  },
};

export const companyDocs = {
  paths: {
    '/api/v1/admin/company/register': {
      post: {
        summary: 'Register a new company',
        tags: ['Admin', 'Company Registration'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'My New Company',
                  },
                  address: {
                    type: 'string',
                    example: '1234 Business Rd, Cityville, ST 12345',
                  },
                },
                required: ['name', 'address'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Company registered successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Company registered successfully',
                    },
                    company: {
                      type: 'object',
                      properties: {
                        _id: {
                          type: 'string',
                          example: '60d21b4667d0d8992e610c85',
                        },
                        name: { type: 'string', example: 'My New Company' },
                        address: {
                          type: 'string',
                          example: '1234 Business Rd, Cityville, ST 12345',
                        },
                        adminId: {
                          type: 'string',
                          example: '60d21b4667d0d8992e610c85',
                        },
                        planId: {
                          type: 'string',
                          example: '60d21b4667d0d8992e610c85',
                        },
                        currentUserCount: { type: 'number', example: 1 },
                        isActive: { type: 'boolean', example: true },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2024-10-31T10:09:24.323Z',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2024-10-31T20:39:08.983Z',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid input or no active subscription found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example:
                        'No active subscription found. Please purchase a plan first.',
                    },
                  },
                },
              },
            },
          },
          409: {
            description: 'Conflict - Admin already has a registered company',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example: 'Admin already has a registered company',
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
