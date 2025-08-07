import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-4 animate-in fade-in-50 duration-300 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="text-yellow-400" size={18} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-5 py-4 max-w-xs lg:max-w-md shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">SellSpark is crafting your automation strategy...</p>
      </div>
    </div>
  );
}
