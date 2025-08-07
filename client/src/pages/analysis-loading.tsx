import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, Globe, Brain, Search, Zap } from "lucide-react";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
}

export default function AnalysisLoading() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: "scraping",
      title: "Website Analysis",
      description: "Scanning your website structure and content...",
      icon: Globe,
      completed: false,
      current: true
    },
    {
      id: "ai-analysis", 
      title: "AI Business Intelligence",
      description: "Analyzing business model and identifying opportunities...",
      icon: Brain,
      completed: false,
      current: false
    },
    {
      id: "research",
      title: "Industry Research",
      description: "Researching automation solutions for your industry...",
      icon: Search,
      completed: false,
      current: false
    },
    {
      id: "recommendations",
      title: "Generating Recommendations",
      description: "Creating personalized automation strategies...",
      icon: Zap,
      completed: false,
      current: false
    }
  ]);

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update step completion based on progress
        if (newProgress >= 25 && !steps[0].completed) {
          setSteps(prev => prev.map((step, i) => 
            i === 0 ? { ...step, completed: true, current: false } :
            i === 1 ? { ...step, current: true } : step
          ));
          setCurrentStep(1);
        }
        
        if (newProgress >= 50 && !steps[1].completed) {
          setSteps(prev => prev.map((step, i) => 
            i === 1 ? { ...step, completed: true, current: false } :
            i === 2 ? { ...step, current: true } : step
          ));
          setCurrentStep(2);
        }
        
        if (newProgress >= 75 && !steps[2].completed) {
          setSteps(prev => prev.map((step, i) => 
            i === 2 ? { ...step, completed: true, current: false } :
            i === 3 ? { ...step, current: true } : step
          ));
          setCurrentStep(3);
        }
        
        if (newProgress >= 100) {
          setSteps(prev => prev.map(step => ({ ...step, completed: true, current: false })));
          setAnalysisComplete(true);
          clearInterval(interval);
          
          // Redirect to chat with summary after 2 seconds
          setTimeout(() => {
            sessionStorage.setItem('showSummary', 'true');
            setLocation("/chat");
          }, 2000);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 200); // Update every 200ms

    return () => clearInterval(interval);
  }, [setLocation, steps]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <MainHeader />
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            {analysisComplete ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {analysisComplete ? "Analysis Complete!" : "Analyzing Your Business"}
          </h1>
          <p className="text-gray-600 text-lg">
            {analysisComplete 
              ? "Your personalized automation roadmap is ready"
              : "Our AI is working hard to understand your business and identify automation opportunities"
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-yellow-600">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200"
          />
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className={`flex items-center p-4 rounded-lg border transition-all ${
                  step.completed 
                    ? "bg-green-50 border-green-200" 
                    : step.current 
                      ? "bg-blue-50 border-blue-200" 
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  step.completed 
                    ? "bg-green-100" 
                    : step.current 
                      ? "bg-yellow-100" 
                      : "bg-gray-100"
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : step.current ? (
                    <Icon className="w-5 h-5 text-yellow-600 animate-pulse" />
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    step.completed ? "text-green-800" : step.current ? "text-yellow-800" : "text-gray-600"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    step.completed ? "text-green-600" : step.current ? "text-yellow-600" : "text-gray-500"
                  }`}>
                    {step.completed ? "✓ Complete" : step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {analysisComplete && (
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to explore your results!
            </h3>
            <p className="text-gray-600 mb-4">
              We've identified key automation opportunities tailored specifically for your business.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-yellow-600 animate-spin mr-2" />
              <span className="text-yellow-600 font-medium">Redirecting to your results...</span>
            </div>
          </div>
        )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}