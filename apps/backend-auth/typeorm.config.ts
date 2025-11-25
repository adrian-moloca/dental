/**
 * TypeORM CLI Configuration
 *
 * Used for running migrations via TypeORM CLI
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USERNAME || 'dental_user',
  password: process.env.DATABASE_PASSWORD || 'dental_password',
  database: process.env.DATABASE_NAME || 'dentalos_auth',
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
