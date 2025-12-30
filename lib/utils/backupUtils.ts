import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import extract from 'extract-zip';
import systemConfig from '../../config/system';
import { getLogger } from './logger';

export class BackupService {
  private backupDir: string;
  private logger;

  constructor() {
    this.backupDir = systemConfig.backup.dir || './backups';
    this.logger = getLogger();
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(backupFile);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        this.logger.info(`Backup created: ${backupFile}`, 'BACKUP');
        resolve(backupFile);
      });

      output.on('error', (err) => {
        this.logger.error(`Backup failed: ${err.message}`, 'BACKUP');
        reject(err);
      });

      archive.pipe(output);

      // Add files to backup
      archive.directory('public/uploads', 'uploads');
      archive.directory('data', 'data');
      archive.file('.env', { name: 'env.example' });

      archive.finalize();
    });
  }

  public async restoreBackup(backupFile: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const extractPath = path.join(this.backupDir, 'restore');
        
        // Ensure restore directory exists
        if (!fs.existsSync(extractPath)) {
          fs.mkdirSync(extractPath, { recursive: true });
        }

        extract(backupFile, { dir: extractPath }, (err) => {
          if (err) {
            this.logger.error(`Restore failed: ${err.message}`, 'BACKUP');
            reject(err);
            return;
          }

          // Copy restored files to their original locations
          try {
            // Copy uploads
            const uploadsSrc = path.join(extractPath, 'uploads');
            const uploadsDest = 'public/uploads';
            
            if (fs.existsSync(uploadsSrc)) {
              this.copyDirectory(uploadsSrc, uploadsDest);
            }

            // Copy data
            const dataSrc = path.join(extractPath, 'data');
            const dataDest = 'data';
            
            if (fs.existsSync(dataSrc)) {
              this.copyDirectory(dataSrc, dataDest);
            }

            this.logger.info('Backup restored successfully', 'BACKUP');
            resolve(true);
          } catch (copyError) {
            this.logger.error(`Restore copy failed: ${copyError.message}`, 'BACKUP');
            reject(copyError);
          }
        });
      } catch (error) {
        this.logger.error(`Restore failed: ${error.message}`, 'BACKUP');
        reject(error);
      }
    });
  }

  private copyDirectory(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  public async listBackups(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter(file => file.startsWith('backup-') && file.endsWith('.zip'))
        .sort()
        .reverse(); // Newest first
    } catch (error) {
      this.logger.error(`List backups failed: ${error.message}`, 'BACKUP');
      return [];
    }
  }

  public async deleteBackup(backupFile: string): Promise<boolean> {
    try {
      const filePath = path.join(this.backupDir, backupFile);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.info(`Backup deleted: ${backupFile}`, 'BACKUP');
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Delete backup failed: ${error.message}`, 'BACKUP');
      return false;
    }
  }

  public async cleanupOldBackups(): Promise<number> {
    try {
      const retentionDays = systemConfig.backup.retentionDays || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const backups = await this.listBackups();
      let deletedCount = 0;
      
      for (const backup of backups) {
        // Extract date from backup filename (backup-YYYY-MM-DDTHH-MM-SS.zip)
        const dateMatch = backup.match(/backup-(\d{4}-\d{2}-\d{2})/);
        
        if (dateMatch) {
          const backupDate = new Date(dateMatch[1]);
          
          if (backupDate < cutoffDate) {
            await this.deleteBackup(backup);
            deletedCount++;
          }
        }
      }
      
      this.logger.info(`Cleaned up ${deletedCount} old backups`, 'BACKUP');
      return deletedCount;
    } catch (error) {
      this.logger.error(`Backup cleanup failed: ${error.message}`, 'BACKUP');
      return 0;
    }
  }

  public async getBackupInfo(backupFile: string): Promise<{
    name: string;
    size: number;
    createdAt: Date;
  } | null> {
    try {
      const filePath = path.join(this.backupDir, backupFile);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        // Extract date from filename
        const dateMatch = backupFile.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        let createdAt = stats.birthtime;
        
        if (dateMatch) {
          createdAt = new Date(dateMatch[1].replace(/-/g, ':'));
        }
        
        return {
          name: backupFile,
          size: stats.size,
          createdAt,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Get backup info failed: ${error.message}`, 'BACKUP');
      return null;
    }
  }

  public async scheduleAutomaticBackups() {
    // This would be implemented in a real application
    // For now, just log that it's not implemented
    this.logger.warn('Automatic backup scheduling not implemented', 'BACKUP');
  }
}

// Singleton instance
let backupService: BackupService | null = null;

export function getBackupService(): BackupService {
  if (!backupService) {
    backupService = new BackupService();
  }
  return backupService;
}

export async function createBackup(): Promise<string> {
  return getBackupService().createBackup();
}

export async function restoreBackup(backupFile: string): Promise<boolean> {
  return getBackupService().restoreBackup(backupFile);
}

export async function listBackups(): Promise<string[]> {
  return getBackupService().listBackups();
}

export async function deleteBackup(backupFile: string): Promise<boolean> {
  return getBackupService().deleteBackup(backupFile);
}

export async function cleanupOldBackups(): Promise<number> {
  return getBackupService().cleanupOldBackups();
}

export async function getBackupInfo(backupFile: string): Promise<{
  name: string;
  size: number;
  createdAt: Date;
} | null> {
  return getBackupService().getBackupInfo(backupFile);
}