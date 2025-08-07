import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Calendar } from "lucide-react";
import { Link } from "wouter";
import sellSparkLogo from "@assets/sellspark-logo.jpg";

export function ChatHeader() {
  const { theme, toggleTheme } = useTheme();

  const handleScheduleMeeting = () => {
    // Open scheduling link in new tab
    window.open("https://calendly.com/sellspark", "_blank");
  };

  return (
    <header className="bg-black dark:bg-black px-4 md:px-8 py-3 md:py-5 flex justify-between items-center relative border-b border-gray-700/50 shadow-lg">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Logo - Centered on desktop, left on mobile */}
      <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 relative z-10">
        <Link href="/">
          <img 
            src={sellSparkLogo} 
            alt="SellSpark Logo" 
            className="h-11 md:h-14 w-auto object-contain hover-lift cursor-pointer hover:scale-105 transition-transform"
          />
        </Link>
      </div>
      
      {/* Right side buttons */}
      <div className="flex items-center space-x-3 md:space-x-4 ml-auto relative z-10">
        <Button
          onClick={handleScheduleMeeting}
          className="glass-button text-black font-bold px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base hover-lift"
        >
          <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          <span className="hidden sm:inline">Schedule Meeting</span>
          <span className="sm:hidden">Schedule</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="glass rounded-full h-10 w-10 md:h-12 md:w-12 hover-lift focus-glow"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 md:h-6 md:w-6 text-gray-300" />
          ) : (
            <Sun className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
          )}
        </Button>
      </div>
    </header>
  );
}
