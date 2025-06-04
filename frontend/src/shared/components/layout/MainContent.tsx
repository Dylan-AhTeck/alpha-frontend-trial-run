// Main Content Component - Provides main content area structure
import React from "react";
import { cn } from "@/shared/utils/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  layout?: "default" | "split" | "full";
}

const layoutClasses = {
  default: "flex-1 flex overflow-hidden",
  split: "flex-1 flex overflow-hidden",
  full: "flex-1 flex flex-col min-h-0",
};

export default function MainContent({
  children,
  className,
  layout = "default",
}: MainContentProps) {
  return <div className={cn(layoutClasses[layout], className)}>{children}</div>;
}
