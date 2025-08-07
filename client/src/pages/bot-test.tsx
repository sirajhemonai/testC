import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

export default function BotTestPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current bot mode
  const { data: modeConfig, isLoading: modeLoading } = useQuery({
    queryKey: ["/api/chat/mode"],
    retry: false,
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      return await apiRequest("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({
          message: messageText,
          sessionId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send welcome message on load
  useEffect(() => {
    if (modeConfig?.welcomeMessage && messages.length === 0) {
      queryClient.setQueryData(["/api/messages"], [
        {
          id: 0,
          content: modeConfig.welcomeMessage,
          isUser: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [modeConfig, messages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message);
  };

  const resetChat = () => {
    queryClient.setQueryData(["/api/messages"], []);
    window.location.reload();
  };

  if (modeLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bot configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
            <Bot className="h-6 w-6 text-primary" />
            ChatBot Mode Test
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Badge variant={modeConfig?.mode === "qna" ? "default" : modeConfig?.mode === "lead_gen" ? "secondary" : "outline"}>
              Mode: {modeConfig?.mode?.replace("_", " ").toUpperCase() || "Unknown"}
            </Badge>
            <Badge variant="outline">Tone: {modeConfig?.tone || "professional"}</Badge>
            <Button variant="ghost" size="sm" onClick={resetChat}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset Chat
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="h-[500px] overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="mt-2 space-x-2">
                        {msg.quickReplies.map((reply, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage.mutate(reply)}
                            className="mt-1"
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Type your message... (${modeConfig?.mode} mode)`}
            disabled={sendMessage.isPending}
          />
          <Button onClick={handleSend} disabled={sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}