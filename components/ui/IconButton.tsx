"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./Button";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  tone?: "default" | "ghost" | "outline";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, tone = "default", ...props }, ref) => {
    if (tone === "default") {
      return (
        <Button
          ref={ref}
          className={cn("size-9", className)}
          aria-label={label}
          {...props}
        />
      );
    }

    return (
      <Button
        ref={ref}
        variant={tone === "ghost" ? "ghost" : "outline"}
        className={cn("size-9", className)}
        aria-label={label}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";
