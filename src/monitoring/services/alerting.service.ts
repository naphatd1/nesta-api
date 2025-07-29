import { Injectable, Logger } from '@nestjs/common';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  service: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);
  private alerts: Alert[] = [];
  private readonly maxAlerts = 1000;

  createAlert(type: Alert['type'], service: string, message: string): Alert {
    const alert: Alert = {
      id: this.generateId(),
      type,
      service,
      message,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);
    this.logger.warn(`Alert created: [${type.toUpperCase()}] ${service}: ${message}`);

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    return alert;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.logger.log(`Alert resolved: ${alertId}`);
      return true;
    }
    return false;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getAlertsByService(service: string): Alert[] {
    return this.alerts.filter(a => a.service === service);
  }

  getAlertsByType(type: Alert['type']): Alert[] {
    return this.alerts.filter(a => a.type === type);
  }

  getAlertStats() {
    const active = this.getActiveAlerts();
    const last24h = this.alerts.filter(
      a => a.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      active: {
        total: active.length,
        critical: active.filter(a => a.type === 'critical').length,
        warning: active.filter(a => a.type === 'warning').length,
        info: active.filter(a => a.type === 'info').length,
      },
      last24h: {
        total: last24h.length,
        resolved: last24h.filter(a => a.resolved).length,
        byType: {
          critical: last24h.filter(a => a.type === 'critical').length,
          warning: last24h.filter(a => a.type === 'warning').length,
          info: last24h.filter(a => a.type === 'info').length,
        },
        byService: this.groupBy(last24h, 'service'),
      },
    };
  }

  // Auto-resolve alerts based on conditions
  autoResolveAlerts() {
    const activeAlerts = this.getActiveAlerts();
    let resolvedCount = 0;

    for (const alert of activeAlerts) {
      // Auto-resolve alerts older than 24 hours for info type
      if (alert.type === 'info' && 
          alert.timestamp < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        this.resolveAlert(alert.id);
        resolvedCount++;
      }

      // Auto-resolve alerts older than 1 hour for warning type if no recent similar alerts
      if (alert.type === 'warning' && 
          alert.timestamp < new Date(Date.now() - 60 * 60 * 1000)) {
        const recentSimilar = activeAlerts.filter(a => 
          a.service === alert.service && 
          a.message === alert.message &&
          a.timestamp > new Date(Date.now() - 30 * 60 * 1000) // last 30 minutes
        );
        
        if (recentSimilar.length <= 1) { // only the current alert
          this.resolveAlert(alert.id);
          resolvedCount++;
        }
      }
    }

    if (resolvedCount > 0) {
      this.logger.log(`Auto-resolved ${resolvedCount} alerts`);
    }

    return resolvedCount;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}