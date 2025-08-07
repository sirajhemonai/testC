import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import sellSparkLogo from "@assets/sellspark-logo.jpg";

export function AnalysisGenerationProgress() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  
  const steps = [
    { progress: 10, message: "🔍 Analyzing your business profile..." },
    { progress: 25, message: "🤖 AI is studying your specific industry..." },
    { progress: 40, message: "🛠️ Identifying automation opportunities..." },
    { progress: 55, message: "💡 Matching tools to your current stack..." },
    { progress: 70, message: "📊 Calculating ROI and time savings..." },
    { progress: 85, message: "✨ Crafting your personalized roadmap..." },
    { progress: 100, message: "🎉 Your automation blueprint is ready!" }
  ];
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setProgress(steps[currentIndex].progress);
        setCurrentStep(steps[currentIndex].message);
        currentIndex++;
      }
    }, 5000); // Update every 5 seconds for ~35 seconds total
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col h-screen w-full md:max-w-5xl mx-auto bg-white dark:bg-black md:shadow-2xl">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 px-3 md:px-6 py-2 md:py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src={sellSparkLogo} 
            alt="SellSpark" 
            className="h-10 md:h-12 w-auto"
          />
        </div>
        <Button
          onClick={() => window.open("https://calendly.com/sellspark", "_blank")}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg"
        >
          <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
          <span className="hidden sm:inline">Schedule Meeting</span>
          <span className="sm:hidden">Schedule</span>
        </Button>
      </header>
      
      {/* Progress Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Creating Your Automation Blueprint
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              🎯 This takes 30-60 seconds as we craft your personalized automation roadmap...
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress}% Complete
            </p>
          </div>
          
          {/* Fun facts or tips */}
          <div className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-lg p-6 mt-8">
            <p className="text-gray-700 dark:text-gray-300 text-center">
              <span className="font-semibold">Almost there!</span> Your comprehensive automation plan includes ROI calculations, implementation timelines, and custom recommendations tailored to your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}