const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    console.log('Validation errors:', {
      requestBody: req.body,
      errors: errorMessages,
      url: req.url,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  // User validation rules
  user: {
    username: {
      in: ['body'],
      isLength: {
        options: { min: 3, max: 50 },
        errorMessage: 'Username must be between 3 and 50 characters'
      },
      matches: {
        options: /^[a-zA-Z0-9_]+$/,
        errorMessage: 'Username can only contain letters, numbers, and underscores'
      }
    },
    email: {
      in: ['body'],
      isEmail: {
        errorMessage: 'Please provide a valid email address'
      },
      matches: {
        options: /@calpoly\.edu$/,
        errorMessage: 'Email must be a valid Cal Poly SLO address (@calpoly.edu)'
      }
    },
    password: {
      in: ['body'],
      isLength: {
        options: { min: 8, max: 128 },
        errorMessage: 'Password must be between 8 and 128 characters'
      },
      matches: {
        options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    },
    firstName: {
      in: ['body'],
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: 'First name must be between 1 and 100 characters'
      },
      isAlpha: {
        errorMessage: 'First name can only contain letters'
      }
    },
    lastName: {
      in: ['body'],
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: 'Last name must be between 1 and 100 characters'
      },
      isAlpha: {
        errorMessage: 'Last name can only contain letters'
      }
    },
    year: {
      in: ['body'],
      optional: true,
      isInt: {
        options: { min: 1, max: 10 },
        errorMessage: 'Year must be between 1 and 10'
      }
    },
    major: {
      in: ['body'],
      optional: true,
      isLength: {
        options: { max: 200 },
        errorMessage: 'Major cannot exceed 200 characters'
      }
    },
    hometown: {
      in: ['body'],
      optional: true,
      isLength: {
        options: { max: 200 },
        errorMessage: 'Hometown cannot exceed 200 characters'
      }
    }
  },

  // Post validation rules
  post: {
    title: {
      in: ['body'],
      isLength: {
        options: { min: 1, max: 255 },
        errorMessage: 'Title must be between 1 and 255 characters'
      },
      trim: true
    },
    description: {
      in: ['body'],
      isLength: {
        options: { min: 10, max: 5000 },
        errorMessage: 'Description must be between 10 and 5000 characters'
      },
      trim: true
    },
    postType: {
      in: ['body'],
      isIn: {
        options: [['offer', 'request', 'event']],
        errorMessage: 'Post type must be offer, request, or event'
      }
    },
    durationType: {
      in: ['body'],
      isIn: {
        options: [['one-time', 'recurring', 'event']],
        errorMessage: 'Duration type must be one-time, recurring, or event'
      }
    },
    expiresAt: {
      in: ['body'],
      optional: true,
      isISO8601: {
        errorMessage: 'Expiration date must be a valid ISO 8601 date'
      },
      custom: {
        options: (value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('Expiration date must be in the future');
          }
          return true;
        }
      }
    },
    eventStart: {
      in: ['body'],
      optional: true,
      isISO8601: {
        errorMessage: 'Event start date must be a valid ISO 8601 date'
      }
    },
    eventEnd: {
      in: ['body'],
      optional: true,
      isISO8601: {
        errorMessage: 'Event end date must be a valid ISO 8601 date'
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.eventStart && new Date(value) <= new Date(req.body.eventStart)) {
            throw new Error('Event end date must be after event start date');
          }
          return true;
        }
      }
    },
    tags: {
      in: ['body'],
      optional: true,
      isArray: {
        options: { min: 1, max: 10 },
        errorMessage: 'Tags must be an array with 1 to 10 items'
      }
    }
  },

  // Message validation rules
  message: {
    content: {
      in: ['body'],
      isLength: {
        options: { min: 1, max: 2000 },
        errorMessage: 'Message content must be between 1 and 2000 characters'
      },
      trim: true
    },
    messageType: {
      in: ['body'],
      optional: true,
      isIn: {
        options: [['text', 'image', 'contact']],
        errorMessage: 'Message type must be text, image, or contact'
      }
    }
  },

  // Search validation rules
  search: {
    query: {
      in: ['query'],
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: 'Search query must be between 1 and 200 characters'
      },
      trim: true
    },
    postType: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [['offer', 'request', 'event', 'all']],
        errorMessage: 'Post type filter must be offer, request, event, or all'
      }
    },
    tags: {
      in: ['query'],
      optional: true,
      isArray: {
        options: { max: 10 },
        errorMessage: 'Tags filter cannot exceed 10 items'
      }
    },
    sortBy: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [['recent', 'expiring', 'recurring']],
        errorMessage: 'Sort must be recent, expiring, or recurring'
      }
    },
    expandCluster: {
      in: ['query'],
      optional: true,
      isBoolean: {
        errorMessage: 'Expand cluster must be a boolean value'
      }
    },
    page: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer'
      }
    },
    limit: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      }
    }
  }
};

// Pagination validation
const paginationValidation = {
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page must be a positive integer'
    }
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100'
    }
  }
};

module.exports = {
  validate,
  commonValidations,
  paginationValidation
}; 