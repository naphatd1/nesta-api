import { Injectable } from '@nestjs/common';

interface ApiMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class ApiMetricsService {
  private metrics: ApiMetric[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k requests

  recordMetric(metric: ApiMetric) {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  async getApiStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const recent24h = this.metrics.filter(m => m.timestamp >= last24Hours);
    const recent1h = this.metrics.filter(m => m.timestamp >= lastHour);

    const totalRequests24h = recent24h.length;
    const totalRequests1h = recent1h.length;
    
    const errors24h = recent24h.filter(m => m.statusCode >= 400).length;
    const errors1h = recent1h.filter(m => m.statusCode >= 400).length;

    const avgResponseTime24h = recent24h.length > 0 
      ? recent24h.reduce((sum, m) => sum + m.responseTime, 0) / recent24h.length 
      : 0;

    const avgResponseTime1h = recent1h.length > 0
      ? recent1h.reduce((sum, m) => sum + m.responseTime, 0) / recent1h.length
      : 0;

    return {
      requests: {
        total24h: totalRequests24h,
        total1h: totalRequests1h,
        rps: Math.round(totalRequests1h / 3600 * 100) / 100, // requests per second
      },
      errors: {
        total24h: errors24h,
        total1h: errors1h,
        rate24h: totalRequests24h > 0 ? Math.round((errors24h / totalRequests24h) * 100 * 100) / 100 : 0,
        rate1h: totalRequests1h > 0 ? Math.round((errors1h / totalRequests1h) * 100 * 100) / 100 : 0,
      },
      responseTime: {
        avg24h: Math.round(avgResponseTime24h * 100) / 100,
        avg1h: Math.round(avgResponseTime1h * 100) / 100,
      },
      errorRate: totalRequests24h > 0 ? Math.round((errors24h / totalRequests24h) * 100 * 100) / 100 : 0,
    };
  }

  async getDetailedStats(hours: number = 24) {
    const now = new Date();
    const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= since);

    // Group by endpoint
    const byEndpoint = this.groupBy(recentMetrics, 'endpoint');
    const endpointStats = Object.entries(byEndpoint).map(([endpoint, metrics]) => ({
      endpoint,
      requests: metrics.length,
      errors: metrics.filter(m => m.statusCode >= 400).length,
      avgResponseTime: Math.round(metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length * 100) / 100,
      errorRate: Math.round((metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100 * 100) / 100,
    }));

    // Group by status code
    const byStatusCode = this.groupBy(recentMetrics, 'statusCode');
    const statusCodeStats = Object.entries(byStatusCode).map(([code, metrics]) => ({
      statusCode: parseInt(code),
      count: metrics.length,
      percentage: Math.round((metrics.length / recentMetrics.length) * 100 * 100) / 100,
    }));

    // Group by hour for timeline
    const timeline = this.getHourlyTimeline(recentMetrics, hours);

    // Top slow endpoints
    const slowEndpoints = endpointStats
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 10);

    // Top error endpoints
    const errorEndpoints = endpointStats
      .filter(e => e.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);

    return {
      period: `${hours}h`,
      total: recentMetrics.length,
      endpoints: endpointStats,
      statusCodes: statusCodeStats,
      timeline,
      topSlow: slowEndpoints,
      topErrors: errorEndpoints,
    };
  }

  async getPerformanceMetrics(period: string) {
    const hours = this.parsePeriod(period);
    const now = new Date();
    const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= since);

    if (recentMetrics.length === 0) {
      return {
        message: 'No data available for the specified period',
      };
    }

    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const p50 = this.percentile(responseTimes, 50);
    const p90 = this.percentile(responseTimes, 90);
    const p95 = this.percentile(responseTimes, 95);
    const p99 = this.percentile(responseTimes, 99);

    return {
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length * 100) / 100,
        p50: Math.round(p50 * 100) / 100,
        p90: Math.round(p90 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
      },
      throughput: {
        rps: Math.round(recentMetrics.length / (hours * 3600) * 100) / 100,
        rpm: Math.round(recentMetrics.length / (hours * 60) * 100) / 100,
      },
      errors: {
        total: recentMetrics.filter(m => m.statusCode >= 400).length,
        rate: Math.round((recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length) * 100 * 100) / 100,
      },
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private getHourlyTimeline(metrics: ApiMetric[], hours: number) {
    const timeline = [];
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      const hourMetrics = metrics.filter(m => 
        m.timestamp >= hourStart && m.timestamp < hourEnd
      );

      timeline.push({
        hour: hourStart.toISOString().substring(0, 13) + ':00:00Z',
        requests: hourMetrics.length,
        errors: hourMetrics.filter(m => m.statusCode >= 400).length,
        avgResponseTime: hourMetrics.length > 0 
          ? Math.round(hourMetrics.reduce((sum, m) => sum + m.responseTime, 0) / hourMetrics.length * 100) / 100
          : 0,
      });
    }

    return timeline;
  }

  private percentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)([hmd])$/);
    if (!match) return 1; // default to 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value;
      case 'd': return value * 24;
      case 'm': return value / 60;
      default: return 1;
    }
  }
}