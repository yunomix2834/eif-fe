"use client";

import { Button } from "@global/components/button";
import { Card } from "@global/components/card";
import { ErrorNotice } from "@global/components/error-notice";
import { Notice } from "@global/components/notice";
import { formatNumber } from "@global/utils/format";
import { InvoiceTable } from "@modules/hoadondientu.gdt.gov.vn/components/invoice-table";
import type { InvoiceQueryResult } from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";

const PAGE_SIZE = 50;

type InvoiceResultsProps = {
  data: InvoiceQueryResult | null;
  error: Error | null;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
};

function ResultSummary({
  data,
  displayedCount,
}: {
  data: InvoiceQueryResult;
  displayedCount: number;
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
      <span>Tổng: {formatNumber(data.total)}</span>
      <span>Hóa đơn thường: {formatNumber(data.source_totals.standard)}</span>
      <span>Máy tính tiền: {formatNumber(data.source_totals.sco)}</span>
      <span>Trang này: {formatNumber(displayedCount)}</span>
      <span>{PAGE_SIZE} bản ghi / trang</span>
    </div>
  );
}

function ResultPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    onPageChange(nextPage);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        ← Trang trước
      </Button>
      <div className="min-w-24 text-center text-xs font-bold tabular-nums">
        Trang {page} / {totalPages}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Trang sau →
      </Button>
    </div>
  );
}

export function InvoiceResults({
  data,
  error,
  isLoading,
  page,
  onPageChange,
}: InvoiceResultsProps) {
  const records = data?.records;
  const totalPages = Math.ceil((records?.length ?? 0) / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageRecords = (records ?? []).slice(start, start + PAGE_SIZE);

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold">Kết quả</h2>
          {data ? (
            <ResultSummary data={data} displayedCount={pageRecords.length} />
          ) : null}
        </div>
        {totalPages > 0 ? (
          <ResultPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : null}
      </div>

      {isLoading ? (
        <div className="mb-4">
          <Notice tone="info">
            Đang tải toàn bộ dữ liệu. Lần tải đầu có thể lâu hơn một chút vì EIF
            đang lấy đủ dữ liệu ở trang hoá đơn điện tử. Vui lòng chờ chút nhé
            ^^.
          </Notice>
        </div>
      ) : null}
      {error ? (
        <div className="mb-4">
          <ErrorNotice value={error} />
        </div>
      ) : null}
      {data && pageRecords.length === 0 ? (
        <div className="mb-4">
          <Notice tone="info">
            Không có dữ liệu phù hợp với điều kiện tra cứu.
          </Notice>
        </div>
      ) : null}

      <InvoiceTable records={pageRecords} />
    </Card>
  );
}
