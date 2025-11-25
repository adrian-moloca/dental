declare module '@dentalos/shared-tracing' {
  export class CorrelationMiddleware {
    constructor(config: any);
    use(req: any, res: any, next: any): void;
  }
}
