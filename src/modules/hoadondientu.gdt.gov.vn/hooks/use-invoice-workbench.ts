"use client";

import { type FormEvent, useState } from "react";
import type { ExportFormat } from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";
import { useExport } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-export";
import { useInvoiceFilterForm } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-invoice-filter-form";
import { useInvoiceQuery } from "@modules/hoadondientu.gdt.gov.vn/hooks/use-invoice-query";
import {
  INVOICE_MODES,
  PURCHASE_PROCESSING_STATUS,
} from "@modules/hoadondientu.gdt.gov.vn/lib/constants";
import {
  toExportPayload,
  toQueryPayload,
} from "@modules/hoadondientu.gdt.gov.vn/lib/mappers";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";

// Điều phối form/query/export ở đây; component chỉ phụ trách hiển thị.
export function useInvoiceWorkbench(sessionId: string) {
  const [mode, setMode] = useState<InvoiceMode>(INVOICE_MODES[0]!);
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState<Error | null>(null);
  const { form, change, reset } = useInvoiceFilterForm();
  const query = useInvoiceQuery(sessionId, mode);
  const exporter = useExport(sessionId);

  function resetQueryState() {
    setPage(1);
    query.reset();
    exporter.resetError();
    setFormError(null);
  }

  function handleModeChange(nextMode: InvoiceMode) {
    const isPurchaseStatus = PURCHASE_PROCESSING_STATUS.some(
      ([value]) => String(value) === form.ttxly,
    );
    if (nextMode.direction === "purchase" && form.ttxly && !isPurchaseStatus) {
      change("ttxly", "");
    }
    setMode(nextMode);
    resetQueryState();
  }

  function handleQuerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    exporter.resetError();
    setFormError(null);
    try {
      const payload = toQueryPayload(form);
      // Lỗi API do query hook hiển thị, không trộn với lỗi nhập liệu.
      void query
        .execute(payload)
        .then((result) => {
          if (result) setPage(1);
        })
        .catch(() => undefined);
    } catch (error) {
      setFormError(asFormError(error));
    }
  }

  function handleFilterReset() {
    reset();
    resetQueryState();
  }

  function handleExport(format: ExportFormat) {
    setFormError(null);
    try {
      const payload = toExportPayload(form, format);
      void exporter.execute(mode, payload).catch(() => undefined);
    } catch (error) {
      setFormError(asFormError(error));
    }
  }

  return {
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
  };
}

function asFormError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
