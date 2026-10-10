import {
  type DownloadResponse,
  requestFile,
  requestJson,
} from "@global/protocol/http-client";
import { createAppError } from "@global/error/app-error";
import { ERROR_CODES } from "@global/error/error-code";
import type {
  ExportInvoiceRequest,
  HoaDonQuery,
  InvoiceQueryResponse,
  InvoiceQueryResult,
} from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import { HDDT_ENDPOINTS } from "@modules/hoadondientu.gdt.gov.vn/lib/endpoints";
import { normalizeInvoiceQueryResult } from "@modules/hoadondientu.gdt.gov.vn/lib/invoice-response";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";

export async function queryInvoices(
  sessionId: string,
  mode: InvoiceMode,
  payload: HoaDonQuery,
  signal?: AbortSignal,
): Promise<InvoiceQueryResult> {
  const response = await requestJson<InvoiceQueryResponse>(
    HDDT_ENDPOINTS.invoiceQuery[mode.id],
    {
      method: "POST",
      body: payload,
      sessionId,
      isSessionAware: true,
      signal,
    },
  );

  if (!response || typeof response !== "object") {
    throw createAppError(ERROR_CODES.invalidResponse, {
      details: { reason: "Invoice query response is not an object." },
    });
  }
  return normalizeInvoiceQueryResult(response, payload);
}

export function exportInvoices(
  sessionId: string,
  mode: InvoiceMode,
  payload: ExportInvoiceRequest,
  signal?: AbortSignal,
): Promise<DownloadResponse> {
  return requestFile(HDDT_ENDPOINTS.invoiceExport[mode.id], {
    method: "POST",
    body: payload,
    sessionId,
    isSessionAware: true,
    signal,
  });
}
