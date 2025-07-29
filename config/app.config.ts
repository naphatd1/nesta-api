export const appConfig = {
  port: parseInt(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Rate limiting
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT) || 10,

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};
