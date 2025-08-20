import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from 'express-rate-limit';
import { storage } from "./storage";
import { 
  authenticateToken, 
  generateToken, 
  authRateLimit,
  AuthenticatedRequest
} from "./auth";
import { RealTimeDataGenerator } from "./realtime";
import { 
  insertMetricSchema, 
  insertConfigSchema, 
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting
  app.use('/api', apiRateLimit);

  // Initialize WebSocket server with real-time data
  const httpServer = createServer(app);
  const realTimeGenerator = new RealTimeDataGenerator(httpServer);

  // ===== AUTHENTICATION ROUTES =====
  
  // Simple email-based access (No verification required)
  app.post('/api/auth/access', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check authorized emails
      const authorizedEmails = [
        'ervin210@icloud.com',
        'radosavlevici.ervin@gmail.com', 
        'radice21011@gmail.com'
      ];

      if (!authorizedEmails.includes(email.toLowerCase())) {
        return res.status(403).json({ 
          message: 'ACCESS DENIED - ELISA Quantum AI Council',
          details: 'Unauthorized email. Violations tracked and subject to $1 billion fine.'
        });
      }

      // Special password check for ervin210@icloud.com
      if (email.toLowerCase() === 'ervin210@icloud.com') {
        if (!password || password !== 'Elonmusksuge') {
          return res.status(403).json({
            message: 'ACCESS DENIED - Invalid credentials',
            details: 'Password required for this account.'
          });
        }
      }

      // Generate access token for authorized user
      const user = await storage.getOrCreateUserByEmail(email);
      const token = generateToken(user.id, email);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        message: 'ELISA Quantum AI Council Access Granted'
      });
    } catch (error) {
      console.error('Access error:', error);
      res.status(500).json({ message: 'Authentication system error' });
    }
  });

  // ===== METRICS ROUTES =====
  
  // Get latest metrics
  app.get('/api/metrics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = await storage.getLatestMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  // Create new metric  
  app.post('/api/metrics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      
      res.status(201).json(metric);
    } catch (error) {
      console.error('Error creating metric:', error);
      res.status(500).json({ message: 'Failed to create metric' });
    }
  });

  // ===== CONFIG ROUTES =====
  
  // Get all config
  app.get('/api/config', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const config = await storage.getAllConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ message: 'Failed to fetch config' });
    }
  });

  // Update config
  app.put('/api/config', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { key, value } = req.body;
      const config = await storage.updateConfig(key, value);
      res.json(config);
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({ message: 'Failed to update config' });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Get admin config
  app.get('/api/admin/config', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const config = await storage.getAllConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching admin config:', error);
      res.status(500).json({ message: 'Failed to fetch admin config' });
    }
  });

  // Get all users (admin only)
  app.get('/api/admin/users', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // ===== AI MODELS ROUTES =====
  
  // Get all AI models
  app.get('/api/ai-models', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const models = await storage.getAllAIModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching AI models:', error);
      res.status(500).json({ message: 'Failed to fetch AI models' });
    }
  });

  // Create AI model
  app.post('/api/ai-models', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const modelData = req.body;
      const model = await storage.createAIModel({
        ...modelData,
        userId: req.userId
      });
      res.status(201).json(model);
    } catch (error) {
      console.error('Error creating AI model:', error);
      res.status(500).json({ message: 'Failed to create AI model' });
    }
  });

  // Update AI model
  app.put('/api/ai-models/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const model = await storage.updateAIModel(id, updateData);
      res.json(model);
    } catch (error) {
      console.error('Error updating AI model:', error);
      res.status(500).json({ message: 'Failed to update AI model' });
    }
  });

  // Delete AI model
  app.delete('/api/ai-models/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAIModel(id);
      res.json({ message: 'AI model deleted successfully' });
    } catch (error) {
      console.error('Error deleting AI model:', error);
      res.status(500).json({ message: 'Failed to delete AI model' });
    }
  });

  // ===== EXPORT ROUTES =====
  
  // Export metrics
  app.get('/api/export/metrics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = await storage.getLatestMetrics();
      res.json({
        exported_at: new Date().toISOString(),
        data: metrics,
        format: 'json'
      });
    } catch (error) {
      console.error('Error exporting metrics:', error);
      res.status(500).json({ message: 'Failed to export metrics' });
    }
  });

  // ===== AUDIT LOG ROUTES =====
  
  // Get audit logs
  app.get('/api/audit-logs', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  return httpServer;
}