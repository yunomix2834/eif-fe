"use client";

import { useCallback, useState } from "react";
import { toAppError } from "@global/error/error-handler";

type AsyncState<TResult> = {
  data: TResult | null;
  error: Error | null;
  isLoading: boolean;
};

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));
      try {
        const data = await action(...args);
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (error) {
        const normalized = toAppError(error);
        setState((current) => ({
          ...current,
          error: normalized,
          isLoading: false,
        }));
        throw normalized;
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return { ...state, execute, reset };
}
