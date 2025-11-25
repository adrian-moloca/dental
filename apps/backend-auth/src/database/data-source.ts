/**
 * TypeORM Data Source for migrations
 *
 * This file is used by TypeORM CLI to run migrations independently
 * from the NestJS application context.
 *
 * Run with: npx typeorm-ts-node-esm migration:run -d src/database/data-source.ts
 * Or set environment variables and run: npx typeorm migration:run -d dist/database/data-source.js
 */

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'dental_user',
  password: 'dental_password',
  database: 'dental_db',
  ssl: false,
  logging: true,
  synchronize: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
});
