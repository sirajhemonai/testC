import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SellSparkLogo } from "@/components/SellSparkLogo";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Heart, 
  Settings,
  ArrowLeft,
  Zap,
  Target,
  Clock,
  TrendingUp,
  UserCheck,
  FileText
} from "lucide-react";
import { Link } from "wouter";

const automationCategories = [
  {
    id: "lead-generation",
    title: "Lead Generation",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    automations: [
      {
        name: "Instagram DM Auto-Responder",
        description: "Automatically respond to new DMs with a friendly message and booking link",
        bestFor: "Social media coaches, fitness trainers"
      },
      {
        name: "Lead Magnet Delivery System", 
        description: "Instantly send PDFs, guides, or videos when someone signs up",
        bestFor: "Business coaches, course creators"
      },
      {
        name: "Website Chat to Calendar",
        description: "Convert website visitors into booked calls automatically",
        bestFor: "All coaches with websites"
      },
      {
        name: "Social Media Lead Capture",
        description: "Turn comments and mentions into potential clients",
        bestFor: "Content creators, influencer coaches"
      },
      {
        name: "Referral Tracking System",
        description: "Automatically track and reward client referrals",
        bestFor: "Established coaches with loyal clients"
      },
      {
        name: "Email List Building Bot",
        description: "Grow your email list with automated opt-in sequences",
        bestFor: "Newsletter-focused coaches"
      },
      {
        name: "Webinar Registration Flow",
        description: "Handle webinar signups and reminder sequences",
        bestFor: "Coaches who run webinars or workshops"
      },
      {
        name: "LinkedIn Outreach Assistant",
        description: "Personalized connection requests and follow-ups",
        bestFor: "Business and career coaches"
      }
    ]
  },
  {
    id: "sales-followup",
    title: "Sales & Follow-Up",
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    automations: [
      {
        name: "Discovery Call Follow-Up",
        description: "Send personalized follow-up messages after sales calls",
        bestFor: "High-ticket coaches"
      },
      {
        name: "Proposal Delivery System",
        description: "Automatically send custom proposals and contracts",
        bestFor: "Business consultants, agency coaches"
      },
      {
        name: "Payment Reminder Assistant",
        description: "Gentle reminders for overdue payments",
        bestFor: "All coaches with payment plans"
      },
      {
        name: "Objection Handling Bot",
        description: "Address common concerns with pre-written responses",
        bestFor: "Sales-focused coaches"
      },
      {
        name: "Social Proof Collector",
        description: "Automatically request and organize testimonials",
        bestFor: "Coaches building credibility"
      },
      {
        name: "No-Show Follow-Up",
        description: "Re-engage prospects who missed their consultation",
        bestFor: "All coaches doing discovery calls"
      },
      {
        name: "Price Objection Handler",
        description: "Respond to budget concerns with value-focused messages",
        bestFor: "Premium coaches"
      },
      {
        name: "Deal Closing Assistant",
        description: "Send closing sequences for warm prospects",
        bestFor: "Conversion-focused coaches"
      }
    ]
  },
  {
    id: "onboarding-setup",
    title: "Onboarding & Setup", 
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    automations: [
      {
        name: "Welcome Sequence Builder",
        description: "Multi-step onboarding emails with forms and resources",
        bestFor: "Program-based coaches"
      },
      {
        name: "Client Intake Assistant",
        description: "Collect health forms, goals, and assessments automatically",
        bestFor: "Health and fitness coaches"
      },
      {
        name: "Payment Processing Flow",
        description: "Handle contracts, payments, and access setup",
        bestFor: "All coaches with programs"
      },
      {
        name: "Session Scheduling System",
        description: "Let clients book their own sessions within your availability",
        bestFor: "1-on-1 coaches"
      },
      {
        name: "Program Access Manager",
        description: "Give clients access to courses, communities, or resources",
        bestFor: "Online program creators"
      },
      {
        name: "Goal Setting Workshop",
        description: "Interactive forms to define client objectives",
        bestFor: "Life and business coaches"
      },
      {
        name: "Resource Library Setup",
        description: "Organize and deliver relevant materials to new clients",
        bestFor: "Knowledge-heavy coaching niches"
      },
      {
        name: "Emergency Contact System",
        description: "Collect and organize client emergency information",
        bestFor: "Health and wellness coaches"
      }
    ]
  },
  {
    id: "program-delivery",
    title: "Program Delivery",
    icon: BookOpen,
    color: "text-orange-500", 
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    automations: [
      {
        name: "Weekly Check-In Bot",
        description: "Automated progress check-ins with personalized responses",
        bestFor: "Accountability-focused coaches"
      },
      {
        name: "Habit Tracking Assistant",
        description: "Help clients track daily habits and celebrate wins",
        bestFor: "Health and lifestyle coaches"
      },
      {
        name: "Workout Delivery System",
        description: "Send personalized workouts based on progress",
        bestFor: "Fitness trainers"
      },
      {
        name: "Meal Plan Generator",
        description: "Create and deliver custom nutrition plans",
        bestFor: "Nutrition coaches"
      },
      {
        name: "Progress Photo Collector",
        description: "Automated requests for transformation photos",
        bestFor: "Fitness and weight loss coaches"
      },
      {
        name: "Milestone Celebration Bot",
        description: "Recognize and celebrate client achievements",
        bestFor: "All coaches focused on motivation"
      },
      {
        name: "Session Reminder System",
        description: "Smart reminders with preparation materials",
        bestFor: "1-on-1 coaches"
      },
      {
        name: "Homework Assignment Tool",
        description: "Deliver and track completion of client tasks",
        bestFor: "Educational coaches"
      }
    ]
  },
  {
    id: "client-retention",
    title: "Client Retention",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20", 
    automations: [
      {
        name: "Engagement Alert System",
        description: "Flag clients showing signs of disengagement",
        bestFor: "Long-term program coaches"
      },
      {
        name: "Win Celebration Assistant",
        description: "Highlight and share client success stories",
        bestFor: "Community-building coaches"
      },
      {
        name: "Renewal Conversation Starter",
        description: "Time renewal discussions perfectly",
        bestFor: "Subscription-based coaches"
      },
      {
        name: "Upsell Opportunity Detector",
        description: "Identify clients ready for advanced programs",
        bestFor: "Multi-tier service coaches"
      },
      {
        name: "Client Satisfaction Monitor",
        description: "Regular pulse checks on client happiness",
        bestFor: "Quality-focused coaches"
      },
      {
        name: "Re-engagement Campaign",
        description: "Win back clients who've gone quiet",
        bestFor: "All coaches with inactive clients"
      },
      {
        name: "Graduation Ceremony Bot",
        description: "Celebrate program completions and transitions",
        bestFor: "Fixed-term program coaches"
      },
      {
        name: "Alumni Network Builder",
        description: "Keep past clients connected and engaged",
        bestFor: "Community-focused coaches"
      }
    ]
  },
  {
    id: "admin-scheduling",
    title: "Admin & Scheduling",
    icon: Settings,
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    automations: [
      {
        name: "Calendar Sync Master",
        description: "Keep all your calendars perfectly synchronized",
        bestFor: "Busy coaches with multiple platforms"
      },
      {
        name: "Invoice Generation Bot",
        description: "Create and send invoices automatically",
        bestFor: "Freelance coaches"
      },
      {
        name: "Expense Tracking System", 
        description: "Categorize and track business expenses",
        bestFor: "Solo coach entrepreneurs"
      },
      {
        name: "Client Communication Hub",
        description: "Centralize all client messages and calls",
        bestFor: "High-volume coaches"
      },
      {
        name: "Backup Plan Generator",
        description: "Auto-reschedule when you're sick or traveling",
        bestFor: "Travel-prone coaches"
      },
      {
        name: "Time Blocking Assistant",
        description: "Protect your deep work and family time",
        bestFor: "Work-life balance focused coaches"
      },
      {
        name: "Client Note Organizer",
        description: "Automatically file and searchable client information",
        bestFor: "Detail-oriented coaches"
      },
      {
        name: "Performance Dashboard",
        description: "Track your coaching metrics and trends",
        bestFor: "Data-driven coaches"
      }
    ]
  }
];

export default function AutomationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-black p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <SellSparkLogo />
              <div>
                <h1 className="text-white text-xl font-bold">SellSpark</h1>
                <p className="text-yellow-400 text-sm">What We Automate</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
            Schedule Meeting
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            48+ Automations for Coaches
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Choose from our library of proven automations, organized by the areas that matter most to your coaching business.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {automationCategories.map((category) => (
              <Card key={category.id} className="glass-card hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`${category.bgColor} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{category.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {category.automations.length} automations
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Automation Categories */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto space-y-16">
          {automationCategories.map((category) => (
            <div key={category.id} className="space-y-8">
              <div className="text-center">
                <div className={`${category.bgColor} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
                  <category.icon className={`h-10 w-10 ${category.color}`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {category.automations.length} automations to streamline your {category.title.toLowerCase()}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.automations.map((automation, index) => (
                  <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900 dark:text-white flex items-start justify-between">
                        <span className="flex-1">{automation.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          New
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {automation.description}
                      </p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Best for:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {automation.bestFor}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>5-10 min setup</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>High ROI</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-400 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to Automate Your Coaching Business?
          </h2>
          <p className="text-xl text-black/80 mb-8">
            Get personalized recommendations based on your specific coaching style and business needs.
          </p>
          
          <div className="space-y-4">
            <Link href="/">
              <Button className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 text-lg">
                Get My Custom Automation Plan
              </Button>
            </Link>
            <p className="text-black/70 text-sm">
              Free analysis • No commitment • Results in 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}  
      <footer className="bg-black py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <SellSparkLogo />
            <span className="text-white text-xl font-bold">SellSpark</span>
          </div>
          <p className="text-gray-400 mb-4">Friendly Automation Help for Coaches</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-yellow-400">Home</Link>
            <a href="#" className="hover:text-yellow-400">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400">Terms of Service</a>
            <a href="mailto:hello@sellspark.ai" className="hover:text-yellow-400">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}