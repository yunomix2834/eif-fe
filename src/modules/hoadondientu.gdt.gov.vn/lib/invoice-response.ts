import type {
  HoaDonQuery,
  InvoiceQueryResponse,
  InvoiceQueryResult,
} from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";

function normalizeSourceTotal(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

// Giữ các giá trị mặc định để UI vẫn đọc được response từ backend phiên bản cũ.
export function normalizeInvoiceQueryResult(
  response: InvoiceQueryResponse,
  payload: HoaDonQuery,
): InvoiceQueryResult {
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
    source_totals: {
      standard: normalizeSourceTotal(response.source_totals?.standard),
      sco: normalizeSourceTotal(response.source_totals?.sco),
    },
  };
}
