export const databaseConfig = {
  url: process.env.DATABASE_URL,
  
  // Database credentials for Docker Compose
  name: process.env.POSTGRES_DB || 'nestdb',
  user: process.env.POSTGRES_USER || 'naphat',
  password: process.env.POSTGRES_PASSWORD || '123456',
};