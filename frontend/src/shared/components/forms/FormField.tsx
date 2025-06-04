// Form Field Component - Provides consistent form field styling and structure
import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/utils";

interface FormFieldProps {
  label: string;
  id: string;
  type?: "text" | "email" | "password" | "number";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          "bg-white/5 border-white/10 text-white placeholder:text-white/50",
          "focus:border-white/30 focus:ring-white/20",
          error &&
            "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}
