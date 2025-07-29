# คู่มือระบบ Health Check

## 🏥 ภาพรวมระบบ Health Check

ระบบ Health Check ช่วยตรวจสอบสถานะสุขภาพของแอปพลิเคชันและ dependencies ต่างๆ เพื่อให้มั่นใจว่าระบบทำงานได้อย่างปกติ

### คุณสมบัติหลัก
- Application health status
- Database connectivity check
- Storage system health
- External service monitoring
- Resource usage monitoring
- Automated alerting

## 🎯 ประเภทของ Health Checks

### 1. Basic Health Check
- ตรวจสอบว่าแอปพลิเคชันทำงานอยู่
- ไม่ต้องการ authentication
- Response time ต่ำ

### 2. Detailed Health Check
- ตรวจสอบ dependencies ทั้งหมด
- ต้องการ authentication
- ข้อมูลเชิงลึกเกี่ยวกับระบบ

### 3. Readiness Check
- ตรวจสอบว่าระบบพร้อมรับ traffic
- ใช้สำหรับ load balancer
- Kubernetes readiness probe

### 4. Liveness Check
- ตรวจสอบว่าแอปพลิเคชันยังทำงานอยู่
- ใช้สำหรับ container orchestration
- Kubernetes liveness probe

## 🚀 การใช้งาน Health Check APIs

### 1. Basic Health Check

```http
GET /health
```

#### Response (Healthy):
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  }
}
```

#### Response (Unhealthy):
```json
{
  "status": "error",
  "info": {
    "storage": {
      "status": "up"
    }
  },
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    },
    "storage": {
      "status": "up"
    }
  }
}
```

### 2. Detailed Health Check

```http
GET /api/monitoring/health
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-29T10:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "details": {
        "connection": "active",
        "pool": {
          "size": 10,
          "used": 3,
          "waiting": 0
        },
        "lastQuery": "2025-07-29T09:59:45.000Z"
      }
    },
    "storage": {
      "status": "healthy",
      "local": {
        "status": "available",
        "path": "/app/uploads",
        "freeSpace": "95.2 GB",
        "usedSpace": "4.8 GB"
      },
      "supabase": {
        "status": "connected",
        "bucket": "uploads",
        "lastSync": "2025-07-29T09:58:30.000Z"
      }
    },
    "memory": {
      "status": "healthy",
      "usage": 25.0,
      "threshold": 80.0,
      "details": {
        "total": "8.0 GB",
        "used": "2.0 GB",
        "free": "6.0 GB"
      }
    },
    "disk": {
      "status": "healthy",
      "usage": 45.2,
      "threshold": 90.0,
      "details": {
        "total": "100 GB",
        "used": "45.2 GB",
        "available": "54.8 GB"
      }
    },
    "cpu": {
      "status": "healthy",
      "usage": 35.5,
      "threshold": 85.0,
      "cores": 8
    },
    "external": {
      "supabase": {
        "status": "connected",
        "responseTime": 120,
        "lastCheck": "2025-07-29T09:59:50.000Z"
      }
    }
  },
  "metrics": {
    "requestsPerMinute": 150,
    "averageResponseTime": 125,
    "errorRate": 0.02,
    "activeConnections": 25
  }
}
```

### 3. Readiness Check

```http
GET /health/ready
```

#### Response (Ready):
```json
{
  "status": "ready",
  "timestamp": "2025-07-29T10:00:00.000Z",
  "checks": {
    "database": "connected",
    "migrations": "up-to-date",
    "storage": "available",
    "cache": "connected"
  }
}
```

#### Response (Not Ready):
```json
{
  "status": "not-ready",
  "timestamp": "2025-07-29T10:00:00.000Z",
  "checks": {
    "database": "connected",
    "migrations": "pending",
    "storage": "available",
    "cache": "disconnected"
  },
  "issues": [
    "Database migrations are pending",
    "Cache service is not available"
  ]
}
```

### 4. Liveness Check

```http
GET /health/live
```

#### Response:
```json
{
  "status": "alive",
  "timestamp": "2025-07-29T10:00:00.000Z",
  "uptime": 86400,
  "pid": 12345
}
```

## 🔧 การตั้งค่า Health Checks

### 1. Environment Configuration

```env
# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_DATABASE=true
HEALTH_CHECK_STORAGE=true
HEALTH_CHECK_EXTERNAL=true

# Thresholds
HEALTH_MEMORY_THRESHOLD=80
HEALTH_DISK_THRESHOLD=90
HEALTH_CPU_THRESHOLD=85
HEALTH_RESPONSE_TIME_THRESHOLD=1000
```

### 2. Custom Health Indicators

```typescript
// custom-health.service.ts
@Injectable()
export class CustomHealthService {
  @HealthCheck('custom-service')
  async checkCustomService(): Promise<HealthIndicatorResult> {
    try {
      // Custom health check logic
      const isHealthy = await this.performCustomCheck();
      
      if (isHealthy) {
        return this.getStatus('custom-service', true, {
          message: 'Custom service is healthy',
          lastCheck: new Date().toISOString()
        });
      } else {
        throw new Error('Custom service check failed');
      }
    } catch (error) {
      return this.getStatus('custom-service', false, {
        message: error.message,
        lastCheck: new Date().toISOString()
      });
    }
  }

  private async performCustomCheck(): Promise<boolean> {
    // Implement your custom health check logic
    return true;
  }

  private getStatus(key: string, isHealthy: boolean, data?: any): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data
      }
    };
  }
}
```

## 🐳 Docker Health Checks

### 1. Dockerfile Health Check

```dockerfile
# ใน Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

### 2. healthcheck.js

```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    console.error(`Health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
```

### 3. Docker Compose Health Check

```yaml
# docker-compose.yml
services:
  app:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
```

## ☸️ Kubernetes Health Checks

### 1. Deployment with Health Checks

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nest-auth-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nest-auth-api
  template:
    metadata:
      labels:
        app: nest-auth-api
    spec:
      containers:
      - name: app
        image: nest-auth-api:latest
        ports:
        - containerPort: 4000
        
        # Liveness Probe
        livenessProbe:
          httpGet:
            path: /health/live
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        # Readiness Probe
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Startup Probe
        startupProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
```

### 2. Service Monitor

```yaml
# service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nest-auth-api-monitor
spec:
  selector:
    matchLabels:
      app: nest-auth-api
  endpoints:
  - port: http
    path: /health
    interval: 30s
```

## 📊 Health Check Monitoring

### 1. Prometheus Metrics

```typescript
// health-metrics.service.ts
@Injectable()
export class HealthMetricsService {
  private healthCheckCounter = new prometheus.Counter({
    name: 'health_check_total',
    help: 'Total number of health checks',
    labelNames: ['status', 'check_type']
  });

  private healthCheckDuration = new prometheus.Histogram({
    name: 'health_check_duration_seconds',
    help: 'Duration of health checks',
    labelNames: ['check_type']
  });

  recordHealthCheck(checkType: string, status: string, duration: number) {
    this.healthCheckCounter.inc({ status, check_type: checkType });
    this.healthCheckDuration.observe({ check_type: checkType }, duration);
  }
}
```

### 2. Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Health Check Dashboard",
    "panels": [
      {
        "title": "Health Check Status",
        "type": "stat",
        "targets": [
          {
            "expr": "health_check_total{status=\"healthy\"}",
            "legendFormat": "Healthy Checks"
          }
        ]
      },
      {
        "title": "Health Check Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "health_check_duration_seconds",
            "legendFormat": "{{check_type}}"
          }
        ]
      }
    ]
  }
}
```

## 🚨 Alerting และ Notifications

### 1. Alert Rules

```yaml
# alert-rules.yaml
groups:
- name: health-check-alerts
  rules:
  - alert: ApplicationDown
    expr: up{job="nest-auth-api"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Application is down"
      description: "The application has been down for more than 1 minute"

  - alert: HighMemoryUsage
    expr: health_memory_usage_percent > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is {{ $value }}%"

  - alert: DatabaseConnectionFailed
    expr: health_database_status == 0
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
      description: "Unable to connect to database"
```

### 2. Notification Channels

```typescript
// notification.service.ts
@Injectable()
export class NotificationService {
  async sendHealthAlert(alert: HealthAlert) {
    switch (alert.severity) {
      case 'critical':
        await this.sendSlackAlert(alert);
        await this.sendEmailAlert(alert);
        break;
      case 'warning':
        await this.sendSlackAlert(alert);
        break;
      case 'info':
        await this.logAlert(alert);
        break;
    }
  }

  private async sendSlackAlert(alert: HealthAlert) {
    // Slack notification implementation
  }

  private async sendEmailAlert(alert: HealthAlert) {
    // Email notification implementation
  }

  private async logAlert(alert: HealthAlert) {
    console.log(`Health Alert: ${alert.message}`);
  }
}
```

## 🧪 การทดสอบ Health Checks

### 1. Manual Testing

```bash
# Basic health check
curl http://localhost:4000/health

# Detailed health check
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/monitoring/health

# Readiness check
curl http://localhost:4000/health/ready

# Liveness check
curl http://localhost:4000/health/live
```

### 2. Automated Testing

```bash
# รัน health check tests
npm run test:api:health

# ใช้ shell script
./run-tests.sh health
```

### 3. Load Testing Health Endpoints

```bash
# Test health endpoint under load
ab -n 1000 -c 10 http://localhost:4000/health

# Monitor response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:4000/health
```

### 4. Failure Simulation

```bash
# Simulate database failure
docker-compose stop postgres

# Check health status
curl http://localhost:4000/health

# Restore database
docker-compose start postgres
```

## 📱 Health Check Dashboard

### 1. Web Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>Health Check Dashboard</title>
    <style>
        .healthy { color: green; }
        .unhealthy { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>System Health Dashboard</h1>
    <div id="health-status"></div>
    
    <script>
        async function updateHealthStatus() {
            try {
                const response = await fetch('/health');
                const health = await response.json();
                
                const statusDiv = document.getElementById('health-status');
                statusDiv.innerHTML = `
                    <h2>Overall Status: <span class="${health.status === 'ok' ? 'healthy' : 'unhealthy'}">${health.status}</span></h2>
                    <ul>
                        ${Object.entries(health.details).map(([key, value]) => 
                            `<li>${key}: <span class="${value.status === 'up' ? 'healthy' : 'unhealthy'}">${value.status}</span></li>`
                        ).join('')}
                    </ul>
                `;
            } catch (error) {
                console.error('Failed to fetch health status:', error);
            }
        }
        
        // Update every 30 seconds
        setInterval(updateHealthStatus, 30000);
        updateHealthStatus();
    </script>
</body>
</html>
```

### 2. Mobile App Health Check

```javascript
// React Native health check component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:4000/health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Text>Checking system health...</Text>;

  return (
    <View style={styles.container}>
      <Text style={[styles.status, health?.status === 'ok' ? styles.healthy : styles.unhealthy]}>
        System Status: {health?.status || 'Unknown'}
      </Text>
      
      {health?.details && Object.entries(health.details).map(([key, value]) => (
        <Text key={key} style={[styles.service, value.status === 'up' ? styles.healthy : styles.unhealthy]}>
          {key}: {value.status}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  status: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  service: { fontSize: 14, marginBottom: 5 },
  healthy: { color: 'green' },
  unhealthy: { color: 'red' }
});
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Health Check Timeout
```bash
# เพิ่ม timeout ใน configuration
HEALTH_CHECK_TIMEOUT=10000

# ตรวจสอบ network latency
ping localhost
```

### 2. Database Health Check Failed
```bash
# ตรวจสอบ database connection
psql $DATABASE_URL

# ตรวจสอบ connection pool
# ดูใน detailed health check response
```

### 3. Storage Health Check Failed
```bash
# ตรวจสอบ local storage
df -h

# ตรวจสอบ permissions
ls -la uploads/

# ทดสอบ Supabase connection
curl -H "Authorization: Bearer <supabase-key>" \
  "https://your-project.supabase.co/storage/v1/bucket"
```

### 4. Memory/CPU Threshold Exceeded
```bash
# ตรวจสอบ resource usage
htop

# Restart application
pm2 restart nest-auth-api

# Scale resources if needed
```

## 📚 Best Practices

### 1. Health Check Design
- Keep health checks lightweight
- Test critical dependencies only
- Set appropriate timeouts
- Return meaningful error messages

### 2. Monitoring Strategy
- Monitor health check trends
- Set up proper alerting
- Document health check procedures
- Regular health check testing

### 3. Performance Considerations
- Cache health check results when appropriate
- Avoid expensive operations in health checks
- Use circuit breakers for external dependencies
- Monitor health check performance

### 4. Security
- Protect detailed health endpoints
- Don't expose sensitive information
- Rate limit health check endpoints
- Log health check access

## 🔗 Related Guides

- [Monitoring Guide](04-monitoring-guide.md) - การ monitor ระบบโดยรวม
- [Deployment Guide](05-deployment-guide.md) - การ deploy พร้อม health checks
- [API Testing Guide](06-api-testing-guide.md) - การทดสอบ health check APIs