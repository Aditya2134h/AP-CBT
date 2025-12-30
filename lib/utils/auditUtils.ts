import AuditLog from '../models/AuditLog';
import { getLogger } from './logger';

export class AuditService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async logAction(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        user: userId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      });

      await auditLog.save();
      this.logger.info(`Audit log created: ${action} ${entityType} ${entityId || ''}`, 'AUDIT');
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, 'AUDIT');
      throw error;
    }
  }

  public async getAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    limit: number = 100,
    skip: number = 0,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const query: any = {};
      
      if (filters.userId) {
        query.user = filters.userId;
      }
      
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.entityType) {
        query.entityType = filters.entityType;
      }
      
      if (filters.entityId) {
        query.entityId = filters.entityId;
      }
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      const logs = await AuditLog.find(query)
        .sort({ createdAt: sort === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .exec();

      return logs;
    } catch (error) {
      this.logger.error(`Failed to get audit logs: ${error.message}`, 'AUDIT');
      throw error;
    }
  }

  public async getAuditLogCount(
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<number> {
    try {
      const query: any = {};
      
      if (filters.userId) {
        query.user = filters.userId;
      }
      
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.entityType) {
        query.entityType = filters.entityType;
      }
      
      if (filters.entityId) {
        query.entityId = filters.entityId;
      }
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      return await AuditLog.countDocuments(query);
    } catch (error) {
      this.logger.error(`Failed to get audit log count: ${error.message}`, 'AUDIT');
      throw error;
    }
  }

  public async exportAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<string> {
    try {
      const logs = await this.getAuditLogs(filters, 10000); // Limit to 10k logs for export
      
      // Convert to CSV format
      const csvHeader = 'Timestamp,User,Action,Entity Type,Entity ID,Old Value,New Value,IP Address,User Agent\n';
      
      const csvRows = logs.map(log => {
        const oldValue = log.oldValue ? JSON.stringify(log.oldValue) : '';
        const newValue = log.newValue ? JSON.stringify(log.newValue) : '';
        
        return `"${log.createdAt}","${log.user?.name || 'N/A'}","${log.action}","${log.entityType}","${log.entityId || ''}","${oldValue}","${newValue}","${log.ipAddress || ''}","${log.userAgent || ''}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // In a real implementation, this would be saved to a file and returned as a download URL
      // For now, we'll just return the CSV content
      
      return csvContent;
    } catch (error) {
      this.logger.error(`Failed to export audit logs: ${error.message}`, 'AUDIT');
      throw error;
    }
  }

  public async getRecentActivity(
    userId?: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const query: any = {};
      
      if (userId) {
        query.user = userId;
      }

      return await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get recent activity: ${error.message}`, 'AUDIT');
      throw error;
    }
  }

  public async getUserActivitySummary(
    userId: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
  }> {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 86400000); // 1 day ago
          break;
        case 'week':
          startDate = new Date(now.getTime() - 604800000); // 1 week ago
          break;
        case 'month':
          startDate = new Date(now.getTime() - 2592000000); // 1 month ago
          break;
        case 'year':
          startDate = new Date(now.getTime() - 31536000000); // 1 year ago
          break;
        default:
          startDate = new Date(now.getTime() - 2592000000); // 1 month ago
      }

      const logs = await AuditLog.find({
        user: userId,
        createdAt: { $gte: startDate },
      }).exec();

      const actionsByType: Record<string, number> = {};
      const actionsByEntity: Record<string, number> = {};

      logs.forEach(log => {
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
        actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;
      });

      return {
        totalActions: logs.length,
        actionsByType,
        actionsByEntity,
      };
    } catch (error) {
      this.logger.error(`Failed to get user activity summary: ${error.message}`, 'AUDIT');
      throw error;
    }
  }
}

// Singleton instance
let auditService: AuditService | null = null;

export function getAuditService(): AuditService {
  if (!auditService) {
    auditService = new AuditService();
  }
  return auditService;
}

export async function logAction(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  oldValue?: any,
  newValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return getAuditService().logAction(userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent);
}

export async function getAuditLogs(
  filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
  limit: number = 100,
  skip: number = 0,
  sort: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  return getAuditService().getAuditLogs(filters, limit, skip, sort);
}

export async function getAuditLogCount(
  filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<number> {
  return getAuditService().getAuditLogCount(filters);
}

export async function exportAuditLogs(
  filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<string> {
  return getAuditService().exportAuditLogs(filters);
}

export async function getRecentActivity(
  userId?: string,
  limit: number = 10
): Promise<any[]> {
  return getAuditService().getRecentActivity(userId, limit);
}

export async function getUserActivitySummary(
  userId: string,
  timeRange: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
}> {
  return getAuditService().getUserActivitySummary(userId, timeRange);
}