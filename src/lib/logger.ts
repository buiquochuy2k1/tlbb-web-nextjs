import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  userId?: number;
  ip?: string;
}

class Logger {
  private logDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 30; // Keep 30 days of logs

  constructor() {
    // Create logs directory in project root
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(date: Date): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `app-${dateStr}.log`;
  }

  private formatTimestamp(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  }

  private formatLogEntry(entry: LogEntry): string {
    let logLine = `[${entry.timestamp}] [${entry.level}] [${entry.category}]`;

    if (entry.userId) {
      logLine += ` [User:${entry.userId}]`;
    }

    if (entry.ip) {
      logLine += ` [IP:${entry.ip}]`;
    }

    logLine += ` ${entry.message}`;

    if (entry.data) {
      logLine += ` | Data: ${JSON.stringify(entry.data)}`;
    }

    return logLine + '\n';
  }

  private writeToFile(entry: LogEntry): void {
    try {
      const now = new Date();
      const fileName = this.getLogFileName(now);
      const filePath = path.join(this.logDir, fileName);

      const logLine = this.formatLogEntry(entry);

      // Append to file (create if doesn't exist)
      fs.appendFileSync(filePath, logLine, 'utf8');

      // Check file size and rotate if needed
      this.rotateLogIfNeeded(filePath);

      // Clean old log files
      this.cleanOldLogs();
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogIfNeeded(filePath: string): void {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(filePath, rotatedPath);
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const logFiles = files
        .filter((file) => file.startsWith('app-') && file.endsWith('.log'))
        .map((file) => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Keep only the most recent files
      if (logFiles.length > this.maxFiles) {
        const filesToDelete = logFiles.slice(this.maxFiles);
        filesToDelete.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Failed to delete old log file ${file.name}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: unknown,
    userId?: number,
    ip?: string
  ): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(new Date()),
      level,
      category,
      message,
      data,
      userId,
      ip,
    };

    // Write to file
    this.writeToFile(entry);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMessage = `[${entry.level}] [${entry.category}] ${entry.message}`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(consoleMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(consoleMessage, data || '');
          break;
        case LogLevel.SUCCESS:
          console.log(`✅ ${consoleMessage}`, data || '');
          break;
        case LogLevel.INFO:
          console.info(`ℹ️ ${consoleMessage}`, data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(`🐛 ${consoleMessage}`, data || '');
          break;
        default:
          console.log(consoleMessage, data || '');
      }
    }
  }

  // Public logging methods
  debug(category: string, message: string, data?: unknown, userId?: number, ip?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, userId, ip);
  }

  info(category: string, message: string, data?: unknown, userId?: number, ip?: string): void {
    this.log(LogLevel.INFO, category, message, data, userId, ip);
  }

  warn(category: string, message: string, data?: unknown, userId?: number, ip?: string): void {
    this.log(LogLevel.WARN, category, message, data, userId, ip);
  }

  error(category: string, message: string, data?: unknown, userId?: number, ip?: string): void {
    this.log(LogLevel.ERROR, category, message, data, userId, ip);
  }

  success(category: string, message: string, data?: unknown, userId?: number, ip?: string): void {
    this.log(LogLevel.SUCCESS, category, message, data, userId, ip);
  }

  // Specific logging methods for common use cases
  auth(message: string, data?: unknown, userId?: number, ip?: string): void {
    this.info('AUTH', message, data, userId, ip);
  }

  payment(message: string, data?: unknown, userId?: number, ip?: string): void {
    this.info('PAYMENT', message, data, userId, ip);
  }

  api(message: string, data?: unknown, userId?: number, ip?: string): void {
    this.info('API', message, data, userId, ip);
  }

  security(message: string, data?: unknown, userId?: number, ip?: string): void {
    this.warn('SECURITY', message, data, userId, ip);
  }

  database(message: string, data?: unknown, userId?: number, ip?: string): void {
    this.info('DATABASE', message, data, userId, ip);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogEntry };
