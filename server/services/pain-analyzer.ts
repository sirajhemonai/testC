import { GoogleGenAI } from "@google/genai";
// import { searchSimilarContexts } from "./pinecone";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Pain taxonomy - 8 core friction buckets
export const PAIN_BUCKETS = {
  LEAD_FLOW: "lead_flow",
  FOLLOW_UP: "follow_up", 
  ONBOARDING: "onboarding",
  ACCOUNTABILITY: "accountability",
  CONTENT: "content",
  UPSELL: "upsell",
  RETENTION: "retention",
  ADMIN: "admin"
} as const;

export type PainBucket = typeof PAIN_BUCKETS[keyof typeof PAIN_BUCKETS];

// Coach personas for micro-forking
export const COACH_PERSONAS = {
  SOLO_SCALING_SALLY: {
    id: "solo_scaling_sally",
    name: "Solo Scaling Sally",
    description: "One-person show trying to scale without burning out",
    painWeights: {
      [PAIN_BUCKETS.ADMIN]: 1.3,
      [PAIN_BUCKETS.FOLLOW_UP]: 1.2,
      [PAIN_BUCKETS.LEAD_FLOW]: 1.1
    }
  },
  CONTENT_CRUSHED_CARL: {
    id: "content_crushed_carl", 
    name: "Content-Crushed Carl",
    description: "Struggles with consistent content creation and distribution",
    painWeights: {
      [PAIN_BUCKETS.CONTENT]: 1.4,
      [PAIN_BUCKETS.FOLLOW_UP]: 1.2,
      [PAIN_BUCKETS.ADMIN]: 1.1
    }
  },
  OVERWHELMED_OLIVIA: {
    id: "overwhelmed_olivia",
    name: "Overwhelmed Olivia",
    description: "Too many clients, not enough systems",
    painWeights: {
      [PAIN_BUCKETS.ACCOUNTABILITY]: 1.3,
      [PAIN_BUCKETS.ONBOARDING]: 1.2,
      [PAIN_BUCKETS.RETENTION]: 1.1
    }
  },
  GROWTH_GURU_GARY: {
    id: "growth_guru_gary",
    name: "Growth Guru Gary", 
    description: "Established coach looking to maximize revenue per client",
    painWeights: {
      [PAIN_BUCKETS.UPSELL]: 1.4,
      [PAIN_BUCKETS.RETENTION]: 1.2,
      [PAIN_BUCKETS.ACCOUNTABILITY]: 1.1
    }
  },
  TECH_TIRED_TINA: {
    id: "tech_tired_tina",
    name: "Tech-Tired Tina",
    description: "Avoids technology, wants simple solutions",
    painWeights: {
      [PAIN_BUCKETS.ADMIN]: 1.3,
      [PAIN_BUCKETS.FOLLOW_UP]: 1.2,
      [PAIN_BUCKETS.LEAD_FLOW]: 1.1
    }
  }
} as const;

export type CoachPersona = typeof COACH_PERSONAS[keyof typeof COACH_PERSONAS];

// Pain matrix interface
export interface PainMatrix {
  [key: string]: number; // bucket: score (0-10)
}

// Update pain matrix based on user response
export async function updatePainMatrix(
  currentMatrix: PainMatrix,
  userAnswer: string,
  questionContext: string
): Promise<PainMatrix> {
  try {
    const systemPrompt = `You are a pain analysis engine for coaching businesses. 

Analyze the user's answer and assign pain scores (0-10) to relevant buckets:
- lead_flow: Attracting and capturing new prospects
- follow_up: Nurturing leads and staying in touch 
- onboarding: Getting new clients started smoothly
- accountability: Keeping clients engaged and on track
- content: Creating and distributing valuable content
- upsell: Increasing revenue from existing clients
- retention: Preventing client churn
- admin: Administrative tasks and operations

Context: ${questionContext}
User Answer: ${userAnswer}

Return ONLY a JSON object with pain scores. Only include buckets that are relevant (score > 0).
Example: {"follow_up": 7, "admin": 4}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          additionalProperties: {
            type: "number"
          }
        }
      },
      contents: systemPrompt
    });

    const painUpdate = JSON.parse(response.text || "{}");
    
    // Merge with existing matrix (cumulative scoring)
    const updatedMatrix = { ...currentMatrix };
    for (const [bucket, score] of Object.entries(painUpdate)) {
      updatedMatrix[bucket] = (updatedMatrix[bucket] || 0) + (score as number);
      // Cap at 10
      updatedMatrix[bucket] = Math.min(updatedMatrix[bucket], 10);
    }

    return updatedMatrix;
  } catch (error) {
    console.error("Error updating pain matrix:", error);
    return currentMatrix;
  }
}

// Assign persona based on pain matrix
export function assignPersona(painMatrix: PainMatrix): CoachPersona | null {
  // Check if any two buckets surpass 7/10
  const highPainBuckets = Object.entries(painMatrix)
    .filter(([_, score]) => score >= 7)
    .map(([bucket, _]) => bucket);

  if (highPainBuckets.length < 2) {
    return null;
  }

  // Find best matching persona based on pain pattern
  let bestPersona: CoachPersona | null = null;
  let bestScore = 0;

  for (const persona of Object.values(COACH_PERSONAS)) {
    let score = 0;
    for (const [bucket, weight] of Object.entries(persona.painWeights)) {
      score += (painMatrix[bucket] || 0) * weight;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestPersona = persona;
    }
  }

  return bestPersona;
}

// Generate next question based on greatest information gain
export async function generateNextQuestion(
  painMatrix: PainMatrix,
  previousQuestions: string[],
  businessContext: string
): Promise<string> {
  try {
    // Find bucket with highest potential for information gain
    const sortedBuckets = Object.entries(painMatrix)
      .sort(([, a], [, b]) => b - a);
    
    let targetBucket: PainBucket = PAIN_BUCKETS.LEAD_FLOW; // default
    
    // If we have scores, target the highest incomplete bucket
    if (sortedBuckets.length > 0) {
      const highestBucket = sortedBuckets[0][0];
      targetBucket = highestBucket as PainBucket;
    }

    // Search for question templates (placeholder for Pinecone integration)
    const searchQuery = `${targetBucket} coaching business question interview discovery`;
    // const contexts = await searchSimilarContexts(searchQuery, 3);
    
    const systemPrompt = `You are an expert business consultant conducting a discovery interview with a coach.

Business Context: ${businessContext}
Target Pain Area: ${targetBucket.replace('_', ' ')}
Current Pain Scores: ${JSON.stringify(painMatrix)}
Previous Questions: ${previousQuestions.join(', ')}

Generate ONE specific, conversational question that:
1. Focuses on the ${targetBucket.replace('_', ' ')} area
2. Hasn't been asked before
3. Will reveal actionable pain points
4. Feels natural and consultant-like
5. Is specific to coaching businesses

Return ONLY the question text, no explanations.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: systemPrompt
    });

    return response.text || "Tell me more about your biggest daily challenge.";
  } catch (error) {
    console.error("Error generating next question:", error);
    return "What's your biggest challenge in running your coaching business?";
  }
}

// Analyze business for personalized automation recommendations
export async function analyzeBusinessForAutomation(
  painMatrix: PainMatrix,
  persona: CoachPersona | null,
  userResponses: Record<string, any>,
  businessSummary: string
): Promise<{
  recommendations: Array<{
    title: string;
    score: number;
    painAddressed: string[];
    effortScore: number;
    headline: string;
    badgeColor: string;
    paybackDays: number;
    reasonQuote: string;
  }>;
  analysis: string;
}> {
  try {
    const systemPrompt = `You are an automation expert analyzing a coaching business for personalized recommendations.

Business Summary: ${businessSummary}
Pain Matrix: ${JSON.stringify(painMatrix)}
Persona: ${persona ? `${persona.name} - ${persona.description}` : 'Not yet assigned'}
User Responses: ${JSON.stringify(userResponses)}

Create 3-5 automation recommendations ranked by impact. For each recommendation:

1. Calculate a relevance score (0-100) based on pain matrix alignment
2. Identify which pain buckets it addresses
3. Estimate effort score (1-10, where 1=easy setup)
4. Generate a compelling headline with time/money savings
5. Assign badge color: green (low risk), orange (medium risk), red (high risk)
6. Estimate payback in days
7. Include a "why we chose this" sentence that quotes the user's actual words

Return as JSON with this structure:
{
  "recommendations": [
    {
      "title": "Smart Lead Scoring System",
      "score": 85,
      "painAddressed": ["lead_flow", "follow_up"],
      "effortScore": 3,
      "headline": "Save 12 hrs/week, pays back in 8 days",
      "badgeColor": "green",
      "paybackDays": 8,
      "reasonQuote": "You mentioned struggling with 'too many unqualified leads'"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  score: { type: "number" },
                  painAddressed: { type: "array", items: { type: "string" } },
                  effortScore: { type: "number" },
                  headline: { type: "string" },
                  badgeColor: { type: "string" },
                  paybackDays: { type: "number" },
                  reasonQuote: { type: "string" }
                }
              }
            }
          }
        }
      },
      contents: systemPrompt
    });

    const result = JSON.parse(response.text || '{"recommendations": []}');
    
    // Generate full analysis HTML
    const analysisPrompt = `Create a comprehensive automation analysis report in HTML format.
    
Business: ${businessSummary}
Pain Points: ${JSON.stringify(painMatrix)}
Recommendations: ${JSON.stringify(result.recommendations)}

Create an engaging, well-formatted HTML report that explains the recommendations with:
- Executive summary highlighting key pain points
- Detailed breakdown of each automation
- Expected ROI and implementation timeline
- Next steps for getting started

Use inline CSS with SellSpark branding (gold #FFD700, professional styling).`;

    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro", 
      contents: analysisPrompt
    });

    return {
      recommendations: result.recommendations,
      analysis: analysisResponse.text || ""
    };
  } catch (error) {
    console.error("Error analyzing business for automation:", error);
    return {
      recommendations: [],
      analysis: "<p>Error generating recommendations. Please try again.</p>"
    };
  }
}