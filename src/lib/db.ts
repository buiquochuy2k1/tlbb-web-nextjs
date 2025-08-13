import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DATABASE_IP || '127.0.0.1',
  user: process.env.DATABASE_ACCOUNT || 'root',
  password: process.env.DATABASE_PASS || '',
  database: process.env.DATABASE_NAME || 'web',
  port: 3306,
};

let connection: mysql.Connection | null = null;

export async function getDbConnection(): Promise<mysql.Connection> {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      // console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw new Error('Failed to connect to database');
    }
  }
  return connection;
}

export async function closeDbConnection(): Promise<void> {
  if (connection) {
    await connection.end();
    connection = null;
    // console.log('Database connection closed');
  }
}

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

const db2Config: DatabaseConfig = {
  host: process.env.DATABASE_IP || '127.0.0.1',
  user: process.env.DATABASE_ACCOUNT || 'root',
  password: process.env.DATABASE_PASS || '',
  database: process.env.DATABASE2_NAME || 'tlbbdb',
  port: 3306,
};

let connection2: mysql.Connection | null = null;

export async function getDbConnection2(): Promise<mysql.Connection> {
  if (!connection2) {
    try {
      connection2 = await mysql.createConnection(db2Config);
      // console.log('Database 2 connected successfully');
    } catch (error) {
      console.error('Database 2 connection failed:', error);
      throw new Error('Failed to connect to database 2');
    }
  }
  return connection2;
}

export async function closeDbConnection2(): Promise<void> {
  if (connection2) {
    await connection2.end();
    connection2 = null;
    // console.log('Database 2 connection closed');
  }
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
