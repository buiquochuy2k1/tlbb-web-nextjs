import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Database configurations
const dbConfigs = {
  web: {
    host: process.env.DATABASE_IP || '127.0.0.1',
    user: process.env.DATABASE_ACCOUNT || 'root',
    password: process.env.DATABASE_PASS || '',
    database: process.env.DATABASE_NAME || 'web',
    port: 3306,
  } as DatabaseConfig,

  tlbbdb: {
    host: process.env.DATABASE_IP || '127.0.0.1',
    user: process.env.DATABASE_ACCOUNT || 'root',
    password: process.env.DATABASE_PASS || '',
    database: process.env.DATABASE2_NAME || 'tlbbdb',
    port: 3306,
  } as DatabaseConfig,
};

// Create connection pools (auto-manage connections)
const pools: { [key: string]: mysql.Pool } = {
  web: mysql.createPool({
    ...dbConfigs.web,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),
  tlbbdb: mysql.createPool({
    ...dbConfigs.tlbbdb,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),
};

/**
 * Generic function to get a connection from pool
 */
async function getConnection(dbName: keyof typeof pools): Promise<mysql.PoolConnection> {
  try {
    const connection = await pools[dbName].getConnection();
    console.log(`✅ Database ${dbName} connection acquired`);
    return connection;
  } catch (error) {
    console.error(`❌ Failed to get connection from pool for ${dbName}:`, error);
    throw error;
  }
}

/**
 * Close specific pool (only if really needed)
 */
async function closePool(dbName: keyof typeof pools): Promise<void> {
  try {
    await pools[dbName].end();
    console.log(`🔌 Database ${dbName} pool closed`);
  } catch (error) {
    console.error(`❌ Error closing pool for ${dbName}:`, error);
  }
}

/**
 * Close all pools
 */
export async function closeAllConnections(): Promise<void> {
  await Promise.all([closePool('web'), closePool('tlbbdb')]);
}

// Specific connection functions for backward compatibility
export async function getDbConnection(): Promise<mysql.PoolConnection> {
  return getConnection('web');
}

export async function getDbConnection2(): Promise<mysql.PoolConnection> {
  return getConnection('tlbbdb');
}

export async function closeDbConnection(): Promise<void> {
  return closePool('web');
}

export async function closeDbConnection2(): Promise<void> {
  return closePool('tlbbdb');
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
