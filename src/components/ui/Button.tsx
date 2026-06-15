import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 outline-none",
            "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950",
            "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
            {
              // Variant styles
              "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/10":
                variant === "primary",
              "border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200":
                variant === "secondary",
              "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300":
                variant === "ghost",
              "bg-red-600 hover:bg-red-500 text-white shadow-md":
                variant === "danger",
              "bg-lime-500 hover:bg-lime-400 text-zinc-950 shadow-md hover:shadow-lime-500/25":
                variant === "accent",
              // Size styles
              "px-3.5 py-1.5 text-xs": size === "sm",
              "px-5 py-2.5 text-sm": size === "md",
              "px-7 py-3 text-base": size === "lg",
              // Full width
              "w-full": fullWidth,
            },
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
