import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  return {
    trailingSlash: true,
    ...(phase === PHASE_DEVELOPMENT_SERVER
      ? {}
      : {
          output: "export" as const,
        }),
  };
}
