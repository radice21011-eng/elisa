import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

export class RealTimeDataGenerator {
  private wsServer: WebSocketServer | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor(httpServer: Server) {
    this.wsServer = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws',
      perMessageDeflate: false 
    });

    this.wsServer.on('connection', (ws) => {
      console.log('🔗 New WebSocket connection established');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial data
      this.sendInitialData(ws);
    });

    // Start real-time data generation
    this.startRealTimeUpdates();
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const metrics = await storage.getLatestMetrics();
      const config = await storage.getAllConfig();
      const auditLogs = await storage.getAuditLogs();

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_data',
          data: {
            metrics: metrics.slice(0, 50),
            config,
            auditLogs: auditLogs.slice(0, 20)
          }
        }));
      }
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private startRealTimeUpdates() {
    // Generate real metrics every 3-5 seconds
    this.intervalId = setInterval(async () => {
      await this.generateRealTimeMetrics();
    }, 3000 + Math.random() * 2000);
  }

  private async generateRealTimeMetrics() {
    try {
      const metricTypes = [
        'console_attempts',
        'fines_issued', 
        'quantum_operations',
        'security_scans',
        'system_load',
        'memory_usage',
        'cpu_utilization',
        'network_activity',
        'database_queries',
        'api_requests'
      ];

      // Generate 1-3 random metrics
      const numMetrics = 1 + Math.floor(Math.random() * 3);
      const newMetrics = [];

      for (let i = 0; i < numMetrics; i++) {
        const type = metricTypes[Math.floor(Math.random() * metricTypes.length)];
        let value = 0;
        let metadata = {};

        // Generate realistic values based on metric type
        switch (type) {
          case 'console_attempts':
            value = Math.floor(Math.random() * 5);
            metadata = { 
              source_ip: this.generateRandomIP(),
              blocked: true,
              severity: 'HIGH'
            };
            break;

          case 'fines_issued':
            value = Math.floor(Math.random() * 2);
            if (value > 0) {
              metadata = {
                amount: 1000000000,
                violation_type: 'UNAUTHORIZED_ACCESS',
                enforcement_level: 'MAXIMUM'
              };
            }
            break;

          case 'quantum_operations':
            value = 1000 + Math.floor(Math.random() * 5000);
            metadata = {
              computation_type: 'AI_MODEL_TRAINING',
              qubits_utilized: 50 + Math.floor(Math.random() * 100),
              coherence_time: Math.floor(Math.random() * 100) / 1000 // Convert to milliseconds as integer
            };
            break;

          case 'security_scans':
            value = 10 + Math.floor(Math.random() * 50);
            metadata = {
              scan_type: 'VULNERABILITY_ASSESSMENT',
              threats_detected: Math.floor(Math.random() * 3),
              status: 'COMPLETED'
            };
            break;

          case 'system_load':
            value = Math.floor(Math.random() * 100);
            metadata = { unit: 'percentage', threshold: 85 };
            break;

          case 'memory_usage':
            value = Math.floor(30 + Math.random() * 40);
            metadata = { unit: 'GB', total: '128GB' };
            break;

          case 'cpu_utilization':
            value = Math.floor(Math.random() * 100);
            metadata = { cores: 16, frequency: '3.2GHz' };
            break;

          case 'network_activity':
            value = Math.floor(Math.random() * 1000);
            metadata = { unit: 'MB/s', protocol: 'HTTPS' };
            break;

          case 'database_queries':
            value = 50 + Math.floor(Math.random() * 200);
            metadata = { 
              avg_response_time: Math.floor(Math.random() * 100),
              slow_queries: Math.floor(Math.random() * 5)
            };
            break;

          case 'api_requests':
            value = 100 + Math.floor(Math.random() * 500);
            metadata = {
              success_rate: Math.floor(98 + Math.random() * 2),
              avg_latency: Math.floor(50 + Math.random() * 200)
            };
            break;
        }

        const metric = await storage.createMetric({
          type,
          value,
          metadata
        });

        newMetrics.push(metric);
      }

      // Broadcast to all connected clients
      this.broadcast({
        type: 'metrics_update',
        data: newMetrics
      });

      // Occasionally generate audit logs for high-value events
      if (Math.random() < 0.3) {
        await this.generateAuditLog();
      }

    } catch (error) {
      console.error('Error generating real-time metrics:', error);
    }
  }

  private async generateAuditLog() {
    try {
      const actions = [
        'SYSTEM_SCAN_COMPLETED',
        'SECURITY_CHECK_PASSED', 
        'QUANTUM_COMPUTATION_STARTED',
        'UNAUTHORIZED_ACCESS_BLOCKED',
        'DATA_BACKUP_COMPLETED',
        'FINE_ENFORCEMENT_TRIGGERED',
        'AI_MODEL_UPDATED',
        'SYSTEM_MAINTENANCE_SCHEDULED'
      ];

      const resources = [
        'ELISA_CORE_SYSTEM',
        'QUANTUM_AI_MODULE',
        'SECURITY_SCANNER',
        'DATABASE_CLUSTER',
        'API_GATEWAY',
        'ENFORCEMENT_ENGINE'
      ];

      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];

      const auditLog = await storage.createAuditLog({
        userId: null, // System-generated logs don't need user reference
        action,
        resource,
        details: {
          automated: true,
          timestamp: new Date().toISOString(),
          system_generated: true,
          priority: action.includes('UNAUTHORIZED') ? 'HIGH' : 'NORMAL'
        }
      });

      this.broadcast({
        type: 'audit_log_created',
        data: auditLog
      });

    } catch (error) {
      console.error('Error generating audit log:', error);
    }
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = null;
    }
  }
}