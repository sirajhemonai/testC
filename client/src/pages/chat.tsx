import { useState, useEffect } from "react";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { WebsiteInput } from "@/components/website-input";
import { AnalysisProgress } from "@/components/analysis-progress";
import { WebsiteSummary } from "@/components/website-summary";
import { QuickReplies } from "@/components/quick-replies";
import { AnalysisGenerationProgress } from "@/components/analysis-generation-progress";
import { startConsultation, respondToQuestion, resetConsultation } from "@/lib/consultation-api";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Zap, Calendar } from "lucide-react";
import { WhatsAppChat } from "@/components/whatsapp-chat";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  quickReplies?: string[] | null;
  messageType?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [consultationComplete, setConsultationComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null);
  const [isGeneratingFinalAnalysis, setIsGeneratingFinalAnalysis] = useState(false);
  const { toast } = useToast();

  // Fetch messages from server periodically (faster refresh for better UX)
  const { data: serverMessages, refetch } = useQuery({
    queryKey: ['/api/messages'],
    refetchInterval: 1000, // Faster refresh - 1 second
    staleTime: 0,
  });

  // Check current consultation session status
  const { data: currentSession, refetch: refetchSession } = useQuery({
    queryKey: ['/api/consultation/current'],
    refetchInterval: 1000, // Faster refresh - 1 second
    staleTime: 0,
  });

  // Update local messages when server messages change
  useEffect(() => {
    if (serverMessages && Array.isArray(serverMessages)) {
      setMessages(serverMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })));

      // Check if there's an active session
      const hasActiveSession = currentSession && (currentSession as any).session && (currentSession as any).session.id;
      const hasMessages = serverMessages.length > 0;
      
      // Check if any message indicates completion or redirect to results
      const hasCompletionMessage = Array.isArray(serverMessages) && serverMessages.some((msg: any) => 
        msg.content.includes("🎉 Excellent! I've analyzed all your responses") ||
        msg.messageType === "analysis"
      );
      
      if (hasCompletionMessage) {
        setConsultationComplete(true);
        // Auto-redirect to results page after 2 seconds when analysis is complete
        setTimeout(() => {
          window.location.href = '/results';
        }, 2000);
      } else if (hasActiveSession && hasMessages) {
        // If we have a session and messages, check if we should show summary or continue consultation
        const websiteUrl = sessionStorage.getItem('websiteUrl');
        const lastWebsiteUrl = sessionStorage.getItem('lastWebsiteUrl');
        
        if (websiteUrl && !showSummary && !consultationStarted) {
          // User came from homepage with URL but already has session - show summary first  
          console.log('[Chat] Found existing session, showing summary page for review');
          
          // Get the website analysis from current session if available
          const session = (currentSession as any)?.session;
          if (session && session.websiteAnalysis) {
            setWebsiteAnalysis(session.websiteAnalysis);
          }
          
          setIsAnalyzing(false);
          setShowSummary(true);
          setConsultationStarted(false);
          sessionStorage.removeItem('websiteUrl'); // Clear the trigger
        } else if (!showSummary) {
          // Only continue normal consultation flow if not showing summary
          console.log('[Chat] Setting consultation started - session exists with messages');
          setIsAnalyzing(false);
          setShowSummary(false);
          setConsultationStarted(true);
        }
      } else if (!hasActiveSession && !isAnalyzing && !showSummary) {
        // Only reset to welcome state if we're not in the middle of analysis or showing summary
        setConsultationStarted(false);
        setConsultationComplete(false);
      }
    }
  }, [serverMessages, currentSession]);

  // Handle new analysis from homepage
  useEffect(() => {
    const showSummaryFlag = sessionStorage.getItem('showSummary');
    const websiteAnalysisData = sessionStorage.getItem('websiteAnalysis');
    
    if (showSummaryFlag === 'true' && websiteAnalysisData && !showSummary && !consultationStarted) {
      console.log('[Chat] Homepage analysis complete, showing summary page');
      
      try {
        const analysisData = JSON.parse(websiteAnalysisData);
        setWebsiteAnalysis(analysisData);
        setShowSummary(true);
        setIsAnalyzing(false);
        setConsultationStarted(false);
        
        // Clear the flags
        sessionStorage.removeItem('showSummary');
        sessionStorage.removeItem('websiteAnalysis');
      } catch (error) {
        console.error('[Chat] Failed to parse website analysis data:', error);
      }
    }
  }, [showSummary, consultationStarted]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleWebsiteSubmit = async (websiteUrl: string) => {
    setIsAnalyzing(true);
    
    // Store website URL for the summary component
    sessionStorage.setItem('lastWebsiteUrl', websiteUrl);

    try {
      const result = await startConsultation(websiteUrl);
      
      console.log('[Chat] Received analysis:', result.websiteAnalysis);
      
      setWebsiteAnalysis(result.websiteAnalysis);
      setIsAnalyzing(false);
      setShowSummary(true); // Show summary first
      setConsultationStarted(false); // Don't start consultation immediately
      
      toast({
        title: "Analysis Complete",
        description: "Your website has been analyzed successfully!",
      });
      
      console.log('[Chat] Analysis complete, showing summary page');
      
      // Don't auto-start consultation, let user review summary first
      setTimeout(() => {
        refetch();
        refetchSession();
      }, 1000);
      
    } catch (error) {
      console.error("Website analysis error:", error);
      toast({
        title: "Analysis Failed", 
        description: error instanceof Error ? error.message : "Failed to analyze website",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const handleContinueFromSummary = async () => {
    try {
      // Get sessionId from current session or create a new one
      const sessionId = (currentSession as any)?.session?.id || Date.now();
      
      // Call the start-chat endpoint to begin the conversational AI
      const response = await fetch('/api/consultation/start-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setShowSummary(false);
        setConsultationStarted(true);
        
        // Add the first AI message directly if provided
        if (data.firstQuestion) {
          const firstMessage: Message = {
            id: Date.now(),
            content: data.firstQuestion.text,
            isUser: false,
            timestamp: formatTimestamp(new Date()),
            quickReplies: data.firstQuestion.suggestions || [],
            messageType: 'question'
          };
          setMessages([firstMessage]);
        }
        
        // Refresh messages to sync with server
        setTimeout(() => {
          refetch();
          refetchSession();
        }, 500);
        
        toast({
          title: "Let's Begin!",
          description: "Starting your personalized consultation",
        });
      } else {
        throw new Error('Failed to start chat consultation');
      }
    } catch (error) {
      console.error('Error starting chat consultation:', error);
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickReply = async (reply: string) => {
    if (isTyping) return;
    
    setIsTyping(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      content: reply,
      isUser: true,
      timestamp: formatTimestamp(new Date()),
      messageType: 'text'
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await respondToQuestion(reply);
      
      if (result.isComplete) {
        // Show the progress component for analysis generation
        setIsGeneratingFinalAnalysis(true);
        
        // Show encouraging message for final analysis
        toast({
          title: "🎯 Creating Your Custom Automation Strategy",
          description: "This takes 30-60 seconds as we craft your personalized automation roadmap...",
          duration: 8000,
        });
        
        // Redirect to results page after showing progress
        setTimeout(() => {
          window.location.href = "/results";
        }, 35000); // 35 seconds for progress animation
      } else if (result.nextQuestion) {
        // Add AI response message
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: result.nextQuestion.text,
          isUser: false,
          timestamp: formatTimestamp(new Date()),
          quickReplies: result.nextQuestion.suggestions || [],
          messageType: 'question'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
      // Refresh messages from server to sync
      setTimeout(() => refetch(), 500);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process response",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (consultationComplete) {
      if (content.toLowerCase().includes("start over") || content.toLowerCase().includes("reset")) {
        await handleReset();
        return;
      }
      if (content.toLowerCase().includes("schedule")) {
        window.open("https://calendly.com/sellspark", "_blank");
        return;
      }
    }

    await handleQuickReply(content);
  };

  const handleReset = async () => {
    try {
      await resetConsultation();
      setConsultationStarted(false);
      setConsultationComplete(false);
      setShowSummary(false);
      setWebsiteAnalysis(null);
      setMessages([]);
      setIsGeneratingFinalAnalysis(false);
      
      // Clear all session storage data
      sessionStorage.removeItem('websiteUrl');
      sessionStorage.removeItem('lastWebsiteUrl');
      
      // Force page reload to ensure clean state
      window.location.reload();
      
      toast({
        title: "Consultation Reset",
        description: "Starting fresh consultation process",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset consultation",
        variant: "destructive",
      });
    }
  };

  const handleTestFinal = async () => {
    try {
      const response = await fetch('/api/consultation/test-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setConsultationStarted(true);
        setConsultationComplete(true);
        refetch();
        
        toast({
          title: "Test Analysis Loaded",
          description: "Sample final analysis with working accordions",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to load test analysis",
        variant: "destructive",
      });
    }
  };

  const showWebsiteInput = !consultationStarted && !showSummary && !consultationComplete;

  // Show progress component when generating final analysis
  if (isGeneratingFinalAnalysis) {
    return <AnalysisGenerationProgress />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full mx-auto bg-[#0F172A] dark:bg-[#0F172A]">
      <MainHeader />
      
      {showWebsiteInput && !isAnalyzing && (
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 px-4">
                Welcome to SellSpark AI Consultation
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 px-4">
                Get personalized automation recommendations for your business in just 5 minutes
              </p>
            </div>
            <WebsiteInput onSubmit={handleWebsiteSubmit} isLoading={isAnalyzing} />
            
            <div className="mt-6 text-center">
              <button
                onClick={handleTestFinal}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                Test Final Analysis (Skip to Results)
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isAnalyzing && (
        <div>
          <AnalysisProgress isAnalyzing={isAnalyzing} />
          <div className="text-center mt-4 space-x-4">
            <button
              onClick={() => {
                setIsAnalyzing(false);
                setShowSummary(false);
                setConsultationStarted(true);
                setTimeout(() => {
                  refetch();
                  refetchSession();
                }, 100);
              }}
              className="bg-[#FFD700] hover:bg-[#FFB700] text-black px-4 py-2 rounded-lg font-medium"
            >
              Analysis Complete - Continue to Chat
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      
      {showSummary && websiteAnalysis && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-[#FFD700]">✨ Analysis Complete!</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Business Name:</span>
                      <p className="text-gray-900 dark:text-white text-lg">{websiteAnalysis.businessName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Business Type:</span>
                      <p className="text-gray-900 dark:text-white">{websiteAnalysis.businessType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Target Audience:</span>
                      <p className="text-gray-900 dark:text-white">{websiteAnalysis.targetAudience}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Key Services:</span>
                      <ul className="list-disc list-inside text-gray-900 dark:text-white space-y-1">
                        {websiteAnalysis.services?.map((service: string, index: number) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">Automation Opportunities Found:</span>
                      <ul className="list-disc list-inside text-gray-900 dark:text-white space-y-1">
                        {websiteAnalysis.challenges?.slice(0, 3).map((challenge: string, index: number) => (
                          <li key={index}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleContinueFromSummary}
                className="bg-[#FFD700] hover:bg-[#FFB700] text-black px-8 py-4 rounded-lg font-medium text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Personalized Consultation →
              </button>
              <p className="text-sm text-gray-500 mt-3">Get your custom automation roadmap based on this analysis</p>
            </div>
          </div>
        </div>
      )}
      
      {consultationStarted && !showSummary && (
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1">
            <ChatMessages 
              messages={messages} 
              isTyping={isTyping} 
            />
          </div>
        </div>
      )}
      
      {consultationStarted && (
        <div className="bg-[#1E293B] dark:bg-[#1E293B] border-t border-gray-700 dark:border-gray-700">
          {/* Show quick replies above input */}
          {messages.length > 0 && messages[messages.length - 1] && 
           !messages[messages.length - 1].isUser && 
           messages[messages.length - 1].quickReplies && 
           Array.isArray(messages[messages.length - 1].quickReplies) &&
           messages[messages.length - 1].quickReplies!.length > 0 && (
            <QuickReplies
              replies={messages[messages.length - 1].quickReplies!}
              onReply={handleQuickReply}
              disabled={isTyping}
            />
          )}
          
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      )}

    </div>
  );
}
