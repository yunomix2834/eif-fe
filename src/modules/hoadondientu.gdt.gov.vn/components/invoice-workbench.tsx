"use client";

import { Button } from "@global/components/button";
import { Card } from "@global/components/card";
import { ErrorNotice } from "@global/components/error-notice";
import { Notice } from "@global/components/notice";
import { ExportMenu } from "@modules/hoadondientu.gdt.gov.vn/components/export-menu";
import { InvoiceFilterForm } from "@modules/hoadondientu.gdt.gov.vn/components/invoice-filter-form";
import { InvoiceResults } from "@modules/hoadondientu.gdt.gov.vn/components/invoice-results";
import { useInvoiceWorkbench } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-invoice-workbench";
import { INVOICE_MODES } from "@modules/hoadondientu.gdt.gov.vn/lib/constants";
import { useHddtSession } from "@modules/hoadondientu.gdt.gov.vn/providers/session-provider";

const FILTER_FORM_ID = "invoice-filter-form";

function AuthenticatedInvoiceWorkbench({ sessionId }: { sessionId: string }) {
  const {
    mode,
    page,
    form,
    formError,
    query,
    exporter,
    change,
    setPage,
    handleModeChange,
    handleQuerySubmit,
    handleFilterReset,
    handleExport,
  } = useInvoiceWorkbench(sessionId);

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
                onClick={() => handleModeChange(item)}
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleFilterReset}
            >
              Đặt lại
            </Button>
            <ExportMenu isBusy={exporter.isLoading} onSelect={handleExport} />
          </div>
        </div>

        <InvoiceFilterForm
          id={FILTER_FORM_ID}
          form={form}
          mode={mode}
          onChange={change}
          onSubmit={handleQuerySubmit}
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

      <InvoiceResults
        data={query.data}
        error={query.error}
        isLoading={query.isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}

export function InvoiceWorkbench() {
  const { session } = useHddtSession();
  if (!session) return null;
  return <AuthenticatedInvoiceWorkbench sessionId={session.id} />;
}
