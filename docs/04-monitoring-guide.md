# คู่มือระบบ Monitoring และ Analytics

## 📊 ภาพรวมระบบ Monitoring

ระบบ Monitoring ให้ข้อมูลเชิงลึกเกี่ยวกับประสิทธิภาพของระบบ การใช้งาน และสถานะสุขภาพของแอปพลิเคชัน

### คุณสมบัติหลัก
- Real-time system metrics
- API performance monitoring
- Database statistics
- Storage analytics
- Health checks และ alerting
- User activity tracking

## 🎯 ประเภทข้อมูล Monitoring

### System Metrics
- **CPU Usage**: การใช้งาน CPU
- **Memory Usage**: การใช้งาน RAM
- **Process Information**: ข้อมูล Node.js process
- **System Uptime**: เวลาที่ระบบทำงาน
- **Platform Details**: ข้อมูลระบบปฏิบัติการ

### Database Metrics
- **Connection Status**: สถานะการเชื่อมต่อ database
- **Table Statistics**: จำนวนข้อมูลในแต่ละตาราง
- **Query Performance**: ประสิทธิภาพการ query
- **Recent Activity**: กิจกรรมล่าสุดใน database

### Storage Metrics
- **Local Storage Usage**: การใช้งาน storage ในเครื่อง
- **Supabase Storage Stats**: สถิติ cloud storage
- **File Distribution**: การกระจายตัวของไฟล์
- **Storage Health**: สุขภาพของระบบ storage

### API Metrics
- **Request/Response Times**: เวลาตอบสนองของ API
- **Error Rates**: อัตราการเกิด error
- **Endpoint Statistics**: สถิติการใช้งาน endpoint
- **Performance Percentiles**: เปอร์เซ็นไทล์ประสิทธิภาพ

## 🚀 การใช้งาน Monitoring APIs

### 1. Dashboard Overview

```http
GET /api/monitoring/dashboard
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "system": {
    "cpu": {
      "usage": 45.2,
      "cores": 8
    },
    "memory": {
      "used": 2147483648,
      "total": 8589934592,
      "percentage": 25.0
    },
    "uptime": 86400,
    "platform": "darwin",
    "nodeVersion": "v20.11.0"
  },
  "database": {
    "status": "connected",
    "tables": {
      "users": 150,
      "posts": 1250,
      "files": 3420
    }
  },
  "storage": {
    "local": {
      "used": 1073741824,
      "available": 107374182400
    },
    "supabase": {
      "used": 2147483648,
      "quota": 21474836480
    }
  },
  "api": {
    "totalRequests": 15420,
    "averageResponseTime": 125,
    "errorRate": 0.02
  }
}
```

### 2. System Metrics

```http
GET /api/monitoring/system
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "timestamp": "2025-07-29T10:00:00.000Z",
  "cpu": {
    "usage": 45.2,
    "cores": 8,
    "model": "Apple M2",
    "speed": 3200
  },
  "memory": {
    "total": 8589934592,
    "used": 2147483648,
    "free": 6442450944,
    "percentage": 25.0,
    "buffers": 134217728,
    "cached": 536870912
  },
  "process": {
    "pid": 12345,
    "uptime": 86400,
    "memoryUsage": {
      "rss": 134217728,
      "heapTotal": 67108864,
      "heapUsed": 33554432,
      "external": 16777216
    }
  },
  "os": {
    "platform": "darwin",
    "arch": "arm64",
    "release": "23.1.0",
    "hostname": "MacBook-Pro.local"
  }
}
```

### 3. Database Statistics

```http
GET /api/monitoring/database
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "connection": {
    "status": "connected",
    "url": "postgresql://***:***@localhost:5432/nestdb",
    "pool": {
      "size": 10,
      "used": 3,
      "waiting": 0
    }
  },
  "tables": [
    {
      "name": "users",
      "count": 150,
      "size": "2.1 MB"
    },
    {
      "name": "posts",
      "count": 1250,
      "size": "15.8 MB"
    },
    {
      "name": "files",
      "count": 3420,
      "size": "45.2 MB"
    }
  ],
  "performance": {
    "slowQueries": 2,
    "averageQueryTime": 15.5,
    "totalQueries": 25680
  }
}
```

### 4. Storage Analytics

```http
GET /api/monitoring/storage
Authorization: Bearer <access_token>
```

#### Response:
```json
{
  "local": {
    "path": "/app/uploads",
    "total": 107374182400,
    "used": 1073741824,
    "available": 106300440576,
    "percentage": 1.0,
    "breakdown": {
      "images": 536870912,
      "documents": 268435456,
      "videos": 268435456,
      "thumbnails": 0
    }
  },
  "supabase": {
    "bucket": "uploads",
    "used": 2147483648,
    "quota": 21474836480,
    "percentage": 10.0,
    "files": 1250,
    "bandwidth": {
      "upload": 134217728,
      "download": 268435456
    }
  },
  "distribution": [
    {
      "type": "IMAGE",
      "count": 850,
      "size": 805306368
    },
    {
      "type": "DOCUMENT",
      "count": 320,
      "size": 268435456
    },
    {
      "type": "VIDEO",
      "count": 45,
      "size": 1073741824
    }
  ]
}
```

### 5. API Performance

```http
GET /api/monitoring/performance?period=1h
Authorization: Bearer <access_token>
```

#### Query Parameters:
- **period**: 1h, 6h, 24h, 7d, 30d

#### Response:
```json
{
  "period": "1h",
  "summary": {
    "totalRequests": 1250,
    "averageResponseTime": 125,
    "medianResponseTime": 95,
    "p95ResponseTime": 280,
    "p99ResponseTime": 450,
    "errorRate": 0.02,
    "successRate": 0.98
  },
  "endpoints": [
    {
      "path": "/api/auth/login",
      "method": "POST",
      "requests": 45,
      "averageTime": 180,
      "errors": 1
    },
    {
      "path": "/api/upload/images/single",
      "method": "POST",
      "requests": 120,
      "averageTime": 850,
      "errors": 2
    }
  ],
  "errors": [
    {
      "status": 401,
      "count": 15,
      "percentage": 1.2
    },
    {
      "status": 500,
      "count": 10,
      "percentage": 0.8
    }
  ],
  "timeline": [
    {
      "timestamp": "2025-07-29T09:00:00.000Z",
      "requests": 125,
      "averageTime": 120,
      "errors": 2
    }
  ]
}
```

### 6. Health Check

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
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "details": "Connection successful"
    },
    "storage": {
      "status": "healthy",
      "local": true,
      "supabase": true
    },
    "memory": {
      "status": "healthy",
      "usage": 25.0,
      "threshold": 80.0
    },
    "disk": {
      "status": "healthy",
      "usage": 45.2,
      "threshold": 90.0
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

## 📈 Real-time Monitoring

### WebSocket Connection (ถ้ามี)
```javascript
const socket = io('http://localhost:4000');

socket.on('metrics', (data) => {
  console.log('Real-time metrics:', data);
});

socket.on('alert', (alert) => {
  console.log('System alert:', alert);
});
```

### Polling Strategy
```javascript
class MonitoringService {
  constructor(authService) {
    this.authService = authService;
    this.baseURL = 'http://localhost:4000/api';
    this.pollingInterval = null;
  }

  async getDashboard() {
    try {
      const response = await this.authService.apiCall('/monitoring/dashboard');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  }

  startPolling(interval = 30000) {
    this.pollingInterval = setInterval(async () => {
      const data = await this.getDashboard();
      this.updateUI(data);
    }, interval);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  updateUI(data) {
    // Update dashboard UI with new data
    document.getElementById('cpu-usage').textContent = `${data.system.cpu.usage}%`;
    document.getElementById('memory-usage').textContent = `${data.system.memory.percentage}%`;
    // ... update other metrics
  }
}
```

## 🚨 Alerting System

### Alert Thresholds
```javascript
const alertThresholds = {
  cpu: 80,        // CPU usage > 80%
  memory: 85,     // Memory usage > 85%
  disk: 90,       // Disk usage > 90%
  responseTime: 1000,  // Response time > 1000ms
  errorRate: 0.05      // Error rate > 5%
};
```

### Alert Types
- **Critical**: ระบบอาจหยุดทำงาน
- **Warning**: ประสิทธิภาพลดลง
- **Info**: ข้อมูลทั่วไป

### Alert Notifications
```json
{
  "id": "alert-001",
  "type": "critical",
  "title": "High Memory Usage",
  "message": "Memory usage is at 92%, exceeding threshold of 85%",
  "timestamp": "2025-07-29T10:00:00.000Z",
  "resolved": false,
  "actions": [
    "Restart application",
    "Scale up resources",
    "Clear cache"
  ]
}
```

## 📊 Dashboard Components

### System Overview Widget
```html
<div class="system-overview">
  <div class="metric">
    <h3>CPU Usage</h3>
    <div class="progress-bar">
      <div class="progress" style="width: 45%"></div>
    </div>
    <span>45%</span>
  </div>
  
  <div class="metric">
    <h3>Memory Usage</h3>
    <div class="progress-bar">
      <div class="progress" style="width: 25%"></div>
    </div>
    <span>25%</span>
  </div>
</div>
```

### API Performance Chart
```javascript
const performanceChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timestamps,
    datasets: [{
      label: 'Response Time (ms)',
      data: responseTimes,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
```

## 🔧 การตั้งค่า Monitoring

### Environment Variables
```env
# Monitoring Configuration
MONITORING_ENABLED=true
METRICS_INTERVAL=30000
ALERT_THRESHOLDS_CPU=80
ALERT_THRESHOLDS_MEMORY=85
ALERT_THRESHOLDS_DISK=90
```

### Custom Metrics
```typescript
// ใน service
@Injectable()
export class CustomMetricsService {
  private metrics = new Map();

  recordMetric(name: string, value: number) {
    this.metrics.set(name, {
      value,
      timestamp: new Date()
    });
  }

  getMetric(name: string) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

## 🧪 การทดสอบ Monitoring

### ใช้ Postman
```bash
# Import postman-collection-fixed.json
# ไปที่ Monitoring folder
# รัน requests ตามลำดับ
```

### ใช้ cURL
```bash
# Dashboard
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/monitoring/dashboard

# System metrics
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/monitoring/system

# Performance metrics
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/api/monitoring/performance?period=1h"
```

### ใช้ Test Scripts
```bash
# รัน monitoring tests
npm run test:api:monitoring

# หรือใช้ shell script
./run-tests.sh monitoring
```

## 📱 Mobile Dashboard

### React Native Example
```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/monitoring/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>System Dashboard</Text>
        
        <View style={styles.metric}>
          <Text>CPU Usage: {metrics.system.cpu.usage}%</Text>
        </View>
        
        <View style={styles.metric}>
          <Text>Memory Usage: {metrics.system.memory.percentage}%</Text>
        </View>
        
        <View style={styles.metric}>
          <Text>API Requests: {metrics.api.totalRequests}</Text>
        </View>
      </View>
    </ScrollView>
  );
};
```

## 🔍 Log Analysis

### Log Levels
- **ERROR**: ข้อผิดพลาดที่สำคัญ
- **WARN**: คำเตือน
- **INFO**: ข้อมูลทั่วไป
- **DEBUG**: ข้อมูลสำหรับ debugging

### Log Format
```json
{
  "timestamp": "2025-07-29T10:00:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "userId": "clxxxxx",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "responseTime": 125
}
```

### Log Aggregation
```bash
# ดู logs แบบ real-time
tail -f logs/app.log

# Filter logs by level
grep "ERROR" logs/app.log

# Count errors by hour
grep "ERROR" logs/app.log | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c
```

## 🔗 Integration กับ External Services

### Grafana Dashboard
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
```

### Prometheus Metrics
```typescript
// metrics.service.ts
@Injectable()
export class PrometheusService {
  private register = new prometheus.Registry();
  
  constructor() {
    // Default metrics
    prometheus.collectDefaultMetrics({ register: this.register });
    
    // Custom metrics
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status']
    });
    
    this.register.registerMetric(this.httpRequestDuration);
  }
  
  getMetrics() {
    return this.register.metrics();
  }
}
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. High Memory Usage
```bash
# ตรวจสอบ memory leaks
node --inspect app.js

# Analyze heap dump
node --heapdump app.js
```

### 2. Slow API Response
```bash
# Profile API endpoints
npm install clinic
clinic doctor -- node app.js
```

### 3. Database Connection Issues
```bash
# ตรวจสอบ connection pool
SELECT * FROM pg_stat_activity;

# Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active';
```

## 📚 Best Practices

### 1. Monitoring Strategy
- กำหนด baseline metrics
- ตั้งค่า alert thresholds ที่เหมาะสม
- Monitor business metrics ด้วย
- Regular review และ adjustment

### 2. Performance Optimization
- Cache frequently accessed data
- Optimize database queries
- Use CDN for static assets
- Implement rate limiting

### 3. Alerting Best Practices
- Avoid alert fatigue
- Prioritize critical alerts
- Include actionable information
- Test alert mechanisms regularly

## 🔗 Related Guides

- [Health Check Guide](07-health-check-guide.md) - การตรวจสอบสุขภาพระบบ
- [API Testing Guide](06-api-testing-guide.md) - การทดสอบ monitoring APIs
- [Deployment Guide](05-deployment-guide.md) - การ deploy monitoring system