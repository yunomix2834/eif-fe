"use client";

import { useState } from "react";
import { Button } from "@global/components/button";
import { Notice } from "@global/components/notice";
import { getUserErrorText } from "@global/error/error-handler";
import { useAppUpdate } from "@global/hooks/use-app-update";

export function UpdatePrompt() {
  const updater = useAppUpdate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (
    updater.isChecking ||
    isDismissed ||
    !updater.update?.is_update_available
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-title"
    >
      <section className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-7">
        <p className="eif-eyebrow">Cập nhật EIF</p>
        <h2 id="update-title" className="mt-2 text-2xl font-black">
          Bạn có muốn cập nhật phiên bản mới không?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Phiên bản {updater.update.latest_version} đã sẵn sàng. Bạn đang dùng{" "}
          {updater.update.current_version}. EIF sẽ tự khởi động lại sau khi cập
          nhật xong.
        </p>

        {updater.error ? (
          <div className="mt-4">
            <Notice tone="danger">{getUserErrorText(updater.error)}</Notice>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          {updater.update.release_notes_url ? (
            <a
              className="mr-auto text-sm font-bold text-[var(--accent)] hover:underline"
              href={updater.update.release_notes_url}
              target="_blank"
              rel="noreferrer"
            >
              Xem thay đổi
            </a>
          ) : null}
          <Button
            variant="secondary"
            disabled={updater.isInstalling}
            onClick={() => setIsDismissed(true)}
          >
            Để sau
          </Button>
          <Button
            isBusy={updater.isInstalling}
            onClick={() => void updater.installUpdate()}
          >
            {updater.isInstalling ? "Đang cập nhật…" : "Cập nhật ngay"}
          </Button>
        </div>
      </section>
    </div>
  );
}
