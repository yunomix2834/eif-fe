"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@global/components/button";
import { Card } from "@global/components/card";
import { ErrorNotice } from "@global/components/error-notice";
import { Notice } from "@global/components/notice";
import { formatNumber } from "@global/utils/format";
import { ExportMenu } from "@modules/hoadondientu.gdt.gov.vn/components/export-menu";
import { InvoiceFilterForm } from "@modules/hoadondientu.gdt.gov.vn/components/invoice-filter-form";
import { InvoiceTable } from "@modules/hoadondientu.gdt.gov.vn/components/invoice-table";
import type {
  ExportFormat,
  HoaDonQuery,
} from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import { useExport } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-export";
import { useInvoiceFilterForm } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-invoice-filter-form";
import { useInvoiceQuery } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-invoice-query";
import { INVOICE_MODES } from "@modules/hoadondientu.gdt.gov.vn/lib/constants";
import {
  toExportPayload,
  toQueryPayload,
} from "@modules/hoadondientu.gdt.gov.vn/lib/mappers";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";
import { useHddtSession } from "@modules/hoadondientu.gdt.gov.vn/providers/session-provider";

const FILTER_FORM_ID = "invoice-filter-form";
const PAGE_SIZE = 50;

function AuthenticatedInvoiceWorkbench({ sessionId }: { sessionId: string }) {
  const [mode, setMode] = useState<InvoiceMode>(INVOICE_MODES[0]!);
  const [page, setPage] = useState(1);
  const { form, change, reset } = useInvoiceFilterForm();
  const query = useInvoiceQuery(sessionId, mode);
  const exporter = useExport(sessionId);
  const [formError, setFormError] = useState<Error | null>(null);

  function changeMode(nextMode: InvoiceMode) {
    if (
      nextMode.direction === "purchase" &&
      form.ttxly !== "" &&
      !["5", "6", "8"].includes(form.ttxly)
    ) {
      change("ttxly", "");
    }

    setMode(nextMode);
    setPage(1);
    query.reset();
    exporter.resetError();
    setFormError(null);
  }

  function executeQuery(payload: HoaDonQuery) {
    void query
      .execute(payload)
      .then((result) => {
        if (result) setPage(1);
      })
      .catch(() => undefined);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    exporter.resetError();
    setFormError(null);
    try {
      executeQuery(toQueryPayload(form));
    } catch (error) {
      setFormError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  }

  function resetFilters() {
    reset();
    setPage(1);
    query.reset();
    exporter.resetError();
    setFormError(null);
  }

  function exportFile(format: ExportFormat) {
    setFormError(null);
    try {
      const payload = toExportPayload(form, format);
      void exporter.execute(mode, payload).catch(() => undefined);
    } catch (error) {
      setFormError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  const allRecords = query.data?.records;
  const totalPages =
    allRecords && allRecords.length > 0
      ? Math.ceil(allRecords.length / PAGE_SIZE)
      : 0;
  const pageRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return (allRecords ?? []).slice(start, start + PAGE_SIZE);
  }, [allRecords, page]);
  const displayedCount = pageRecords.length;

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold">Loại hóa đơn</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Mỗi tab tự tổng hợp dữ liệu hóa đơn thường và hóa đơn khởi tạo từ
              máy tính tiền.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {INVOICE_MODES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={mode.id === item.id ? "primary" : "secondary"}
                onClick={() => changeMode(item)}
              >
                {item.shortLabel}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">{mode.label}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {mode.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              form={FILTER_FORM_ID}
              isBusy={query.isLoading}
            >
              Tra cứu {mode.shortLabel}
            </Button>
            <Button type="button" variant="secondary" onClick={resetFilters}>
              Đặt lại
            </Button>
            <ExportMenu isBusy={exporter.isLoading} onSelect={exportFile} />
          </div>
        </div>

        <InvoiceFilterForm
          id={FILTER_FORM_ID}
          form={form}
          mode={mode}
          onChange={change}
          onSubmit={submit}
        />

        {formError ? (
          <div className="mt-4">
            <Notice tone="danger">{formError.message}</Notice>
          </div>
        ) : null}
        {exporter.error ? (
          <div className="mt-4">
            <ErrorNotice value={exporter.error} />
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold">Kết quả</h2>
            {query.data ? (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                <span>Tổng: {formatNumber(query.data.total)}</span>
                <span>Trang này: {formatNumber(displayedCount)}</span>
                <span>{PAGE_SIZE} bản ghi / trang</span>
              </div>
            ) : null}
          </div>

          {totalPages > 0 ? (
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
          ) : null}
        </div>

        {query.isLoading ? (
          <div className="mb-4">
            <Notice tone="info">
              Đang tải toàn bộ dữ liệu. Lần tải đầu có thể lâu hơn một chút vì
              EIF đang lấy đủ dữ liệu ở trang hoá đơn điện tử. Vui lòng chờ chút
              nhé ^^.
            </Notice>
          </div>
        ) : null}

        {query.error ? (
          <div className="mb-4">
            <ErrorNotice value={query.error} />
          </div>
        ) : null}

        {query.data && displayedCount === 0 ? (
          <div className="mb-4">
            <Notice tone="info">
              Không có dữ liệu phù hợp với điều kiện tra cứu.
            </Notice>
          </div>
        ) : null}

        <InvoiceTable records={pageRecords} />
      </Card>
    </div>
  );
}

export function InvoiceWorkbench() {
  const { session } = useHddtSession();
  if (!session) return null;
  return <AuthenticatedInvoiceWorkbench sessionId={session.id} />;
}
