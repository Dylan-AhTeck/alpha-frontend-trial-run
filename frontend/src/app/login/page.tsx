"use client";

import { LoginForm } from "@/features/auth";
import { FuturisticGraphic } from "@/components/landing/futuristic-graphic";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      {/* Background */}
      <div className="absolute inset-0">
        <FuturisticGraphic />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Alpha"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-white">Alpha</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-white/40">
          © 2024 Alpha. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
