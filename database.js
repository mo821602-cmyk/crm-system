const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'crm.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        phone TEXT,
        company TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        category TEXT DEFAULT 'عميل جديد',
        status TEXT DEFAULT 'نشط',
        notes TEXT,
        source TEXT,
        value REAL DEFAULT 0,
        address TEXT,
        city TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        customerId INTEGER,
        value REAL DEFAULT 0,
        stage TEXT DEFAULT 'تواصل أولي',
        probability INTEGER DEFAULT 10,
        expectedCloseDate TEXT,
        notes TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        customerId INTEGER,
        dealId INTEGER,
        priority TEXT DEFAULT 'متوسطة',
        status TEXT DEFAULT 'قيد الانتظار',
        dueDate TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (dealId) REFERENCES deals(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT,
        customerId INTEGER,
        dealId INTEGER,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (dealId) REFERENCES deals(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        userId INTEGER,
        link TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        type TEXT DEFAULT 'ملاحظة',
        content TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Create indexes for performance
    db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_userId ON customers(userId)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_userId ON deals(userId)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId)`);

    console.log('✅ Database tables created');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Database error:', error);
    return Promise.reject(error);
  }
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

module.exports = { db, initializeDatabase, run, get, all };
