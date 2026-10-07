import { GLOBAL_ENDPOINTS } from "@global/lib/endpoints";
import { requestJson } from "@global/protocol/http-client";
import { getBackendHealth } from "@global/service/health.service";

export type UpdateInfo = {
  current_version: string;
  latest_version: string;
  is_update_available: boolean;
  release_notes_url?: string;
};

export function checkForAppUpdate(signal?: AbortSignal): Promise<UpdateInfo> {
  return requestJson<UpdateInfo>(GLOBAL_ENDPOINTS.updates.latest, { signal });
}

export function installLatestAppUpdate(): Promise<UpdateInfo> {
  return requestJson<UpdateInfo>(GLOBAL_ENDPOINTS.updates.install, {
    method: "POST",
  });
}

export async function waitForAppVersion(
  expectedVersion: string,
  timeoutMs = 60_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    const controller = new AbortController();
    const requestTimeout = window.setTimeout(() => controller.abort(), 2_000);
    try {
      const health = await getBackendHealth(controller.signal);
      if (health.version === expectedVersion) return;
    } catch {
      // Backend sẽ mất kết nối trong lúc helper thay binary và khởi động lại.
    } finally {
      window.clearTimeout(requestTimeout);
    }
  }

  throw new Error(
    "EIF đã chuẩn bị bản cập nhật nhưng chưa khởi động lại đúng thời gian dự kiến.",
  );
}
