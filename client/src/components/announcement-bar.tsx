import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  
  // Subtle bounce animation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 100);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1E293B] text-[#FFD700] py-2 px-4 text-center relative overflow-hidden sticky top-0 z-50 border-b border-[#FFD700]/20">
      <div className={`flex items-center justify-center space-x-2 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <span className="text-sm font-bold animate-pulse">⚡</span>
        <span className="font-medium text-sm md:text-base">
          5 free builds left this week
        </span>
        <Link href="/free-build" className="inline-flex items-center space-x-1 font-bold hover:text-white transition-colors group">
          <span className="border-b border-[#FFD700]/50 group-hover:border-white">Claim yours</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      

    </div>
  );
}