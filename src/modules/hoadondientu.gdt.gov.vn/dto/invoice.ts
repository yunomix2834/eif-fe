export type InvoiceFilter = {
  shdon?: number;
  khhdon?: string;
  khmshdon?: number;
  nbmst?: string;
  nmmst?: string;
  tthai?: number;
  ttxly?: number;
  unhiem?: number;
};

export type HoaDonQuery = InvoiceFilter & {
  from_date: string;
  to_date: string;
};

// ExportFormat phải khớp với các format backend hỗ trợ.
// XLSX vẫn là lựa chọn mặc định/khuyến nghị cho kế toán vì chỉ XLSX giữ được
// data type của cell và Custom Number Format. CSV/XML/JSON phù hợp hơn cho
// import hoặc trao đổi dữ liệu giữa các hệ thống.
export type ExportFormat = "xlsx" | "csv" | "xml" | "json";

export type ExportInvoiceRequest = HoaDonQuery & {
  format: ExportFormat;
};

export type InvoiceRecord = Record<string, unknown>;

export type InvoiceChannel = "standard" | "sco";

export type InvoiceSourceTotals = Record<InvoiceChannel, number>;

export type InvoiceQueryResult = {
  from_date: string;
  to_date: string;
  records: InvoiceRecord[];
  total: number;
  source_totals: InvoiceSourceTotals;
};

// API dùng datas; giao diện dùng records sau khi chuẩn hóa response.
export type InvoiceQueryResponse = Partial<
  Omit<InvoiceQueryResult, "records" | "source_totals">
> & {
  datas?: InvoiceRecord[] | null;
  source_totals?: Partial<InvoiceSourceTotals> | null;
};
