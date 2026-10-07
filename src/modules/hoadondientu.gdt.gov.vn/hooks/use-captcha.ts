"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toAppError } from "@global/error/error-handler";
import type { CaptchaResponse } from "@modules/hoadondientu.gdt.gov.vn/dto/captcha";
import { getCaptcha } from "@modules/hoadondientu.gdt.gov.vn/service/auth.service";

export function useCaptcha() {
  const [data, setData] = useState<CaptchaResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoading(true);
    setData(null);
    setError(null);

    try {
      const captcha = await getCaptcha(controller.signal);
      setData(captcha);
      return captcha;
    } catch (value) {
      if (value instanceof DOMException && value.name === "AbortError")
        return null;
      const normalized = toAppError(value);
      setError(normalized);
      throw normalized;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void reload().catch(() => undefined);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      controllerRef.current?.abort();
    };
  }, [reload]);

  return { data, error, isLoading, reload };
}
