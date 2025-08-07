import { SellSparkLogo } from "@/components/SellSparkLogo";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { Mail, Phone, MapPin, Zap } from "lucide-react";
import { Link } from "wouter";

export function MainFooter() {
  return (
    <>
      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <SellSparkLogo clickable={false} />
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                AI-powered automation consultation platform helping businesses identify and implement automation opportunities for growth and efficiency.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                <span>siraj@sellspark.pro</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+8801919201192</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">Home</Link></li>
                <li><Link href="/past-projects" className="text-gray-300 hover:text-yellow-400 transition-colors">Past Projects</Link></li>
                <li><Link href="/ai-agent-expert" className="text-gray-300 hover:text-yellow-400 transition-colors">AI Expert</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">Predictable‑Leads Funnels</li>
                <li className="text-gray-300">Done‑for‑You AI Agents</li>
                <li className="text-gray-300">1‑Click Client Onboarding</li>
                <li className="text-gray-300">Retention & Upsell Email Engine</li>
                <li className="text-gray-300">Evergreen Content Machine</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SellSpark. All rights reserved.
            </p>

          </div>
        </div>
      </footer>

      {/* WhatsApp Chat */}
      <WhatsAppChat />
    </>
  );
}