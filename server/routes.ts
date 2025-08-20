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