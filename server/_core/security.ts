import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import validator from 'validator';
import type { Request, Response, NextFunction } from 'express';

/**
 * Rate limiter for AI endpoints to prevent abuse
 * Limits: 20 requests per minute per IP
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per window
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated admin users
  skip: (req: Request) => {
    const user = (req as any).user;
    return user?.role === 'admin';
  },
});

/**
 * General API rate limiter
 * Limits: 100 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Helmet security headers configuration
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.manus.im"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS configuration
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Manus domains and localhost
    const allowedOrigins = [
      /\.manus\.space$/,
      /\.manusvm\.computer$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize text input to prevent XSS
   */
  text: (input: string): string => {
    if (!input) return '';
    // Remove any HTML tags and trim whitespace
    return validator.escape(validator.trim(input));
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string | null => {
    if (!input) return null;
    const normalized = validator.normalizeEmail(input);
    if (!normalized || !validator.isEmail(normalized)) {
      return null;
    }
    return normalized;
  },

  /**
   * Sanitize URL input
   */
  url: (input: string): string | null => {
    if (!input) return null;
    if (!validator.isURL(input, { protocols: ['http', 'https'], require_protocol: true })) {
      return null;
    }
    return input;
  },

  /**
   * Sanitize AI prompt input
   * Removes potentially dangerous patterns while preserving legitimate content
   */
  aiPrompt: (input: string): string => {
    if (!input) return '';
    
    // Trim and limit length
    let sanitized = validator.trim(input);
    if (sanitized.length > 5000) {
      sanitized = sanitized.substring(0, 5000);
    }
    
    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/\0/g, '');
    
    // Remove potential prompt injection patterns
    const dangerousPatterns = [
      /ignore (all )?previous instructions/gi,
      /disregard (all )?previous/gi,
      /forget (all )?previous/gi,
      /new instructions:/gi,
      /system:\s*you are now/gi,
    ];
    
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[removed]');
    });
    
    return sanitized;
  },
};

/**
 * Validation middleware for AI requests
 */
export const validateAIRequest = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  
  // Check if body exists
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  
  // Validate prompt if present
  if (body.prompt) {
    if (typeof body.prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt must be a string' });
    }
    if (body.prompt.length > 5000) {
      return res.status(400).json({ error: 'Prompt too long (max 5000 characters)' });
    }
    // Sanitize the prompt
    body.prompt = sanitize.aiPrompt(body.prompt);
  }
  
  next();
};

/**
 * Error handler for security-related errors
 */
export const securityErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  
  // Pass to next error handler
  next(err);
};
