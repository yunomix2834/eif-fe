import type { ButtonHTMLAttributes, ReactNode } from "react";
import { joinClassNames } from "@global/utils/class-names";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isBusy?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  isBusy = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isBusy}
      className={joinClassNames(
        "eif-button",
        `eif-button-${variant}`,
        className,
      )}
    >
      {isBusy ? <span className="eif-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
