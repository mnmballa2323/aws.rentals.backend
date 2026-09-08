type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

export interface AuditMetadata {
  actorId: string;
  targetId?: string;
  companyId?: string;
  jurisdiction?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const isProduction = process.env['NODE_ENV'] === 'production';

/**
 * Recursively masks sensitive fields (SSN, credit card, bank details, passwords, keys)
 * to prevent accidental exposure of PII in logs.
 */
function maskSensitiveData(val: any): any {
  if (val === null || val === undefined) {
    return val;
  }

  if (typeof val === 'string') {
    // If it looks like a long raw authorization token, jwt, or key, mask it
    if (val.startsWith('Bearer ') || val.length > 100) {
      return '[REDACTED]';
    }
    return val;
  }

  if (Array.isArray(val)) {
    return val.map(maskSensitiveData);
  }

  if (typeof val === 'object') {
    const masked: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      const lowerKey = key.toLowerCase();
      const isSensitiveKey = 
        lowerKey.includes('ssn') ||
        lowerKey.includes('socialsecurity') ||
        lowerKey.includes('routing') ||
        lowerKey.includes('accountnumber') ||
        lowerKey.includes('bankaccount') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('pin') ||
        lowerKey.includes('creditcard') ||
        lowerKey.includes('cvv') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('cardnumber');

      if (isSensitiveKey) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(val[key]);
      }
    }
    return masked;
  }

  return val;
}

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (data !== undefined) {
    entry.data = maskSensitiveData(data);
  }
  return JSON.stringify(entry);
}

/**
 * Structured logger that outputs JSON in production
 * and human-readable format in development.
 * Includes a dedicated compliance audit logging method.
 */
export const logger = {
  debug(message: string, data?: unknown): void {
    if (!isProduction) {
      console.debug(formatLog('debug', message, data));
    }
  },

  info(message: string, data?: unknown): void {
    const maskedData = maskSensitiveData(data);
    if (isProduction) {
      console.info(formatLog('info', message, data));
    } else {
      console.info(`[INFO] ${message}`, maskedData ?? '');
    }
  },

  warn(message: string, data?: unknown): void {
    const maskedData = maskSensitiveData(data);
    if (isProduction) {
      console.warn(formatLog('warn', message, data));
    } else {
      console.warn(`[WARN] ${message}`, maskedData ?? '');
    }
  },

  error(message: string, data?: unknown): void {
    const maskedData = maskSensitiveData(data);
    if (isProduction) {
      console.error(formatLog('error', message, data));
    } else {
      console.error(`[ERROR] ${message}`, maskedData ?? '');
    }
  },

  /**
   * Log compliance-sensitive database operations (lease signs, application updates).
   */
  audit(action: string, metadata: AuditMetadata): void {
    const maskedMetadata = maskSensitiveData(metadata) as AuditMetadata;
    const entry = {
      level: 'info' as LogLevel,
      message: `[AUDIT] ${action}`,
      timestamp: new Date().toISOString(),
      audit: {
        action,
        ...maskedMetadata,
      },
    };
    if (isProduction) {
      console.info(JSON.stringify(entry));
    } else {
      console.info(`[AUDIT] ${action} by ${maskedMetadata.actorId} target ${maskedMetadata.targetId || 'N/A'}`, maskedMetadata);
    }
  },
};
