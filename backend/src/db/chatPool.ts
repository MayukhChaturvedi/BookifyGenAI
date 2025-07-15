import { Pool } from 'pg';
import config from '../config/config.js';
import sslConfig from './sslConfig.js';

const pool = new Pool({
  connectionString: config.dbUrl.split('?')[0],
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: sslConfig,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Successfully connected to Aiven PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;
