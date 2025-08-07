import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SellSparkLogo } from "@/components/SellSparkLogo";
import { Link } from "wouter";

export function MainHeader() {
  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-[25px] z-40">
      <div className="max-w-7xl mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Logo on left */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <SellSparkLogo clickable={false} />
          </Link>
          
          {/* Menu items on right */}
          <nav className="flex items-center gap-3">
            <Link href="/past-projects" className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#FFD700] transition-colors">
              Past Projects
            </Link>
            <Link href="/ai-agent-expert" className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#FFD700] transition-colors px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-[#FFD700] hover:shadow-md transition-all">
              AI Expert
            </Link>
            <Link href="/free-build" className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold text-xs px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all animate-pulse">
              Free Build ⚡
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}