// Role constants
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Question type constants
export const QUESTION_TYPES = {
  MCQ: 'mcq',
  ESSAY: 'essay',
  MATCHING: 'matching',
  FILL_BLANK: 'fill-blank',
  TRUE_FALSE: 'true-false',
  IMAGE_RECOGNITION: 'image-recognition',
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

// Test status constants
export const TEST_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type TestStatus = typeof TEST_STATUSES[keyof typeof TEST_STATUSES];

// Test session status constants
export const TEST_SESSION_STATUSES = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
  EXPIRED: 'expired',
} as const;

export type TestSessionStatus = typeof TEST_SESSION_STATUSES[keyof typeof TEST_SESSION_STATUSES];

// Security event types
export const SECURITY_EVENT_TYPES = {
  TAB_SWITCH: 'tab-switch',
  COPY_PASTE: 'copy-paste',
  SCREENSHOT: 'screenshot',
  WINDOW_FOCUS_LOSS: 'window-focus-loss',
  MULTIPLE_TABS: 'multiple-tabs',
  DEVELOPER_TOOLS: 'developer-tools',
  FACE_NOT_DETECTED: 'face-not-detected',
  SUSPICIOUS_PATTERN: 'suspicious-pattern',
  IP_CHANGE: 'ip-change',
  UNAUTHORIZED_ACCESS: 'unauthorized-access',
} as const;

export type SecurityEventType = typeof SECURITY_EVENT_TYPES[keyof typeof SECURITY_EVENT_TYPES];

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

// User status constants
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES];

// Class status constants
export const CLASS_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PENDING: 'pending',
} as const;

export type ClassStatus = typeof CLASS_STATUSES[keyof typeof CLASS_STATUSES];

// Test result status constants
export const TEST_RESULT_STATUSES = {
  PASS: 'pass',
  FAIL: 'fail',
} as const;

export type TestResultStatus = typeof TEST_RESULT_STATUSES[keyof typeof TEST_RESULT_STATUSES];

// Default values
export const DEFAULTS = {
  PASSING_SCORE: 70,
  TEST_DURATION: 60, // minutes
  MAX_ATTEMPTS: 3,
  GRACE_PERIOD: 5, // minutes
  QUESTION_POINTS: 1,
  DIFFICULTY: 'medium',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_2FA: 'Invalid 2FA token',
    ACCOUNT_INACTIVE: 'Account is not active',
    UNAUTHORIZED: 'Unauthorized access',
  },
  VALIDATION: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_LENGTH: 'Password must be at least 8 characters',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  },
  DATABASE: {
    CONNECTION_FAILED: 'Failed to connect to database',
    OPERATION_FAILED: 'Database operation failed',
    NOT_FOUND: 'Resource not found',
  },
  API: {
    INVALID_REQUEST: 'Invalid request',
    RATE_LIMITED: 'Too many requests, please try again later',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  },
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    SETUP_2FA: '/api/auth/setup-2fa',
    VERIFY_2FA: '/api/auth/verify-2fa',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    GET: '/api/users/:id',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    BULK_IMPORT: '/api/users/bulk-import',
    EXPORT: '/api/users/export',
  },
  TESTS: {
    LIST: '/api/tests',
    CREATE: '/api/tests',
    GET: '/api/tests/:id',
    UPDATE: '/api/tests/:id',
    DELETE: '/api/tests/:id',
    PUBLISH: '/api/tests/:id/publish',
    ARCHIVE: '/api/tests/:id/archive',
    PREVIEW: '/api/tests/:id/preview',
  },
  QUESTIONS: {
    LIST: '/api/questions',
    CREATE: '/api/questions',
    GET: '/api/questions/:id',
    UPDATE: '/api/questions/:id',
    DELETE: '/api/questions/:id',
    IMPORT: '/api/questions/import',
    EXPORT: '/api/questions/export',
  },
  CLASSES: {
    LIST: '/api/classes',
    CREATE: '/api/classes',
    GET: '/api/classes/:id',
    UPDATE: '/api/classes/:id',
    DELETE: '/api/classes/:id',
    ADD_STUDENTS: '/api/classes/:id/students',
    REMOVE_STUDENTS: '/api/classes/:id/students',
  },
  TEST_SESSIONS: {
    LIST: '/api/test-sessions',
    CREATE: '/api/test-sessions',
    GET: '/api/test-sessions/:id',
    UPDATE: '/api/test-sessions/:id',
    END: '/api/test-sessions/:id/end',
    EXTEND: '/api/test-sessions/:id/extend',
  },
  ANSWERS: {
    LIST: '/api/answers',
    CREATE: '/api/answers',
    GET: '/api/answers/:id',
    UPDATE: '/api/answers/:id',
    SUBMIT: '/api/answers/submit',
  },
  RESULTS: {
    LIST: '/api/results',
    GET: '/api/results/:id',
    UPDATE: '/api/results/:id',
    PUBLISH: '/api/results/:id/publish',
    EXPORT: '/api/results/export',
  },
  MONITORING: {
    ACTIVE_SESSIONS: '/api/monitoring/active-sessions',
    SECURITY_EVENTS: '/api/monitoring/security-events',
    ALERTS: '/api/monitoring/alerts',
    RESOLVE_ALERT: '/api/monitoring/alerts/:id/resolve',
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    TEST_PERFORMANCE: '/api/analytics/test-performance',
    STUDENT_PERFORMANCE: '/api/analytics/student-performance',
    CLASS_PERFORMANCE: '/api/analytics/class-performance',
    SYSTEM_STATS: '/api/analytics/system-stats',
  },
  SETTINGS: {
    LIST: '/api/settings',
    GET: '/api/settings/:key',
    UPDATE: '/api/settings/:key',
    DELETE: '/api/settings/:key',
  },
  AUDIT: {
    LIST: '/api/audit-logs',
    GET: '/api/audit-logs/:id',
    EXPORT: '/api/audit-logs/export',
  },
} as const;