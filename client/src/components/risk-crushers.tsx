import { Shield, RefreshCw, Clock, XCircle } from "lucide-react";

const badges = [
  {
    icon: Clock,
    title: "7-Day Workflow Warranty",
    description: "If it doesn't work, we fix it free"
  },
  {
    icon: Shield,
    title: "Pay-After-Go-Live",
    description: "Only pay once you see results"
  },
  {
    icon: RefreshCw,
    title: "Unlimited Revisions",
    description: "Perfect fit guaranteed (first 30 days)"
  },
  {
    icon: XCircle,
    title: "Cancel Anytime",
    description: "No contracts, no commitments"
  }
];

export function RiskCrushers() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <badge.icon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {badge.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {badge.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}