import { configDotenv } from 'dotenv';
configDotenv();

interface Config {
  port: number;
  nodeEnv: string;
  dbHost: string;
  dbUrl: string;
  jwtSecret: string;
  jwtExpiration: number;
  jwtRefreshSecret: string;
  jwtRefreshExpiration: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbHost: process.env.DB_HOST || 'localhost',
  dbUrl: process.env.DB_URL || 'example_db_url',
  jwtSecret: process.env.JWT_SECRET || 'example_jwt_secret',
  jwtExpiration: Number(process.env.JWT_EXPIRATION) || 60 * 60, // 1 hour
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'example_jwt_refresh_secret',
  jwtRefreshExpiration:
    Number(process.env.JWT_REFRESH_EXPIRATION) || 7 * 24 * 60 * 60, // 7 days
};

export default config;
