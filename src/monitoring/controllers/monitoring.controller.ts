import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SystemMetricsService } from '../services/system-metrics.service';
import { DatabaseMetricsService } from '../services/database-metrics.service';
import { FileStorageMetricsService } from '../services/file-storage-metrics.service';
import { ApiMetricsService } from '../services/api-metrics.service';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(
    private readonly systemMetrics: SystemMetricsService,
    private readonly databaseMetrics: DatabaseMetricsService,
    private readonly fileStorageMetrics: FileStorageMetricsService,
    private readonly apiMetrics: ApiMetricsService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const [system, database, storage, api] = await Promise.all([
      this.systemMetrics.getSystemInfo(),
      this.databaseMetrics.getDatabaseStats(),
      this.fileStorageMetrics.getStorageStats(),
      this.apiMetrics.getApiStats(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      system,
      database,
      storage,
      api,
      status: this.getOverallStatus(system, database, storage, api),
    };
  }

  @Get('system')
  async getSystemMetrics() {
    return this.systemMetrics.getDetailedMetrics();
  }

  @Get('database')
  async getDatabaseMetrics() {
    return this.databaseMetrics.getDetailedStats();
  }

  @Get('storage')
  async getStorageMetrics() {
    return this.fileStorageMetrics.getDetailedStats();
  }

  @Get('api')
  async getApiMetrics(@Query('hours') hours: string = '24') {
    const hoursNum = parseInt(hours) || 24;
    return this.apiMetrics.getDetailedStats(hoursNum);
  }

  @Get('health')
  async getHealthCheck() {
    const [systemHealth, dbHealth, storageHealth] = await Promise.all([
      this.systemMetrics.getHealthStatus(),
      this.databaseMetrics.getHealthStatus(),
      this.fileStorageMetrics.getHealthStatus(),
    ]);

    const overall = systemHealth.healthy && dbHealth.healthy && storageHealth.healthy;

    return {
      healthy: overall,
      timestamp: new Date().toISOString(),
      services: {
        system: systemHealth,
        database: dbHealth,
        storage: storageHealth,
      },
    };
  }

  @Get('alerts')
  async getActiveAlerts() {
    // Get current metrics and check for alerts
    const dashboard = await this.getDashboard();
    const alerts = [];

    // System alerts
    if (dashboard.system.memory.usage > 90) {
      alerts.push({
        type: 'warning',
        service: 'system',
        message: `High memory usage: ${dashboard.system.memory.usage}%`,
        timestamp: new Date().toISOString(),
      });
    }

    if (dashboard.system.cpu.usage > 80) {
      alerts.push({
        type: 'warning',
        service: 'system',
        message: `High CPU usage: ${dashboard.system.cpu.usage}%`,
        timestamp: new Date().toISOString(),
      });
    }

    // Database alerts
    if (dashboard.database.connections.active > 80) {
      alerts.push({
        type: 'warning',
        service: 'database',
        message: `High database connections: ${dashboard.database.connections.active}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Storage alerts
    if (dashboard.storage.disk.usage > 85) {
      alerts.push({
        type: 'critical',
        service: 'storage',
        message: `Low disk space: ${dashboard.storage.disk.usage}% used`,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('performance')
  async getPerformanceMetrics(@Query('period') period: string = '1h') {
    return {
      period,
      metrics: await this.apiMetrics.getPerformanceMetrics(period),
      timestamp: new Date().toISOString(),
    };
  }

  private getOverallStatus(system: any, database: any, storage: any, api: any): string {
    const issues = [];

    if (system.memory.usage > 90) issues.push('high_memory');
    if (system.cpu.usage > 80) issues.push('high_cpu');
    if (!database.connected) issues.push('db_disconnected');
    if (storage.disk.usage > 85) issues.push('low_disk');
    if (api.errorRate > 5) issues.push('high_error_rate');

    if (issues.length === 0) return 'healthy';
    if (issues.length <= 2) return 'warning';
    return 'critical';
  }
}