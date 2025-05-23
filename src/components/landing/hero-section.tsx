"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FuturisticGraphic } from "./futuristic-graphic";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Graphic */}
      <FuturisticGraphic />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Beta Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
          <span className="text-sm font-medium text-white/90">
            🚀 Now in Beta
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Experience
          <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Alpha
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          An AI Agent with your Identity
        </p>

        <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto">
          Alpha processes your conversational patterns and personality traits to
          create an AI agent that thinks, responds, and interacts just like you.
        </p>

        {/* CTA Button */}
        <Link href="/login">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Access Beta
          </Button>
        </Link>

        {/* Additional Info */}
        <p className="text-sm text-white/40 mt-8">
          Limited beta access • By invitation only
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
