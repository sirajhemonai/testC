import { Building, Target, Cog, ArrowRight, CheckCircle, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface WebsiteSummaryProps {
  businessName: string;
  businessType: string;
  services: string[];
  targetAudience: string;
  websiteUrl: string;
  onContinue: () => void;
}

interface BusinessOverview {
  businessName: string;
  businessType: string;
  coreServices: string[];
  automationOpportunity: string;
  whatsMissing: string;
  trustBuilders: string[];
  coachingSpecialty: string;
  targetMarket: string;
}

export function WebsiteSummary({
  businessName,
  businessType,
  services,
  targetAudience,
  websiteUrl,
  onContinue
}: WebsiteSummaryProps) {
  // Fetch enhanced business overview
  const { data: overview, isLoading } = useQuery<BusinessOverview>({
    queryKey: ['/api/business-overview', businessName],
    queryFn: async () => {
      const response = await fetch('/api/business-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          services,
          targetAudience,
          websiteUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate business overview');
      }
      
      return response.json();
    }
  });

  const displayData = overview || {
    businessName,
    businessType,
    coreServices: services.slice(0, 3),
    automationOpportunity: "Lead management automation",
    whatsMissing: "Systematic client follow-up",
    trustBuilders: [
      "Automated lead generation systems to scale your coaching business",
      "Email automation sequences that convert prospects into paying clients"
    ],
    coachingSpecialty: businessType,
    targetMarket: targetAudience
  };
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Business Analysis Complete
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Here's what I learned about your business
          </p>
        </div>

        {/* Main Business Overview Card */}
        <div className="glass-card p-8 md:p-10 mb-8 animate-slide-in-up">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Building className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold gradient-text">
                Business Analysis Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                AI-powered insights from your website analysis
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center mb-3">
                  <Building className="w-5 h-5 text-yellow-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Business Name</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {isLoading ? "Analyzing..." : displayData.businessName}
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center mb-3">
                  <Target className="w-5 h-5 text-yellow-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Coaching Specialty</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {isLoading ? "Analyzing..." : displayData.coachingSpecialty}
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-yellow-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Target Market</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {isLoading ? "Analyzing..." : displayData.targetMarket}
                </p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center mb-3">
                  <Cog className="w-5 h-5 text-yellow-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Core Services</h4>
                </div>
                <div className="space-y-2">
                  {(isLoading ? ["Analyzing services..."] : displayData.coreServices).map((service, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 hover-lift border-2 border-yellow-300/50">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-yellow-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Automation Opportunity</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {isLoading ? "Identifying opportunities..." : displayData.automationOpportunity}
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 hover-lift border-2 border-red-300/50">
                <div className="flex items-center mb-3">
                  <Zap className="w-5 h-5 text-red-500 mr-2" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">What's Missing</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {isLoading ? "Analyzing gaps..." : displayData.whatsMissing}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Builders Section */}
        {!isLoading && displayData.trustBuilders.length > 0 && (
          <div className="glass-card p-6 md:p-8 mb-8 animate-slide-in-up border-2 border-green-300/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                How SellSpark Will Transform Your Coaching Business
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {displayData.trustBuilders.map((builder, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{builder}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="glass-card p-6 mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 font-medium">
              Ready to discover your <span className="gradient-text font-bold">personalized automation strategy</span>? 
              Let's identify the specific automations that will save you 10+ hours per week.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>5-minute consultation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>Personalized strategy</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span>No sales pitch</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onContinue}
            className="glass-button text-black font-bold px-10 py-4 rounded-2xl text-xl hover-lift pulse-golden focus-glow"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing Your Business..." : "Start My Automation Consultation"}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}