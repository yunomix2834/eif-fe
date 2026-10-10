"use client";

import {
  displayDateToISO,
  formatDateForDisplay,
  normalizeDateDisplayInput,
} from "@global/utils/date";

type DateInputProps = {
  id: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
};

// Nhập DD/MM/YYYY bằng text; vùng icon mở date picker của trình duyệt.
export function DateInput({ id, value, label, onChange }: DateInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        className="eif-input pr-12 tabular-nums"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={(event) =>
          onChange(normalizeDateDisplayInput(event.target.value))
        }
        required
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--muted)]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M7 3v3M17 3v3M4.5 9.5h15" strokeLinecap="round" />
          <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" />
        </svg>
      </span>
      <input
        type="date"
        className="absolute inset-y-0 right-0 w-11 cursor-pointer opacity-0"
        value={displayDateToISO(value) ?? ""}
        onChange={(event) => {
          if (event.target.value)
            onChange(formatDateForDisplay(event.target.value));
        }}
        aria-label={`Chọn ${label} từ lịch`}
        title={`Chọn ${label} từ lịch`}
      />
    </div>
  );
}
