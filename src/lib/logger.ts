import fs from 'fs';
import path from 'path';

// Webhook URLs from environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LOG_TYPE = process.env.LOG_TYPE;

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
      this.ensureLogDirectory();

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

  /**
   * Send log to Discord webhook
   */
  private async sendToDiscord(entry: LogEntry): Promise<void> {
    if (!DISCORD_WEBHOOK_URL) return;

    try {
      // Determine color based on log level
      const colors = {
        [LogLevel.ERROR]: 0xff0000, // Red
        [LogLevel.WARN]: 0xffa500, // Orange
        [LogLevel.SUCCESS]: 0x00ff00, // Green
        [LogLevel.INFO]: 0x0099ff, // Blue
        [LogLevel.DEBUG]: 0x808080, // Gray
      };

      const embed = {
        title: `[${entry.level}] ${entry.category}`,
        description: entry.message,
        color: colors[entry.level] || 0x808080,
        fields: [] as Array<{
          name: string;
          value: string;
          inline?: boolean;
        }>,
        timestamp: entry.timestamp,
        footer: {
          text: 'TLBB Payment System Logger',
        },
      };

      // Add user info if available
      if (entry.userId) {
        embed.fields.push({
          name: 'User ID',
          value: entry.userId.toString(),
          inline: true,
        });
      }

      // Add IP info if available
      if (entry.ip) {
        embed.fields.push({
          name: 'IP Address',
          value: entry.ip,
          inline: true,
        });
      }

      // Add data if available
      if (entry.data) {
        const dataStr = typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2);
        if (dataStr.length > 1024) {
          embed.fields.push({
            name: 'Data',
            value: dataStr.substring(0, 1021) + '...',
            inline: false,
          });
        } else {
          embed.fields.push({
            name: 'Data',
            value: dataStr,
            inline: false,
          });
        }
      }

      const payload = {
        embeds: [embed],
      };

      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send log to Discord:', error);
    }
  }

  /**
   * Send log to Telegram webhook
   */
  private async sendToTelegram(entry: LogEntry): Promise<void> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    try {
      // Determine emoji based on log level
      const emojis = {
        [LogLevel.ERROR]: '❌',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.SUCCESS]: '✅',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.DEBUG]: '🐛',
      };

      let message = `${emojis[entry.level] || '📝'} **[${entry.level}]** [${entry.category}]\n`;
      message += `📄 ${entry.message}\n`;
      message += `⏰ ${entry.timestamp}\n`;

      // Add user info if available
      if (entry.userId) {
        message += `👤 User ID: ${entry.userId}\n`;
      }

      // Add IP info if available
      if (entry.ip) {
        message += `🌐 IP: ${entry.ip}\n`;
      }

      // Add data if available
      if (entry.data) {
        const dataStr = typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2);
        if (dataStr.length > 3000) {
          message += `📊 Data: ${dataStr.substring(0, 2997)}...`;
        } else {
          message += `📊 Data: ${dataStr}`;
        }
      }

      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Failed to send log to Telegram:', error);
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

    if (LOG_TYPE === 'DISCORD') {
      // Send to Discord and Telegram (async, don't wait)
      this.sendToDiscord(entry).catch(console.error);
    } else if (LOG_TYPE === 'TELEGRAM') {
      this.sendToTelegram(entry).catch(console.error);
    } else if (LOG_TYPE === 'WRITETOFILE') {
      this.writeToFile(entry);
    }

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
