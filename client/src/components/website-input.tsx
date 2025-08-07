import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowRight } from "lucide-react";

interface WebsiteInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function WebsiteInput({ onSubmit, isLoading = false }: WebsiteInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 shadow-lg mx-4 md:mx-0">
      <div className="flex items-center mb-4">
        <Globe className="text-yellow-500 mr-2 md:mr-3 flex-shrink-0" size={20} />
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
          Let's start by analyzing your website
        </h2>
      </div>
      
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
        Enter your website URL and I'll analyze your business to provide personalized automation recommendations.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="glass-input w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="glass-button text-black font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}