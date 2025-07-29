# คู่มือการจัดการ Database

## 🗄️ ภาพรวมระบบ Database

ระบบใช้ **PostgreSQL** เป็น primary database พร้อมกับ **Prisma ORM** สำหรับการจัดการข้อมูลและ database operations

### คุณสมบัติหลัก
- PostgreSQL 15+ database
- Prisma ORM สำหรับ type-safe database access
- Database migrations และ seeding
- Connection pooling
- Query optimization
- Backup และ restore procedures

## 📊 Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role user_role DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
```

### 2. Posts Table
```sql
CREATE TABLE posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Files Table
```sql
CREATE TABLE files (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,
    filename TEXT UNIQUE NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    type file_type NOT NULL,
    status file_status DEFAULT 'UPLOADING',
    path TEXT NOT NULL,
    url TEXT,
    thumbnail TEXT,
    metadata JSONB,
    uploaded_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE file_type AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
CREATE TYPE file_status AS ENUM ('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED');
```

### 4. File Chunks Table
```sql
CREATE TABLE file_chunks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(file_id, chunk_index)
);
```

## 🔧 Prisma Configuration

### 1. Schema Definition (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String?
  role         UserRole @default(USER)
  isActive     Boolean  @default(true)
  refreshToken String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  posts Post[]
  files File[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  files  File[]

  @@map("posts")
}

enum FileType {
  IMAGE
  DOCUMENT
  VIDEO
  AUDIO
  OTHER
}

enum FileStatus {
  UPLOADING
  PROCESSING
  COMPLETED
  FAILED
}

model File {
  id           String     @id @default(cuid())
  originalName String
  filename     String     @unique
  mimetype     String
  size         Int
  type         FileType
  status       FileStatus @default(UPLOADING)
  path         String
  url          String?
  thumbnail    String?
  metadata     Json?
  uploadedById String
  postId       String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  uploadedBy User  @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
  post       Post? @relation(fields: [postId], references: [id], onDelete: SetNull)

  @@map("files")
}

model FileChunk {
  id         String   @id @default(cuid())
  fileId     String
  chunkIndex Int
  data       Bytes
  createdAt  DateTime @default(now())

  @@unique([fileId, chunkIndex])
  @@map("file_chunks")
}
```

### 2. Environment Configuration
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Connection Pool Settings
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=20000
DATABASE_POOL_IDLE_TIMEOUT=10000
```

## 🚀 Database Operations

### 1. การติดตั้งและ Setup

#### ติดตั้ง Prisma CLI:
```bash
npm install -g prisma
npm install @prisma/client
```

#### Generate Prisma Client:
```bash
npx prisma generate
```

#### Database Migrations:
```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name init

# รัน migrations ใน production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### 2. Database Seeding

#### prisma/seed.ts:
```typescript
import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
    },
  });

  // Create test users
  const userPassword = await argon2.hash('password123');
  const users = [];
  
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: userPassword,
        name: `Test User ${i}`,
        role: UserRole.USER,
      },
    });
    users.push(user);
  }

  // Create sample posts
  for (const user of users) {
    for (let i = 1; i <= 3; i++) {
      await prisma.post.create({
        data: {
          title: `Sample Post ${i} by ${user.name}`,
          content: `This is sample content for post ${i} created by ${user.name}`,
          published: Math.random() > 0.5,
          authorId: user.id,
        },
      });
    }
  }

  console.log('✅ Database seeding completed!');
  console.log(`Created admin user: ${admin.email}`);
  console.log(`Created ${users.length} test users`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### รัน Seeding:
```bash
npx prisma db seed
```

### 3. Database Queries

#### Basic CRUD Operations:
```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// user.service.ts
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create user
  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: await argon2.hash(data.password),
        name: data.name,
        role: data.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
          },
        },
        files: {
          select: {
            id: true,
            originalName: true,
            type: true,
            status: true,
          },
        },
      },
    });
  }

  // Update user
  async updateUser(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // Delete user
  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Get user statistics
  async getUserStats() {
    const [totalUsers, activeUsers, adminUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      regular: totalUsers - adminUsers,
    };
  }
}
```

#### Advanced Queries:
```typescript
// Complex queries with relations
async getPostsWithFiles(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            originalName: true,
            url: true,
            type: true,
            size: true,
          },
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.post.count({ where: { authorId: userId } }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Aggregation queries
async getFileStatistics() {
  const stats = await this.prisma.file.groupBy({
    by: ['type', 'status'],
    _count: {
      id: true,
    },
    _sum: {
      size: true,
    },
    _avg: {
      size: true,
    },
  });

  return stats.map(stat => ({
    type: stat.type,
    status: stat.status,
    count: stat._count.id,
    totalSize: stat._sum.size,
    averageSize: Math.round(stat._avg.size || 0),
  }));
}

// Raw SQL queries (when needed)
async getCustomAnalytics() {
  const result = await this.prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as uploads,
      SUM(size) as total_size
    FROM files 
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date DESC
  `;

  return result;
}
```

## 🔍 Database Monitoring

### 1. Connection Monitoring
```typescript
// database-health.service.ts
@Injectable()
export class DatabaseHealthService {
  constructor(private prisma: PrismaService) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  async getConnectionInfo() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;

    return result[0];
  }

  async getDatabaseSize() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as size_bytes
    `;

    return result[0];
  }

  async getTableSizes() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `;

    return result;
  }
}
```

### 2. Query Performance Monitoring
```typescript
// query-logger.interceptor.ts
@Injectable()
export class QueryLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const request = context.switchToHttp().getRequest();
        
        if (duration > 1000) { // Log slow queries
          console.warn(`Slow query detected: ${request.url} took ${duration}ms`);
        }
      }),
    );
  }
}
```

## 🔄 Database Migrations

### 1. Creating Migrations
```bash
# สร้าง migration สำหรับ schema changes
npx prisma migrate dev --name add_user_preferences

# Preview migration (ไม่รัน)
npx prisma migrate diff --preview-feature

# Deploy migrations ใน production
npx prisma migrate deploy
```

### 2. Migration Best Practices
```sql
-- ตัวอย่าง migration file
-- migrations/20250729100000_add_user_preferences/migration.sql

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT DEFAULT 'light',
    "language" TEXT DEFAULT 'en',
    "notifications" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 3. Data Migrations
```typescript
// data-migration.service.ts
@Injectable()
export class DataMigrationService {
  constructor(private prisma: PrismaService) {}

  async migrateUserPreferences() {
    console.log('Starting user preferences migration...');

    const users = await this.prisma.user.findMany({
      where: {
        preferences: null, // Users without preferences
      },
    });

    for (const user of users) {
      await this.prisma.userPreferences.create({
        data: {
          userId: user.id,
          theme: 'light',
          language: 'en',
          notifications: true,
        },
      });
    }

    console.log(`Migrated preferences for ${users.length} users`);
  }

  async cleanupOldFiles() {
    console.log('Cleaning up old files...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    const deletedFiles = await this.prisma.file.deleteMany({
      where: {
        status: 'FAILED',
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Deleted ${deletedFiles.count} old failed files`);
  }
}
```

## 💾 Backup และ Restore

### 1. Database Backup
```bash
#!/bin/bash
# backup-database.sh

DB_NAME="nestdb"
DB_USER="username"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --verbose --clean --no-owner --no-privileges \
  --file="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_${DB_NAME}_${DATE}.sql.gz"
```

### 2. Database Restore
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1
DB_NAME="nestdb"
DB_USER="username"
DB_HOST="localhost"
DB_PORT="5432"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

# Extract backup if compressed
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE > temp_restore.sql
  RESTORE_FILE="temp_restore.sql"
else
  RESTORE_FILE=$BACKUP_FILE
fi

# Drop and recreate database
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

# Restore database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $RESTORE_FILE

# Clean up temporary file
if [ "$RESTORE_FILE" = "temp_restore.sql" ]; then
  rm temp_restore.sql
fi

echo "Database restored from $BACKUP_FILE"
```

### 3. Automated Backup Script
```bash
#!/bin/bash
# automated-backup.sh

# Add to crontab: 0 2 * * * /path/to/automated-backup.sh

source /path/to/.env

# Backup database
./backup-database.sh

# Upload to cloud storage (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
  aws s3 cp /backups/backup_nestdb_$(date +%Y%m%d)*.sql.gz \
    s3://$AWS_S3_BUCKET/database-backups/
fi

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-type: application/json' \
  --data '{"text":"Database backup completed successfully"}'
```

## 🔧 Performance Optimization

### 1. Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_posts_author_id ON posts(author_id);
CREATE INDEX CONCURRENTLY idx_posts_published ON posts(published);
CREATE INDEX CONCURRENTLY idx_files_uploaded_by_id ON files(uploaded_by_id);
CREATE INDEX CONCURRENTLY idx_files_type_status ON files(type, status);
CREATE INDEX CONCURRENTLY idx_files_created_at ON files(created_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_posts_author_published ON posts(author_id, published);
CREATE INDEX CONCURRENTLY idx_files_user_type ON files(uploaded_by_id, type);

-- Partial indexes
CREATE INDEX CONCURRENTLY idx_active_users ON users(id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_completed_files ON files(id) WHERE status = 'COMPLETED';
```

### 2. Query Optimization
```typescript
// Optimized queries
async getRecentPosts(limit = 10) {
  return this.prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          files: {
            where: { status: 'COMPLETED' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Use transactions for consistency
async createPostWithFiles(postData: CreatePostDto, files: Express.Multer.File[]) {
  return this.prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        authorId: postData.authorId,
      },
    });

    const fileRecords = await Promise.all(
      files.map(file =>
        tx.file.create({
          data: {
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            type: this.getFileType(file.mimetype),
            path: file.path,
            uploadedById: postData.authorId,
            postId: post.id,
          },
        })
      )
    );

    return { post, files: fileRecords };
  });
}
```

### 3. Connection Pooling
```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Set connection pool size
    await this.$executeRaw`SET max_connections = 100`;
    await this.$executeRaw`SET shared_preload_libraries = 'pg_stat_statements'`;
  }
}
```

## 🧪 Database Testing

### 1. Test Database Setup
```typescript
// test-database.service.ts
@Injectable()
export class TestDatabaseService {
  private testPrisma: PrismaClient;

  async setupTestDatabase() {
    this.testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });

    await this.testPrisma.$connect();
    
    // Clean database
    await this.cleanDatabase();
    
    // Seed test data
    await this.seedTestData();
  }

  async cleanDatabase() {
    const tablenames = await this.testPrisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await this.testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }
  }

  async seedTestData() {
    // Create test users
    const testUser = await this.testPrisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
      },
    });

    // Create test posts
    await this.testPrisma.post.create({
      data: {
        title: 'Test Post',
        content: 'Test content',
        authorId: testUser.id,
      },
    });
  }

  async teardownTestDatabase() {
    await this.testPrisma.$disconnect();
  }
}
```

### 2. Integration Tests
```typescript
// database.integration.spec.ts
describe('Database Integration', () => {
  let testDb: TestDatabaseService;
  let userService: UserService;

  beforeAll(async () => {
    testDb = new TestDatabaseService();
    await testDb.setupTestDatabase();
  });

  afterAll(async () => {
    await testDb.teardownTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanDatabase();
    await testDb.seedTestData();
  });

  describe('User Operations', () => {
    it('should create a user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    });

    it('should find user by email', async () => {
      const user = await userService.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });
  });
});
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Connection Issues
```bash
# ตรวจสอบ PostgreSQL status
sudo systemctl status postgresql

# ตรวจสอบ connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### 2. Migration Issues
```bash
# Reset migrations (development only)
npx prisma migrate reset

# Force deploy migrations
npx prisma migrate deploy --force

# Check migration status
npx prisma migrate status
```

### 3. Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 📚 Best Practices

### 1. Schema Design
- ใช้ appropriate data types
- กำหนด constraints ที่เหมาะสม
- ใช้ foreign keys สำหรับ referential integrity
- ตั้งชื่อ tables และ columns ให้สื่อความหมาย

### 2. Query Optimization
- ใช้ indexes อย่างเหมาะสม
- หลีกเลี่ยง N+1 query problems
- ใช้ select เฉพาะ fields ที่ต้องการ
- ใช้ pagination สำหรับ large datasets

### 3. Security
- ใช้ parameterized queries
- จำกัด database permissions
- เข้ารหัส sensitive data
- Regular security updates

### 4. Maintenance
- Regular backups
- Monitor performance metrics
- Clean up old data
- Update statistics regularly

## 🔗 Related Guides

- [Installation Guide](01-installation-guide.md) - การติดตั้ง database
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor database performance
- [Deployment Guide](05-deployment-guide.md) - การ deploy database