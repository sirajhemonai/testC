import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import darkModeLogo from "@assets/darkmode_1754329222920.png";
import lightModeLogo from "@assets/DayMode_1754329222925.png";

interface SellSparkLogoProps {
  clickable?: boolean;
}

export function SellSparkLogo({ clickable = true }: SellSparkLogoProps) {
  const { theme } = useTheme();
  
  const logoElement = (
    <div className="h-10 md:h-12 overflow-hidden">
      <img 
        src={theme === "dark" ? darkModeLogo : lightModeLogo} 
        alt="SellSpark" 
        className="h-16 md:h-20 w-auto object-cover object-center -mt-3 md:-mt-4"
      />
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="flex items-center">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}