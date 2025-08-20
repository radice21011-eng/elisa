import { Response } from 'express';
import { storage } from './storage';
import { format } from 'date-fns';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateFrom?: Date;
  dateTo?: Date;
  includeHeaders?: boolean;
}

export class ExportService {
  
  // Export metrics data
  async exportMetrics(options: ExportOptions): Promise<string | Buffer> {
    const metrics = await storage.getMetrics(
      undefined, 
      options.dateFrom, 
      options.dateTo
    );

    switch (options.format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          dateRange: {
            from: options.dateFrom?.toISOString(),
            to: options.dateTo?.toISOString()
          },
          totalRecords: metrics.length,
          data: metrics
        }, null, 2);

      case 'csv':
        return this.convertToCsv(metrics, [
          { key: 'id', label: 'ID' },
          { key: 'type', label: 'Type' },
          { key: 'value', label: 'Value' },
          { key: 'timestamp', label: 'Timestamp', format: (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss') },
          { key: 'metadata', label: 'Metadata', format: (data: any) => JSON.stringify(data || {}) }
        ], options.includeHeaders);

      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export audit logs
  async exportAuditLogs(options: ExportOptions, userId?: string): Promise<string | Buffer> {
    const logs = await storage.getAuditLogs(userId, options.dateFrom, options.dateTo);

    switch (options.format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          dateRange: {
            from: options.dateFrom?.toISOString(),
            to: options.dateTo?.toISOString()
          },
          userId: userId || 'all',
          totalRecords: logs.length,
          data: logs
        }, null, 2);

      case 'csv':
        return this.convertToCsv(logs, [
          { key: 'id', label: 'ID' },
          { key: 'userId', label: 'User ID' },
          { key: 'action', label: 'Action' },
          { key: 'resource', label: 'Resource' },
          { key: 'timestamp', label: 'Timestamp', format: (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss') },
          { key: 'details', label: 'Details', format: (data: any) => JSON.stringify(data || {}) }
        ], options.includeHeaders);

      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export AI models configuration
  async exportAIModels(options: ExportOptions): Promise<string | Buffer> {
    const aiModels = await storage.getAIModels();

    switch (options.format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          totalModels: aiModels.length,
          data: aiModels
        }, null, 2);

      case 'csv':
        return this.convertToCsv(aiModels, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'version', label: 'Version' },
          { key: 'status', label: 'Status' },
          { key: 'compliance', label: 'Compliance' },
          { key: 'security', label: 'Security Level' },
          { key: 'createdAt', label: 'Created', format: (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss') },
          { key: 'updatedAt', label: 'Updated', format: (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss') }
        ], options.includeHeaders);

      default:
        throw new Error('Unsupported export format');
    }
  }

  // Export system configuration
  async exportSystemConfig(options: ExportOptions): Promise<string | Buffer> {
    const config = await storage.getAllConfig();

    switch (options.format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          totalConfigs: config.length,
          data: config
        }, null, 2);

      case 'csv':
        return this.convertToCsv(config, [
          { key: 'id', label: 'ID' },
          { key: 'key', label: 'Key' },
          { key: 'value', label: 'Value' },
          { key: 'description', label: 'Description' },
          { key: 'updatedBy', label: 'Updated By' },
          { key: 'updatedAt', label: 'Updated', format: (date: Date) => format(date, 'yyyy-MM-dd HH:mm:ss') }
        ], options.includeHeaders);

      default:
        throw new Error('Unsupported export format');
    }
  }

  // Generate comprehensive system report
  async exportSystemReport(options: ExportOptions): Promise<string | Buffer> {
    const [metrics, logs, aiModels, config] = await Promise.all([
      storage.getLatestMetrics(),
      storage.getAuditLogs(undefined, options.dateFrom, options.dateTo),
      storage.getAIModels(),
      storage.getAllConfig()
    ]);

    const report = {
      generated: new Date().toISOString(),
      dateRange: {
        from: options.dateFrom?.toISOString(),
        to: options.dateTo?.toISOString()
      },
      summary: {
        totalMetrics: metrics.length,
        totalAuditLogs: logs.length,
        totalAIModels: aiModels.length,
        totalConfigs: config.length,
        activeModels: aiModels.filter(m => m.status === 'active').length,
        recentAlerts: metrics.filter(m => 
          m.type === 'console_attempts' && 
          new Date(m.timestamp!).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length
      },
      metrics: {
        recent: metrics.slice(0, 50),
        byType: this.groupBy(metrics, 'type')
      },
      auditLogs: {
        recent: logs.slice(0, 50),
        byAction: this.groupBy(logs, 'action')
      },
      aiModels,
      systemConfig: config,
      copyright: "© 2025 Ervin Remus Radosavlevici - ELISA Quantum AI Council"
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      default:
        throw new Error('System report only supports JSON format');
    }
  }

  // Utility function to convert data to CSV
  private convertToCsv(data: any[], columns: Array<{
    key: string; 
    label: string; 
    format?: (value: any) => string;
  }>, includeHeaders = true): string {
    let csv = '';

    // Add headers
    if (includeHeaders) {
      csv += columns.map(col => col.label).join(',') + '\n';
    }

    // Add data rows
    data.forEach(item => {
      const row = columns.map(col => {
        let value = item[col.key];
        if (col.format && value) {
          value = col.format(value);
        }
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  // Utility function to group array by property
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  // Set response headers for file download
  static setDownloadHeaders(res: Response, filename: string, format: string) {
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      pdf: 'application/pdf'
    };

    res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
  }
}

export const exportService = new ExportService();