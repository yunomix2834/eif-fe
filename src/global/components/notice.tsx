import type { ReactNode } from "react";
import { joinClassNames } from "@global/utils/class-names";

type NoticeTone = "info" | "success" | "warning" | "danger";

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={joinClassNames("eif-notice", `eif-notice-${tone}`)}
      role="status"
    >
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}
