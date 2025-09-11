// Simple rate limiter to prevent API spam
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(5, 2000); // 5 requests per 2 seconds

// Rate limiting wrapper for API calls
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string = 'default'
): T {
  return (async (...args: any[]) => {
    if (!rateLimiter.isAllowed(key)) {
      const remainingTime = rateLimiter.getRemainingTime(key);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`);
    }
    
    return await fn(...args);
  }) as T;
}
