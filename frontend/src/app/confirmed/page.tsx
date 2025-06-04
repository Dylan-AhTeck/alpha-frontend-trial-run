"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfirmedPage() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <CardTitle className="text-3xl text-white mb-2">
            Welcome to Alpha!
          </CardTitle>
          <p className="text-white/80 text-lg">
            Your account has been successfully confirmed
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <p className="text-white/90 text-base leading-relaxed">
              You're now part of our exclusive community! Alpha brings together
              the most innovative minds in technology, giving you access to
              cutting-edge tools and conversations that shape the future.
            </p>
            <p className="text-white/70 text-sm">
              Ready to explore what's possible?
            </p>
          </div>

          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Enter Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-white/50 text-xs">Your journey begins now</p>
        </CardContent>
      </Card>
    </div>
  );
}
