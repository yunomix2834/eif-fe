export type InvoiceFilter = {
  shdon?: number;
  khhdon?: string;
  khmshdon?: number;
  nbmst?: string;
  nmmst?: string;
  tthai?: number;
  ttxly?: number;
  unhiem?: number;

  // Bộ lọc CCCD (nmcmnd) tạm thời chưa hiển thị/gửi từ frontend.
  // nmcmnd?: string;
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

export type ExportInvoiceRequest = InvoiceFilter & {
  from_date: string;
  to_date: string;
  format: ExportFormat;
};

export type InvoiceRecord = Record<string, unknown>;

export type InvoiceQueryResult = {
  from_date: string;
  to_date: string;
  records: InvoiceRecord[];
  total: number;
};
