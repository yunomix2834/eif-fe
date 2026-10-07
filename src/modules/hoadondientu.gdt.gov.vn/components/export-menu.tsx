"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@global/components/button";
import type { ExportFormat } from "@modules/hoadondientu.gdt.gov.vn/dto/invoice";

type ExportOption = {
  format: ExportFormat;
  label: string;
  description: string;
};

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: "xlsx",
    label: "Excel (.xlsx)",
    description:
      "Khuyến nghị cho kế toán: giữ kiểu Text và Custom Number Format.",
  },
  {
    format: "csv",
    label: "CSV (.csv)",
    description: "Phù hợp import vào Excel hoặc phần mềm kế toán.",
  },
  {
    format: "xml",
    label: "XML (.xml)",
    description:
      "Dữ liệu có cấu trúc để trao đổi hệ thống; không phải XML hóa đơn gốc có chữ ký số.",
  },
  {
    format: "json",
    label: "JSON (.json)",
    description: "Phù hợp tích hợp API, xử lý tự động hoặc lưu trữ kỹ thuật.",
  },
];

export function ExportMenu({
  isBusy,
  onSelect,
}: {
  isBusy: boolean;
  onSelect: (format: ExportFormat) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Menu là popup tự quản lý nên cần đóng khi user click ra ngoài hoặc nhấn
    // Escape. Listener chỉ tồn tại trong lúc menu đang mở để tránh giữ listener
    // toàn cục không cần thiết trong suốt vòng đời của trang.
    function closeWhenClickOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current?.contains(target)) setIsOpen(false);
    }

    function closeWhenPressEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeWhenClickOutside);
    document.addEventListener("keydown", closeWhenPressEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenClickOutside);
      document.removeEventListener("keydown", closeWhenPressEscape);
    };
  }, [isOpen]);

  function handleSelect(format: ExportFormat) {
    // Đóng menu trực tiếp từ event của người dùng trước khi bắt đầu export.
    // Không dùng Effect theo `isBusy` để đóng menu vì setState đồng bộ trong
    // Effect tạo thêm một render không cần thiết và bị React Hooks lint cảnh báo.
    setIsOpen(false);
    onSelect(format);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        isBusy={isBusy}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((isCurrentOpen) => !isCurrentOpen)}
      >
        Xuất file
        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </Button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Chọn định dạng xuất file"
          className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl"
        >
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              role="menuitem"
              className="grid w-full gap-0.5 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={() => handleSelect(option.format)}
            >
              <span className="text-sm font-bold text-[var(--text)]">
                {option.label}
              </span>
              <span className="text-xs leading-5 text-[var(--muted)]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
