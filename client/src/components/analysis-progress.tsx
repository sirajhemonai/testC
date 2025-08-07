import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Globe, Brain, MessageCircle, Search, Sparkles, ChartBar, CheckCircle } from "lucide-react";

interface AnalysisProgressProps {
  isAnalyzing: boolean;
}

export function AnalysisProgress({ isAnalyzing }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    { icon: Globe, label: "Analyzing website content", duration: 8000, subtext: "Extracting business information..." },
    { icon: Search, label: "Researching your industry", duration: 6000, subtext: "Finding industry-specific automation solutions..." },
    { icon: Brain, label: "Identifying automation opportunities", duration: 5000, subtext: "Using AI to analyze your business model..." },
    { icon: ChartBar, label: "Calculating potential ROI", duration: 4000, subtext: "Estimating time and cost savings..." },
    { icon: Sparkles, label: "Generating recommendations", duration: 4000, subtext: "Creating personalized automation strategies..." },
    { icon: MessageCircle, label: "Preparing consultation", duration: 3000, subtext: "Finalizing your custom analysis..." },
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setCurrentStep(0);
      setCompletedSteps(new Set());
      return;
    }

    let currentDuration = 0;
    
    const interval = setInterval(() => {
      // Calculate total time for all steps
      const totalTime = steps.reduce((sum, step) => sum + step.duration, 0);
      
      // Find current step based on elapsed time
      let elapsed = 0;
      let stepIndex = 0;
      const newCompletedSteps = new Set<number>();
      
      for (let i = 0; i < steps.length; i++) {
        if (currentDuration >= elapsed + steps[i].duration) {
          newCompletedSteps.add(i);
        }
        
        if (currentDuration >= elapsed && currentDuration < elapsed + steps[i].duration) {
          stepIndex = i;
        }
        elapsed += steps[i].duration;
      }
      
      setCompletedSteps(newCompletedSteps);
      setCurrentStep(stepIndex);
      
      // Smooth progress with easing
      const calculatedProgress = Math.min((currentDuration / totalTime) * 95, 95);
      setProgress(calculatedProgress);
      
      currentDuration += 50; // Faster updates for smoother animation
      
      // Stop when we reach the end
      if (currentDuration > totalTime) {
        clearInterval(interval);
        setProgress(95);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const CurrentIcon = steps[currentStep]?.icon || Globe;

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse opacity-30"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <CurrentIcon className="w-10 h-10 text-black" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Analyzing Your Business with AI
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            {steps[currentStep]?.label || "Processing..."}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {steps[currentStep]?.subtext || "Please wait..."}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Progress value={progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 rounded">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;
              
              return (
                <div
                  key={index}
                  className={`relative flex items-start space-x-4 p-4 rounded-xl transition-all duration-500 ${
                    isCurrent
                      ? "bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 shadow-md transform scale-105"
                      : isCompleted
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                      : "bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 opacity-60"
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCurrent
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg"
                      : isCompleted
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${isCurrent ? "text-black" : "text-gray-500 dark:text-gray-400"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold transition-colors ${
                      isCurrent
                        ? "text-yellow-800 dark:text-yellow-200"
                        : isCompleted
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-sm mt-1 transition-colors ${
                      isCurrent
                        ? "text-yellow-600 dark:text-yellow-300"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {step.subtext}
                    </p>
                  </div>
                  {isCurrent && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          This typically takes 30-45 seconds • Powered by SellSpark AI
        </p>
      </div>
    </div>
  );
}