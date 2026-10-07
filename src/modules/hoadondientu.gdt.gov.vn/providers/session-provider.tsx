"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import type { AuthenticationResponse } from "@modules/hoadondientu.gdt.gov.vn/dto/auth";
import type { SessionResponse } from "@modules/hoadondientu.gdt.gov.vn/dto/session";
import {
  clearStoredSession,
  storeSession,
} from "@modules/hoadondientu.gdt.gov.vn/lib/session-storage";
import type { StoredHddtSession } from "@modules/hoadondientu.gdt.gov.vn/model/session";

export type SessionPhase =
  "booting" | "anonymous" | "validating" | "authenticated";

type SessionState = {
  phase: SessionPhase;
  session: StoredHddtSession | null;
};

type SessionAction =
  | { type: "ANONYMOUS" }
  | { type: "VALIDATING" }
  | { type: "AUTHENTICATED"; session: StoredHddtSession };

function reduceSessionState(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "ANONYMOUS":
      return { phase: "anonymous", session: null };
    case "VALIDATING":
      return { ...state, phase: "validating" };
    case "AUTHENTICATED":
      return { phase: "authenticated", session: action.session };
  }
}

function mapSessionResponse(
  info: SessionResponse,
  shouldRemember: boolean,
): StoredHddtSession {
  return {
    id: info.session_id,
    username: info.username,
    expiredAt: info.expired_at,
    remainingSeconds: info.remaining_seconds,
    isPersistent: shouldRemember,
    lastSyncedAt: new Date().toISOString(),
  };
}

type SessionContextValue = SessionState & {
  setValidating: () => void;
  resumeSession: (session: StoredHddtSession) => void;
  acceptAuthentication: (
    response: AuthenticationResponse,
    username: string,
    shouldRemember: boolean,
  ) => void;
  acceptSessionInfo: (
    info: SessionResponse,
    shouldRemember: boolean,
  ) => StoredHddtSession;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function HddtSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduceSessionState, {
    phase: "booting",
    session: null,
  });

  const setValidating = useCallback(() => {
    dispatch({ type: "VALIDATING" });
  }, []);

  const resumeSession = useCallback((session: StoredHddtSession) => {
    dispatch({ type: "AUTHENTICATED", session });
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    dispatch({ type: "ANONYMOUS" });
  }, []);

  const acceptSessionInfo = useCallback(
    (info: SessionResponse, shouldRemember: boolean) => {
      const session = mapSessionResponse(info, shouldRemember);
      storeSession(session);
      dispatch({ type: "AUTHENTICATED", session });
      return session;
    },
    [],
  );

  const acceptAuthentication = useCallback(
    (
      response: AuthenticationResponse,
      username: string,
      shouldRemember: boolean,
    ) => {
      const session: StoredHddtSession = {
        id: response.session_id,
        username: username.trim(),
        expiredAt: response.expired_at,
        remainingSeconds: Math.max(
          0,
          Math.floor(
            (new Date(response.expired_at).getTime() - Date.now()) / 1_000,
          ),
        ),
        isPersistent: shouldRemember,
        lastSyncedAt: new Date().toISOString(),
      };
      storeSession(session);
      dispatch({ type: "AUTHENTICATED", session });
    },
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      setValidating,
      resumeSession,
      acceptAuthentication,
      acceptSessionInfo,
      clearSession,
    }),
    [
      state,
      setValidating,
      resumeSession,
      acceptAuthentication,
      acceptSessionInfo,
      clearSession,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useHddtSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useHddtSession must be used inside HddtSessionProvider");
  return context;
}
