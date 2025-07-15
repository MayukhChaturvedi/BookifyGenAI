import postgres from 'postgres';
import config from '../config/config.js';
import sslConfig from './sslConfig.js'; // <-- Import the shared config

// The 'postgres' library uses a slightly different connection method but accepts the same ssl object
const sql = postgres(config.dbUrl, {
  ssl: sslConfig, // <-- Use the shared SSL config here too
});

export default sql;
