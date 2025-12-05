/**
 * Structured logging utility for production
 * Provides consistent log format with timestamps, levels, and context
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: number;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Format log message with timestamp and context
   */
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const formatted = this.format('info', message, context);
    console.log(formatted);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const formatted = this.format('warn', message, context);
    console.warn(formatted);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    const formatted = this.format('error', message, errorContext);
    console.error(formatted);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.format('debug', message, context);
      console.debug(formatted);
    }
  }

  /**
   * Log API request
   */
  request(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, context);
  }

  /**
   * Log API response
   */
  response(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${path} ${statusCode}`;
    
    if (level === 'warn') {
      this.warn(message, { ...context, duration, statusCode });
    } else {
      this.info(message, { ...context, duration, statusCode });
    }
  }

  /**
   * Log AI request
   */
  aiRequest(type: string, userId?: number, cached?: boolean): void {
    this.info(`AI Request: ${type}`, { userId, cached });
  }

  /**
   * Log AI response
   */
  aiResponse(type: string, duration: number, userId?: number, error?: boolean): void {
    const message = `AI Response: ${type}`;
    if (error) {
      this.error(message, undefined, { userId, duration });
    } else {
      this.info(message, { userId, duration });
    }
  }

  /**
   * Log database query
   */
  dbQuery(query: string, duration: number, error?: Error): void {
    if (error) {
      this.error(`DB Query Failed: ${query}`, error, { duration });
    } else {
      this.debug(`DB Query: ${query}`, { duration });
    }
  }

  /**
   * Log authentication event
   */
  auth(event: 'login' | 'logout' | 'failed', userId?: number, context?: LogContext): void {
    this.info(`Auth: ${event}`, { ...context, userId });
  }

  /**
   * Log payment event
   */
  payment(event: string, amount?: number, userId?: number, context?: LogContext): void {
    this.info(`Payment: ${event}`, { ...context, userId, amount });
  }
}

// Export singleton instance
export const logger = new Logger();
