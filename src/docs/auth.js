export const authDocs = {
  paths: {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new admin',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  password: { type: 'string', example: 'strongpassword123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful. Please verify your email.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'number', example: 201 },
                    message: {
                      type: 'string',
                      example:
                        'Registration successful. Please verify your email.',
                    },
                  },
                },
              },
            },
          },
          409: { description: 'Email already registered' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/auth/verify-otp': {
      post: {
        summary: 'Verify OTP for registration',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Email Verified successfully.',
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid or expired OTP' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/auth/forget-password': {
      post: {
        summary: 'Request OTP for password reset',
        tags: ['Password Reset'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Verification code sent.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Your 6-digit Verification Code has been sent.',
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Email not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/auth/verify-forget-password-otp': {
      post: {
        summary: 'Verify OTP for password reset',
        tags: ['Password Reset'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              'OTP verified successfully. You can now reset your password.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example:
                        'OTP verified successfully. You can now reset your password.',
                    },
                    resetToken: { type: 'string', example: 'JWT_RESET_TOKEN' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid or expired OTP' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        summary: 'Reset admin password',
        tags: ['Password Reset'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  newPassword: { type: 'string', example: 'NewPassword123!' },
                  confirm_newPassword: {
                    type: 'string',
                    example: 'NewPassword123!',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Password reset successfully.',
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Reset token is missing or invalid' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login admin or user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'john.doe@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful.' },
                    accessToken: {
                      type: 'string',
                      example: 'JWT_ACCESS_TOKEN',
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'JWT_REFRESH_TOKEN',
                    },
                    user: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: 'user_id' },
                        email: {
                          type: 'string',
                          example: 'john.doe@example.com',
                        },
                        full_name: {
                          type: 'string',
                          example: 'john doe',
                        },
                        isEmailVerified: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid email or password',
          },
          403: {
            description: 'Verify your email before sign in',
          },
          404: {
            description: 'Email not found',
          },
          500: {
            description: 'Server error',
          },
        },
      },
    },

    '/api/v1/auth/refresh-token': {
      post: {
        summary: 'Refresh access token',
        tags: ['Authentication'],
        responses: {
          200: {
            description: 'New access token issued.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: {
                      type: 'string',
                      example: 'JWT_ACCESS_TOKEN',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'No refresh token provided or invalid refresh token',
          },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
