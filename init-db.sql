-- Initialize database for NestJS application
-- This script runs when PostgreSQL container starts for the first time

-- Create database if not exists (already created by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS nestdb;

-- Connect to the database
\c nestdb;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges to user
GRANT ALL PRIVILEGES ON DATABASE nestdb TO naphat;
GRANT ALL ON SCHEMA public TO naphat;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO naphat;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO naphat;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO naphat;

-- Display success message
SELECT 'Database nestdb initialized successfully!' as message;