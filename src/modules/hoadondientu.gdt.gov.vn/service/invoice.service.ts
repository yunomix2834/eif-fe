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
  InvoiceQueryResult,
  InvoiceRecord,
} from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import { HDDT_ENDPOINTS } from "@modules/hoadondientu.gdt.gov.vn/lib/endpoints";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";

type InvoiceQueryResponse = Partial<Omit<InvoiceQueryResult, "records">> & {
  // `datas` là field của API Thuế/backend; service map sang `records` để code UI rõ nghĩa.
  datas?: InvoiceRecord[] | null;
};

function normalizeQueryResult(
  response: InvoiceQueryResponse | null | undefined,
  payload: HoaDonQuery,
): InvoiceQueryResult {
  if (!response || typeof response !== "object") {
    throw createAppError(ERROR_CODES.invalidResponse, {
      details: { reason: "Invoice query response is not an object." },
    });
  }

  const records = Array.isArray(response.datas) ? response.datas : [];

  return {
    from_date:
      typeof response.from_date === "string"
        ? response.from_date
        : payload.from_date,
    to_date:
      typeof response.to_date === "string" ? response.to_date : payload.to_date,
    records,
    total:
      typeof response.total === "number" && Number.isFinite(response.total)
        ? response.total
        : records.length,
  };
}

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

  return normalizeQueryResult(response, payload);
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
