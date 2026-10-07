"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toAppError } from "@global/error/error-handler";
import type {
  HoaDonQuery,
  InvoiceQueryResult,
} from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";
import { queryInvoices } from "@modules/hoadondientu.gdt.gov.vn/service/invoice.service";

type QueryState = {
  data: InvoiceQueryResult | null;
  error: Error | null;
  isLoading: boolean;
};

export function useInvoiceQuery(
  sessionId: string | undefined,
  mode: InvoiceMode,
) {
  const [state, setState] = useState<QueryState>({
    data: null,
    error: null,
    isLoading: false,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (payload: HoaDonQuery) => {
      if (!sessionId) throw new Error("Bạn chưa có EIF session.");

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await queryInvoices(
          sessionId,
          mode,
          payload,
          controller.signal,
        );
        if (controller.signal.aborted) return null;

        setState({ data, error: null, isLoading: false });
        return data;
      } catch (value) {
        if (controller.signal.aborted) return null;
        if (value instanceof DOMException && value.name === "AbortError")
          return null;
        const error = toAppError(value);
        setState((current) => ({ ...current, error, isLoading: false }));
        throw error;
      }
    },
    [sessionId, mode],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState({ data: null, error: null, isLoading: false });
  }, []);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  return { ...state, execute, reset };
}
