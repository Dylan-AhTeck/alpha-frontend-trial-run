// Error Alert Component - Provides consistent error message display
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/utils";

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
  variant?: "danger" | "warning";
  className?: string;
}

const variantClasses = {
  danger: "bg-red-500/10 border-red-500/20 text-red-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
};

export default function ErrorAlert({
  error,
  onDismiss,
  variant = "danger",
  className,
}: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div
      className={cn(
        "p-3 rounded-md border",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start">
        <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
        <p className="text-sm flex-1">{error}</p>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-1 ml-2 hover:bg-white/10"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
