import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { RealTimeValidation } from "@/components/real-time-validation";
import { Zap } from "lucide-react";
import { ComparisonTable } from "@/components/comparison-table";
import { Testimonials } from "@/components/testimonials";
import { RiskCrushers } from "@/components/risk-crushers";
import { FAQSection } from "@/components/faq-section";
import { ArrowRight, CheckCircle, Clock, TrendingUp, DollarSign, Smile, Star, Shield, CreditCard, Globe } from "lucide-react";
import { useLocation, Link } from "wouter";
import { FloatingParticles } from "@/components/FloatingParticles";
import { useToast } from "@/hooks/use-toast";

// Import coach images
import coach1 from "@assets/67fab5bb-319b-48de-a7a4-eedeb4d4e9a3_1754256540780.png";
import coach2 from "@assets/78c46763-06bc-428e-82e4-fe357adb66df_1754256540784.png";
import coach3 from "@assets/dce02e43-7261-417c-be6c-8fa96a3f70db_1754256540787.png";
import coach4 from "@assets/e3e8379c-5dbf-4fab-b6bd-1aa94de1d8db_1754256540788.png";
import coach5 from "@assets/63a04fa1-a002-410b-a100-1606aabc9e1d_1754256540790.png";

export default function Homepage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNextStep = () => {
    if (currentStep === 1 && websiteUrl.trim()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && email.trim()) {
      handleStartAnalysis();
    }
  };

  const handleStartAnalysis = async () => {
    if (!websiteUrl.trim() || !email.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Store data for the analysis
      sessionStorage.setItem('websiteUrl', websiteUrl.trim());
      sessionStorage.setItem('userEmail', email.trim());
      
      // Start the analysis and create session with email
      const response = await fetch('/api/consultation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          websiteUrl: websiteUrl.trim(),
          email: email.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }
      
      const result = await response.json();
      
      // Store analysis data and redirect to chat for summary view
      sessionStorage.setItem('websiteAnalysis', JSON.stringify(result.websiteAnalysis));
      sessionStorage.setItem('showSummary', 'true');
      
      setLocation('/loading');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try again. Make sure your website URL is valid.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <FloatingParticles />
      <RealTimeValidation />
      
      <MainHeader />

      {/* Above-the-Fold "Money Zone" */}
      <section className="py-10 md:py-20 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow copy */}
          <div className="text-yellow-600 dark:text-yellow-400 font-medium mb-4 text-sm md:text-base">
            For busy online & hybrid coaches
          </div>
          
          {/* Headline (H1) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight slide-in-bottom">
            Get 5 client-winning automations idea built for you—
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 gradient-text">
              free, instantly.
            </span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed fade-in-delay px-2">
            Our AI agent scans your site and hands you a plug‑and‑play automation plan in under 60 seconds—no tech hassle, zero cost to start.
          </p>

          {/* 3-Step Progress Indicator */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  {currentStep === 1 ? 'Paste your website' : 'Website'}
                </div>
              </div>
              <div className={`h-1 flex-1 mx-4 ${currentStep >= 2 ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  {currentStep === 2 ? 'Enter your email' : 'Email'}
                </div>
              </div>
              <div className={`h-1 flex-1 mx-4 ${currentStep >= 3 ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 3 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <div className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  Get Results
                </div>
              </div>
            </div>
          </div>

          {/* Form Steps */}
          <div className="glass-card max-w-2xl mx-auto p-4 md:p-6 mb-8 md:mb-10 glass-enhanced scale-hover">
            <div className="text-center mb-6">
              {currentStep === 1 && (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Step 1: Paste your website
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We'll analyze your current setup in seconds
                  </p>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Step 2: Enter your email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get your personalized automation plan delivered
                  </p>
                </>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {currentStep === 1 && (
                <Input
                  type="url"
                  placeholder="https://yourcoachingsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="glass-input flex-1 text-base md:text-lg py-3 md:py-4"
                />
              )}
              
              {currentStep === 2 && (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="glass-input flex-1 text-base md:text-lg py-3 md:py-4"
                />
              )}
              
              <Button 
                onClick={handleNextStep}
                disabled={
                  isAnalyzing || 
                  (currentStep === 1 && !websiteUrl.trim()) || 
                  (currentStep === 2 && !email.trim())
                }
                className="glass-button bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold py-3 md:py-4 px-6 pulse-button w-full"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Analyzing...
                  </>
                ) : currentStep === 1 ? (
                  <>Next Step <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" /></>
                ) : (
                  <>Get My Free Plan <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" /></>
                )}
              </Button>
              
              {/* CTA micro-copy */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {currentStep === 1 
                  ? "AI-powered analysis • Takes 30 seconds • Completely free"
                  : "No spam • Unsubscribe anytime • Your data is secure"
                }
              </p>
            </div>
          </div>

          {/* Social-proof strip */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {[coach1, coach2, coach3, coach4, coach5].map((coachImg, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden shadow-sm hover:z-10 hover:scale-110 transition-all duration-200">
                  <img 
                    src={coachImg} 
                    alt={`Coach ${i + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-sm">
                <span className="text-black font-semibold text-xs">
                  +10
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-4">
              Helping coaches save 10+ hours weekly
            </span>
          </div>
        </div>
      </section>

      {/* "Why Coaches Love Automations" Tiles */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-bold text-[#FFD700] uppercase tracking-wider mb-4 animate-fade-in">
              The Results Speak
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent animate-gradient">
              Why Coaches Love Automations
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto">
              Lead with <span className="font-semibold text-[#FFD700]">benefits</span>, not features
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Time Saved Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <Clock className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                    10-20 hours
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">saved weekly</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </div>

            {/* Show-up Rate Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                    +30%
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">show-up rate on calls</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <DollarSign className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                    2×
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">revenue per client</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </div>

            {/* Tech Overwhelm Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <Card className="relative bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <Smile className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2">
                    0%
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">tech overwhelm</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Automation Journey with SellSpark
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From overwhelmed to automated in days, not months
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Your Plan</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI analyzes your website and delivers 5 personalized automation recommendations in 60 seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">We Build It</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our experts set up your automations while you focus on coaching—no tech skills needed
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Scale & Grow</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save 10-20 hours weekly, increase revenue, and enjoy unlimited support for 30 days
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Card className="inline-flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="flex items-center gap-4 p-0">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Limited Time: 5 Free Automation Plans</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">For the first 5 coaches this week only</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <ComparisonTable />
      </section>

      {/* What Coaches Are Saying */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Coaches Are Saying
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Real results from coaches who chose automation over admin
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">HS</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Hannah Stephenson</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Career Transition Coach</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "I saw a big spike in subscribers—my list jumped from 312 to over 1,000 in just three weeks, and my cost per lead dropped by 41%. The ManyChat lead magnet bot made growing my audience way easier."
                </p>
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">RT</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Rachel Tan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Sleep Consultant</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "The quiz funnel qualifies clients while I sleep—literally. I wake up to paid bookings from parents who found me at 2 a.m. It's working around the clock so I don't have to."
                </p>
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">LD</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Lena Duarte</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Nutrition Coach</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "Thanks to the calendar sync and WhatsApp reminders, my no-shows dropped from 28% to just 6% in nine days. Clients show up more, and I've added five paid consults each month without stress."
                </p>
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Crushers Strip */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Zero Risk, Maximum Results
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We remove every barrier so you can focus on what matters
          </p>
        </div>
        
        <RiskCrushers />
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => window.open("https://calendly.com/sellspark", "_blank")}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold py-4 px-8 text-lg"
          >
            Book My 15-min Build-Map Call <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Unlimited Revisions (First 30 days) • Cancel anytime—no contracts
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <FAQSection />
      </section>

      {/* Too-Long-Didn't-Read CTA Panel */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-400 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Ready to trade admin chaos for coaching freedom?
          </h2>
          <p className="text-lg text-black/80 mb-8">
            Get 5 free automation ideas in 48 hrs, no card needed—then decide.
          </p>
          
          <div className="glass-card max-w-xl mx-auto p-6 mb-8 bg-white/20">
            <div className="flex flex-col gap-3">
              <Input
                type="url"
                placeholder="Enter your website URL..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/90 border-0 text-gray-900 placeholder:text-gray-600"
              />
              <Button 
                onClick={handleStartAnalysis}
                disabled={!websiteUrl.trim()}
                className="bg-black hover:bg-gray-800 text-yellow-400 font-semibold py-3 px-6"
              >
                Scan My Site Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-black/70 text-center">
                Takes &lt; 60 sec
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-black">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Save 10-20 hrs/week</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">+30% show-ups & sign-ups</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Smile className="h-5 w-5" />
              <span className="font-medium">White-glove, no-code setup</span>
            </div>
          </div>
        </div>
      </section>

      <MainFooter />
    </div>
  );
}