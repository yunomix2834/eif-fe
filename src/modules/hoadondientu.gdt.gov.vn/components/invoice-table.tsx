import { formatDateTime } from "@global/utils/date";
import { formatMoney } from "@global/utils/format";
import type { InvoiceRecord } from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import {
  getNumericValue,
  getProcessingLabel,
  getStatusLabel,
  getTextValue,
} from "@modules/hoadondientu.gdt.gov.vn/utils/invoice";

function createRowKey(record: InvoiceRecord, index: number): string {
  return String(
    record.id ??
      record.mhdon ??
      `${record.khhdon ?? "invoice"}-${record.shdon ?? index}-${index}`,
  );
}

export function InvoiceTable({ records }: { records: InvoiceRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] px-5 py-12 text-center text-sm text-[var(--muted)]">
        Không có dữ liệu để hiển thị.
      </div>
    );
  }

  return (
    <div className="eif-table-wrap">
      <table className="eif-table">
        <thead>
          <tr>
            <th>Nguồn</th>
            <th>Số HĐ</th>
            <th>Mẫu số</th>
            <th>Ký hiệu</th>
            <th>Ngày lập</th>
            <th>MST người bán</th>
            <th>Tên người bán</th>
            <th>MST người mua</th>
            <th>Tên người mua</th>
            <th>Tổng thanh toán</th>
            <th>Trạng thái</th>
            <th>Kết quả xử lý</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={createRowKey(record, index)}>
              <td>{getTextValue(record, "_eif_source")}</td>
              <td className="font-semibold">{getTextValue(record, "shdon")}</td>
              <td>{getTextValue(record, "khmshdon")}</td>
              <td>{getTextValue(record, "khhdon")}</td>
              <td>
                {record.tdlap ? formatDateTime(String(record.tdlap)) : "-"}
              </td>
              <td>{getTextValue(record, "nbmst")}</td>
              <td className="max-w-64">{getTextValue(record, "nbten")}</td>
              <td>{getTextValue(record, "nmmst")}</td>
              <td className="max-w-64">{getTextValue(record, "nmten")}</td>
              <td className="whitespace-nowrap font-semibold">
                {formatMoney(getNumericValue(record, "tgtttbso"))}
              </td>
              <td>{getStatusLabel(record.tthai)}</td>
              <td className="max-w-72">{getProcessingLabel(record.ttxly)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
