import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Base database configuration (shared settings)
const baseDbConfig = {
  host: process.env.DATABASE_IP || '127.0.0.1',
  user: process.env.DATABASE_ACCOUNT || 'root',
  password: process.env.DATABASE_PASS || '',
  port: 3306,
};

// Database configurations (only database names differ)
const dbConfigs = {
  web: {
    ...baseDbConfig,
    database: process.env.DATABASE_NAME || 'web',
  } as DatabaseConfig,

  tlbbdb: {
    ...baseDbConfig,
    database: process.env.DATABASE2_NAME || 'tlbbdb',
  } as DatabaseConfig,
};

// Connection pool
const connections: { [key: string]: mysql.Connection | null } = {
  web: null,
  tlbbdb: null,
};

/**
 * Generic database connection function
 */
async function getConnection(dbName: keyof typeof dbConfigs): Promise<mysql.Connection> {
  if (!connections[dbName]) {
    try {
      connections[dbName] = await mysql.createConnection(dbConfigs[dbName]);
      console.log(`✅ Database ${dbName} connected successfully`);
    } catch (error) {
      console.error(`❌ Database ${dbName} connection failed:`, error);
      throw new Error(`Failed to connect to database ${dbName}`);
    }
  }
  return connections[dbName]!;
}

/**
 * Create a new database connection with custom database name
 * Useful for dynamic database connections
 */
export async function createDbConnection(databaseName: string): Promise<mysql.Connection> {
  try {
    const config = {
      ...baseDbConfig,
      database: databaseName,
    };
    const connection = await mysql.createConnection(config);
    console.log(`✅ Custom database ${databaseName} connected successfully`);
    return connection;
  } catch (error) {
    console.error(`❌ Custom database ${databaseName} connection failed:`, error);
    throw new Error(`Failed to connect to database ${databaseName}`);
  }
}

/**
 * Close specific database connection
 */
async function closeConnection(dbName: keyof typeof dbConfigs): Promise<void> {
  if (connections[dbName]) {
    try {
      await connections[dbName]!.end();
      connections[dbName] = null;
      console.log(`🔌 Database ${dbName} connection closed`);
    } catch (error) {
      console.error(`❌ Error closing ${dbName} connection:`, error);
    }
  }
}

/**
 * Close all database connections
 */
export async function closeAllConnections(): Promise<void> {
  await Promise.all([closeConnection('web'), closeConnection('tlbbdb')]);
}

// Specific connection functions for backward compatibility
export async function getDbConnection(): Promise<mysql.Connection> {
  return getConnection('web');
}

export async function getDbConnection2(): Promise<mysql.Connection> {
  return getConnection('tlbbdb');
}

export async function closeDbConnection(): Promise<void> {
  return closeConnection('web');
}

export async function closeDbConnection2(): Promise<void> {
  return closeConnection('tlbbdb');
}

// Account interface based on your database schema
export interface Account {
  id?: number;
  name: string;
  sex?: string;
  birthday?: Date;
  address?: string;
  password: string;
  password2?: string;
  showpassword?: string;
  question?: string;
  answer?: string;
  email?: string;
  qq?: string;
  tel?: number;
  id_type?: 'IdCard';
  id_card?: string;
  point?: number;
  is_online?: boolean;
  is_lock?: boolean;
  backhoa?: number;
  score?: number;
  encode?: string;
  pin?: string;
  last_ip_login?: string;
  is_admin?: number;
  refer_name?: string;
  is_refer?: number;
  code_game?: string;
  sodienthoai?: string;
  date_registered?: Date;
  date_modified?: Date;
  ip?: string;
  created_on?: Date;
  modified_on?: Date;
  token_version?: number; // Add token version for JWT refresh
}
