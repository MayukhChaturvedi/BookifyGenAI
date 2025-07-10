import postgres from 'postgres';

// const sql = postgres({
//   host: process.env.DB_HOST || 'localhost',
//   port: Number(process.env.DB_PORT) || 5432,
//   database: process.env.DB_NAME || 'bookify',
//   username: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'password',
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

const sql = postgres(
  process.env.DB_URL || 'postgres://postgres:password@localhost:5432/bookify',
  {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30000, // Close idle connections after 30 seconds);
  },
);

export default sql;
