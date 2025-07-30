import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get basic health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health status' })
  @ApiResponse({ status: 200, description: 'Detailed health status retrieved successfully' })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('errors')
  @ApiOperation({ summary: 'Get error statistics' })
  @ApiResponse({ status: 200, description: 'Error statistics retrieved successfully' })
  async getErrorStats() {
    return this.healthService.getErrorStatistics();
  }
}