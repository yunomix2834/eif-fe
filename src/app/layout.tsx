import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";
import { appConfig } from "@global/config/config";
import { AppShell } from "@global/layouts/app-shell";
import { THEME_BOOTSTRAP_SCRIPT } from "@global/lib/theme-bootstrap";
import "@global/styles/globals.css";
import { appModules } from "@modules/registry";
import { AppProviders } from "./providers";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: {
    default: `${appConfig.app.name} · ${appConfig.app.fullName}`,
    template: `%s · ${appConfig.app.name}`,
  },
  description: `${appConfig.app.fullName} - Tra cứu và xuất hóa đơn điện tử`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
        <AppProviders>
          <AppShell modules={appModules}>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
