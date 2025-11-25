declare module 'pg' {
  export interface QueryResultRow {
    [column: string]: any;
  }

  export interface QueryResult<R extends QueryResultRow = any> {
    rows: R[];
    rowCount: number;
    command: string;
  }

  export interface PoolClient {
    query<R extends QueryResultRow = any>(sql: string, values?: any[]): Promise<QueryResult<R>>;
    release(): void;
  }

  export class Pool {
    constructor(config?: any);
    query<R extends QueryResultRow = any>(sql: string, values?: any[]): Promise<QueryResult<R>>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export class Client {
    constructor(config?: any);
    query<R extends QueryResultRow = any>(sql: string, values?: any[]): Promise<QueryResult<R>>;
    connect(): Promise<void>;
    end(): Promise<void>;
  }
}
