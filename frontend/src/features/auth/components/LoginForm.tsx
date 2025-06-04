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
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { EmailCheckResponse } from "../types/auth.types";
import {
  checkUserStatus,
  requestBetaAccess,
  resendEmailVerification,
} from "../api/auth-api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    | "email"
    | "password"
    | "non-beta"
    | "email-confirmation"
    | "pending-verification"
  >("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsLoading(true);
    setError("");

    try {
      // Check if user exists and is in beta via backend API
      const data: EmailCheckResponse = await checkUserStatus(email);

      // Handle different user statuses
      switch (data.status) {
        case "not_beta":
          setStep("non-beta");
          break;
        case "new_user":
          // New beta user - show password step for account creation
          setStep("password");
          setIsReturningUser(false);
          break;
        case "pending_verification":
          // Existing user but email not verified - show resend verification
          setStep("pending-verification");
          break;
        case "verified_user":
          // Existing verified user - show password step for sign in
          setStep("password");
          setIsReturningUser(true);
          break;
        default:
          throw new Error("Unexpected user status received");
      }
    } catch (error) {
      console.error("Email check error:", error);
      setError("Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError("");

    try {
      if (isReturningUser) {
        // Existing user - sign in
        await signIn(email, password);
        router.push("/dashboard");
      } else {
        // New beta user - sign up directly
        await signUp(email, password);
        // After signup, user needs to confirm email before accessing dashboard
        // Show success message instead of immediate redirect
        setStep("email-confirmation");
        return;
      }
    } catch (error: unknown) {
      console.error("Authentication error:", error);
      if (error instanceof Error) {
        // Handle specific Supabase error cases
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonBetaRequest = async () => {
    setIsLoading(true);
    try {
      await requestBetaAccess(email);
      setError("");
      // Show success message
      alert("Thanks! We'll notify you when beta spots open up.");
    } catch (error) {
      console.error("Beta request error:", error);
      setError("Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError("");

    try {
      await resendEmailVerification(email);
      // Success - show email confirmation step
      setStep("email-confirmation");
    } catch (error: unknown) {
      console.error("Resend verification error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          {(() => {
            switch (step) {
              case "non-beta":
                return "Join the Waitlist";
              case "email-confirmation":
                return "Email Verification";
              case "pending-verification":
                return "Check Your Email";
              case "password":
                return isReturningUser ? "Welcome Back" : "Create Your Account";
              default:
                return "Join the Beta";
            }
          })()}
        </CardTitle>
        <CardDescription className="text-white/70">
          {(() => {
            switch (step) {
              case "email":
                return "Sign in to access your account";
              case "password":
                return isReturningUser
                  ? "Welcome back! Enter your password"
                  : "Create a secure password for your account";
              case "non-beta":
                return "You're not on the beta list yet";
              case "email-confirmation":
                return "Please verify your email address to continue";
              case "pending-verification":
                return "Your account needs email verification";
              default:
                return "";
            }
          })()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                {mode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 underline"
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                >
                  {mode === "signin" ? "Sign up!" : "Sign in!"}
                </button>
              </p>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isReturningUser ? "Signing in..." : "Creating account..."}
                </>
              ) : isReturningUser ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/70 hover:text-white"
              onClick={() => setStep("email")}
            >
              ← Back to email
            </Button>
          </form>
        )}

        {step === "non-beta" && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-white/90">
                Sign up below to be notified when spots open up!
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleNonBetaRequest}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Notify Me"
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => setStep("email")}
              >
                ← Back
              </Button>
            </div>
          </div>
        )}

        {step === "email-confirmation" && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-white/90 mb-2">
                  We&apos;ve sent a confirmation link to:
                </p>
                <p className="text-blue-400 font-medium">{email}</p>
              </div>
              <p className="text-white/70 text-sm">
                Click the link in your email to verify your account. You&apos;ll
                be automatically redirected to your dashboard once verified.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => setStep("email")}
                variant="ghost"
                className="w-full text-white/70 hover:text-white"
              >
                ← Use Different Email
              </Button>
              <p className="text-center text-xs text-white/50">
                The confirmation link will bring you back automatically
              </p>
            </div>
          </div>
        )}

        {step === "pending-verification" && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Email Not Verified
                </h3>
                <p className="text-white/90 mb-2">You have an account with:</p>
                <p className="text-blue-400 font-medium">{email}</p>
                <p className="text-white/70 text-sm mt-2">
                  But your email address hasn&apos;t been verified yet.
                </p>
              </div>
            </div>
            <Button
              onClick={handleResendVerification}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-white/70 hover:text-white"
              onClick={() => setStep("email")}
            >
              ← Try Different Email
            </Button>
          </div>
        )}

        {/* Beta access notice - only show for email step */}
        {step === "email" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Beta access only • Currently accepting beta users
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
