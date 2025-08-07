import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/8801919201192?text=Hi! I'm interested in automation solutions for my coaching business.", "_blank");
  };

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
        <div className={`transition-all duration-300 ${isOpen ? 'mb-3 md:mb-4' : ''}`}>
          {isOpen && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 md:p-4 mb-3 md:mb-4 w-72 sm:w-80 max-w-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Need Help?</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                Chat with us on WhatsApp for instant support and automation consultation!
              </p>
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white text-sm md:text-base py-2 md:py-3"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start WhatsApp Chat
              </Button>
            </div>
          )}
        </div>

        {/* Main Chat Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full h-12 w-12 md:h-14 md:w-14 bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </>
  );
}