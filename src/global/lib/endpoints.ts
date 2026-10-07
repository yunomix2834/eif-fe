export const GLOBAL_ENDPOINTS = {
  health: "/healthz",
  updates: {
    latest: "/updates/latest",
    install: "/updates/install",
  },
} as const;
