/**
 * Type declarations for Mongoose integration
 *
 * This service uses both TypeORM (for PostgreSQL) and Mongoose (for MongoDB).
 * The "modules" module uses MongoDB for module catalog storage.
 */

declare module 'mongoose' {
  export type FilterQuery<T = any> = any;
  export type UpdateQuery<T = any> = any;
  export type Model<T = any> = any;
  export namespace Types {
    type ObjectId = string;
  }
  const mongoose: any;
  export default mongoose;
}

declare module '@nestjs/mongoose' {
  export const Schema: any;
  export const Prop: any;
  export const SchemaFactory: any;
  export function InjectModel(model?: string): any;
  export const MongooseModule: any;
}
