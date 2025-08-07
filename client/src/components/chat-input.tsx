import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [message]);

  return (
    <div className="bg-[#1E293B] dark:bg-[#1E293B] border-t border-gray-700/30 dark:border-gray-700/30 p-4 md:p-8">
      <div className="flex items-end space-x-3 md:space-x-5 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer or choose from the options above..."
            className="glass-input w-full px-4 md:px-6 py-3 md:py-5 rounded-3xl text-base md:text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none transition-all duration-300 min-h-[52px] md:min-h-[64px] shadow-lg font-medium focus-glow hover-lift"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="glass-button bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-all duration-300 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl flex-shrink-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
