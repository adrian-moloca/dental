import { DentalOSDatabase } from './schema';

let db: DentalOSDatabase | null = null;

export async function initializeDatabase(): Promise<DentalOSDatabase> {
  if (db) {
    return db;
  }

  db = new DentalOSDatabase();

  await db.open();

  console.log('IndexedDB initialized successfully');

  return db;
}

export function getDatabase(): DentalOSDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function clearDatabase(): Promise<void> {
  if (!db) {
    return;
  }

  await db.delete();
  db = null;
}
