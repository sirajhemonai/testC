import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building, Target, Cog, ArrowRight, CheckCircle, TrendingUp, Users, Zap, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";

interface WebsiteAnalysis {
  businessName: string;
  businessType: string;
  targetAudience: string;
  services: string[];
  challenges: string[];
  specificTools: string[];
  implementations: string[];
}

export default function Summary() {
  const [, setLocation] = useLocation();
  const [analysisData, setAnalysisData] = useState<WebsiteAnalysis | null>(null);

  // Get current session data
  const { data: session } = useQuery<{session: any}>({
    queryKey: ['/api/consultation/current'],
    refetchInterval: 2000, // Check every 2 seconds for updated analysis
  });

  useEffect(() => {
    if (session?.session?.websiteAnalysis) {
      try {
        const parsed = typeof session.session.websiteAnalysis === 'string' 
          ? JSON.parse(session.session.websiteAnalysis) 
          : session.session.websiteAnalysis;
        setAnalysisData(parsed);
      } catch (error) {
        console.error('Failed to parse website analysis:', error);
      }
    }
  }, [session]);

  const handleContinueToChat = () => {
    setLocation("/chat");
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <MainHeader />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Business Analysis Complete! 
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We've analyzed {analysisData.businessName} and identified key automation opportunities
          </p>
        </div>

        {/* Main Analysis Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="bg-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{analysisData.businessName}</h2>
            <div className="flex items-center text-yellow-100">
              <Building className="w-5 h-5 mr-2" />
              <span>{analysisData.businessType}</span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Overview */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
                  </div>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {analysisData.targetAudience}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <Cog className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Services</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisData.services.map((service, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Automation Opportunities */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Tools you can use</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {analysisData.specificTools?.slice(0, 5).map((tool, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-gray-800 font-medium">{tool}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins Section */}
            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Quick Implementation Ideas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.implementations?.slice(0, 4).map((implementation, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{implementation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Impact Preview */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Potential Business Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Time Savings</h4>
                  <p className="text-sm text-gray-600">5-15 hours/week saved</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Revenue Growth</h4>
                  <p className="text-sm text-gray-600">20-40% increase potential</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Client Experience</h4>
                  <p className="text-sm text-gray-600">Improved satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinueToChat}
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to Personalized Recommendation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-gray-600 mt-4 text-sm">
            Get your 5 free custom automation strategies in our interactive chat
          </p>
        </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}