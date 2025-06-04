"use client";

import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Access Beta Button */}
          <Link href="/login">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Access Beta
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
