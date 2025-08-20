import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from 'express-rate-limit';
import { storage } from "./storage";
import { 
  authenticateToken, 
  requireAdmin, 
  requireSuperAdmin, 
  requireELISAOwnership,
  generateToken, 
  hashPassword, 
  verifyPassword,
  authRateLimit,
  AuthenticatedRequest
} from "./auth";
import { ELISAWebSocketServer } from "./websocket";
import { exportService, ExportService } from "./export";
import { 
  insertUserSchema, 
  loginSchema, 
  insertMetricSchema, 
  insertConfigSchema, 
  insertAIModelSchema,
  insertAuditLogSchema
} from "@shared/schema";

// Rate limiting configurations
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit to 10 requests per 5 minutes
  message: 'Rate limit exceeded for sensitive operations',
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting
  app.use('/api', apiRateLimit);

  // Initialize WebSocket server
  const httpServer = createServer(app);
  const wsServer = new ELISAWebSocketServer(httpServer);

  // ===== AUTHENTICATION ROUTES =====
  
  // User registration (Super Admin only)
  app.post('/api/auth/register', 
    rateLimit(authRateLimit), 
    authenticateToken, 
    requireSuperAdmin, 
    async (req: AuthenticatedRequest, res) => {
      try {
        const userData = insertUserSchema.parse(req.body);
        
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create user
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        });

        // Log user creation
        await storage.createAuditLog({
          userId: req.userId!,
          action: 'USER_CREATED',
          resource: 'USER_MANAGEMENT',
          details: { newUserId: user.id, email: user.email, role: user.role }
        });

        res.json({ 
          message: 'User created successfully', 
          user: { id: user.id, email: user.email, role: user.role } 
        });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // User login
  app.post('/api/auth/login', rateLimit(authRateLimit), async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(credentials.email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store session
      await storage.createSession(user.id, token, expiresAt);
      
      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Log login
      await storage.createAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTHENTICATION',
        details: { ip: req.ip, userAgent: req.headers['user-agent'] }
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User logout
  app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await storage.deleteSession(token);
      }

      // Log logout
      await storage.createAuditLog({
        userId: req.userId!,
        action: 'USER_LOGOUT',
        resource: 'AUTHENTICATION',
        details: {}
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({
      id: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      lastLogin: req.user!.lastLogin,
      createdAt: req.user!.createdAt
    });
  });

  // ===== METRICS ROUTES (ELISA Protected) =====
  
  // Get real-time metrics
  app.get('/api/metrics', authenticateToken, requireELISAOwnership, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, from, to, limit = 100 } = req.query;
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const metrics = await storage.getMetrics(type as string, fromDate, toDate);
      res.json(metrics.slice(0, Number(limit)));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new metric (System only - for real-time updates)
  app.post('/api/metrics', authenticateToken, requireELISAOwnership, async (req: AuthenticatedRequest, res) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      
      // Broadcast to WebSocket clients
      wsServer.broadcast({
        type: 'metric_created',
        data: metric,
        timestamp: new Date().toISOString()
      });

      res.json(metric);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== AI MODELS MANAGEMENT (Admin Protected) =====
  
  // Get all AI models
  app.get('/api/ai-models', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const models = await storage.getAIModels();
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create AI model
  app.post('/api/ai-models', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const modelData = insertAIModelSchema.parse(req.body);
      const model = await storage.createAIModel(modelData);
      
      // Log model creation
      await storage.createAuditLog({
        userId: req.userId!,
        action: 'AI_MODEL_CREATED',
        resource: 'AI_MODEL_MANAGEMENT',
        details: { modelId: model.id, name: model.name }
      });

      // Broadcast update
      wsServer.broadcast({
        type: 'ai_model_created',
        data: model,
        timestamp: new Date().toISOString()
      });

      res.json(model);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update AI model
  app.put('/api/ai-models/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = insertAIModelSchema.partial().parse(req.body);
      
      const model = await storage.updateAIModel(id, updates);
      
      // Log model update
      await storage.createAuditLog({
        userId: req.userId!,
        action: 'AI_MODEL_UPDATED',
        resource: 'AI_MODEL_MANAGEMENT',
        details: { modelId: id, updates }
      });

      // Broadcast update
      wsServer.broadcast({
        type: 'ai_model_updated',
        data: model,
        timestamp: new Date().toISOString()
      });

      res.json(model);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete AI model
  app.delete('/api/ai-models/:id', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteAIModel(id);
      
      // Log model deletion
      await storage.createAuditLog({
        userId: req.userId!,
        action: 'AI_MODEL_DELETED',
        resource: 'AI_MODEL_MANAGEMENT',
        details: { modelId: id }
      });

      // Broadcast deletion
      wsServer.broadcast({
        type: 'ai_model_deleted',
        data: { id },
        timestamp: new Date().toISOString()
      });

      res.json({ message: 'AI model deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SYSTEM CONFIGURATION (Admin Panel) =====
  
  // Get system configuration
  app.get('/api/admin/config', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const config = await storage.getAllConfig();
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Set configuration value
  app.post('/api/admin/config', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const configData = insertConfigSchema.parse(req.body);
      const config = await storage.setConfig(configData, req.userId!);
      
      // Log configuration change
      await storage.createAuditLog({
        userId: req.userId!,
        action: 'CONFIG_UPDATED',
        resource: 'SYSTEM_CONFIGURATION',
        details: { key: config.key, value: config.value }
      });

      // Broadcast config change
      wsServer.broadcast({
        type: 'config_updated',
        data: config,
        timestamp: new Date().toISOString()
      });

      res.json(config);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== AUDIT LOGS =====
  
  // Get audit logs
  app.get('/api/audit-logs', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, from, to, limit = 100 } = req.query;
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const logs = await storage.getAuditLogs(userId as string, fromDate, toDate);
      res.json(logs.slice(0, Number(limit)));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== EXPORT FUNCTIONALITY =====
  
  // Export metrics
  app.get('/api/export/metrics', 
    authenticateToken, 
    requireAdmin, 
    strictRateLimit, 
    async (req: AuthenticatedRequest, res) => {
      try {
        const { format = 'json', from, to, includeHeaders = 'true' } = req.query;
        
        const options = {
          format: format as 'json' | 'csv',
          dateFrom: from ? new Date(from as string) : undefined,
          dateTo: to ? new Date(to as string) : undefined,
          includeHeaders: includeHeaders === 'true'
        };

        const data = await exportService.exportMetrics(options);
        const filename = `elisa-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
        
        ExportService.setDownloadHeaders(res, filename, format as string);
        
        // Log export
        await storage.createAuditLog({
          userId: req.userId!,
          action: 'METRICS_EXPORTED',
          resource: 'DATA_EXPORT',
          details: { format, filename }
        });

        res.send(data);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Export audit logs
  app.get('/api/export/audit-logs', 
    authenticateToken, 
    requireSuperAdmin, 
    strictRateLimit, 
    async (req: AuthenticatedRequest, res) => {
      try {
        const { format = 'json', userId, from, to, includeHeaders = 'true' } = req.query;
        
        const options = {
          format: format as 'json' | 'csv',
          dateFrom: from ? new Date(from as string) : undefined,
          dateTo: to ? new Date(to as string) : undefined,
          includeHeaders: includeHeaders === 'true'
        };

        const data = await exportService.exportAuditLogs(options, userId as string);
        const filename = `elisa-audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        
        ExportService.setDownloadHeaders(res, filename, format as string);
        
        // Log export
        await storage.createAuditLog({
          userId: req.userId!,
          action: 'AUDIT_LOGS_EXPORTED',
          resource: 'DATA_EXPORT',
          details: { format, filename, targetUserId: userId }
        });

        res.send(data);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Export AI models
  app.get('/api/export/ai-models', 
    authenticateToken, 
    requireAdmin, 
    strictRateLimit, 
    async (req: AuthenticatedRequest, res) => {
      try {
        const { format = 'json', includeHeaders = 'true' } = req.query;
        
        const options = {
          format: format as 'json' | 'csv',
          includeHeaders: includeHeaders === 'true'
        };

        const data = await exportService.exportAIModels(options);
        const filename = `elisa-ai-models-${new Date().toISOString().split('T')[0]}.${format}`;
        
        ExportService.setDownloadHeaders(res, filename, format as string);
        
        // Log export
        await storage.createAuditLog({
          userId: req.userId!,
          action: 'AI_MODELS_EXPORTED',
          resource: 'DATA_EXPORT',
          details: { format, filename }
        });

        res.send(data);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Export system report
  app.get('/api/export/system-report', 
    authenticateToken, 
    requireSuperAdmin, 
    strictRateLimit, 
    async (req: AuthenticatedRequest, res) => {
      try {
        const { from, to } = req.query;
        
        const options = {
          format: 'json' as const,
          dateFrom: from ? new Date(from as string) : undefined,
          dateTo: to ? new Date(to as string) : undefined,
        };

        const data = await exportService.exportSystemReport(options);
        const filename = `elisa-system-report-${new Date().toISOString().split('T')[0]}.json`;
        
        ExportService.setDownloadHeaders(res, filename, 'json');
        
        // Log export
        await storage.createAuditLog({
          userId: req.userId!,
          action: 'SYSTEM_REPORT_EXPORTED',
          resource: 'DATA_EXPORT',
          details: { filename }
        });

        res.send(data);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // ===== SYSTEM STATUS & HEALTH =====
  
  // System health check
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        websocket: 'active',
        authentication: 'active'
      }
    });
  });

  // Cleanup expired sessions (internal job)
  setInterval(async () => {
    try {
      await storage.cleanupExpiredSessions();
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }, 60 * 60 * 1000); // Run every hour

  // Real-time metrics simulation (for demo purposes)
  setInterval(async () => {
    try {
      // Simulate console attempts
      await storage.createMetric({
        type: 'console_attempts',
        value: Math.floor(Math.random() * 5) + 1,
        metadata: { source: 'system_monitor' }
      });

      // Simulate fines issued
      await storage.createMetric({
        type: 'fines_issued',
        value: Math.floor(Math.random() * 3),
        metadata: { source: 'enforcement_system' }
      });

      // Occasionally broadcast alerts
      if (Math.random() > 0.9) {
        wsServer.broadcastAlert(
          'warning', 
          'High console access attempt rate detected',
          { threshold: 50, current: Math.floor(Math.random() * 100) }
        );
      }
    } catch (error) {
      console.error('Error creating demo metrics:', error);
    }
  }, 3000); // Every 3 seconds

  return httpServer;
}
