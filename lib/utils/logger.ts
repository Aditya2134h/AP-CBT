import fs from 'fs';
import path from 'path';
import systemConfig from '../../config/system';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  details?: any;
  userId?: string;
  ipAddress?: string;
}

export class Logger {
  private logFile: string;
  private maxSize: number;
  private maxFiles: number;
  private currentFileIndex: number = 0;

  constructor() {
    this.logFile = systemConfig.logging.file || './logs/app.log';
    this.maxSize = systemConfig.logging.maxSize || 10485760; // 10MB
    this.maxFiles = systemConfig.logging.maxFiles || 5;
    
    // Ensure logs directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Check if we need to rotate logs
    this.checkLogRotation();
  }

  private checkLogRotation() {
    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        
        if (stats.size >= this.maxSize) {
          this.rotateLogs();
        }
      }
    } catch (error) {
      console.error('Error checking log rotation:', error);
    }
  }

  private rotateLogs() {
    try {
      // Find the highest numbered log file
      const logDir = path.dirname(this.logFile);
      const logBase = path.basename(this.logFile, path.extname(this.logFile));
      const logExt = path.extname(this.logFile);
      
      let highestIndex = 0;
      const files = fs.readdirSync(logDir);
      
      files.forEach(file => {
        if (file.startsWith(logBase) && file.endsWith(logExt)) {
          const match = file.match(new RegExp(`${logBase}\.(\d+)\.log`));
          if (match) {
            const index = parseInt(match[1]);
            if (index > highestIndex) {
              highestIndex = index;
            }
          }
        }
      });
      
      // Rename current log file
      const newIndex = highestIndex + 1;
      const newLogFile = path.join(logDir, `${logBase}.${newIndex}.log`);
      
      fs.renameSync(this.logFile, newLogFile);
      
      // Clean up old log files if we exceed maxFiles
      if (highestIndex >= this.maxFiles) {
        const oldestIndex = highestIndex - this.maxFiles + 1;
        const oldestLogFile = path.join(logDir, `${logBase}.${oldestIndex}.log`);
        
        if (fs.existsSync(oldestLogFile)) {
          fs.unlinkSync(oldestLogFile);
        }
      }
    } catch (error) {
      console.error('Error rotating logs:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevel = systemConfig.logging.level || 'info';
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4,
    };
    
    return levels[level] >= levels[currentLevel as LogLevel];
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeToFile(entry: LogEntry) {
    try {
      const logString = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(this.logFile, logString);
      this.checkLogRotation();
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      details,
      userId,
      ipAddress,
    };
    
    // Log to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'GENERAL'}] ${message}`);
        if (details) console.debug('Details:', details);
        break;
      case LogLevel.INFO:
        console.info(`[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'GENERAL'}] ${message}`);
        if (details) console.info('Details:', details);
        break;
      case LogLevel.WARN:
        console.warn(`[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'GENERAL'}] ${message}`);
        if (details) console.warn('Details:', details);
        break;
      case LogLevel.ERROR:
        console.error(`[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'GENERAL'}] ${message}`);
        if (details) console.error('Details:', details);
        break;
      case LogLevel.CRITICAL:
        console.error(`[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'GENERAL'}] ${message}`);
        if (details) console.error('Details:', details);
        break;
    }
    
    // Write to file
    this.writeToFile(entry);
  }

  public debug(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    this.log(LogLevel.DEBUG, message, context, details, userId, ipAddress);
  }

  public info(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    this.log(LogLevel.INFO, message, context, details, userId, ipAddress);
  }

  public warn(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    this.log(LogLevel.WARN, message, context, details, userId, ipAddress);
  }

  public error(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    this.log(LogLevel.ERROR, message, context, details, userId, ipAddress);
  }

  public critical(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
    this.log(LogLevel.CRITICAL, message, context, details, userId, ipAddress);
  }

  public async getLogs(level?: LogLevel, limit: number = 100): Promise<LogEntry[]> {
    try {
      if (!fs.existsSync(this.logFile)) return [];
      
      const content = fs.readFileSync(this.logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const logs = lines
        .map(line => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch (error) {
            return null;
          }
        })
        .filter(log => log !== null)
        .reverse(); // Newest first
      
      if (level) {
        return logs.filter(log => log.level === level).slice(0, limit);
      }
      
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  public async clearLogs(): Promise<boolean> {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
      }
      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }
}

// Singleton instance
let logger: Logger | null = null;

export function getLogger(): Logger {
  if (!logger) {
    logger = new Logger();
  }
  return logger;
}

export function logDebug(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
  getLogger().debug(message, context, details, userId, ipAddress);
}

export function logInfo(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
  getLogger().info(message, context, details, userId, ipAddress);
}

export function logWarn(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
  getLogger().warn(message, context, details, userId, ipAddress);
}

export function logError(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
  getLogger().error(message, context, details, userId, ipAddress);
}

export function logCritical(message: string, context?: string, details?: any, userId?: string, ipAddress?: string) {
  getLogger().critical(message, context, details, userId, ipAddress);
}

export function logSecurityEvent(
  eventType: string,
  description: string,
  severity: string,
  userId?: string,
  ipAddress?: string,
  details?: any
) {
  getLogger().warn(`Security Event: ${eventType}`, 'SECURITY', {
    eventType,
    description,
    severity,
    details,
  }, userId, ipAddress);
}

export function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  ipAddress?: string,
  oldValue?: any,
  newValue?: any
) {
  getLogger().info(`Audit: ${action} ${entityType} ${entityId}`, 'AUDIT', {
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
  }, userId, ipAddress);
}