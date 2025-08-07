
import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const comparisonData = [
  {
    feature: "Setup time",
    diy: "12–30 hrs, endless Zap errors",
    freelancer: "1–2 weeks, back‑and‑forth emails",
    sellspark: "48 hrs (free for first 5 coaches)",
    sellsparkBest: true
  },
  {
    feature: "Needs tech skills",
    diy: "High",
    freelancer: "Medium", 
    sellspark: "None – white‑glove",
    sellsparkBest: true
  },
  {
    feature: "Cost",
    diy: "Hidden (your time)",
    freelancer: "$1 000 – $3 000 per build",
    sellspark: "From $100 after your free build",
    sellsparkBest: true
  },
  {
    feature: "Personalisation",
    diy: "Generic templates",
    freelancer: "One‑size‑fits‑some",
    sellspark: "Plan tailored by AI to your funnel",
    sellsparkBest: true
  },
  {
    feature: "Ongoing support",
    diy: "You",
    freelancer: "Limited",
    sellspark: "Human + AI concierge, unlimited tweaks 30 days",
    sellsparkBest: true
  }
];

export function ComparisonTable() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Old Way vs Freelancers vs SellSpark AI
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          See why coaches choose our AI-powered approach
        </p>
      </div>

      {/* Mobile-first responsive table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-4">
          {/* Headers */}
          <div className="font-semibold text-gray-900 dark:text-white p-4"></div>
          <div className="text-center p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Typical Automation Freelancer</h3>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg">
            <h3 className="font-semibold text-black">SellSpark AI</h3>
          </div>
          <div className="text-center p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">DIY Admin & Tools</h3>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div key={`row-${index}`} className="contents">
              <div className="font-medium text-gray-900 dark:text-white p-4 border-t border-gray-200 dark:border-gray-700">
                {row.feature}
              </div>
              <div className="p-4 text-center text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                {row.freelancer}
              </div>
              <div className={`p-4 text-center border-t border-gray-200 dark:border-gray-700 ${row.sellsparkBest ? 'bg-yellow-50 dark:bg-yellow-900/20 font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                <div className="flex items-center justify-center gap-2">
                  {row.sellsparkBest && <Check className="h-4 w-4 text-green-600" />}
                  {row.sellspark}
                </div>
              </div>
              <div className="p-4 text-center text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                {row.diy}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-6">
        {comparisonData.map((row, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                {row.feature}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Freelancer:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{row.freelancer}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">SellSpark:</span>
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.sellspark}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">DIY:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{row.diy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}