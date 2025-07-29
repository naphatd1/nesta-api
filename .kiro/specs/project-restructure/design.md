# Design Document - Project Structure Reorganization

## Overview

This document outlines the design for reorganizing the NestJS Auth API project structure to improve maintainability, clarity, and developer experience. The reorganization will group related files together while maintaining full functionality.

## Architecture

### Current Structure Issues
- Configuration files scattered in root directory
- Scripts and tools mixed with source code
- Documentation files not centralized
- Docker files in root causing clutter
- Testing files not properly organized

### New Proposed Structure

```
nest-auth-api/
├── src/                          # Source code (unchanged)
├── config/                       # Configuration files
│   ├── database.config.ts
│   ├── auth.config.ts
│   ├── upload.config.ts
│   └── app.config.ts
├── database/                     # Database related files
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── init-db.sql
├── docker/                       # Docker related files
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.external-db.yml
│   └── healthcheck.js
├── deployment/                   # Deployment scripts and configs
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── install-docker.sh
│   │   └── run-tests.sh
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── nginx-no-ssl.conf
│   │   └── nginx-self-signed.conf
│   └── ssl/
│       └── create-self-signed-cert.sh
├── testing/                      # Testing related files
│   ├── api/
│   │   ├── postman-collection-fixed.json
│   │   ├── postman-environment.json
│   │   └── test-api.js
│   ├── tools/
│   │   ├── check-server.js
│   │   └── test-upload.js
│   └── results/
├── tools/                        # Development tools
│   ├── docker-build-test.sh
│   └── monitoring/
├── docs/                         # Documentation (already exists)
├── storage/                      # File storage
│   ├── uploads/
│   │   ├── images/
│   │   ├── documents/
│   │   ├── videos/
│   │   ├── audio/
│   │   ├── thumbnails/
│   │   └── temp/
│   └── logs/
├── .env                          # Environment files (root level)
├── .env.example
├── package.json                  # Package configuration (root level)
├── tsconfig.json                 # TypeScript config (root level)
├── nest-cli.json                 # NestJS config (root level)
└── README.md                     # Main documentation (root level)
```

## Components and Interfaces

### 1. Configuration Management

#### New Configuration Structure
```typescript
// config/app.config.ts
export const appConfig = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// config/database.config.ts
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  // other database configs
};

// config/auth.config.ts
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  // other auth configs
};
```

#### Configuration Loader
```typescript
// src/common/config/config.service.ts
@Injectable()
export class ConfigService {
  constructor() {
    // Load configurations from config/ directory
  }
}
```

### 2. Database Organization

#### Prisma Configuration Update
```javascript
// database/prisma/schema.prisma
// Move from prisma/schema.prisma

// Update package.json prisma configuration
{
  "prisma": {
    "schema": "database/prisma/schema.prisma",
    "seed": "ts-node database/prisma/seed.ts"
  }
}
```

### 3. Docker Organization

#### Docker Compose Updates
```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    # ... rest of configuration
```

#### Dockerfile Updates
```dockerfile
# docker/Dockerfile
# Update COPY commands to reference correct paths
COPY package*.json ./
COPY database/prisma ./database/prisma/
COPY src ./src/
```

### 4. Testing Organization

#### Test Configuration Updates
```javascript
// testing/api/test-api.js
const newman = require('newman');
const path = require('path');

const options = {
  collection: path.join(__dirname, 'postman-collection-fixed.json'),
  environment: path.join(__dirname, 'postman-environment.json'),
  // ... rest of configuration
};
```

### 5. Deployment Scripts Organization

#### Script Path Updates
```bash
#!/bin/bash
# deployment/scripts/deploy.sh

# Update paths to reference new structure
DOCKER_COMPOSE_FILE="../docker/docker-compose.yml"
NGINX_CONFIG="../deployment/nginx/nginx.conf"
```

## Data Models

### File Path Mapping

| Current Location | New Location | Type |
|-----------------|--------------|------|
| `Dockerfile*` | `docker/` | Docker files |
| `docker-compose*.yml` | `docker/` | Docker compose |
| `*.sh` | `deployment/scripts/` | Shell scripts |
| `nginx*.conf` | `deployment/nginx/` | Nginx configs |
| `postman-*.json` | `testing/api/` | API tests |
| `test-*.js` | `testing/tools/` | Test tools |
| `check-server.js` | `testing/tools/` | Test utilities |
| `prisma/` | `database/prisma/` | Database schema |
| `init-db.sql` | `database/` | Database init |
| `uploads/` | `storage/uploads/` | File storage |

### Configuration Mapping

| Configuration Type | Current | New Location |
|-------------------|---------|--------------|
| App settings | Scattered in code | `config/app.config.ts` |
| Database settings | In prisma/ | `config/database.config.ts` |
| Auth settings | In auth module | `config/auth.config.ts` |
| Upload settings | In upload module | `config/upload.config.ts` |

## Error Handling

### Path Resolution Errors
- Implement path resolution utilities
- Use relative imports where possible
- Update all hardcoded paths

### Import Path Updates
- Use TypeScript path mapping
- Update all import statements
- Maintain backward compatibility

### Configuration Loading Errors
- Implement fallback mechanisms
- Provide clear error messages
- Validate configuration on startup

## Testing Strategy

### Migration Testing
1. **Before Migration**: Run full test suite
2. **During Migration**: Test each moved component
3. **After Migration**: Verify all functionality works
4. **Regression Testing**: Ensure no functionality is broken

### Test Categories
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **API Tests**: Test all endpoints
- **Docker Tests**: Test containerized deployment
- **E2E Tests**: Test complete workflows

### Validation Checklist
- [ ] All npm scripts work
- [ ] All API endpoints respond correctly
- [ ] All Docker commands work
- [ ] All tests pass
- [ ] All imports resolve correctly
- [ ] All configurations load properly
- [ ] File uploads work correctly
- [ ] Database operations work
- [ ] Authentication works
- [ ] Monitoring works

## Implementation Plan

### Phase 1: Preparation
1. Create new directory structure
2. Update package.json scripts
3. Create configuration files
4. Update TypeScript paths

### Phase 2: Move Files
1. Move Docker files
2. Move deployment scripts
3. Move testing files
4. Move database files
5. Move documentation

### Phase 3: Update References
1. Update import paths in source code
2. Update Docker configurations
3. Update deployment scripts
4. Update test configurations
5. Update documentation links

### Phase 4: Validation
1. Run all tests
2. Test Docker builds
3. Test deployment scripts
4. Verify all functionality
5. Update documentation

### Phase 5: Cleanup
1. Remove old files
2. Update .gitignore
3. Update README
4. Create migration guide