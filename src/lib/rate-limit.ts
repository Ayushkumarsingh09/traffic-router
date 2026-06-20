import { RateLimiterMemory } from "rate-limiter-flexible";

const apiLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

const routeLimiter = new RateLimiterMemory({
  points: 200,
  duration: 60,
});

export async function checkRateLimit(
  key: string,
  type: "api" | "auth" | "route" = "api",
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limiter =
    type === "auth" ? authLimiter : type === "route" ? routeLimiter : apiLimiter;

  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (error) {
    const retryAfter =
      typeof error === "object" && error !== null && "msBeforeNext" in error
        ? Math.ceil(Number(error.msBeforeNext) / 1000)
        : 60;
    return { allowed: false, retryAfter };
  }
}
