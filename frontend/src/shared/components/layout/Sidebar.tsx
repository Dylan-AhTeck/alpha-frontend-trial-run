// Sidebar Component - Provides common sidebar structure
import React from "react";
import { cn } from "@/shared/utils/utils";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
  sm: "w-64", // 16rem
  md: "w-80", // 20rem
  lg: "w-96", // 24rem
  xl: "w-112", // 28rem (if available) or custom
};

export default function Sidebar({
  children,
  className,
  width = "md",
}: SidebarProps) {
  return (
    <div
      className={cn(
        "border-r border-white/10 bg-black/30 backdrop-blur-sm",
        widthClasses[width],
        className
      )}
    >
      {children}
    </div>
  );
}
