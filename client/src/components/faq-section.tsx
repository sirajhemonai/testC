import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How quickly can you build my automations?",
    answer: "Most automations are live within 48 hours. We work fast because we know you're losing money every day without them.",
    cta: "Get started today"
  },
  {
    question: "What if I'm not tech-savvy?",
    answer: "Perfect! That's exactly who we built this for. You don't touch any code—we handle everything and teach you how to use it.",
    cta: "See how simple it is"
  },
  {
    question: "Will this work with my current tools?",
    answer: "Yes. We integrate with 95% of coaching tools (Calendly, ConvertKit, Kajabi, etc.). If we can't connect something, we'll find a workaround.",
    cta: "Check compatibility"
  },
  {
    question: "What happens after the 5 free automations?",
    answer: "We're offering 5 free automation plans to the first 5 businesses who contact us as we're just starting out. After that, custom automation plans start at $100.",
    cta: "Get yours free"
  },
  {
    question: "How do I know this will work for MY business?",
    answer: "We analyze your specific website and business model before building anything. Every automation is custom-tailored to your exact needs.",
    cta: "Get your analysis"
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Common Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Quick answers to help you decide
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="glass-card border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                {faq.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {openIndex === index && (
              <div className="px-6 pb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {faq.answer}
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Talk with a human
                  </Button>
                  <span className="text-sm text-gray-500">
                    {faq.cta}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}