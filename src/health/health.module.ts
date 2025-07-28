import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ErrorLoggingService } from '../common/services/error-logging.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, ErrorLoggingService],
})
export class HealthModule {}