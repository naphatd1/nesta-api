import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as fs from 'fs/promises';

@Injectable()
export class SystemMetricsService {
  async getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      uptime: {
        system: os.uptime(),
        process: process.uptime(),
      },
      memory: {
        total: Math.round(totalMemory / 1024 / 1024), // MB
        used: Math.round(usedMemory / 1024 / 1024), // MB
        free: Math.round(freeMemory / 1024 / 1024), // MB
        usage: Math.round((usedMemory / totalMemory) * 100), // %
        process: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        usage: await this.getCpuUsage(),
        loadAverage: os.loadavg(),
      },
      platform: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
      },
    };
  }

  async getDetailedMetrics() {
    const basic = await this.getSystemInfo();
    const diskUsage = await this.getDiskUsage();
    const networkInterfaces = os.networkInterfaces();

    return {
      ...basic,
      disk: diskUsage,
      network: networkInterfaces,
      environment: {
        nodeVersion: process.version,
        pid: process.pid,
        ppid: process.ppid,
        cwd: process.cwd(),
        execPath: process.execPath,
      },
    };
  }

  async getHealthStatus() {
    const metrics = await this.getSystemInfo();
    const issues = [];

    if (metrics.memory.usage > 90) {
      issues.push('High memory usage');
    }

    if (metrics.cpu.usage > 80) {
      issues.push('High CPU usage');
    }

    if (metrics.cpu.loadAverage[0] > metrics.cpu.cores * 2) {
      issues.push('High system load');
    }

    return {
      healthy: issues.length === 0,
      issues,
      metrics: {
        memoryUsage: metrics.memory.usage,
        cpuUsage: metrics.cpu.usage,
        uptime: metrics.uptime.process,
      },
    };
  }

  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const currentTime = process.hrtime(startTime);

        const totalTime = currentTime[0] * 1000000 + currentTime[1] / 1000; // microseconds
        const totalUsage = currentUsage.user + currentUsage.system;
        const cpuPercent = (totalUsage / totalTime) * 100;

        resolve(Math.round(cpuPercent * 100) / 100);
      }, 100);
    });
  }

  private async getDiskUsage() {
    try {
      const stats = await fs.stat('.');
      // This is a simplified version - in production you might want to use a library like 'diskusage'
      return {
        total: 'N/A',
        used: 'N/A',
        free: 'N/A',
        usage: 0,
        note: 'Install diskusage package for detailed disk metrics',
      };
    } catch (error) {
      return {
        error: 'Unable to get disk usage',
      };
    }
  }
}