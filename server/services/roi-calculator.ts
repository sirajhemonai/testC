import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ROI Metrics interface
export interface ROIMetrics {
  recipeId: string;
  recipeTitle: string;
  medianROI: number;
  paybackDays: number;
  p75ROI: number;
  monthlyTimeSaved: number; // hours
  monthlyCostSaved: number; // dollars
  implementationCost: number;
  confidenceLevel: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

// Coach profile for ROI calculations
export interface CoachProfile {
  monthlyRevenue: number;
  hourlyRate: number;
  clientCount: number;
  businessModel: 'solo' | 'team' | 'agency';
  techComfort: 'low' | 'medium' | 'high';
}

// Benchmark data (simulated - in real implementation would come from database/BigQuery)
const AUTOMATION_BENCHMARKS = {
  'smart_lead_scoring': {
    avgTimeSavedHours: 12,
    avgCostSavedPercent: 15,
    implementationDays: 7,
    successRate: 85,
    paybackDaysRange: [5, 15],
    roiRange: [200, 500]
  },
  'automated_follow_up': {
    avgTimeSavedHours: 8,
    avgCostSavedPercent: 20,
    implementationDays: 5,
    successRate: 90,
    paybackDaysRange: [3, 12],
    roiRange: [150, 400]
  },
  'client_onboarding': {
    avgTimeSavedHours: 6,
    avgCostSavedPercent: 10,
    implementationDays: 10,
    successRate: 80,
    paybackDaysRange: [8, 20],
    roiRange: [120, 300]
  },
  'content_automation': {
    avgTimeSavedHours: 15,
    avgCostSavedPercent: 25,
    implementationDays: 14,
    successRate: 75,
    paybackDaysRange: [10, 25],
    roiRange: [180, 450]
  },
  'admin_automation': {
    avgTimeSavedHours: 10,
    avgCostSavedPercent: 12,
    implementationDays: 7,
    successRate: 88,
    paybackDaysRange: [6, 18],
    roiRange: [150, 350]
  }
};

// Monte Carlo simulation for ROI calculation
export function calculateROI(
  recipes: string[],
  coachProfile: CoachProfile
): ROIMetrics[] {
  const results: ROIMetrics[] = [];

  for (const recipeId of recipes) {
    const benchmark = AUTOMATION_BENCHMARKS[recipeId as keyof typeof AUTOMATION_BENCHMARKS];
    
    if (!benchmark) continue;

    // Monte Carlo simulation (simplified)
    const simulations = 1000;
    const roiResults: number[] = [];
    const paybackResults: number[] = [];

    for (let i = 0; i < simulations; i++) {
      // Random factors
      const timeSavedVariation = 0.7 + Math.random() * 0.6; // 70-130% of benchmark
      const successFactor = Math.random() < (benchmark.successRate / 100) ? 1 : 0.3;
      const revenueMultiplier = getRevenueMultiplier(coachProfile.monthlyRevenue);
      
      // Calculate time saved in hours per month
      const monthlyTimeSaved = benchmark.avgTimeSavedHours * timeSavedVariation * successFactor;
      
      // Calculate cost saved (time value + efficiency gains)
      const timeCostSaved = monthlyTimeSaved * coachProfile.hourlyRate;
      const efficiencyGains = (coachProfile.monthlyRevenue * benchmark.avgCostSavedPercent / 100) * revenueMultiplier;
      const totalMonthlySavings = timeCostSaved + efficiencyGains;
      
      // Implementation cost (varies by tech comfort and business model)
      const baseCost = benchmark.implementationDays * 50; // $50/day base rate
      const techMultiplier = coachProfile.techComfort === 'low' ? 1.5 : coachProfile.techComfort === 'high' ? 0.8 : 1.0;
      const implementationCost = baseCost * techMultiplier;
      
      // Calculate ROI and payback
      const monthlyROI = (totalMonthlySavings / implementationCost) * 100;
      const paybackDays = (implementationCost / (totalMonthlySavings / 30));
      
      roiResults.push(monthlyROI);
      paybackResults.push(paybackDays);
    }

    // Calculate percentiles
    roiResults.sort((a, b) => a - b);
    paybackResults.sort((a, b) => a - b);
    
    const medianROI = roiResults[Math.floor(simulations * 0.5)];
    const p75ROI = roiResults[Math.floor(simulations * 0.75)];
    const medianPayback = paybackResults[Math.floor(simulations * 0.5)];
    
    // Determine risk level
    const riskLevel = medianPayback < 30 ? 'low' : medianPayback < 90 ? 'medium' : 'high';
    
    results.push({
      recipeId,
      recipeTitle: formatRecipeTitle(recipeId),
      medianROI: Math.round(medianROI),
      paybackDays: Math.round(medianPayback),
      p75ROI: Math.round(p75ROI),
      monthlyTimeSaved: benchmark.avgTimeSavedHours,
      monthlyCostSaved: Math.round((coachProfile.monthlyRevenue * benchmark.avgCostSavedPercent / 100)),
      implementationCost: Math.round(benchmark.implementationDays * 50 * (coachProfile.techComfort === 'low' ? 1.5 : 1.0)),
      confidenceLevel: benchmark.successRate,
      riskLevel: riskLevel as 'low' | 'medium' | 'high'
    });
  }

  // Sort by ROI descending
  return results.sort((a, b) => b.medianROI - a.medianROI);
}

// Helper function to get revenue multiplier based on business size
function getRevenueMultiplier(monthlyRevenue: number): number {
  if (monthlyRevenue < 5000) return 0.8;
  if (monthlyRevenue < 15000) return 1.0;
  if (monthlyRevenue < 50000) return 1.2;
  return 1.5;
}

// Helper function to format recipe titles
function formatRecipeTitle(recipeId: string): string {
  const titles: Record<string, string> = {
    'smart_lead_scoring': 'Smart Lead Scoring System',
    'automated_follow_up': 'Automated Follow-up Sequences',
    'client_onboarding': 'Client Onboarding Automation',
    'content_automation': 'Content Creation & Distribution',
    'admin_automation': 'Administrative Task Automation'
  };
  return titles[recipeId] || recipeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ROI Narrative Translator using GPT-style prompt
export async function generateROINarratives(
  roiMetrics: ROIMetrics[],
  coachProfile: CoachProfile
): Promise<Array<{
  recipeId: string;
  headline: string;
  explainer: string;
  badgeColor: string;
}>> {
  try {
    const systemPrompt = `You are the SellSpark ROI Narrator. Your role is to translate automation ROI data into compelling, confident narratives.

Coach Profile:
- Monthly Revenue: $${coachProfile.monthlyRevenue.toLocaleString()}
- Hourly Rate: $${coachProfile.hourlyRate}
- Business Model: ${coachProfile.businessModel}
- Tech Comfort: ${coachProfile.techComfort}

For EACH automation recipe, create:
1. A headline (≤12 words) including medianROI or paybackDays
2. A one-sentence explanation ending with a motivating verb
3. Badge color based on payback days: green (<30), amber (30-90), red (>90)

Style: Confident but no hype. Use 2nd-person ("you"). Focus on concrete outcomes.

ROI Data: ${JSON.stringify(roiMetrics)}

Return JSON array: [{"recipeId": "...", "headline": "...", "explainer": "...", "badgeColor": "..."}]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              recipeId: { type: "string" },
              headline: { type: "string" },
              explainer: { type: "string" },
              badgeColor: { type: "string" }
            }
          }
        }
      },
      contents: systemPrompt
    });

    const narratives = JSON.parse(response.text || "[]");
    
    // Ensure badge colors are correct
    return narratives.map((narrative: any, index: number) => {
      const metric = roiMetrics[index];
      const badgeColor = metric ? (
        metric.paybackDays < 30 ? 'green' : 
        metric.paybackDays < 90 ? 'amber' : 'red'
      ) : 'amber';
      
      return {
        ...narrative,
        badgeColor
      };
    });
  } catch (error) {
    console.error("Error generating ROI narratives:", error);
    
    // Fallback narratives
    return roiMetrics.map(metric => ({
      recipeId: metric.recipeId,
      headline: `${metric.medianROI}% ROI in ${metric.paybackDays} days`,
      explainer: `Save ${metric.monthlyTimeSaved} hours monthly while boosting efficiency—so you pocket the gains, not the platform.`,
      badgeColor: metric.paybackDays < 30 ? 'green' : metric.paybackDays < 90 ? 'amber' : 'red'
    }));
  }
}

// Extract coach profile from consultation data
export function extractCoachProfile(
  businessSummary: string,
  userResponses: Record<string, any>
): CoachProfile {
  // Extract or estimate key metrics from consultation data
  const monthlyRevenue = estimateRevenue(businessSummary, userResponses);
  const hourlyRate = estimateHourlyRate(monthlyRevenue, userResponses);
  const clientCount = estimateClientCount(userResponses);
  const businessModel = determineBusinessModel(userResponses);
  const techComfort = assessTechComfort(userResponses);

  return {
    monthlyRevenue,
    hourlyRate,
    clientCount,
    businessModel,
    techComfort
  };
}

function estimateRevenue(businessSummary: string, responses: Record<string, any>): number {
  // Look for revenue indicators in responses
  const revenueKeywords = ['revenue', 'income', 'monthly', 'clients', 'price'];
  let estimate = 10000; // default

  // Simple heuristic based on business complexity and client mentions
  const summaryLower = businessSummary.toLowerCase();
  if (summaryLower.includes('enterprise') || summaryLower.includes('corporate')) estimate = 25000;
  else if (summaryLower.includes('premium') || summaryLower.includes('high-end')) estimate = 18000;
  else if (summaryLower.includes('startup') || summaryLower.includes('new')) estimate = 5000;

  return estimate;
}

function estimateHourlyRate(monthlyRevenue: number, responses: Record<string, any>): number {
  // Estimate based on revenue and typical coaching rates
  return Math.max(50, Math.min(500, monthlyRevenue / 20));
}

function estimateClientCount(responses: Record<string, any>): number {
  // Look for client count indicators
  const responseText = JSON.stringify(responses).toLowerCase();
  if (responseText.includes('dozens') || responseText.includes('many')) return 25;
  if (responseText.includes('several') || responseText.includes('few')) return 8;
  return 15; // default
}

function determineBusinessModel(responses: Record<string, any>): 'solo' | 'team' | 'agency' {
  const responseText = JSON.stringify(responses).toLowerCase();
  if (responseText.includes('team') || responseText.includes('staff')) return 'team';
  if (responseText.includes('agency') || responseText.includes('company')) return 'agency';
  return 'solo';
}

function assessTechComfort(responses: Record<string, any>): 'low' | 'medium' | 'high' {
  const responseText = JSON.stringify(responses).toLowerCase();
  if (responseText.includes('tech') && responseText.includes('struggle')) return 'low';
  if (responseText.includes('automation') || responseText.includes('software')) return 'high';
  return 'medium';
}