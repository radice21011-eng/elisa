import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from './auth';
import { storage } from './storage';

interface Client {
  ws: WebSocket;
  userId?: string;
  isAuthenticated: boolean;
}

export class ELISAWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<Client> = new Set();
  private metricsInterval?: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startMetricsUpdates();
  }

  private verifyClient(info: any): boolean {
    // Basic verification - more detailed auth happens after connection
    return true;
  }

  private async handleConnection(ws: WebSocket, request: any) {
    const client: Client = {
      ws,
      isAuthenticated: false
    };

    this.clients.add(client);

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(client, message);
      } catch (error) {
        this.sendError(client, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.clients.delete(client);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(client);
    });

    // Send initial connection message
    this.sendMessage(client, {
      type: 'connection',
      message: 'Connected to ELISA Quantum AI Council WebSocket',
      timestamp: new Date().toISOString()
    });
  }

  private async handleMessage(client: Client, message: any) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(client, message);
        break;
      
      case 'subscribe':
        await this.handleSubscribe(client, message);
        break;
        
      case 'ping':
        this.sendMessage(client, { type: 'pong', timestamp: new Date().toISOString() });
        break;
        
      default:
        this.sendError(client, 'Unknown message type');
    }
  }

  private async handleAuth(client: Client, message: any) {
    const { token } = message;
    
    if (!token) {
      this.sendError(client, 'Token required');
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      this.sendError(client, 'Invalid token');
      return;
    }

    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isActive) {
      this.sendError(client, 'User not found or inactive');
      return;
    }

    client.userId = user.id;
    client.isAuthenticated = true;

    // Log successful WebSocket authentication
    await storage.createAuditLog({
      userId: user.id,
      action: 'WEBSOCKET_AUTH',
      resource: 'REALTIME_CONNECTION',
      details: { userAgent: message.userAgent }
    });

    this.sendMessage(client, {
      type: 'auth_success',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });
  }

  private async handleSubscribe(client: Client, message: any) {
    if (!client.isAuthenticated) {
      this.sendError(client, 'Authentication required');
      return;
    }

    const { channels } = message;
    // For now, we'll automatically subscribe authenticated users to all channels
    // In a more complex system, we'd manage subscriptions per channel
    
    this.sendMessage(client, {
      type: 'subscribed',
      channels: channels || ['metrics', 'alerts', 'audit'],
      timestamp: new Date().toISOString()
    });
  }

  private sendMessage(client: Client, message: any) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private sendError(client: Client, error: string) {
    this.sendMessage(client, {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all authenticated clients
  public broadcast(message: any) {
    this.clients.forEach(client => {
      if (client.isAuthenticated) {
        this.sendMessage(client, message);
      }
    });
  }

  // Broadcast to specific users
  public broadcastToUsers(userIds: string[], message: any) {
    this.clients.forEach(client => {
      if (client.isAuthenticated && client.userId && userIds.includes(client.userId)) {
        this.sendMessage(client, message);
      }
    });
  }

  // Start broadcasting real-time metrics updates
  private startMetricsUpdates() {
    this.metricsInterval = setInterval(async () => {
      try {
        const latestMetrics = await storage.getLatestMetrics();
        const recentMetrics = latestMetrics.slice(0, 10); // Last 10 metrics

        if (recentMetrics.length > 0) {
          this.broadcast({
            type: 'metrics_update',
            data: recentMetrics,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error broadcasting metrics:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  // Broadcast system alerts
  public broadcastAlert(type: 'info' | 'warning' | 'error' | 'critical', message: string, details?: any) {
    this.broadcast({
      type: 'alert',
      alertType: type,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Cleanup
  public close() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.wss.close();
  }
}