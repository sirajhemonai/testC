import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import sellSparkLogo from "@assets/sellspark-logo.jpg";

export default function Results() {
  const { theme } = useTheme();
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Fetch consultation results
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/consultation/results'],
    retry: 1,
  });

  useEffect(() => {
    // Define the toggleAccordion function globally
    (window as any).toggleAccordion = function(trigger: HTMLElement) {
      const content = trigger.nextElementSibling as HTMLElement;
      const arrow = trigger.querySelector('span:last-child');
      
      if (content && arrow) {
        const isHidden = content.style.display === 'none' || content.style.display === '';
        
        if (isHidden) {
          content.style.display = 'block';
          content.style.maxHeight = 'none';
          arrow.textContent = '▲';
        } else {
          content.style.display = 'none';
          arrow.textContent = '▼';
        }
      }
    };
    
    return () => {
      delete (window as any).toggleAccordion;
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainHeader />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your automation analysis...</p>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  // Show error or no consultation state
  if (error || !data || !(data as any).finalAnalysis) {
    return (
      <div className="min-h-screen bg-background">
        <MainHeader />
        <div className="flex items-center justify-center p-4 flex-1">
          <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">No Analysis Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't completed a consultation yet. Let's analyze your business and discover automation opportunities!
            </p>
            <Link href="/">
              <Button className="bg-[#FFD700] hover:bg-[#FFB700] text-black font-semibold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start Consultation
              </Button>
            </Link>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  // Extract business info from consultation data
  const businessInfo = (data as any)?.session || {};
  const userResponses = (data as any)?.userResponses || {};
  
  const analysisHTML = (data as any).finalAnalysis || `
<div style="background: linear-gradient(135deg, #FFF7E6 0%, #FFECCC 100%); color: #1a1a1a; padding: 32px; border-radius: 20px; margin-bottom: 32px; border: 3px solid #FFD700; box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2); position: relative; overflow: hidden;">
  <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
  <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 32px; font-weight: 800; position: relative;">⚡ Your SellSpark Automation Blueprint</h2>
  <p style="color: #333333; margin: 0; font-size: 18px; line-height: 1.8; position: relative;">Welcome! 🎯 Based on our AI analysis, here's your personalized automation roadmap designed to <strong style="color: #FFB700; font-weight: 700;">save you 15+ hours per week</strong> while accelerating your business growth:</p>
</div>

<div style="margin-bottom: 24px;">
  <div onclick="toggleAccordion(this)" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); color: #1a1a1a; border: 2px solid #FFD700; padding: 24px; border-radius: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(0,0,0,0.08); position: relative; overflow: hidden;">
    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: linear-gradient(180deg, #FFD700 0%, #FFB700 100%);"></div>
    <div style="flex: 1; padding-left: 16px;">
      <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 22px; font-weight: 700;">🎯 Smart Lead Magnetism & Follow-up Engine</h3>
      <p style="margin: 0; color: #666666; font-size: 14px;">Transform prospects into customers with intelligent automation</p>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="background: #FFD700; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">HIGH IMPACT</span>
      <span style="font-size: 24px; color: #FFD700; user-select: none; font-weight: bold; transition: transform 0.3s;">▼</span>
    </div>
  </div>
  <div style="background: #fafbfc; color: #1a1a1a; border: 2px solid #FFD700; border-top: none; padding: 0; border-radius: 0 0 16px 16px; display: none; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
    <div style="padding: 32px; background: linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.03) 100%);">
      <div style="display: grid; gap: 24px;">
        <div>
          <p style="color: #1a1a1a; margin: 0 0 20px 0; font-weight: 700; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #FFD700; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🔧</span>
            SellSpark Implementation Strategy
          </p>
          <div style="display: grid; gap: 16px; margin-left: 40px;">
            <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #FFD700; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <strong style="color: #1a1a1a; display: block; margin-bottom: 4px;">🎪 Smart Lead Scoring System</strong>
              <span style="color: #666666; font-size: 14px;">AI-powered algorithm ranks prospects based on 15+ behavioral signals including page visits, email opens, and content engagement</span>
            </div>
            <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #FFD700; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <strong style="color: #1a1a1a; display: block; margin-bottom: 4px;">💌 Dynamic Email Sequences</strong>
              <span style="color: #666666; font-size: 14px;">Personalized 7-touch campaigns that automatically adapt messaging based on prospect behavior and interests</span>
            </div>
            <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #FFD700; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <strong style="color: #1a1a1a; display: block; margin-bottom: 4px;">🚨 Real-time Alert System</strong>
              <span style="color: #666666; font-size: 14px;">Instant notifications via SMS/Slack when high-value prospects show buying signals (visiting pricing page 3+ times)</span>
            </div>
            <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #FFD700; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <strong style="color: #1a1a1a; display: block; margin-bottom: 4px;">📈 A/B Testing Framework</strong>
              <span style="color: #666666; font-size: 14px;">Continuous optimization of subject lines, CTAs, and messaging to maximize conversion rates</span>
            </div>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #FFF7E6 0%, #FFECCC 100%); padding: 24px; border-radius: 12px; border: 2px solid #FFD700; margin-top: 8px;">
          <p style="color: #1a1a1a; margin: 0; font-size: 16px; line-height: 1.6;">
            <strong style="font-size: 20px; color: #FFB700;">💰 Expected ROI:</strong><br>
            <span style="font-size: 18px; font-weight: 600;">• Time Saved:</span> 8-12 hours per week on manual follow-ups<br>
            <span style="font-size: 18px; font-weight: 600;">• Conversion Boost:</span> 35-45% increase in lead-to-customer rate<br>
            <span style="font-size: 18px; font-weight: 600;">• Revenue Impact:</span> 300-500% ROI within 90 days<br>
            <span style="font-size: 18px; font-weight: 600;">• Implementation:</span> 2-3 weeks with SellSpark team
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); padding: 18px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin: 0; color: var(--text-primary, #333333); font-size: 18px;">🤖 AI-Powered Customer Experience Hub</h3>
    <span style="font-size: 20px; color: var(--text-primary, #333333); user-select: none; font-weight: bold;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 12px 12px; display: none; overflow: hidden;">
    <div style="padding: 20px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-weight: 600;">🔧 <strong>SellSpark Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 16px 20px; line-height: 1.7;">
        <li>🎭 <strong>24/7 AI Assistant:</strong> Deploy intelligent chatbots that handle 70% of customer inquiries instantly</li>
        <li>🎯 <strong>Smart Ticket Routing:</strong> Automatically categorize and assign support tickets to the right team member</li>
        <li>⚡ <strong>Priority Escalation:</strong> Instantly flag and escalate urgent issues to prevent customer churn</li>
        <li>📊 <strong>Satisfaction Tracking:</strong> Monitor and optimize customer happiness scores in real-time</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0; padding: 12px; background-color: var(--bg-primary, #fff7e6); border-radius: 8px; border-left: 4px solid #FFD700;">💰 <strong>Expected Results:</strong> Reduce response time by 80% and handle 70% of inquiries automatically. Increase customer satisfaction by 45% while reducing support costs.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); padding: 18px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin: 0; color: var(--text-primary, #333333); font-size: 18px;">📊 Revenue Intelligence & Growth Engine</h3>
    <span style="font-size: 20px; color: var(--text-primary, #333333); user-select: none; font-weight: bold;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 12px 12px; display: none; overflow: hidden;">
    <div style="padding: 20px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-weight: 600;">🔧 <strong>SellSpark Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 16px 20px; line-height: 1.7;">
        <li>🎯 <strong>Multi-Channel Data Fusion:</strong> Automatically collect and sync customer data from all touchpoints</li>
        <li>📈 <strong>Real-time Performance Dashboards:</strong> Monitor KPIs, revenue, and growth metrics that matter</li>
        <li>🚨 <strong>Predictive Alerts:</strong> Get warned about potential issues before they impact your bottom line</li>
        <li>💡 <strong>Growth Opportunity Finder:</strong> AI identifies untapped revenue streams and optimization opportunities</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0; padding: 12px; background-color: var(--bg-primary, #fff7e6); border-radius: 8px; border-left: 4px solid #FFD700;">💰 <strong>Expected Results:</strong> Eliminate manual data entry completely and gain instant insights for better decision-making. Identify 15-25% additional revenue opportunities.</p>
    </div>
  </div>
</div>
`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 md:py-12 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4 px-2">
            Your Personalized Automation Roadmap
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-black/80 px-2">
            Transform your business with AI-powered automation solutions
          </p>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Custom styles for better readability */}
        <style dangerouslySetInnerHTML={{ __html: `
          .automation-content h2 { color: #1a1a1a !important; }
          .automation-content h3 { color: #1a1a1a !important; }
          .automation-content p { color: #333333 !important; }
          .automation-content ul { color: #333333 !important; }
          .automation-content li { color: #333333 !important; }
          .automation-content strong { color: #1a1a1a !important; }
          .automation-content div[onclick] { 
            background-color: #ffffff !important; 
            color: #1a1a1a !important;
          }
          .automation-content div[onclick] h3 { 
            color: #1a1a1a !important; 
          }
        ` }} />
        
        <div 
          className="automation-content"
          dangerouslySetInnerHTML={{ __html: analysisHTML }}
        />

        {/* Business Info Summary */}
        {businessInfo.websiteUrl && (
          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
              <div>
                <span className="text-gray-600 block md:inline">Website:</span>
                <span className="ml-0 md:ml-2 font-medium text-gray-900 break-all">{businessInfo.websiteUrl}</span>
              </div>
              <div>
                <span className="text-gray-600 block md:inline">Completed:</span>
                <span className="ml-0 md:ml-2 font-medium text-gray-900">
                  {new Date(businessInfo.completedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 md:mt-12 bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 md:p-8 rounded-xl md:rounded-2xl shadow-xl mx-2 md:mx-0">
          <h3 className="text-lg md:text-2xl font-bold text-black mb-3 md:mb-6 text-center">
            Ready to Transform Your Business?
          </h3>
          <div className="flex flex-col gap-3 md:gap-4 justify-center">
            <Button
              onClick={() => window.open("https://calendly.com/sellspark", "_blank")}
              className="bg-black text-yellow-400 hover:bg-gray-800 px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold shadow-lg w-full btn-mobile"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Get Our Services
            </Button>
            <Button
              onClick={async () => {
                // Clear all session storage data
                sessionStorage.removeItem('websiteUrl');
                sessionStorage.removeItem('lastWebsiteUrl');
                
                // Reset consultation on server
                try {
                  await fetch('/api/consultation/reset', { method: 'POST' });
                } catch (error) {
                  console.error('Failed to reset consultation:', error);
                }
                
                // Redirect to homepage
                window.location.href = '/';
              }}
              variant="outline"
              className="bg-white text-black border-black hover:bg-gray-100 px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg font-semibold shadow-lg w-full btn-mobile"
            >
              <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start New Analysis
            </Button>
          </div>
          <p className="text-center text-black/80 mt-3 md:mt-4 text-xs md:text-sm px-2">
            Book a free consultation with our founder, Siraj, or analyze another business
          </p>
        </div>


      </div>

      <MainFooter />
    </div>
  );
}