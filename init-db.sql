-- Initialize database with extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (this might not work in all PostgreSQL versions)
-- SELECT 'CREATE DATABASE nestauth' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nestauth')\gexec

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (these will be created by Prisma migrations)
-- But you can add custom indexes here if needed

-- Example: Create a custom index for email lookups
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE "isActive" = true;