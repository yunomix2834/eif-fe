"use client";

import { useCallback, useState } from "react";
import { toAppError } from "@global/error/error-handler";
import { useRequestController } from "@global/hooks/use-request-controller";
import { downloadBlob } from "@global/utils/download";
import type { ExportInvoiceRequest } from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";
import { exportInvoices } from "@modules/hoadondientu.gdt.gov.vn/service/invoice.service";

type ExportState = {
  isLoading: boolean;
  error: Error | null;
};

export function useExport(sessionId: string | undefined) {
  const [state, setState] = useState<ExportState>({
    isLoading: false,
    error: null,
  });
  const { start } = useRequestController();

  const execute = useCallback(
    async (mode: InvoiceMode, payload: ExportInvoiceRequest) => {
      if (!sessionId) throw new Error("Bạn chưa có EIF session.");

      const signal = start();
      setState({ isLoading: true, error: null });

      try {
        const file = await exportInvoices(sessionId, mode, payload, signal);
        if (signal.aborted) return;

        // Header tên file có thể bị proxy loại bỏ; fallback giữ đúng format đã chọn.
        const fallbackName = `hddtgdt-${mode.direction}-${payload.from_date}_${payload.to_date}.${payload.format}`;
        downloadBlob(file.blob, file.filename || fallbackName);
        setState({ isLoading: false, error: null });
      } catch (value) {
        if (signal.aborted) return;
        if (value instanceof DOMException && value.name === "AbortError")
          return;
        const error = toAppError(value);
        setState({ isLoading: false, error });
        throw error;
      }
    },
    [sessionId, start],
  );

  const resetError = useCallback(
    () => setState((current) => ({ ...current, error: null })),
    [],
  );

  return { ...state, execute, resetError };
}
