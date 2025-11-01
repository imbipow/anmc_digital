const Joi = require('joi');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: {
          message: 'Validation error',
          status: 400,
          details: errors
        }
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

// Validation schemas
const schemas = {
  news: Joi.object({
    title: Joi.string().required().min(3).max(200),
    slug: Joi.string().required().min(3).max(200),
    content: Joi.string().required(),
    excerpt: Joi.string().required().max(500),
    authorName: Joi.string().required(),
    date: Joi.string().isoDate().required(),
    publishedAt: Joi.string().isoDate(),
    featuredImage: Joi.string().uri().required(),
    featured: Joi.boolean(),
    status: Joi.string().valid('published', 'draft').default('draft'),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string())
  }),

  event: Joi.object({
    title: Joi.string().required().min(3).max(200),
    slug: Joi.string().required().min(3).max(200),
    description: Joi.string().required(),
    content: Joi.string().required(),
    startDate: Joi.string().isoDate().required(),
    endDate: Joi.string().isoDate().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    location: Joi.string().required(),
    address: Joi.string().required(),
    featuredImage: Joi.string().uri().required(),
    featured: Joi.boolean(),
    status: Joi.string().valid('upcoming', 'past').default('upcoming'),
    category: Joi.string().required(),
    maxAttendees: Joi.number().integer().min(1),
    registrationRequired: Joi.boolean(),
    contactEmail: Joi.string().email(),
    tags: Joi.array().items(Joi.string())
  }),

  project: Joi.object({
    title: Joi.string().required().min(3).max(200),
    slug: Joi.string().required().min(3).max(200),
    description: Joi.string().required(),
    content: Joi.string().required(),
    status: Joi.string().valid('active', 'completed', 'planning', 'fundraising').required(),
    startDate: Joi.string().isoDate().required(),
    endDate: Joi.string().isoDate(),
    budget: Joi.number().min(0),
    fundingSource: Joi.string(),
    projectManager: Joi.string(),
    featuredImage: Joi.string().uri().required(),
    featured: Joi.boolean(),
    category: Joi.string().required(),
    progress: Joi.number().min(0).max(100),
    tags: Joi.array().items(Joi.string())
  }),

  facility: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    capacity: Joi.string().required(),
    description: Joi.string().required(),
    features: Joi.array().items(Joi.string()).required(),
    pricing: Joi.string().required(),
    icon: Joi.string(),
    image: Joi.string().uri().required()
  }),

  achievement: Joi.object({
    year: Joi.string().pattern(/^\d{4}$/).required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required()
  })
};

module.exports = {
  validate,
  schemas
};
