"use client";

import * as React from "react";

import { cn } from "@/lib/utils"; extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "secondary" && "border-transparent bg-muted text-muted-foreground",
        variant === "outline" && "border-border text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
