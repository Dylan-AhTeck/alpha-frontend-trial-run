// Header Component - Provides common header structure and styling
import React from "react";
import { cn } from "@/shared/utils/utils";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-white/10 bg-black/50 backdrop-blur-md p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">{children}</div>
    </header>
  );
}
