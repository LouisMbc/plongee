import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'plongee_db',
  user: process.env.DB_USER || 'plongee_user',
  password: process.env.DB_PASSWORD || 'plongee_password',
});

export default pool;
