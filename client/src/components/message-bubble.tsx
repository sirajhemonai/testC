import { Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp: string;
  messageType?: string;
}

export function MessageBubble({ content, isUser, timestamp, messageType = "text" }: MessageBubbleProps) {
  useEffect(() => {
    // Define the toggleAccordion function globally for the AI-generated HTML
    (window as any).toggleAccordion = function(trigger: HTMLElement) {
      console.log('toggleAccordion called', trigger);
      const content = trigger.nextElementSibling as HTMLElement;
      const arrow = trigger.querySelector('span');
      
      console.log('Content element:', content);
      console.log('Arrow element:', arrow);
      
      if (content && arrow) {
        const isHidden = content.style.display === 'none' || content.style.display === '';
        console.log('Is hidden:', isHidden);
        
        if (isHidden) {
          content.style.display = 'block';
          content.style.maxHeight = 'none';
          arrow.textContent = '▲';
          console.log('Showing content');
        } else {
          content.style.display = 'none';
          arrow.textContent = '▼';
          console.log('Hiding content');
        }
      } else {
        console.log('Missing content or arrow element');
      }
    };
    
    // Cleanup function to remove the global function when component unmounts
    return () => {
      delete (window as any).toggleAccordion;
    };
  }, []);

  return (
    <div className={cn(
      "flex items-start message-reveal mb-6 md:mb-8",
      isUser ? "justify-end" : "space-x-3 md:space-x-4"
    )}>
      {isUser ? (
        <div className="flex items-end space-x-3 md:space-x-4 max-w-[85%] md:max-w-[80%]">
          <div className="bg-gray-800 dark:bg-gray-700 rounded-3xl rounded-br-md px-4 md:px-6 py-3 md:py-4 shadow-xl">
            <p className="text-white text-base md:text-lg font-medium leading-relaxed">{content}</p>
            <span className="text-sm text-gray-300 mt-2 block font-medium">{timestamp}</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white dark:ring-gray-900">
            <User className="text-white" size={18} />
          </div>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white dark:ring-gray-900">
            <Zap className="text-white" size={18} />
          </div>
          <div className={cn(
            "flex-1",
            messageType === "analysis" ? "max-w-none" : "max-w-[85%] md:max-w-[80%]"
          )}>
            <div className={cn(
              "glass-message rounded-3xl rounded-tl-md shadow-xl overflow-hidden hover-lift",
              messageType === "analysis" ? "w-full" : ""
            )}>
              {messageType === "analysis" ? (
                <div className="p-5 md:p-8">
                  <div 
                    className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              ) : (
                <div className="px-4 md:px-6 py-3 md:py-4">
                  <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">{content}</p>
                </div>
              )}
              <div className="px-4 md:px-6 pb-3 md:pb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{timestamp}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
