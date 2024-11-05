export const authDocs = {
  paths: {
    '/api/v1/auth/admin/register': {
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
    '/api/v1/auth/admin/verify-otp': {
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
    '/api/v1/auth/admin/password/forgot': {
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
    '/api/v1/auth/admin/password/verify-otp': {
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
    '/api/v1/auth/admin/password/reset': {
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
                  new_password: {
                    type: 'string',
                    example: 'NewPassword123!',
                    description:
                      'Must include at least one uppercase letter, one lowercase letter, one number, and one special character',
                  },
                  confirm_password: {
                    type: 'string',
                    example: 'NewPassword123!',
                    description: 'Must match the new_password field',
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
    '/api/v1/auth/admin/login': {
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
    '/api/v1/auth/token/refresh': {
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
    '/api/v1/auth/user/invite/verify-otp': {
      post: {
        summary: 'Verify OTP for new user password',
        tags: ['Authentication', 'verify Passcode'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    example: 'user@example.com',
                  },
                  otp: {
                    type: 'string',
                    example: '123456',
                  },
                },
                required: ['email', 'otp'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example:
                        'OTP verified successfully. Please set your new password.',
                    },
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR...',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid OTP or user not found.',
          },
          401: {
            description: 'Invalid OTP.',
          },
          404: {
            description: 'User not found.',
          },
          500: {
            description: 'Server error.',
          },
        },
      },
    },
    '/api/v1/auth/user/password/new': {
      post: {
        summary: 'Set a new password for the user',
        tags: ['Authentication', 'Password Reset'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  new_password: {
                    type: 'string',
                    example: 'newSecurePassword123',
                  },
                  confirm_password: {
                    type: 'string',
                    example: 'newSecurePassword123',
                  },
                },
                required: ['new_password', 'confirm_password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password set successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example:
                        'Password set successfully. You can now sign in.',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Passwords do not match or other validation error.',
          },
          401: {
            description: 'Invalid or expired session token.',
          },
          404: {
            description: 'User not found.',
          },
          500: {
            description: 'Server error.',
          },
        },
      },
    },
    '/api/v1/auth/user/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    example: 'SecurePassword123',
                  },
                },
                required: ['email', 'password'],
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
                    message: {
                      type: 'string',
                      example: 'Login successful',
                    },
                    user: {
                      type: 'object',
                      properties: {
                        email: { type: 'string', example: 'user@example.com' },
                        // Include other user properties as needed
                      },
                    },
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR...',
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR...',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid email or password.',
          },
          403: {
            description: 'Email not verified.',
          },
          500: {
            description: 'Server error.',
          },
        },
      },
    },
    '/api/v1/auth/user/password/forgot': {
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
    '/api/v1/auth/user/password/verify-otp': {
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
    '/api/v1/auth/user/password/reset': {
      post: {
        summary: 'Reset user password',
        tags: ['Password Reset'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  new_password: {
                    type: 'string',
                    example: 'NewPassword123!',
                    description:
                      'Must include at least one uppercase letter, one lowercase letter, one number, and one special character',
                  },
                  confirm_password: {
                    type: 'string',
                    example: 'NewPassword123!',
                    description: 'Must match the new_password field',
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
  },
};
