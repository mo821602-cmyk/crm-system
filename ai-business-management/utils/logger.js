// ✅ Logger Utility with Winston

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  // Format log message
  formatMessage(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    });
  }

  // Write to log file
  writeLog(filename, level, message, data = {}) {
    const logMessage = this.formatMessage(level, message, data);
    fs.appendFileSync(filename, logMessage + '\n');
  }

  // Info level
  info(message, data = {}) {
    console.log(`[INFO] ${message}`, data);
    this.writeLog(this.logFile, 'INFO', message, data);
  }

  // Error level
  error(message, data = {}) {
    console.error(`[ERROR] ${message}`, data);
    this.writeLog(this.errorFile, 'ERROR', message, data);
    this.writeLog(this.logFile, 'ERROR', message, data);
  }

  // Warning level
  warn(message, data = {}) {
    console.warn(`[WARN] ${message}`, data);
    this.writeLog(this.logFile, 'WARN', message, data);
  }

  // Debug level
  debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
      this.writeLog(this.logFile, 'DEBUG', message, data);
    }
  }

  // Stream for Morgan middleware
  get stream() {
    return {
      write: (message) => this.writeLog(this.logFile, 'HTTP', message.trim())
    };
  }
}

module.exports = new Logger();
