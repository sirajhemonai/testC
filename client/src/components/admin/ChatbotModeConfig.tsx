import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, MessageSquare, UserPlus, ShoppingBag, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ChatbotMode } from "@shared/schema";

interface ChatbotModeData {
  mode: "qna" | "lead_gen" | "recommendation";
  isActive: boolean;
  configuration: string;
  systemPrompt: string;
  welcomeMessage: string;
  tone: "professional" | "friendly" | "casual" | "formal";
}

export function ChatbotModeConfig() {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<"qna" | "lead_gen" | "recommendation">("qna");
  
  // Fetch chatbot modes
  const { data: modes = [], isLoading } = useQuery<ChatbotMode[]>({
    queryKey: ["/api/chatbot-modes"],
  });

  // Update mode mutation
  const updateMode = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<ChatbotModeData> }) => {
      await apiRequest(`/api/chatbot-modes/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot-modes"] });
      toast({
        title: "Success",
        description: "Chatbot mode updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update chatbot mode",
        variant: "destructive",
      });
    },
  });

  // Set active mode mutation
  const setActiveMode = useMutation({
    mutationFn: async (modeId: number) => {
      await apiRequest(`/api/chatbot-modes/${modeId}/activate`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot-modes"] });
      toast({
        title: "Success", 
        description: "Active mode changed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change active mode",
        variant: "destructive",
      });
    },
  });

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "qna":
        return <MessageSquare className="h-4 w-4" />;
      case "lead_gen":
        return <UserPlus className="h-4 w-4" />;
      case "recommendation":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const currentMode = modes.find(m => m.mode === selectedMode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          ChatBot Mode Configuration
        </CardTitle>
        <CardDescription>
          Configure different modes for your chatbot: Q&A, Lead Generation, or Product Recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={selectedMode} onValueChange={(value) => setSelectedMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qna" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Q&A Bot
            </TabsTrigger>
            <TabsTrigger value="lead_gen" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Lead Gen
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {currentMode && (
            <div className="mt-6 space-y-6">
              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Label htmlFor="active-mode" className="text-base font-medium">
                    {getModeIcon(currentMode.mode)}
                    Active Mode
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    ({currentMode.isActive ? "Currently Active" : "Inactive"})
                  </span>
                </div>
                <Switch
                  id="active-mode"
                  checked={currentMode.isActive}
                  onCheckedChange={() => {
                    if (!currentMode.isActive) {
                      setActiveMode.mutate(currentMode.id);
                    }
                  }}
                />
              </div>

              {/* Mode-specific content */}
              <TabsContent value="qna" className="space-y-4">
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    value={currentMode.systemPrompt}
                    onChange={(e) => {
                      updateMode.mutate({
                        id: currentMode.id,
                        updates: { systemPrompt: e.target.value }
                      });
                    }}
                    placeholder="Enter the system prompt for Q&A mode..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt defines how the bot responds to questions using your training data
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="lead_gen" className="space-y-4">
                <div className="space-y-2">
                  <Label>Lead Collection Prompt</Label>
                  <Textarea
                    value={currentMode.systemPrompt}
                    onChange={(e) => {
                      updateMode.mutate({
                        id: currentMode.id,
                        updates: { systemPrompt: e.target.value }
                      });
                    }}
                    placeholder="Enter the system prompt for lead generation..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt guides how the bot collects lead information
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recommendation" className="space-y-4">
                <div className="space-y-2">
                  <Label>Recommendation Prompt</Label>
                  <Textarea
                    value={currentMode.systemPrompt}
                    onChange={(e) => {
                      updateMode.mutate({
                        id: currentMode.id,
                        updates: { systemPrompt: e.target.value }
                      });
                    }}
                    placeholder="Enter the system prompt for recommendations..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    This prompt defines how the bot recommends products or services
                  </p>
                </div>
              </TabsContent>

              {/* Common settings */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={currentMode.welcomeMessage}
                    onChange={(e) => {
                      updateMode.mutate({
                        id: currentMode.id,
                        updates: { welcomeMessage: e.target.value }
                      });
                    }}
                    placeholder="Enter the welcome message..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    value={currentMode.tone}
                    onValueChange={(value) => {
                      updateMode.mutate({
                        id: currentMode.id,
                        updates: { tone: value as any }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full"
                  disabled={updateMode.isPending}
                >
                  {updateMode.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}