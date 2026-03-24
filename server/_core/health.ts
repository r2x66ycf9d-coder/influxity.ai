import type { Request, Response } from 'express';
import { getDb } from '../db';
import { aiCache } from './cache';

/**
 * Health check endpoint
 * Returns system status and health metrics
 */
export async function healthCheck(req: Request, res: Response) {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      cache: { status: 'unknown', stats: {} },
      memory: { status: 'unknown', usage: {} },
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    const db = await getDb();
    if (db) {
      // Simple query to test connection
      await db.execute('SELECT 1');
      health.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      };
    } else {
      health.checks.database = {
        status: 'unavailable',
        responseTime: 0,
      };
    }
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
    };
    health.status = 'degraded';
  }

  // Check cache
  try {
    const cacheStats = aiCache.getStats();
    health.checks.cache = {
      status: 'healthy',
      stats: cacheStats,
    };
  } catch (error) {
    health.checks.cache = {
      status: 'unhealthy',
      stats: {},
    };
    health.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  // Warn if heap usage is over 80%
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  health.checks.memory = {
    status: heapUsagePercent > 80 ? 'warning' : 'healthy',
    usage: memUsageMB as any,
  };

  if (heapUsagePercent > 80 && health.status === 'healthy') {
    health.status = 'degraded';
  }

  // Set response status code based on health
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json(health);
}

/**
 * Simple liveness probe
 * Returns 200 if server is running
 */
export function livenessProbe(req: Request, res: Response) {
  res.status(200).json({ status: 'alive' });
}

/**
 * Readiness probe
 * Returns 200 if server is ready to accept traffic
 */
export async function readinessProbe(req: Request, res: Response) {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }
    
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', reason: 'database connection failed' });
  }
}
