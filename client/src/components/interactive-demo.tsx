import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, DollarSign } from "lucide-react";

const demoSteps = [
  {
    title: "Paste your website",
    description: "We'll analyze your current setup in seconds",
    placeholder: "https://yourcoachingsite.com"
  },
  {
    title: "Answer 5 quick questions",
    description: "Bot-style questions to understand your business",
    placeholder: "Tell us about your biggest time-waster..."
  },
  {
    title: "See your top 3 automations",
    description: "Plus ROI calculator showing time & money saved",
    placeholder: "Get your personalized automation plan"
  }
];

const sampleAutomations = [
  {
    title: "DM-Triage Bot",
    description: "Auto-responds to DMs and books qualified leads",
    timeSaved: "8 hrs/week",
    roi: "$2,400/month"
  },
  {
    title: "No-Show Recovery",
    description: "Automatically reschedules missed appointments",
    timeSaved: "4 hrs/week",
    roi: "$1,200/month"
  },
  {
    title: "Client Onboarding",
    description: "Sends forms, contracts, and welcome sequences",
    timeSaved: "6 hrs/week",
    roi: "$1,800/month"
  }
];

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue("");
    } else {
      setShowResults(true);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setInputValue("");
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your Personalized Automation Plan
          </h3>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">18 hours saved weekly</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">$5,400/month ROI</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {sampleAutomations.map((automation, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {automation.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {automation.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Time Saved:</span>
                    <span className="font-semibold text-green-600">{automation.timeSaved}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Value:</span>
                    <span className="font-semibold text-green-600">{automation.roi}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={resetDemo}
            variant="outline"
            className="mr-4"
          >
            Try Again
          </Button>
          <Button className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold">
            Get These Built for Me →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {demoSteps.map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                index <= currentStep
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Step {currentStep + 1}: {demoSteps[currentStep].title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {demoSteps[currentStep].description}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={demoSteps[currentStep].placeholder}
              className="glass-input text-center"
            />
            
            {currentStep === 1 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <em>"Your DMs feel overwhelming—but watch them book calls for you in under a week."</em>
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!inputValue.trim()}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
            >
              {currentStep === demoSteps.length - 1 ? 'Show My Results' : 'Next Step'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}