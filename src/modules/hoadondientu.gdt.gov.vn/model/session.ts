export type StoredHddtSession = {
  id: string;
  username: string;
  expiredAt: string;
  remainingSeconds: number;
  isPersistent: boolean;
  lastSyncedAt: string;
};
