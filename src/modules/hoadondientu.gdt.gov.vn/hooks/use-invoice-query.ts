"use client";

import { useCallback, useState } from "react";
import { toAppError } from "@global/error/error-handler";
import { useRequestController } from "@global/hooks/use-request-controller";
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
  const { start, cancel } = useRequestController();

  const execute = useCallback(
    async (payload: HoaDonQuery) => {
      if (!sessionId) throw new Error("Bạn chưa có EIF session.");

      const signal = start();
      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await queryInvoices(sessionId, mode, payload, signal);
        if (signal.aborted) return null;

        setState({ data, error: null, isLoading: false });
        return data;
      } catch (value) {
        if (signal.aborted) return null;
        if (value instanceof DOMException && value.name === "AbortError")
          return null;
        const error = toAppError(value);
        setState((current) => ({ ...current, error, isLoading: false }));
        throw error;
      }
    },
    [sessionId, mode, start],
  );

  const reset = useCallback(() => {
    cancel();
    setState({ data: null, error: null, isLoading: false });
  }, [cancel]);

  return { ...state, execute, reset };
}
