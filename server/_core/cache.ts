import NodeCache from 'node-cache';

/**
 * AI Response Cache
 * Caches AI responses to reduce API calls and improve performance
 * TTL: 1 hour for most responses, 24 hours for static content
 */
class AICache {
  private cache: NodeCache;
  
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Don't clone objects (faster)
    });
  }

  /**
   * Generate cache key from prompt and type
   */
  private generateKey(type: string, prompt: string, userId?: number): string {
    // Include userId for personalized responses
    const userPart = userId ? `user:${userId}:` : '';
    // Hash the prompt to keep key length reasonable
    const promptHash = this.simpleHash(prompt);
    return `${type}:${userPart}${promptHash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached AI response
   */
  get(type: string, prompt: string, userId?: number): string | undefined {
    const key = this.generateKey(type, prompt, userId);
    return this.cache.get<string>(key);
  }

  /**
   * Set cached AI response
   */
  set(type: string, prompt: string, response: string, userId?: number, ttl?: number): boolean {
    const key = this.generateKey(type, prompt, userId);
    return this.cache.set(key, response, ttl || 3600);
  }

  /**
   * Cache with longer TTL for static content (24 hours)
   */
  setStatic(type: string, prompt: string, response: string, userId?: number): boolean {
    return this.set(type, prompt, response, userId, 86400); // 24 hours
  }

  /**
   * Delete cached response
   */
  delete(type: string, prompt: string, userId?: number): number {
    const key = this.generateKey(type, prompt, userId);
    return this.cache.del(key);
  }

  /**
   * Clear all cached responses
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const aiCache = new AICache();
