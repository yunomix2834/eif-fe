"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { DateInput } from "@global/components/date-input";
import {
  INVOICE_STATUS,
  PROCESSING_STATUS,
  PURCHASE_PROCESSING_STATUS,
} from "@modules/hoadondientu.gdt.gov.vn/lib/constants";
import type { InvoiceFilterFormState } from "@modules/hoadondientu.gdt.gov.vn/lib/mappers";
import type { InvoiceMode } from "@modules/hoadondientu.gdt.gov.vn/model/invoice-mode";

type FilterField = keyof InvoiceFilterFormState;

function FilterRow({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="eif-filter-row">
      <label htmlFor={id} className="eif-filter-row-label">
        {label}
      </label>
      <div className="eif-filter-control">{children}</div>
    </div>
  );
}

function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <h3 className="text-sm font-black">{children}</h3>
      {hint ? (
        <span className="text-[10px] font-semibold text-[var(--muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function InvoiceFilterForm({
  id,
  form,
  mode,
  onChange,
  onSubmit,
}: {
  id: string;
  form: InvoiceFilterFormState;
  mode: InvoiceMode;
  onChange: (field: FilterField, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const fieldChange =
    (field: FilterField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(field, event.target.value);

  const processingStatuses =
    mode.direction === "purchase"
      ? PURCHASE_PROCESSING_STATUS
      : PROCESSING_STATUS;

  return (
    <form
      id={id}
      className="grid gap-0 xl:grid-cols-[1.15fr_0.78fr_1fr]"
      onSubmit={onSubmit}
    >
      <section className="grid content-start gap-3 pb-5 xl:pb-0 xl:pr-7">
        <SectionTitle>Thông tin hóa đơn</SectionTitle>

        <FilterRow id="invoice-number" label="Số hóa đơn">
          <input
            id="invoice-number"
            className="eif-input"
            type="number"
            min="0"
            value={form.shdon}
            onChange={fieldChange("shdon")}
            placeholder="Nhập số hóa đơn"
          />
        </FilterRow>

        <FilterRow id="invoice-symbol" label="Ký hiệu hóa đơn">
          <input
            id="invoice-symbol"
            className="eif-input"
            value={form.khhdon}
            onChange={fieldChange("khhdon")}
            placeholder="Ví dụ: C26TER"
          />
        </FilterRow>

        <FilterRow id="invoice-template" label="Ký hiệu mẫu số hóa đơn">
          <input
            id="invoice-template"
            className="eif-input"
            type="number"
            min="0"
            value={form.khmshdon}
            onChange={fieldChange("khmshdon")}
            placeholder="Nhập mẫu số"
          />
        </FilterRow>

        <FilterRow id="seller-tax-code" label="MST người bán">
          <input
            id="seller-tax-code"
            className="eif-input"
            value={form.nbmst}
            onChange={fieldChange("nbmst")}
            inputMode="numeric"
            placeholder="Nhập MST người bán"
          />
        </FilterRow>

        <FilterRow id="buyer-tax-code" label="MST người mua">
          <input
            id="buyer-tax-code"
            className="eif-input"
            value={form.nmmst}
            onChange={fieldChange("nmmst")}
            inputMode="numeric"
            placeholder="Nhập MST người mua"
          />
        </FilterRow>
      </section>

      <section className="grid content-start gap-3 border-t border-[var(--border)] py-5 xl:border-l xl:border-t-0 xl:px-7 xl:py-0">
        <SectionTitle hint="DD/MM/YYYY">Ngày lập hóa đơn</SectionTitle>

        <div className="grid gap-1.5">
          <label
            htmlFor="invoice-from-date"
            className="text-[11px] font-semibold text-[var(--muted)]"
          >
            Từ ngày
          </label>
          <DateInput
            id="invoice-from-date"
            label="Từ ngày"
            value={form.from_date}
            onChange={(value) => onChange("from_date", value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="invoice-to-date"
            className="text-[11px] font-semibold text-[var(--muted)]"
          >
            Đến ngày
          </label>
          <DateInput
            id="invoice-to-date"
            label="Đến ngày"
            value={form.to_date}
            onChange={(value) => onChange("to_date", value)}
          />
        </div>

        <p className="text-[11px] leading-5 text-[var(--muted)]">
          Nhập DD/MM/YYYY hoặc bấm biểu tượng lịch để chọn ngày. EIF sẽ tự
          chuyển sang định dạng API khi tra cứu.
        </p>
      </section>

      <section className="grid content-start gap-3 border-t border-[var(--border)] pt-5 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
        <SectionTitle>Trạng thái</SectionTitle>

        <FilterRow id="delegated-invoice" label="Hóa đơn ủy nhiệm">
          <select
            id="delegated-invoice"
            className="eif-input"
            value={form.unhiem}
            onChange={fieldChange("unhiem")}
          >
            <option value="">Tất cả</option>
            <option value="0">Không</option>
            <option value="1">Có</option>
          </select>
        </FilterRow>

        <FilterRow id="invoice-status" label="Trạng thái hóa đơn">
          <select
            id="invoice-status"
            className="eif-input"
            value={form.tthai}
            onChange={fieldChange("tthai")}
          >
            <option value="">Tất cả</option>
            {INVOICE_STATUS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FilterRow>

        <FilterRow id="processing-status" label="Kết quả kiểm tra">
          <select
            id="processing-status"
            className="eif-input"
            value={form.ttxly}
            onChange={fieldChange("ttxly")}
          >
            <option value="">Tất cả</option>
            {processingStatuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FilterRow>
      </section>
    </form>
  );
}
