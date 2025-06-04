// Page Container Component - Provides base full-screen layout structure
import React from "react";
import { cn } from "@/shared/utils/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn("h-screen bg-black text-white flex flex-col", className)}
    >
      {children}
    </div>
  );
}
