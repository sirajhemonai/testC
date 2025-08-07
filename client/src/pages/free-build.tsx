import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { ArrowRight, Check, Clock, Phone, FileText, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingParticles } from "@/components/FloatingParticles";

// Import coach images
import coach1 from "@assets/67fab5bb-319b-48de-a7a4-eedeb4d4e9a3_1754256540780.png";
import coach2 from "@assets/78c46763-06bc-428e-82e4-fe357adb66df_1754256540784.png";
import coach3 from "@assets/dce02e43-7261-417c-be6c-8fa96a3f70db_1754256540787.png";
import coach4 from "@assets/e3e8379c-5dbf-4fab-b6bd-1aa94de1d8db_1754256540788.png";
import coach5 from "@assets/63a04fa1-a002-410b-a100-1606aabc9e1d_1754256540790.png";

export default function FreeBuild() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [biggestTimeSuck, setBiggestTimeSuck] = useState("");
  const [otherTimeSuck, setOtherTimeSuck] = useState("");
  const [automationDetails, setAutomationDetails] = useState("");
  const [shareResults, setShareResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !website || !biggestTimeSuck || !automationDetails || !shareResults) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields and agree to share results.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit form data
      const response = await fetch('/api/free-build-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          website,
          biggestTimeSuck: biggestTimeSuck === 'other' ? otherTimeSuck : biggestTimeSuck,
          automationDetails,
          shareResults
        })
      });

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: "Your free automation slot is locked. Check your email for next steps!",
        });
        
        // Reset form
        setName("");
        setEmail("");
        setWebsite("");
        setBiggestTimeSuck("");
        setOtherTimeSuck("");
        setAutomationDetails("");
        setShareResults(false);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "Is each business really only getting ONE automation?",
      answer: "Yes. Five businesses, one build each. That lets us go deep on quality and gather clean before-vs-after metrics."
    },
    {
      question: "What counts as 'one automation'?",
      answer: "A single workflow that solves a specific problem—like auto-booking from DMs, quiz-to-CRM funnels, or no-show recovery sequences."
    },
    {
      question: "Do I need any tech skills?",
      answer: "Zero. We build everything and hand you the keys with a walkthrough video."
    },
    {
      question: "What happens after 30 days?",
      answer: "The automation is yours forever. The 30-day warranty covers tweaks if something needs adjusting."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <FloatingParticles />
      
      <MainHeader />

      {/* Hero Section */}
      <section className="py-10 md:py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow copy */}
          <div className="text-yellow-600 dark:text-yellow-400 font-bold mb-4 text-sm md:text-base animate-pulse">
            ⚡ Only 5 free builds left—1 per coach
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Get ONE high-impact automation built free, 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              {" "}live in 72 hrs.
            </span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            We're gifting a single, done-for-you automation to five coaching businesses this week—no card, no catch, lifetime use.
          </p>

          {/* CTA Button */}
          <Button 
            onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold py-4 px-8 text-lg mb-3"
          >
            Lock My Free Automation <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* CTA micro-copy */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            60-sec form • Human-built • $0 upfront
          </p>

          {/* Social-proof filmstrip */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {[coach1, coach2, coach3, coach4, coach5].map((coachImg, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden shadow-sm hover:z-10 hover:scale-110 transition-all duration-200">
                  <img 
                    src={coachImg} 
                    alt={`Coach ${i + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 text-sm">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">
                -22% no-shows
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                +3 bookings Wk 1
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Doing This */}
      <section className="py-12 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why We're Doing This
          </h2>
          <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
            "Real proof beats promises."
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We need five fresh case studies for an industry keynote next month.<br />
            You get one automation worth ~$300, we get permission to quote the metrics. Win-win.
          </p>
        </div>
      </section>

      {/* Three-Step Sprint */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Your 72-Hour Sprint
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Claim slot & paste site
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                60-second form below
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                15-min kickoff call
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pick your automation + share access
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                We build & hand over
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Loom walkthrough + 30-day tweak warranty
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk-Reducer Badge Row */}
      <section className="py-8 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-700 dark:text-gray-300">100% free – no card</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-700 dark:text-gray-300">72-hr live guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-700 dark:text-gray-300">You keep the IP</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              <Check className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-gray-700 dark:text-gray-300">30-day tweak warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Opt-In Form */}
      <section id="claim-form" className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Reserve My Free Automation
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                takes &lt; 60 sec
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcoachingsite.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Biggest time-suck
                  </label>
                  <Select value={biggestTimeSuck} onValueChange={setBiggestTimeSuck}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your biggest time drain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead-qualification">Lead qualification & DM responses</SelectItem>
                      <SelectItem value="scheduling">Scheduling & calendar management</SelectItem>
                      <SelectItem value="no-shows">No-show follow-ups</SelectItem>
                      <SelectItem value="onboarding">Client onboarding</SelectItem>
                      <SelectItem value="content">Content creation & distribution</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {biggestTimeSuck === 'other' && (
                    <Input
                      value={otherTimeSuck}
                      onChange={(e) => setOtherTimeSuck(e.target.value)}
                      placeholder="Please specify..."
                      className="mt-2"
                      required
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Automation Details
                  </label>
                  <Textarea
                    value={automationDetails}
                    onChange={(e) => setAutomationDetails(e.target.value)}
                    placeholder="What specific automation would help you most? Be as detailed as possible..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="share-results"
                    checked={shareResults}
                    onCheckedChange={(checked) => setShareResults(checked as boolean)}
                  />
                  <label 
                    htmlFor="share-results" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    OK to share anonymised results (we'll never share your name or business details without explicit permission)
                  </label>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold py-4 text-lg"
                >
                  {isSubmitting ? "Locking Your Slot..." : "Lock My Free Automation →"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index}
                className="glass-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  {expandedFaq === index && (
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 p-4 shadow-lg z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-black font-semibold text-center sm:text-left">
            5 coach slots left—claim your ONE free automation (72 hrs build).
          </p>
          <Button 
            onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2"
          >
            Lock My Slot →
          </Button>
        </div>
      </div>

      <MainFooter />
    </div>
  );
}