/**
 * Unit tests for correlation ID utilities
 *
 * @module shared-tracing/test
 */

import {
  generateCorrelationId,
  getCorrelationContext,
  getCorrelationId,
  getCausationId,
  runWithCorrelationContext,
  createCorrelationContext,
  extractCorrelationId,
  extractCausationId,
  injectCorrelationId,
  createCorrelationHeaders,
} from '../src/correlation-id';

describe('Correlation ID Utilities', () => {
  describe('generateCorrelationId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateCorrelationId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      // UUID v4 format validation
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createCorrelationContext', () => {
    it('should create context with generated correlation ID', () => {
      const context = createCorrelationContext();
      expect(context.correlationId).toBeDefined();
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should use provided correlation ID', () => {
      const customId = 'custom-correlation-id';
      const context = createCorrelationContext({ correlationId: customId });
      expect(context.correlationId).toBe(customId);
    });

    it('should include causation ID when provided', () => {
      const causationId = 'causation-id';
      const context = createCorrelationContext({ causationId });
      expect(context.causationId).toBe(causationId);
    });

    it('should include source metadata when provided', () => {
      const source = { service: 'auth-service', version: '1.0.0' };
      const context = createCorrelationContext({ source });
      expect(context.source).toEqual(source);
    });
  });

  describe('runWithCorrelationContext', () => {
    it('should execute callback within correlation context', () => {
      const context = createCorrelationContext();
      let capturedId: string | undefined;

      runWithCorrelationContext(context, () => {
        capturedId = getCorrelationId();
      });

      expect(capturedId).toBe(context.correlationId);
    });

    it('should return callback result', () => {
      const context = createCorrelationContext();
      const result = runWithCorrelationContext(context, () => 'test-result');
      expect(result).toBe('test-result');
    });

    it('should isolate contexts between different runs', () => {
      const context1 = createCorrelationContext({ correlationId: 'id-1' });
      const context2 = createCorrelationContext({ correlationId: 'id-2' });

      let id1: string | undefined;
      let id2: string | undefined;

      runWithCorrelationContext(context1, () => {
        id1 = getCorrelationId();
      });

      runWithCorrelationContext(context2, () => {
        id2 = getCorrelationId();
      });

      expect(id1).toBe('id-1');
      expect(id2).toBe('id-2');
    });

    it('should propagate context through async operations', async () => {
      const context = createCorrelationContext();

      const result = await runWithCorrelationContext(context, async () => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        return getCorrelationId();
      });

      expect(result).toBe(context.correlationId);
    });
  });

  describe('getCorrelationContext', () => {
    it('should return undefined outside of correlation context', () => {
      const context = getCorrelationContext();
      expect(context).toBeUndefined();
    });

    it('should return context when inside runWithCorrelationContext', () => {
      const expectedContext = createCorrelationContext();

      runWithCorrelationContext(expectedContext, () => {
        const actualContext = getCorrelationContext();
        expect(actualContext).toBe(expectedContext);
      });
    });
  });

  describe('extractCorrelationId', () => {
    it('should extract from x-correlation-id header', () => {
      const headers = { 'x-correlation-id': 'test-id' };
      const id = extractCorrelationId(headers);
      expect(id).toBe('test-id');
    });

    it('should extract from X-Correlation-Id header (case insensitive)', () => {
      const headers = { 'X-Correlation-Id': 'test-id' };
      const id = extractCorrelationId(headers);
      expect(id).toBe('test-id');
    });

    it('should fallback to x-request-id header', () => {
      const headers = { 'x-request-id': 'request-id' };
      const id = extractCorrelationId(headers);
      expect(id).toBe('request-id');
    });

    it('should handle array header values', () => {
      const headers = { 'x-correlation-id': ['test-id', 'other-id'] };
      const id = extractCorrelationId(headers);
      expect(id).toBe('test-id');
    });

    it('should generate new ID when header is missing', () => {
      const headers = {};
      const id = extractCorrelationId(headers);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should generate new ID when header is empty', () => {
      const headers = { 'x-correlation-id': '' };
      const id = extractCorrelationId(headers);
      expect(id).toBeDefined();
      expect(id).not.toBe('');
    });
  });

  describe('extractCausationId', () => {
    it('should extract from x-causation-id header', () => {
      const headers = { 'x-causation-id': 'causation-id' };
      const id = extractCausationId(headers);
      expect(id).toBe('causation-id');
    });

    it('should return undefined when header is missing', () => {
      const headers = {};
      const id = extractCausationId(headers);
      expect(id).toBeUndefined();
    });

    it('should handle array header values', () => {
      const headers = { 'x-causation-id': ['causation-id', 'other-id'] };
      const id = extractCausationId(headers);
      expect(id).toBe('causation-id');
    });
  });

  describe('injectCorrelationId', () => {
    it('should inject correlation ID from context', () => {
      const context = createCorrelationContext({ correlationId: 'test-id' });

      runWithCorrelationContext(context, () => {
        const payload = injectCorrelationId({ key: 'value' });
        expect(payload.correlationId).toBe('test-id');
        expect(payload.key).toBe('value');
        expect(payload.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should inject causation ID when present', () => {
      const context = createCorrelationContext({
        correlationId: 'test-id',
        causationId: 'cause-id',
      });

      runWithCorrelationContext(context, () => {
        const payload = injectCorrelationId({ key: 'value' });
        expect(payload.causationId).toBe('cause-id');
      });
    });

    it('should generate correlation ID when outside context', () => {
      const payload = injectCorrelationId({ key: 'value' });
      expect(payload.correlationId).toBeDefined();
      expect(typeof payload.correlationId).toBe('string');
    });
  });

  describe('createCorrelationHeaders', () => {
    it('should create headers from context', () => {
      const context = createCorrelationContext({ correlationId: 'test-id' });

      runWithCorrelationContext(context, () => {
        const headers = createCorrelationHeaders();
        expect(headers['x-correlation-id']).toBe('test-id');
      });
    });

    it('should include causation ID when present', () => {
      const context = createCorrelationContext({
        correlationId: 'test-id',
        causationId: 'cause-id',
      });

      runWithCorrelationContext(context, () => {
        const headers = createCorrelationHeaders();
        expect(headers['x-causation-id']).toBe('cause-id');
      });
    });

    it('should return empty object when outside context', () => {
      const headers = createCorrelationHeaders();
      expect(headers).toEqual({});
    });
  });

  describe('getCausationId', () => {
    it('should return causation ID from context', () => {
      const context = createCorrelationContext({ causationId: 'cause-id' });

      runWithCorrelationContext(context, () => {
        expect(getCausationId()).toBe('cause-id');
      });
    });

    it('should return undefined when not in context', () => {
      expect(getCausationId()).toBeUndefined();
    });

    it('should return undefined when causation ID not set', () => {
      const context = createCorrelationContext();

      runWithCorrelationContext(context, () => {
        expect(getCausationId()).toBeUndefined();
      });
    });
  });
});
