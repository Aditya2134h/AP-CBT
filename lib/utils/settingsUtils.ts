import Settings from '../models/Settings';
import { getCacheService } from './cacheUtils';
import { getLogger } from './logger';

export class SettingsService {
  private cache;
  private logger;

  constructor() {
    this.cache = getCacheService();
    this.logger = getLogger();
  }

  public async getSetting(key: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = `settings:${key}`;
      const cachedValue = await this.cache.get(cacheKey);
      
      if (cachedValue) {
        try {
          return JSON.parse(cachedValue);
        } catch (parseError) {
          this.logger.warn(`Failed to parse cached setting: ${key}`, 'SETTINGS');
        }
      }

      // Get from database
      const setting = await Settings.findOne({ key }).exec();
      
      if (!setting) {
        return null;
      }

      // Cache the setting
      try {
        await this.cache.set(cacheKey, JSON.stringify(setting.value), 3600); // Cache for 1 hour
      } catch (cacheError) {
        this.logger.warn(`Failed to cache setting: ${key}`, 'SETTINGS');
      }

      return setting.value;
    } catch (error) {
      this.logger.error(`Failed to get setting: ${key} - ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async getAllSettings(): Promise<Record<string, any>> {
    try {
      const settings = await Settings.find().exec();
      
      const result: Record<string, any> = {};
      
      for (const setting of settings) {
        result[setting.key] = setting.value;
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to get all settings: ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async setSetting(key: string, value: any, description?: string, category?: string): Promise<any> {
    try {
      const setting = await Settings.findOneAndUpdate(
        { key },
        { value, description, category },
        { upsert: true, new: true }
      ).exec();

      // Invalidate cache
      const cacheKey = `settings:${key}`;
      await this.cache.del(cacheKey);
      
      this.logger.info(`Setting updated: ${key}`, 'SETTINGS');
      
      return setting.value;
    } catch (error) {
      this.logger.error(`Failed to set setting: ${key} - ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async deleteSetting(key: string): Promise<boolean> {
    try {
      const result = await Settings.deleteOne({ key }).exec();
      
      // Invalidate cache
      const cacheKey = `settings:${key}`;
      await this.cache.del(cacheKey);
      
      this.logger.info(`Setting deleted: ${key}`, 'SETTINGS');
      
      return result.deletedCount === 1;
    } catch (error) {
      this.logger.error(`Failed to delete setting: ${key} - ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    try {
      const settings = await Settings.find({ category }).exec();
      
      const result: Record<string, any> = {};
      
      for (const setting of settings) {
        result[setting.key] = setting.value;
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to get settings by category: ${category} - ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async updateMultipleSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    try {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(settings)) {
        const updatedValue = await this.setSetting(key, value);
        result[key] = updatedValue;
      }
      
      this.logger.info(`Updated ${Object.keys(settings).length} settings`, 'SETTINGS');
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to update multiple settings: ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async resetToDefaults(): Promise<number> {
    try {
      // Define default settings
      const defaultSettings = [
        { key: 'app.name', value: 'CBT System', description: 'Application name', category: 'general' },
        { key: 'app.version', value: '1.0.0', description: 'Application version', category: 'general' },
        { key: 'app.maintenance', value: false, description: 'Maintenance mode', category: 'general' },
        { key: 'auth.allowRegistration', value: true, description: 'Allow new user registration', category: 'auth' },
        { key: 'auth.require2FA', value: false, description: 'Require 2FA for all users', category: 'auth' },
        { key: 'test.defaultDuration', value: 60, description: 'Default test duration in minutes', category: 'test' },
        { key: 'test.defaultPassingScore', value: 70, description: 'Default passing score percentage', category: 'test' },
        { key: 'test.maxAttempts', value: 3, description: 'Maximum test attempts', category: 'test' },
        { key: 'security.enableWebcam', value: false, description: 'Enable webcam proctoring', category: 'security' },
        { key: 'security.monitoringLevel', value: 'medium', description: 'Security monitoring level', category: 'security' },
      ];
      
      let updatedCount = 0;
      
      for (const setting of defaultSettings) {
        const existing = await Settings.findOne({ key: setting.key }).exec();
        
        if (!existing) {
          await this.setSetting(setting.key, setting.value, setting.description, setting.category);
          updatedCount++;
        }
      }
      
      this.logger.info(`Reset ${updatedCount} settings to defaults`, 'SETTINGS');
      
      return updatedCount;
    } catch (error) {
      this.logger.error(`Failed to reset settings to defaults: ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async exportSettings(): Promise<string> {
    try {
      const settings = await this.getAllSettings();
      
      // Convert to JSON format
      const jsonContent = JSON.stringify(settings, null, 2);
      
      return jsonContent;
    } catch (error) {
      this.logger.error(`Failed to export settings: ${error.message}`, 'SETTINGS');
      throw error;
    }
  }

  public async importSettings(settingsJson: string): Promise<number> {
    try {
      const settings = JSON.parse(settingsJson);
      let importedCount = 0;
      
      for (const [key, value] of Object.entries(settings)) {
        await this.setSetting(key, value);
        importedCount++;
      }
      
      this.logger.info(`Imported ${importedCount} settings`, 'SETTINGS');
      
      return importedCount;
    } catch (error) {
      this.logger.error(`Failed to import settings: ${error.message}`, 'SETTINGS');
      throw error;
    }
  }
}

// Singleton instance
let settingsService: SettingsService | null = null;

export function getSettingsService(): SettingsService {
  if (!settingsService) {
    settingsService = new SettingsService();
  }
  return settingsService;
}

export async function getSetting(key: string): Promise<any> {
  return getSettingsService().getSetting(key);
}

export async function getAllSettings(): Promise<Record<string, any>> {
  return getSettingsService().getAllSettings();
}

export async function setSetting(key: string, value: any, description?: string, category?: string): Promise<any> {
  return getSettingsService().setSetting(key, value, description, category);
}

export async function deleteSetting(key: string): Promise<boolean> {
  return getSettingsService().deleteSetting(key);
}

export async function getSettingsByCategory(category: string): Promise<Record<string, any>> {
  return getSettingsService().getSettingsByCategory(category);
}

export async function updateMultipleSettings(settings: Record<string, any>): Promise<Record<string, any>> {
  return getSettingsService().updateMultipleSettings(settings);
}

export async function resetToDefaults(): Promise<number> {
  return getSettingsService().resetToDefaults();
}

export async function exportSettings(): Promise<string> {
  return getSettingsService().exportSettings();
}

export async function importSettings(settingsJson: string): Promise<number> {
  return getSettingsService().importSettings(settingsJson);
}