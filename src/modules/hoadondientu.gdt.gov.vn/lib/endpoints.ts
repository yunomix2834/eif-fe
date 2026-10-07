import type { InvoiceModeId } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";

const BASE = "/module/hoadondientu.gdt.gov.vn";

export const HDDT_ENDPOINTS = {
  captcha: `${BASE}/captcha`,
  authenticate: `${BASE}/authenticate`,
  session: `${BASE}/session`,
  sessionRefresh: `${BASE}/session/refresh`,

  invoiceQuery: {
    sold: `${BASE}/invoice/sold`,
    purchase: `${BASE}/invoice/purchase`,
  } satisfies Record<InvoiceModeId, string>,

  invoiceExport: {
    sold: `${BASE}/invoice/sold/export`,
    purchase: `${BASE}/invoice/purchase/export`,
  } satisfies Record<InvoiceModeId, string>,
} as const;
