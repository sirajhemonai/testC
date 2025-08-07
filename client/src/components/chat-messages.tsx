import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { HelpMessage } from "./help-message";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Show help message if we detect Make.com configuration issues
    const hasConfigurationMessage = messages.some(msg => 
      msg.content.includes("Make.com scenario needs to be configured")
    );
    setShowHelp(hasConfigurationMessage);
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth bg-[#0F172A] dark:bg-[#0F172A]">
      {/* Help Message */}
      {showHelp && <HelpMessage />}

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
}
