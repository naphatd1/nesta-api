import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { HealthModule } from "./health/health.module";
import { UploadModule } from "./upload/upload.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { CommonModule } from "./common/common.module";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { SecurityLoggingInterceptor } from "./common/interceptors/security-logging.interceptor";
import { ErrorResponseInterceptor } from "./common/interceptors/error-response.interceptor";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";
import { ErrorLoggingService } from "./common/services/error-logging.service";
import { MetricsInterceptor } from "./monitoring/interceptors/metrics.interceptor";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    HealthModule,
    UploadModule,
    MonitoringModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ErrorLoggingService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes("*");
  }
}
