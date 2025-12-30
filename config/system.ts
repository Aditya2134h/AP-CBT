export const systemConfig = {
  // Application configuration
  app: {
    name: 'CBT System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true',
  },

  // Authentication configuration
  auth: {
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'),
    sessionUpdateAge: parseInt(process.env.SESSION_UPDATE_AGE || '3600'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cbt-system',
    atlasUri: process.env.MONGODB_URI_ATLAS || '',
  },

  // File upload configuration
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'audio/mpeg',
      'video/mp4',
    ],
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
  },

  // Security configuration
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedIPs: process.env.ALLOWED_IPS?.split(',') || ['127.0.0.1', '::1'],
    webcamEnabled: process.env.WEBCAM_ENABLED === 'true',
    webcamInterval: parseInt(process.env.WEBCAM_INTERVAL || '30000'), // 30 seconds
    webcamQuality: parseFloat(process.env.WEBCAM_QUALITY || '0.7'), // 70% quality
  },

  // Test configuration
  test: {
    autoSaveInterval: parseInt(process.env.TEST_AUTO_SAVE_INTERVAL || '5000'), // 5 seconds
    syncInterval: parseInt(process.env.TEST_SYNC_INTERVAL || '10000'), // 10 seconds
    maxAttempts: parseInt(process.env.TEST_MAX_ATTEMPTS || '3'),
    gracePeriod: parseInt(process.env.TEST_GRACE_PERIOD || '300'), // 5 minutes
  },

  // Analytics configuration
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365'),
  },

  // Rate limiting configuration
  rateLimiting: {
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Email configuration
  email: {
    server: process.env.EMAIL_SERVER || '',
    from: process.env.EMAIL_FROM || 'no-reply@cbt-system.com',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  },

  // Docker configuration
  docker: {
    port: parseInt(process.env.DOCKER_PORT || '3000'),
    mongoPort: parseInt(process.env.DOCKER_MONGO_PORT || '27017'),
    redisPort: parseInt(process.env.DOCKER_REDIS_PORT || '6379'),
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    prefix: process.env.REDIS_PREFIX || 'cbt:',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  },

  // Backup configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    dir: process.env.BACKUP_DIR || './backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    schedule: process.env.BACKUP_SCHEDULE || '0 0 * * *', // Daily at midnight
  },
};

export type SystemConfig = typeof systemConfig;

export default systemConfig;