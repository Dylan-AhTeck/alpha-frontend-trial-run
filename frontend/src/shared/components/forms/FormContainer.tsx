// Form Container Component - Provides consistent form layout and styling
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/utils";

interface FormContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormContainer({
  title,
  description,
  children,
  className,
}: FormContainerProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md",
        className
      )}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
        {description && (
          <CardDescription className="text-white/70">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
