import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { useToast } from "@/hooks/use-toast";
import { Zap, Clock, Target, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

const aiAgentSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  website: z.string().url("Please enter a valid website URL"),
  email: z.string().email("Please enter a valid email address"),
  automationGoal: z.string().min(10, "Please describe your automation goal (minimum 10 characters)"),
  currentProcess: z.string().min(10, "Please describe your current process (minimum 10 characters)"),
  timeSpent: z.string().min(1, "Please select time spent"),
  painPoints: z.string().min(5, "Please describe your main challenges"),
  teamSize: z.string().min(1, "Please select team size"),
  budget: z.string().min(1, "Please select budget range"),
});

type AIAgentFormData = z.infer<typeof aiAgentSchema>;

export default function AIAgentExpert() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const totalSteps = 4;

  const form = useForm<AIAgentFormData>({
    resolver: zodResolver(aiAgentSchema),
    defaultValues: {
      businessName: "",
      website: "",
      email: "",
      automationGoal: "",
      currentProcess: "",
      timeSpent: "",
      painPoints: "",
      teamSize: "",
      budget: "",
    },
  });

  const onSubmit = async (data: AIAgentFormData) => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...data,
        businessType: 'coaching' // Always set to coaching
      };
      
      const response = await fetch('/api/ai-agent-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    const fields: { [key: number]: (keyof AIAgentFormData)[] } = {
      1: ['businessName', 'email'],
      2: ['website'],
      3: ['automationGoal', 'currentProcess', 'timeSpent'],
      4: ['painPoints', 'teamSize', 'budget']
    };

    const currentFields = fields[currentStep] || [];
    const values = form.getValues();
    
    for (const field of currentFields) {
      if (!values[field]) {
        form.setError(field, { message: "This field is required" });
        return false;
      }
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] dark:bg-[#0F172A]">
      <MainHeader />
      
      <div className="min-h-screen bg-[#0F172A] dark:bg-[#0F172A] pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success State */}
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle className="w-14 h-14 text-black" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Thank You! Your Request is Confirmed
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                We've received your automation consultation request and our AI experts are already on it!
              </p>
              
              <div className="bg-[#1E293B] rounded-2xl p-8 max-w-2xl mx-auto border border-gray-700 mb-8">
                <h2 className="text-2xl font-semibold text-[#FFD700] mb-4">What happens next?</h2>
                
                <div className="space-y-6 text-left">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-sm font-bold text-black">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Check Your Email</h3>
                      <p className="text-gray-400">You'll receive a confirmation email shortly with your request details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-sm font-bold text-black">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Expert Analysis (Within 24 Hours)</h3>
                      <p className="text-gray-400">Our AI automation experts will analyze your coaching business and requirements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-sm font-bold text-black">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Receive Your Custom Plan</h3>
                      <p className="text-gray-400">Get a detailed AI automation roadmap tailored specifically for your coaching business</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <p className="text-[#FFD700] font-medium">
                  💡 Pro Tip: While you wait, think about which coaching tasks take up most of your time. 
                  Our experts will help you automate them!
                </p>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-[#FFD700] hover:bg-[#FFB700] text-black font-semibold py-6 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
              >
                Back to Homepage
              </Button>
            </div>
          ) : (
            <>
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-black" />
            </div>
            {currentStep === 1 ? (
              <>
                <p className="text-sm text-[#FFD700] font-medium mb-2">For coaches & service founders ready to unlock AI</p>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Real AI experts map your first<br />revenue-saving automations in 24 hrs.
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Paste your site, share a goal, and within a day our specialists hand you<br />
                  a step-by-step AI-agent action plan—no generic bots, 100% done-with-you.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Almost there! Let's customize your AI plan
                </h1>
                <p className="text-lg text-gray-300">
                  {currentStep === 2 && "Tell us about your business"}
                  {currentStep === 3 && "What would you like to automate?"}
                  {currentStep === 4 && "Final details to maximize your ROI"}
                </p>
              </>
            )}
          </div>

          {/* Benefits Section - Only show on first step */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-semibold text-white mb-2">Tailored Solutions</h3>
                <p className="text-gray-400 text-sm">Custom AI agent recommendations based on your specific business needs and processes.</p>
              </div>
              
              <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-semibold text-white mb-2">Fast Response</h3>
                <p className="text-gray-400 text-sm">Get expert recommendations within 24 hours of submitting your requirements.</p>
              </div>
              
              <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-semibold text-white mb-2">Implementation Ready</h3>
                <p className="text-gray-400 text-sm">Detailed action plans with step-by-step implementation guidance.</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep >= step 
                      ? 'bg-[#FFD700] text-black' 
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}>
                    {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`
                      w-full h-1 ml-2
                      ${currentStep > step ? 'bg-[#FFD700]' : 'bg-gray-700'}
                    `} style={{ width: '100px' }} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={currentStep >= 1 ? 'text-white' : 'text-gray-500'}>Quick Start</span>
              <span className={currentStep >= 2 ? 'text-white' : 'text-gray-500'}>Your Business</span>
              <span className={currentStep >= 3 ? 'text-white' : 'text-gray-500'}>Automation Goals</span>
              <span className={currentStep >= 4 ? 'text-white' : 'text-gray-500'}>Final Details</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-[#1E293B] rounded-2xl shadow-xl border border-gray-700 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Quick Start */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        Let's start with the basics
                      </h2>
                      <p className="text-gray-400">Takes less than 2 minutes • No credit card required</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">What's your business name?</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="SellSpark Coaching" 
                              className="py-6 text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">Where should we send your custom plan?</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@business.com" 
                              className="py-6 text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Your Business */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        Tell us about your coaching business
                      </h2>
                      <p className="text-gray-400">This helps our experts create recommendations specifically for coaches</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">What's your coaching website URL?</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourcoachingbusiness.com" 
                              className="py-6 text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-400 mt-2">We'll analyze your coaching website to provide tailored automation recommendations</p>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Automation Goals */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        What's eating up your time?
                      </h2>
                      <p className="text-gray-400">Tell us what you'd love to automate</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="automationGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">What task would give you back the most time if automated?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Examples: Following up with leads, scheduling appointments, creating content, managing customer support..."
                              rows={4}
                              className="text-lg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentProcess"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">How do you handle this now?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your current process, tools you use, and time it takes..."
                              rows={4}
                              className="text-lg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeSpent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">How much time does this take daily?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="py-6 text-lg">
                                <SelectValue placeholder="Select time spent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30min">Less than 30 minutes</SelectItem>
                              <SelectItem value="1hour">About 1 hour</SelectItem>
                              <SelectItem value="2-3hours">2-3 hours</SelectItem>
                              <SelectItem value="4-6hours">4-6 hours</SelectItem>
                              <SelectItem value="fullday">Most of my day</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 4: Final Details */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        Last step! Let's maximize your ROI
                      </h2>
                      <p className="text-gray-400">This helps us prioritize high-impact automations</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="painPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">What's your biggest frustration with the current process?</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us what makes this inefficient or frustrating..."
                              rows={4}
                              className="text-lg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-lg">How big is your team?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="py-6 text-lg">
                                  <SelectValue placeholder="Select team size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="solo">Just me</SelectItem>
                                <SelectItem value="2-5">2-5 people</SelectItem>
                                <SelectItem value="6-20">6-20 people</SelectItem>
                                <SelectItem value="21-50">21-50 people</SelectItem>
                                <SelectItem value="50+">50+ people</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-lg">Monthly budget for automation?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="py-6 text-lg">
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="under-500">Under $500</SelectItem>
                                <SelectItem value="500-1500">$500 - $1,500</SelectItem>
                                <SelectItem value="1500-5000">$1,500 - $5,000</SelectItem>
                                <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
                                <SelectItem value="15000+">$15,000+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      ← Back
                    </Button>
                  )}
                  
                  <div className={currentStep === 1 ? 'w-full' : 'ml-auto'}>
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full bg-[#FFD700] hover:bg-[#FFB700] text-black font-semibold py-6 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
                      >
                        {currentStep === 1 ? (
                          <>Get My Expert Plan <ArrowRight className="ml-2 w-5 h-5" /></>
                        ) : (
                          <>Continue <ArrowRight className="ml-2 w-5 h-5" /></>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-6 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Get My Custom AI Plan
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Trust Elements */}
                {currentStep === 1 && (
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                      ✓ Humans only • ✓ No credit card • ✓ 24-hr turnaround
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* What Happens Next Section - Centered with Golden Accents */}
          <div className="mt-20 text-center">
            <h2 className="text-4xl font-bold text-[#FFD700] mb-12">What happens next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              <div className="relative">
                <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-black">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">We Analyze</h3>
                <p className="text-gray-400 px-4">Our AI experts review your requirements and analyze your business needs within hours.</p>
              </div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-black">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">We Design</h3>
                <p className="text-gray-400 px-4">We create a custom AI automation roadmap with specific tools and implementation steps.</p>
              </div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-black">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">We Deliver</h3>
                <p className="text-gray-400 px-4">You receive your personalized AI agent plan within 24 hours, ready to implement.</p>
              </div>
            </div>
            
            <div className="bg-[#1E293B] rounded-2xl p-10 max-w-3xl mx-auto border border-gray-700 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-[#FFD700] mr-3" />
                <h3 className="text-2xl font-semibold text-white">100% Done-With-You Process</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                No generic templates. No confusing jargon. Just clear, actionable steps to automate your business 
                with AI agents that actually work for your specific needs.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-[#FFD700] font-medium text-lg">Starting from $100 per custom automation process</p>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      <MainFooter />
    </div>
  );
}