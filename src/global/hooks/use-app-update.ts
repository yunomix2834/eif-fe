"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toAppError } from "@global/error/error-handler";
import {
  checkForAppUpdate,
  installLatestAppUpdate,
  type UpdateInfo,
  waitForAppVersion,
} from "@global/service/update.service";

export function useAppUpdate() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const checkController = useRef<AbortController | null>(null);

  const checkForUpdate = useCallback(async () => {
    checkController.current?.abort();
    const controller = new AbortController();
    checkController.current = controller;
    setIsChecking(true);

    try {
      const nextUpdate = await checkForAppUpdate(controller.signal);
      setUpdate(nextUpdate);
      setError(null);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      // Không chặn việc dùng app nếu GitHub tạm thời không thể truy cập.
      setError(toAppError(cause));
    } finally {
      if (checkController.current === controller) setIsChecking(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    setIsInstalling(true);
    setError(null);
    try {
      const installedUpdate = await installLatestAppUpdate();
      await waitForAppVersion(installedUpdate.latest_version);
      window.location.reload();
    } catch (cause) {
      setError(toAppError(cause));
      setIsInstalling(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void checkForUpdate(), 0);
    return () => {
      window.clearTimeout(timeout);
      checkController.current?.abort();
    };
  }, [checkForUpdate]);

  return {
    update,
    error,
    isChecking,
    isInstalling,
    checkForUpdate,
    installUpdate,
  };
}
