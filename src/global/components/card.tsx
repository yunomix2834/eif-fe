import type { HTMLAttributes, ReactNode } from "react";
import { joinClassNames } from "@global/utils/class-names";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <section {...props} className={joinClassNames("eif-card", className)}>
      {children}
    </section>
  );
}
