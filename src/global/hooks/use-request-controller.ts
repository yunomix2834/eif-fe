"use client";

import { useCallback, useEffect, useRef } from "react";

// Mỗi hook chỉ giữ một request: lượt mới hủy lượt cũ, unmount hủy lượt đang chạy.
export function useRequestController() {
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const start = useCallback(() => {
    cancel();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return { start, cancel };
}
