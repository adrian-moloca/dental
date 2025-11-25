import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketClient, RealtimeEvent } from '../../realtime/websocket-client';
import {
  getCRDTMergeEngine,
  CRDTEnvelope,
  CRDTMergeResult,
  CRDTResolutionStrategy,
} from '../../realtime/crdt-merge';

export interface UseRealtimeSyncOptions {
  resourceType: string;
  resourceId: string;
  channels?: string[];
  autoSubscribe?: boolean;
  resolutionStrategy?: CRDTResolutionStrategy;
  onConflict?: (result: CRDTMergeResult) => void;
}

export interface UseRealtimeSyncReturn {
  isConnected: boolean;
  isSubscribed: boolean;
  events: RealtimeEvent[];
  subscribe: () => void;
  unsubscribe: () => void;
  applyRemotePatch: (
    patch: CRDTEnvelope,
    localData: Record<string, any>,
    localMetadata: { version: number; timestamp: Date; actorId: string },
  ) => Promise<CRDTMergeResult>;
  clearEvents: () => void;
}

/**
 * React hook for realtime sync with CRDT conflict resolution.
 *
 * @example
 * const { isConnected, applyRemotePatch } = useRealtimeSync({
 *   resourceType: 'patient',
 *   resourceId: patientId,
 *   channels: [`resource:patient:${patientId}`],
 *   autoSubscribe: true,
 *   onConflict: (result) => {
 *     if (result.needsManualResolution) {
 *       showConflictDialog(result.conflicts);
 *     }
 *   },
 * });
 *
 * // When a remote event arrives
 * useEffect(() => {
 *   const handleEvent = async (event: RealtimeEvent) => {
 *     if (event.eventType === 'patient.updated') {
 *       const result = await applyRemotePatch(
 *         event.payload.patch,
 *         localPatientData,
 *         localMetadata
 *       );
 *       if (result.resolved) {
 *         updateLocalData(result.merged);
 *       }
 *     }
 *   };
 *   // Register event handler
 * }, []);
 */
export function useRealtimeSync(options: UseRealtimeSyncOptions): UseRealtimeSyncReturn {
  const wsClient = getWebSocketClient();
  const mergeEngine = getCRDTMergeEngine();

  const [isConnected, setIsConnected] = useState(wsClient.isConnected());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const subscribedRef = useRef(false);

  const subscribe = useCallback(() => {
    if (!isConnected) {
      console.warn('Cannot subscribe: not connected');
      return;
    }

    const channels = options.channels || [
      `resource:${options.resourceType}:${options.resourceId}`,
    ];

    wsClient.subscribe(channels);
    subscribedRef.current = true;
    setIsSubscribed(true);
  }, [isConnected, options.channels, options.resourceType, options.resourceId]);

  const unsubscribe = useCallback(() => {
    if (!isConnected) {
      return;
    }

    const channels = options.channels || [
      `resource:${options.resourceType}:${options.resourceId}`,
    ];

    wsClient.unsubscribe(channels);
    subscribedRef.current = false;
    setIsSubscribed(false);
  }, [isConnected, options.channels, options.resourceType, options.resourceId]);

  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      if (options.autoSubscribe && !subscribedRef.current) {
        subscribe();
      }
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsSubscribed(false);
      subscribedRef.current = false;
    };

    const handleSubscribed = (channels: string[]) => {
      const myChannels = options.channels || [
        `resource:${options.resourceType}:${options.resourceId}`,
      ];
      const subscribed = myChannels.some((ch) => channels.includes(ch));
      if (subscribed) {
        setIsSubscribed(true);
      }
    };

    const handleUnsubscribed = (channels: string[]) => {
      const myChannels = options.channels || [
        `resource:${options.resourceType}:${options.resourceId}`,
      ];
      const unsubscribed = myChannels.some((ch) => channels.includes(ch));
      if (unsubscribed) {
        setIsSubscribed(false);
      }
    };

    const handleRealtimeEvent = (event: RealtimeEvent) => {
      setEvents((prev) => [...prev, event]);
    };

    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);
    wsClient.on('subscribed', handleSubscribed);
    wsClient.on('unsubscribed', handleUnsubscribed);
    wsClient.on('realtime-event', handleRealtimeEvent);

    // Auto-subscribe if configured
    if (options.autoSubscribe && wsClient.isConnected() && !subscribedRef.current) {
      subscribe();
    }

    return () => {
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
      wsClient.off('subscribed', handleSubscribed);
      wsClient.off('unsubscribed', handleUnsubscribed);
      wsClient.off('realtime-event', handleRealtimeEvent);

      if (subscribedRef.current) {
        unsubscribe();
      }
    };
  }, [options.autoSubscribe, subscribe, unsubscribe]);

  const applyRemotePatch = useCallback(
    async (
      patch: CRDTEnvelope,
      localData: Record<string, any>,
      localMetadata: { version: number; timestamp: Date; actorId: string },
    ): Promise<CRDTMergeResult> => {
      const strategy = options.resolutionStrategy || CRDTResolutionStrategy.LAST_WRITE_WINS;
      const result = await mergeEngine.merge(localData, localMetadata, patch, strategy);

      if (result.conflicts.length > 0 && options.onConflict) {
        options.onConflict(result);
      }

      return result;
    },
    [options.resolutionStrategy, options.onConflict],
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    isConnected,
    isSubscribed,
    events,
    subscribe,
    unsubscribe,
    applyRemotePatch,
    clearEvents,
  };
}
