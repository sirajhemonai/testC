import { apiRequest } from "./queryClient";

export interface ConsultationSession {
  id: number;
  websiteUrl: string | null;
  businessSummary: string | null;
  currentStep: number;
  userResponses: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteAnalysis {
  businessName: string;
  businessType: string;
  industry?: string;
  services: string[];
  targetAudience: string;
  summary?: string;
  challenges?: string[];
  specificTools?: string[];
  implementations?: string[];
}

export interface QuestionResponse {
  question: string;
  quickReplies: string[];
}

export async function startConsultation(websiteUrl: string): Promise<{
  session: ConsultationSession;
  websiteAnalysis: WebsiteAnalysis;
  firstQuestion: QuestionResponse;
}> {
  const response = await apiRequest("/api/consultation/start", {
    method: "POST",
    body: JSON.stringify({ websiteUrl }),
  });

  return response.json();
}

export async function respondToQuestion(response: string): Promise<{
  isComplete: boolean;
  nextQuestion?: QuestionResponse;
  finalAnalysis?: string;
}> {
  const apiResponse = await apiRequest("/api/consultation/respond", {
    method: "POST",
    body: JSON.stringify({ response }),
  });

  return apiResponse.json();
}

export async function getCurrentSession(): Promise<ConsultationSession | null> {
  try {
    const response = await apiRequest("/api/consultation/current");
    const data = await response.json();
    return data.session;
  } catch (error) {
    return null;
  }
}

export async function resetConsultation(): Promise<void> {
  await apiRequest("/api/consultation/reset", {
    method: "POST",
  });
}