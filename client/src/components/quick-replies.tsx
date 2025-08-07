import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface QuickRepliesProps {
  replies: string[];
  onReply: (reply: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ replies, onReply, disabled }: QuickRepliesProps) {
  // Truncate long replies to keep them shorter
  const truncateReply = (reply: string) => {
    return reply.length > 25 ? reply.substring(0, 22) + "..." : reply;
  };

  return (
    <div className="px-3 md:px-6 py-3 md:py-5 bg-[#1E293B] dark:bg-[#1E293B] border-b border-gray-700/30 dark:border-gray-700/30">
      <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse"></div>
        <p className="text-sm md:text-base font-semibold gradient-text">
          Quick options:
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        {replies.slice(0, 4).map((reply, index) => (
          <Button
            key={index}
            onClick={() => onReply(reply)}
            disabled={disabled}
            variant="outline"
            className="relative group text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-yellow-900/30 dark:hover:bg-yellow-900/30 border-gray-600/50 dark:border-gray-600/50 hover:border-yellow-400/50 transition-all duration-200 text-sm py-2 px-3 font-medium hover:shadow-sm border rounded-lg bg-gray-800 dark:bg-gray-800"
            title={reply} // Show full text on hover
          >
            <span className="relative z-10">{truncateReply(reply)}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10 ml-1" />
          </Button>
        ))}
      </div>
    </div>
  );
}