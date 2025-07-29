# คู่มือความปลอดภัย (Security Guide)

## 🔒 ภาพรวมความปลอดภัย

คู่มือนี้ครอบคลุมมาตรการความปลอดภัยทั้งหมดที่ใช้ในระบบ ตั้งแต่ authentication, authorization, data protection จนถึง infrastructure security

### หลักการความปลอดภัย
- **Defense in Depth**: หลายชั้นของการป้องกัน
- **Principle of Least Privilege**: สิทธิ์ขั้นต่ำที่จำเป็น
- **Zero Trust**: ไม่เชื่อถือใครโดยอัตโนมัติ
- **Security by Design**: ออกแบบให้ปลอดภัยตั้งแต่เริ่มต้น

## 🔐 Authentication Security

### 1. Password Security

#### Password Hashing
```typescript
// ใช้ Argon2 สำหรับ password hashing
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }
}
```

#### Password Policy
```typescript
// password-validator.ts
export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }
}
```

### 2. JWT Security

#### JWT Configuration
```typescript
// jwt.config.ts
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '15m',
    issuer: 'nest-auth-api',
    audience: 'nest-auth-api-users',
    algorithm: 'HS256',
  },
  refreshTokenOptions: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    expiresIn: '7d',
    issuer: 'nest-auth-api',
    audience: 'nest-auth-api-users',
    algorithm: 'HS256',
  },
};

// JWT Security Best Practices
@Injectable()
export class JwtSecurityService {
  generateSecureToken(): string {
    // Generate cryptographically secure random token
    return crypto.randomBytes(32).toString('hex');
  }

  validateTokenClaims(payload: any): boolean {
    // Validate required claims
    const requiredClaims = ['sub', 'iat', 'exp', 'iss', 'aud'];
    
    for (const claim of requiredClaims) {
      if (!payload[claim]) {
        return false;
      }
    }

    // Validate issuer and audience
    if (payload.iss !== 'nest-auth-api' || payload.aud !== 'nest-auth-api-users') {
      return false;
    }

    return true;
  }

  isTokenExpiringSoon(payload: any): boolean {
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    const timeUntilExpiry = exp - now;
    
    // Return true if token expires in less than 5 minutes
    return timeUntilExpiry < 300;
  }
}
```

#### Token Blacklisting
```typescript
// token-blacklist.service.ts
@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();

  async blacklistToken(token: string): Promise<void> {
    // In production, use Redis or database
    this.blacklistedTokens.add(token);
    
    // Set expiration to clean up old tokens
    setTimeout(() => {
      this.blacklistedTokens.delete(token);
    }, 15 * 60 * 1000); // 15 minutes
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklistedTokens.has(token);
  }

  async blacklistAllUserTokens(userId: string): Promise<void> {
    // Increment user's token version to invalidate all tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
```

## 🛡️ Authorization Security

### 1. Role-Based Access Control (RBAC)

```typescript
// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  @Get('users')
  async getAllUsers() {
    // Only admins can access this
  }
}
```

### 2. Resource-Based Authorization

```typescript
// resource-ownership.guard.ts
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    const resourceType = this.getResourceType(context);

    if (!user || !resourceId) {
      return false;
    }

    // Admin can access all resources
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check resource ownership
    return this.checkOwnership(user.id, resourceId, resourceType);
  }

  private async checkOwnership(userId: string, resourceId: string, resourceType: string): Promise<boolean> {
    switch (resourceType) {
      case 'post':
        const post = await this.prisma.post.findUnique({
          where: { id: resourceId },
          select: { authorId: true },
        });
        return post?.authorId === userId;

      case 'file':
        const file = await this.prisma.file.findUnique({
          where: { id: resourceId },
          select: { uploadedById: true },
        });
        return file?.uploadedById === userId;

      default:
        return false;
    }
  }

  private getResourceType(context: ExecutionContext): string {
    const handler = context.getHandler().name;
    const className = context.getClass().name;
    
    if (className.includes('Post')) return 'post';
    if (className.includes('File') || className.includes('Upload')) return 'file';
    
    return 'unknown';
  }
}
```

## 🔐 Data Protection

### 1. Input Validation และ Sanitization

```typescript
// validation.pipe.ts
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Sanitize input
    if (typeof value === 'string') {
      value = this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      value = this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// DTO Validation
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;
}
```

### 2. SQL Injection Prevention

```typescript
// ใช้ Prisma ORM ป้องกัน SQL Injection
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Safe - Prisma handles parameterization
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }, // Automatically parameterized
    });
  }

  // Safe - Using Prisma's raw query with parameters
  async searchUsers(searchTerm: string) {
    return this.prisma.$queryRaw`
      SELECT id, email, name 
      FROM users 
      WHERE name ILIKE ${`%${searchTerm}%`}
      AND is_active = true
    `;
  }

  // UNSAFE - Never do this
  async unsafeSearch(searchTerm: string) {
    // DON'T DO THIS - Vulnerable to SQL injection
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM users WHERE name LIKE '%${searchTerm}%'
    `);
  }
}
```

### 3. XSS Prevention

```typescript
// xss-protection.interceptor.ts
@Injectable()
export class XSSProtectionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Sanitize request body
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }

    return next.handle().pipe(
      map((data) => {
        // Sanitize response data if needed
        return this.sanitizeResponseData(data);
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  private sanitizeResponseData(data: any): any {
    // Only sanitize string fields that might contain user content
    if (data && typeof data === 'object') {
      const fieldsToSanitize = ['content', 'description', 'comment'];
      
      for (const field of fieldsToSanitize) {
        if (data[field] && typeof data[field] === 'string') {
          data[field] = this.sanitizeString(data[field]);
        }
      }
    }

    return data;
  }
}
```

## 🌐 Network Security

### 1. HTTPS Configuration

```typescript
// main.ts - Force HTTPS in production
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'production') {
    // Force HTTPS
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  await app.listen(process.env.PORT || 4000);
}
```

### 2. CORS Configuration

```typescript
// cors.config.ts
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};
```

### 3. Rate Limiting

```typescript
// rate-limiting.config.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 100, // Max requests per window
    }),
  ],
})
export class AppModule {}

// Custom rate limiting for sensitive endpoints
@Injectable()
export class AuthRateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Rate limit by IP + User Agent for auth endpoints
    return `${req.ip}-${req.get('User-Agent')}`;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();
    
    // Stricter limits for auth endpoints
    if (request.url.includes('/auth/')) {
      return 10; // 10 requests per minute for auth
    }
    
    return 100; // Default limit
  }
}

// Usage
@Controller('auth')
@UseGuards(AuthRateLimitGuard)
export class AuthController {
  @Post('login')
  @Throttle(5, 60) // 5 login attempts per minute
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

## 🔍 Security Monitoring

### 1. Security Event Logging

```typescript
// security-logger.service.ts
@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);

  logAuthenticationAttempt(email: string, success: boolean, ip: string, userAgent: string) {
    const event = {
      type: 'AUTHENTICATION_ATTEMPT',
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      this.logger.log(`Successful login: ${email} from ${ip}`);
    } else {
      this.logger.warn(`Failed login attempt: ${email} from ${ip}`);
    }

    // Send to security monitoring system
    this.sendToSecurityMonitoring(event);
  }

  logSuspiciousActivity(type: string, details: any, ip: string) {
    const event = {
      type: 'SUSPICIOUS_ACTIVITY',
      subtype: type,
      details,
      ip,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(`Suspicious activity detected: ${type} from ${ip}`, details);
    this.sendToSecurityMonitoring(event);
  }

  logSecurityViolation(violation: string, userId?: string, ip?: string) {
    const event = {
      type: 'SECURITY_VIOLATION',
      violation,
      userId,
      ip,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(`Security violation: ${violation}`, event);
    this.sendToSecurityMonitoring(event);
  }

  private async sendToSecurityMonitoring(event: any) {
    // Send to external security monitoring service
    // e.g., Splunk, ELK Stack, or custom SIEM
    try {
      // Implementation depends on your monitoring solution
      console.log('Security Event:', JSON.stringify(event));
    } catch (error) {
      this.logger.error('Failed to send security event to monitoring system', error);
    }
  }
}
```

### 2. Intrusion Detection

```typescript
// intrusion-detection.service.ts
@Injectable()
export class IntrusionDetectionService {
  private suspiciousIPs = new Map<string, number>();
  private blockedIPs = new Set<string>();

  constructor(private securityLogger: SecurityLoggerService) {}

  checkSuspiciousActivity(ip: string, endpoint: string): boolean {
    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      return false;
    }

    // Increment suspicious activity counter
    const count = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, count + 1);

    // Block IP if too many suspicious activities
    if (count + 1 >= 10) {
      this.blockIP(ip);
      this.securityLogger.logSuspiciousActivity('IP_BLOCKED', { ip, count: count + 1 }, ip);
      return false;
    }

    // Log suspicious activity
    if (count + 1 >= 5) {
      this.securityLogger.logSuspiciousActivity('HIGH_ACTIVITY', { ip, count: count + 1, endpoint }, ip);
    }

    return true;
  }

  private blockIP(ip: string) {
    this.blockedIPs.add(ip);
    
    // Remove block after 1 hour
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      this.suspiciousIPs.delete(ip);
    }, 60 * 60 * 1000);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }
}

// Intrusion detection guard
@Injectable()
export class IntrusionDetectionGuard implements CanActivate {
  constructor(private intrusionDetection: IntrusionDetectionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const endpoint = request.url;

    return this.intrusionDetection.checkSuspiciousActivity(ip, endpoint);
  }
}
```

## 🔐 File Upload Security

### 1. File Type Validation

```typescript
// file-security.service.ts
@Injectable()
export class FileSecurityService {
  private readonly allowedMimeTypes = new Map([
    ['image', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']],
    ['document', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
    ['video', ['video/mp4', 'video/mpeg', 'video/quicktime']],
    ['audio', ['audio/mpeg', 'audio/wav', 'audio/ogg']],
  ]);

  private readonly dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.rb'
  ];

  validateFile(file: Express.Multer.File, expectedType: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.getMaxFileSize(expectedType)) {
      errors.push(`File size exceeds limit for ${expectedType}`);
    }

    // Check MIME type
    const allowedTypes = this.allowedMimeTypes.get(expectedType) || [];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Invalid file type. Expected: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (this.dangerousExtensions.includes(extension)) {
      errors.push('Dangerous file extension detected');
    }

    // Check file signature (magic bytes)
    if (!this.validateFileSignature(file.buffer, file.mimetype)) {
      errors.push('File signature does not match MIME type');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateFileSignature(buffer: Buffer, mimetype: string): boolean {
    const signatures = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'application/pdf': [0x25, 0x50, 0x44, 0x46],
    };

    const signature = signatures[mimetype];
    if (!signature) return true; // Skip validation for unknown types

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  private getMaxFileSize(type: string): number {
    const limits = {
      image: 10 * 1024 * 1024,    // 10MB
      document: 50 * 1024 * 1024, // 50MB
      video: 100 * 1024 * 1024,   // 100MB
      audio: 20 * 1024 * 1024,    // 20MB
    };

    return limits[type] || 5 * 1024 * 1024; // Default 5MB
  }

  scanFileForMalware(filePath: string): Promise<boolean> {
    // Integrate with antivirus scanning service
    // This is a placeholder - implement based on your antivirus solution
    return Promise.resolve(true);
  }
}
```

### 2. Secure File Storage

```typescript
// secure-storage.service.ts
@Injectable()
export class SecureStorageService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(private fileSecurityService: FileSecurityService) {}

  async saveFile(file: Express.Multer.File, userId: string): Promise<string> {
    // Generate secure filename
    const secureFilename = this.generateSecureFilename(file.originalname);
    const filePath = path.join(this.uploadPath, secureFilename);

    // Ensure upload directory exists and has correct permissions
    await this.ensureSecureDirectory();

    // Validate file security
    const validation = this.fileSecurityService.validateFile(file, 'image');
    if (!validation.isValid) {
      throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
    }

    // Scan for malware
    const isSafe = await this.fileSecurityService.scanFileForMalware(file.path);
    if (!isSafe) {
      throw new BadRequestException('File contains malware');
    }

    // Move file to secure location
    await fs.promises.rename(file.path, filePath);

    // Set secure file permissions
    await fs.promises.chmod(filePath, 0o644);

    return secureFilename;
  }

  private generateSecureFilename(originalName: string): string {
    const extension = path.extname(originalName);
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}${extension}`;
  }

  private async ensureSecureDirectory(): Promise<void> {
    try {
      await fs.promises.access(this.uploadPath);
    } catch {
      await fs.promises.mkdir(this.uploadPath, { recursive: true, mode: 0o755 });
    }

    // Set secure directory permissions
    await fs.promises.chmod(this.uploadPath, 0o755);
  }
}
```

## 🔧 Environment Security

### 1. Environment Variables Protection

```typescript
// config.validation.ts
import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  @Transform(({ value }) => value || 'http://localhost:3000')
  CORS_ORIGIN: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  HTTPS_ENABLED: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Validate JWT secrets strength
  if (validatedConfig.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (validatedConfig.JWT_REFRESH_TOKEN_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET must be at least 32 characters long');
  }

  return validatedConfig;
}
```

### 2. Secrets Management

```typescript
// secrets.service.ts
@Injectable()
export class SecretsService {
  private secrets = new Map<string, string>();

  constructor() {
    this.loadSecrets();
  }

  private loadSecrets() {
    // Load secrets from environment variables
    const secretKeys = [
      'JWT_SECRET',
      'JWT_REFRESH_TOKEN_SECRET',
      'DATABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    for (const key of secretKeys) {
      const value = process.env[key];
      if (!value) {
        throw new Error(`Required secret ${key} is not set`);
      }
      this.secrets.set(key, value);
    }
  }

  getSecret(key: string): string {
    const secret = this.secrets.get(key);
    if (!secret) {
      throw new Error(`Secret ${key} not found`);
    }
    return secret;
  }

  // Rotate secrets (for production use)
  async rotateSecret(key: string, newValue: string): Promise<void> {
    // Validate new secret
    if (newValue.length < 32) {
      throw new Error('New secret must be at least 32 characters long');
    }

    // Update in memory
    this.secrets.set(key, newValue);

    // Update in external secret management system
    // e.g., AWS Secrets Manager, HashiCorp Vault, etc.
    await this.updateExternalSecret(key, newValue);
  }

  private async updateExternalSecret(key: string, value: string): Promise<void> {
    // Implementation depends on your secret management solution
    console.log(`Updating secret ${key} in external system`);
  }
}
```

## 🚨 Security Incident Response

### 1. Incident Detection

```typescript
// security-incident.service.ts
@Injectable()
export class SecurityIncidentService {
  constructor(
    private securityLogger: SecurityLoggerService,
    private notificationService: NotificationService,
  ) {}

  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Log the incident
    this.securityLogger.logSecurityViolation(incident.type, incident.userId, incident.ip);

    // Assess severity
    const severity = this.assessIncidentSeverity(incident);

    // Take immediate action based on severity
    await this.takeImmediateAction(incident, severity);

    // Notify security team
    await this.notifySecurityTeam(incident, severity);

    // Create incident record
    await this.createIncidentRecord(incident, severity);
  }

  private assessIncidentSeverity(incident: SecurityIncident): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalIncidents = ['DATA_BREACH', 'PRIVILEGE_ESCALATION', 'MALWARE_DETECTED'];
    const highIncidents = ['BRUTE_FORCE_ATTACK', 'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT'];
    const mediumIncidents = ['SUSPICIOUS_LOGIN', 'RATE_LIMIT_EXCEEDED', 'INVALID_TOKEN'];

    if (criticalIncidents.includes(incident.type)) return 'CRITICAL';
    if (highIncidents.includes(incident.type)) return 'HIGH';
    if (mediumIncidents.includes(incident.type)) return 'MEDIUM';
    return 'LOW';
  }

  private async takeImmediateAction(incident: SecurityIncident, severity: string): Promise<void> {
    switch (severity) {
      case 'CRITICAL':
        // Block user account
        if (incident.userId) {
          await this.blockUserAccount(incident.userId);
        }
        // Block IP address
        if (incident.ip) {
          await this.blockIPAddress(incident.ip);
        }
        break;

      case 'HIGH':
        // Temporary account suspension
        if (incident.userId) {
          await this.suspendUserAccount(incident.userId, 24); // 24 hours
        }
        break;

      case 'MEDIUM':
        // Require password reset
        if (incident.userId) {
          await this.requirePasswordReset(incident.userId);
        }
        break;
    }
  }

  private async blockUserAccount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, blockedAt: new Date() },
    });
  }

  private async blockIPAddress(ip: string): Promise<void> {
    // Add to IP blacklist
    // Implementation depends on your infrastructure
  }

  private async notifySecurityTeam(incident: SecurityIncident, severity: string): Promise<void> {
    const message = `Security Incident Detected:
Type: ${incident.type}
Severity: ${severity}
User: ${incident.userId || 'Unknown'}
IP: ${incident.ip || 'Unknown'}
Time: ${new Date().toISOString()}
Details: ${JSON.stringify(incident.details)}`;

    await this.notificationService.sendSecurityAlert(message, severity);
  }
}

interface SecurityIncident {
  type: string;
  userId?: string;
  ip?: string;
  details: any;
  timestamp: Date;
}
```

## 📚 Security Best Practices

### 1. Development Security

```typescript
// security-checklist.ts
export const SecurityChecklist = {
  development: [
    'Use HTTPS in all environments',
    'Validate all input data',
    'Sanitize output data',
    'Use parameterized queries',
    'Implement proper error handling',
    'Log security events',
    'Use secure session management',
    'Implement rate limiting',
    'Use strong authentication',
    'Apply principle of least privilege',
  ],

  deployment: [
    'Use environment variables for secrets',
    'Enable security headers',
    'Configure CORS properly',
    'Set up monitoring and alerting',
    'Regular security updates',
    'Backup and recovery procedures',
    'Network security configuration',
    'SSL/TLS configuration',
    'Database security hardening',
    'File system permissions',
  ],

  monitoring: [
    'Monitor authentication attempts',
    'Track suspicious activities',
    'Log security events',
    'Set up intrusion detection',
    'Monitor file uploads',
    'Track API usage patterns',
    'Monitor system resources',
    'Set up automated alerts',
    'Regular security audits',
    'Incident response procedures',
  ],
};
```

### 2. Security Testing

```typescript
// security.test.ts
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = ['123456', 'password', 'qwerty'];
      
      for (const password of weakPasswords) {
        const result = PasswordValidator.validate(password);
        expect(result.isValid).toBe(false);
      }
    });

    it('should prevent brute force attacks', async () => {
      const email = 'test@example.com';
      
      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password: 'wrongpassword' })
          .expect(401);
      }

      // Next attempt should be rate limited
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(429);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: maliciousInput, content: 'test' })
        .expect(201);

      expect(response.body.title).not.toContain('<script>');
    });

    it('should prevent SQL injection', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      await request(app.getHttpServer())
        .get(`/users/search?q=${sqlInjection}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });
  });

  describe('File Upload Security', () => {
    it('should reject dangerous file types', async () => {
      const dangerousFile = Buffer.from('malicious content');
      
      await request(app.getHttpServer())
        .post('/upload/images/single')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('image', dangerousFile, 'malware.exe')
        .expect(400);
    });
  });
});
```

## 🔗 Related Guides

- [Authentication Guide](02-authentication-guide.md) - รายละเอียดระบบ authentication
- [File Upload Guide](03-file-upload-guide.md) - ความปลอดภัยในการอัปโหลดไฟล์
- [Deployment Guide](05-deployment-guide.md) - การ deploy อย่างปลอดภัย
- [Monitoring Guide](04-monitoring-guide.md) - การ monitor security events