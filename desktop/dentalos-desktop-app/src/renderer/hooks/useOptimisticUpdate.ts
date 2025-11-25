import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdateOptions<TData, TVariables> {
  /**
   * Function that performs the actual mutation (API call).
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Function to optimistically update local data before mutation completes.
   * Return the new optimistic data.
   */
  onOptimisticUpdate: (currentData: TData | undefined, variables: TVariables) => TData;

  /**
   * Called when mutation succeeds with server response.
   */
  onSuccess?: (data: TData, variables: TVariables) => void;

  /**
   * Called when mutation fails. Should revert optimistic update.
   */
  onError?: (error: Error, variables: TVariables, rollbackData: TData | undefined) => void;

  /**
   * Called when mutation completes (success or failure).
   */
  onSettled?: () => void;
}

/**
 * Hook for optimistic UI updates with automatic rollback on error.
 * Provides instant feedback while maintaining data consistency.
 *
 * @example
 * const { mutate, data, isLoading, error } = useOptimisticUpdate({
 *   mutationFn: updatePatient,
 *   onOptimisticUpdate: (current, vars) => ({
 *     ...current,
 *     ...vars,
 *     _isOptimistic: true,
 *   }),
 *   onSuccess: (data) => {
 *     toast.success('Patient updated');
 *   },
 *   onError: (error) => {
 *     toast.error(`Update failed: ${error.message}`);
 *   },
 * });
 *
 * // Trigger mutation with optimistic update
 * mutate({ firstName: 'John', lastName: 'Doe' });
 */
export function useOptimisticUpdate<TData = unknown, TVariables = unknown>(
  options: OptimisticUpdateOptions<TData, TVariables>,
) {
  const [data, setData] = useState<TData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track rollback data in case of error
  const rollbackDataRef = useRef<TData | undefined>();

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      // Store current data for rollback
      rollbackDataRef.current = data;

      // Apply optimistic update immediately
      const optimisticData = options.onOptimisticUpdate(data, variables);
      setData(optimisticData);

      try {
        // Perform actual mutation
        const result = await options.mutationFn(variables);

        // Update with server response
        setData(result);

        // Call success callback
        options.onSuccess?.(result, variables);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');

        // Rollback to previous data
        setData(rollbackDataRef.current);
        setError(error);

        // Call error callback
        options.onError?.(error, variables, rollbackDataRef.current);

        throw error;
      } finally {
        setIsLoading(false);
        options.onSettled?.();
      }
    },
    [data, options],
  );

  return {
    mutate,
    data,
    isLoading,
    error,
  };
}

/**
 * Hook for optimistic list updates (add, remove, update items in array).
 *
 * @example
 * const { addItem, removeItem, updateItem, items } = useOptimisticList({
 *   initialItems: patients,
 *   addItemFn: createPatient,
 *   removeItemFn: deletePatient,
 *   updateItemFn: updatePatient,
 * });
 *
 * // Add item optimistically
 * addItem({ firstName: 'Jane', lastName: 'Smith' });
 */
export function useOptimisticList<TItem extends { id?: string; _id?: string }>(options: {
  initialItems: TItem[];
  addItemFn: (item: Partial<TItem>) => Promise<TItem>;
  removeItemFn: (id: string) => Promise<void>;
  updateItemFn: (id: string, updates: Partial<TItem>) => Promise<TItem>;
}) {
  const [items, setItems] = useState<TItem[]>(options.initialItems);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const getItemId = (item: TItem): string => {
    return item.id || item._id || '';
  };

  const addItem = useCallback(
    async (newItem: Partial<TItem>) => {
      // Generate temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...newItem, id: tempId, _isOptimistic: true } as unknown as TItem;

      // Add optimistically
      setItems((prev) => [optimisticItem, ...prev]);
      setPendingOperations((prev) => new Set(prev).add(tempId));

      try {
        const result = await options.addItemFn(newItem);
        getItemId(result); // Validate result has ID

        // Replace optimistic item with real one
        setItems((prev) =>
          prev.map((item) => (getItemId(item) === tempId ? result : item)),
        );

        return result;
      } catch (error) {
        // Remove optimistic item on error
        setItems((prev) => prev.filter((item) => getItemId(item) !== tempId));
        throw error;
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    },
    [options],
  );

  const removeItem = useCallback(
    async (id: string) => {
      // Mark as pending deletion
      setPendingOperations((prev) => new Set(prev).add(id));

      // Remove optimistically
      const previousItems = items;
      setItems((prev) => prev.filter((item) => getItemId(item) !== id));

      try {
        await options.removeItemFn(id);
      } catch (error) {
        // Restore item on error
        setItems(previousItems);
        throw error;
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items, options],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<TItem>) => {
      setPendingOperations((prev) => new Set(prev).add(id));

      // Update optimistically
      const previousItems = items;
      setItems((prev) =>
        prev.map((item) =>
          getItemId(item) === id ? { ...item, ...updates, _isOptimistic: true } as TItem : item,
        ),
      );

      try {
        const result = await options.updateItemFn(id, updates);

        // Replace with server response
        setItems((prev) =>
          prev.map((item) => (getItemId(item) === id ? result : item)),
        );

        return result;
      } catch (error) {
        // Restore previous state on error
        setItems(previousItems);
        throw error;
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [items, options],
  );

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    pendingOperations,
    isPending: (id: string) => pendingOperations.has(id),
  };
}
