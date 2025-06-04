"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

interface PasswordRequirement {
  text: string;
  met: boolean;
}

type FormStep = "email" | "password" | "success" | "waitlist";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<FormStep>(
    initialEmail ? "password" : "email"
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const router = useRouter();

  const passwordRequirements: PasswordRequirement[] = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
    {
      text: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      // Check beta status BEFORE signup
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to validate email");
      }

      if (data.is_beta_user) {
        // Beta user - proceed to password creation
        setStep("password");
      } else {
        // Non-beta user - show waitlist
        setStep("waitlist");
      }
    } catch (error: unknown) {
      console.error("Email validation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to validate email. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (!isPasswordValid || !doPasswordsMatch) return;

    setIsLoading(true);
    setError("");

    try {
      // Use native Supabase signup with implicit flow
      await signUp(email, password);
      setStep("success");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaitlistSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/non-beta-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to join waitlist");
      }

      // Show success message and redirect to login
      alert(
        "Thanks for your interest! We'll notify you when access is available."
      );
      router.push("/login");
    } catch (error: unknown) {
      console.error("Waitlist error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to join waitlist. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Email Step
  if (step === "email") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Join the Beta</CardTitle>
          <CardDescription className="text-white/70">
            Enter your email to check beta access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Access...
                </>
              ) : (
                "Check Beta Access"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => router.push("/login")}
              >
                ← Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Password Creation Step (for beta users)
  if (step === "password") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-white/70">
            Set up your password for {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
              />
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    {req.met ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <X className="h-3 w-3 text-red-400" />
                    )}
                    <span
                      className={req.met ? "text-green-400" : "text-white/60"}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/90">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
              />
              {confirmPassword && (
                <div className="flex items-center space-x-2 text-sm">
                  {doPasswordsMatch ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-400" />
                      <span className="text-red-400">
                        Passwords don&apos;t match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => setStep("email")}
              >
                ← Change Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Success Step (email confirmation message)
  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-white/70">
            We&apos;ve sent you a confirmation link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4">
            <p className="text-green-400 text-sm">
              A confirmation email has been sent to <strong>{email}</strong>
            </p>
          </div>

          <p className="text-white/70 text-sm">
            Click the link in the email to complete your registration and access
            your account.
          </p>

          <p className="text-white/60 text-xs">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>

          <div className="pt-4">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
              onClick={() => router.push("/login")}
            >
              ← Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Waitlist Step (for non-beta users)
  if (step === "waitlist") {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            Beta Access Only
          </CardTitle>
          <CardDescription className="text-white/70">
            This platform is currently in private beta
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4">
            <p className="text-yellow-400 text-sm">
              <strong>{email}</strong> is not currently on our beta access list.
            </p>
          </div>

          <p className="text-white/70 text-sm">
            Would you like to join our waitlist? We&apos;ll notify you when
            access becomes available.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleWaitlistSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Waitlist...
                </>
              ) : (
                "Join Waitlist"
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-white/70 hover:text-white"
              onClick={() => setStep("email")}
            >
              Try Different Email
            </Button>
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white"
              onClick={() => router.push("/login")}
            >
              ← Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
