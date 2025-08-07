import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Clock, DollarSign, Target, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PainMatrix {
  [key: string]: number;
}

interface CoachPersona {
  id: string;
  name: string;
  description: string;
}

interface ROIMetric {
  recipeId: string;
  recipeTitle: string;
  medianROI: number;
  paybackDays: number;
  p75ROI: number;
  monthlyTimeSaved: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ROINarrative {
  recipeId: string;
  headline: string;
  explainer: string;
  badgeColor: string;
}

interface AdaptiveConsultationProps {
  sessionId: number;
  businessSummary: string;
  onComplete?: (results: any) => void;
}

const PAIN_BUCKET_LABELS = {
  lead_flow: "Lead Generation",
  follow_up: "Follow-up & Nurturing",
  onboarding: "Client Onboarding", 
  accountability: "Client Accountability",
  content: "Content Creation",
  upsell: "Upselling & Growth",
  retention: "Client Retention",
  admin: "Administrative Tasks"
};

export function AdaptiveConsultation({ sessionId, businessSummary, onComplete }: AdaptiveConsultationProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [painMatrix, setPainMatrix] = useState<PainMatrix>({});
  const [persona, setPersona] = useState<CoachPersona | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [roiMetrics, setRoiMetrics] = useState<ROIMetric[]>([]);
  const [narratives, setNarratives] = useState<ROINarrative[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  // Initialize first question
  useEffect(() => {
    setCurrentQuestion("What's the biggest time drain in your coaching business right now?");
  }, []);

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/consultation/respond", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          lastAnswer: userAnswer
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update pain matrix visualization
        setPainMatrix(result.painMatrix || {});
        setPersona(result.persona);
        setConfidenceLevel(result.confidenceLevel || 0);
        setQuestionCount(prev => prev + 1);

        if (result.isComplete) {
          // Show final ROI results
          setRoiMetrics(result.roiMetrics || []);
          setNarratives(result.narratives || []);
          setIsComplete(true);
          onComplete?.(result);
        } else {
          // Show next question
          setCurrentQuestion(result.nextQuestion);
          setUserAnswer("");
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get progress percentage
  const progressPercentage = Math.min((questionCount / 6) * 100, 100);

  // Get badge color for ROI metrics
  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'green': return 'default';
      case 'amber': return 'secondary';
      case 'red': return 'destructive';
      default: return 'outline';
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Executive Summary */}
        <Card className="border-2 border-[#FFD700] bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-[#FFD700]" />
              Your AI-Powered Automation Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FFD700]">{roiMetrics.length}</div>
                <div className="text-sm text-gray-600">Automation Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(roiMetrics.reduce((sum, metric) => sum + metric.monthlyTimeSaved, 0))}h
                </div>
                <div className="text-sm text-gray-600">Hours Saved Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.min(...roiMetrics.map(m => m.paybackDays))} days
                </div>
                <div className="text-sm text-gray-600">Fastest Payback</div>
              </div>
            </div>
            
            {persona && (
              <div className="bg-white p-4 rounded-lg border-l-4 border-[#FFD700]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-[#FFD700]" />
                  <span className="font-semibold">Your Coach Profile: {persona.name}</span>
                </div>
                <p className="text-gray-600">{persona.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ROI-Prioritized Recommendations */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FFD700]" />
            ROI-Prioritized Automation Recommendations
          </h3>
          
          {roiMetrics.map((metric, index) => {
            const narrative = narratives.find(n => n.recipeId === metric.recipeId);
            return (
              <Card key={metric.recipeId} className="border-l-4 border-[#FFD700]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{metric.recipeTitle}</h4>
                        <Badge variant={getBadgeVariant(narrative?.badgeColor || 'amber')}>
                          {metric.paybackDays} days payback
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{narrative?.explainer}</p>
                      
                      {/* ROI Visualization */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{metric.medianROI}% ROI</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{metric.monthlyTimeSaved}h saved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span>{metric.riskLevel} risk</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#FFD700]">{narrative?.headline}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payback Days Visualization */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Payback Timeline:</span>
                      <span className="text-sm text-gray-600">{metric.paybackDays} days</span>
                    </div>
                    <Progress 
                      value={Math.max(10, 100 - (metric.paybackDays / 90) * 100)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Transform Your Business?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your personalized automation roadmap is ready. Let's implement these solutions and start saving you 
              {Math.round(roiMetrics.reduce((sum, metric) => sum + metric.monthlyTimeSaved, 0))} hours per month.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => window.open("https://calendly.com/sellspark", "_blank")}
                className="bg-[#FFD700] hover:bg-[#FFB700] text-black"
              >
                Book Implementation Call
              </Button>
              <Button variant="outline">
                Download Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Discovery Interview</h2>
          <span className="text-sm text-gray-500">Question {questionCount + 1} of 6</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Real-time Pain Matrix Visualization */}
      {Object.keys(painMatrix).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(PAIN_BUCKET_LABELS).map(([key, label]) => {
                const score = painMatrix[key] || 0;
                const intensity = score / 10;
                return (
                  <div key={key} className="text-center">
                    <div 
                      className="w-full h-2 bg-gray-200 rounded-full mb-1"
                      style={{
                        background: `linear-gradient(to right, #FFD700 ${intensity * 100}%, #e5e5e5 ${intensity * 100}%)`
                      }}
                    />
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs text-gray-500">{score.toFixed(1)}/10</div>
                  </div>
                );
              })}
            </div>
            
            {persona && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Profile Matched: {persona.name}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{persona.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion}</h3>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
              rows={4}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              className="w-full bg-[#FFD700] hover:bg-[#FFB700] text-black"
            >
              {isSubmitting ? "Analyzing..." : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Indicator */}
      {confidenceLevel > 0 && (
        <div className="text-center">
          <div className="text-sm text-gray-500">
            AI Confidence: {Math.round(confidenceLevel)}/10
          </div>
          <div className="text-xs text-gray-400">
            Higher confidence leads to better recommendations
          </div>
        </div>
      )}
    </div>
  );
}