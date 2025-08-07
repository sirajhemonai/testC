import { GoogleGenAI } from "@google/genai";
import { configService } from "./config";
import { pineconeService } from "./pinecone";

let ai: GoogleGenAI;

async function getAI(): Promise<GoogleGenAI> {
  if (!ai) {
    const apiKey = await configService.getApiKey("GEMINI_API_KEY");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export interface AutomationAnalysis {
  businessType: string;
  targetAudience: string;
  mainServices: string[];
  automationOpportunities: string[];
  suggestedQuestions: string[];
}

export async function analyzeBusinessForAutomation(
  businessSummary: string,
  userGoals: string,
  userResponses: Record<string, string>
): Promise<string> {
  try {
    // Parse enhanced data from user responses
    const parsedResponses = typeof userResponses === 'string' ? JSON.parse(userResponses) : userResponses;
    const businessType = parsedResponses.businessType || userResponses.businessType || 'Not specified';
    const businessName = parsedResponses.businessName || 'your business';
    const targetAudience = parsedResponses.targetAudience || 'customers';
    const services = parsedResponses.services || [];
    
    // Search for relevant training contexts
    let trainingInsights = "";
    try {
      const query = `${businessSummary} ${userGoals} ${JSON.stringify(userResponses)}`;
      const contexts = await pineconeService.searchSimilarContexts(query, 5);
      if (contexts.length > 0) {
        trainingInsights = "\n\nRelevant Training Insights:\n" +
          contexts.map(ctx => `- ${ctx.title}: ${ctx.content}`).join("\n");
      }
    } catch (error) {
      console.error("Error searching training contexts:", error);
    }
    
    // Step 1: Business data summary
    const businessDataSummary = {
      name: businessName,
      type: businessType,
      services: services,
      targetAudience: targetAudience,
      painPoint: userResponses.painPoint || 'operational efficiency',
      revenueImpact: userResponses.revenueImpact || 'revenue growth',
      timeline: userResponses.timeline || 'within 30 days',
      techStack: userResponses.techStack || 'basic tools',
      successMetric: userResponses.successMetric || 'time saved'
    };

    // Step 2: Use Perplexity to find industry-specific automation solutions
    const industryResearch = await searchIndustryAutomation(businessType, businessDataSummary.painPoint);

    // Step 3: Generate coaching-specific recommendations using our kb.md automations
    const prompt = `You are SellSpark's coaching automation expert. Create exactly 3-4 SPECIFIC automation solutions for ${businessName} using ONLY automations from our knowledge base.

Coach Profile:
- Coach: ${businessDataSummary.name} (${businessDataSummary.type})
- Specialty: ${businessDataSummary.services.join(", ")}
- Clients: ${businessDataSummary.targetAudience}
- Main Challenge: ${businessDataSummary.painPoint}
- Growth Goal: ${businessDataSummary.revenueImpact}
- Timeline: ${businessDataSummary.timeline}
- Current Tools: ${businessDataSummary.techStack}
- Success Vision: ${businessDataSummary.successMetric}

Available Coaching Automations from KB:
${trainingInsights}

Based on their pain points, recommend SPECIFIC automations that coaches actually need:

For LEAD GENERATION challenges, suggest:
- AI-powered micro-funnels from content (IG, TikTok, email)
- Instagram DM auto-responder with booking links
- Website chat to calendar conversion
- Social media lead capture systems

For CONTENT CREATION challenges, suggest:
- AI content creation system (learns their voice)
- Weekly post generation across formats
- Content batching and scheduling automation

For CLIENT ONBOARDING challenges, suggest:
- Automated welcome sequences with forms
- Client intake assistants for health/goals
- Payment processing and access setup flows

For FOLLOW-UP challenges, suggest:
- Discovery call follow-up sequences
- No-show re-engagement systems
- Lead nurture email automation

Create coach-specific recommendations with:
1. Make.com, Zapier, or Manychat implementations
2. Exact tools mentioned in kb.md (ChatGPT, Airtable, Tally, etc.)
3. Coach-specific ROI (hours saved, leads increased)
4. Real coaching business impacts

CRITICAL: Use this EXACT HTML format:

<div style="background-color: #FFF7E6; color: #1a1a1a; padding: 28px; border-radius: 16px; margin-bottom: 28px; border: 3px solid #FFD700; box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);">
  <p style="color: #333333; margin: 0; font-size: 17px; line-height: 1.7;">Based on analyzing ${businessName}, here are the exact automation solutions that will transform your ${businessType} business. Each is designed to directly address your key challenges: ${userResponses.painPoints || 'converting leads and saving time'} in your ${businessType}.</p>
</div>

For each recommendation:
<div style="margin-bottom: 24px; background: #ffffff; border: 2px solid #FFD700; border-radius: 16px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
  <div style="display: flex; align-items: start; gap: 20px;">
    <div style="font-size: 40px; flex-shrink: 0;">[EMOJI]</div>
    <div style="flex: 1;">
      <h3 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">[SPECIFIC SOLUTION NAME]</h3>
      <p style="color: #666666; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">[What it does - be specific to their business]</p>
      
      <div style="background: #FFF7E6; padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #FFD700;">
        <p style="color: #1a1a1a; margin: 0; font-size: 15px; line-height: 1.6;">
          <strong style="color: #B8860B;">How it works:</strong><br>
          [Simple step like: "New lead from website"] → [What happens: "AI enriches data & scores them"] → [Result: "You get alert + automated follow-up starts"]<br>
          <span style="color: #666666; font-size: 14px;">⚡ Your competitors take 24-48 hours. You'll respond in 5 minutes.</span>
        </p>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
        <span style="background: #FFD700; color: #1a1a1a; padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 600;">[Platform]</span>
        <span style="background: #f0f0f0; color: #1a1a1a; padding: 8px 16px; border-radius: 24px; font-size: 14px;">[Tool 1]</span>
        <span style="background: #f0f0f0; color: #1a1a1a; padding: 8px 16px; border-radius: 24px; font-size: 14px;">[Tool 2]</span>
        <span style="background: #E8F5E9; color: #2E7D32; padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 600;">💰 ~$[X]/month</span>
      </div>
      
      <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #4CAF50;">
        <p style="color: #1a1a1a; margin: 0; font-size: 15px; line-height: 1.7;">
          <strong style="color: #2E7D32;">Expected Results:</strong><br>
          ✓ [Specific measurable outcome with numbers]<br>
          ✓ [Time/money saved per week/month]<br>
          ✓ [Business impact - growth percentage]
        </p>
      </div>
    </div>
  </div>
</div>

End with:
<div style="background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%); padding: 32px; border-radius: 20px; text-align: center; margin-top: 40px; box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);">
  <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">Ready to Automate Your Coaching Business?</h3>
  <p style="color: #333333; margin: 0 0 24px 0; font-size: 18px; line-height: 1.6;">We provide <strong>any type of custom automation services</strong> for coaches. Get your personalized automation solution built by experts.</p>
  
  <div style="background: rgba(255,255,255,0.9); padding: 24px; border-radius: 16px; margin: 24px 0; border: 2px solid #FFD700;">
    <h4 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Our Custom Automation Process:</h4>
    <div style="color: #333333; font-size: 16px; line-height: 1.8; text-align: left;">
      <p style="margin: 0 0 12px 0;"><strong>1. Send Details:</strong> Contact us via form or WhatsApp with your automation needs</p>
      <p style="margin: 0 0 12px 0;"><strong>2. Analysis:</strong> We check and find the best solution for your business</p>
      <p style="margin: 0 0 12px 0;"><strong>3. Demo Call:</strong> We show you exactly how it works via personalized call</p>
      <p style="margin: 0 0 12px 0;"><strong>4. Confirm & Build:</strong> You confirm and we build and deliver your automation</p>
      <p style="margin: 0; color: #B8860B; font-weight: 600;">💰 Starting from only $100 (cost depends on complexity)</p>
    </div>
  </div>
  
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center; flex-wrap: wrap; margin: 24px 0;">
    <a href="https://wa.me/8801919201192" style="text-decoration: none;">
      <div style="background: #25D366; color: white; padding: 16px 32px; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 18px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
        📱 WhatsApp: +8801919201192
      </div>
    </a>
    <a href="https://calendly.com/sellspark" style="text-decoration: none;">
      <div style="background: #1a1a1a; color: #FFD700; padding: 16px 32px; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 18px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        📅 Schedule Call
      </div>
    </a>
  </div>
  
  <p style="color: #666666; margin: 20px 0 0 0; font-size: 16px;">
    ⚡ <strong>Quick response guaranteed</strong><br>
    <span style="font-size: 14px;">Join coaches already saving 15+ hours per week with our automations</span>
  </p>
</div>`;

    const gemini = await getAI();
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || generateFallbackAnalysis(userResponses);
  } catch (error) {
    console.error("Error in analyzeBusinessForAutomation:", error);
    return generateFallbackAnalysis(userResponses);
  }
}

// Industry research using Perplexity API
async function searchIndustryAutomation(businessType: string, painPoint: string): Promise<string> {
  try {
    const perplexityApiKey = await configService.getApiKey("PERPLEXITY_API_KEY");
    if (!perplexityApiKey) {
      return getDefaultIndustryResearch(businessType);
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an automation research expert. Find the most effective AI agents and automation solutions for specific industries.'
          },
          {
            role: 'user',
            content: `Find the most effective AI agents and automation solutions for ${businessType} businesses that solve "${painPoint}". Focus on:
1. Tools that work with Make.com, n8n, or Zapier
2. Real success stories and case studies
3. Specific implementation strategies
4. ROI data and metrics
5. Cost estimates

Include recent innovations and what leading ${businessType} companies are using.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return getDefaultIndustryResearch(businessType);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Perplexity research error:", error);
    return getDefaultIndustryResearch(businessType);
  }
}

function getDefaultIndustryResearch(businessType: string): string {
  const industryData = {
    'SaaS': `Leading SaaS companies use: Intercom for AI support (80% ticket reduction), Apollo.io for lead scoring, Make.com for onboarding automation. Average ROI: 400% in 3 months.`,
    'E-commerce': `Top e-commerce brands use: Klaviyo for email automation (30% revenue increase), Gorgias for support, Make.com for inventory alerts. Average savings: 20 hours/week.`,
    'Agency': `Successful agencies use: ClickUp + Make.com for project automation, Instantly for outreach, Loom for async updates. Client retention improved by 40%.`,
    'Consulting': `Top consultants use: Calendly + Zapier for booking, Notion AI for proposals, automated invoice systems. Revenue per client increased 25%.`,
  };

  return industryData[businessType as keyof typeof industryData] || `Industry leaders in ${businessType} report 15+ hours saved weekly using Make.com, Zapier, and AI tools for customer engagement and operations.`;
}

function generateFallbackAnalysis(userResponses: Record<string, string>): string {
  const businessType = userResponses.businessType || "business";
  const automationGoals = userResponses.automationGoals || "automation";
  const name = userResponses.name || "there";
  
  return `
<div style="background-color: #FFF7E6; color: #1a1a1a; padding: 28px; border-radius: 16px; margin-bottom: 28px; border: 3px solid #FFD700; box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);">
  <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">⚡ Your SellSpark Automation Blueprint</h2>
  <p style="color: #333333; margin: 0; font-size: 17px; line-height: 1.7;">Hi ${name}! 👋 Based on your ${businessType} business and focus on ${automationGoals}, here's your personalized automation roadmap that can <strong style="color: #B8860B;">save you 10+ hours per week</strong> while sparking explosive growth:</p>
</div>

<div style="margin-bottom: 20px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); padding: 18px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin: 0; color: var(--text-primary, #333333); font-size: 18px;">🎯 Smart Lead Magnetism & Follow-up Engine</h3>
    <span style="font-size: 20px; color: var(--text-primary, #333333); user-select: none; font-weight: bold;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 12px 12px; display: none; overflow: hidden;">
    <div style="padding: 20px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-weight: 600;">🔧 <strong>SellSpark Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 16px 20px; line-height: 1.7;">
        <li>🎪 <strong>Smart Lead Scoring:</strong> Automatically rank prospects based on website behavior and engagement</li>
        <li>💌 <strong>Personalized Sequences:</strong> Create dynamic follow-up campaigns that adapt to each lead's journey</li>
        <li>🚨 <strong>Instant VIP Alerts:</strong> Get notified immediately when hot prospects are ready to buy</li>
        <li>📈 <strong>Conversion Optimization:</strong> A/B test your messaging to maximize lead-to-customer conversion</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0; padding: 12px; background-color: var(--bg-primary, #fff7e6); border-radius: 8px; border-left: 4px solid #FFD700;">💰 <strong>Expected Results:</strong> Save 8-12 hours weekly while converting 35% more leads into paying customers. ROI typically 300-500% within 3 months.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); padding: 18px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin: 0; color: var(--text-primary, #333333); font-size: 18px;">🤖 AI-Powered Customer Experience Hub</h3>
    <span style="font-size: 20px; color: var(--text-primary, #333333); user-select: none; font-weight: bold;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 12px 12px; display: none; overflow: hidden;">
    <div style="padding: 20px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-weight: 600;">🔧 <strong>SellSpark Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 16px 20px; line-height: 1.7;">
        <li>🎭 <strong>24/7 AI Assistant:</strong> Deploy intelligent chatbots that handle 70% of customer inquiries instantly</li>
        <li>🎯 <strong>Smart Ticket Routing:</strong> Automatically categorize and assign support tickets to the right team member</li>
        <li>⚡ <strong>Priority Escalation:</strong> Instantly flag and escalate urgent issues to prevent customer churn</li>
        <li>📊 <strong>Satisfaction Tracking:</strong> Monitor and optimize customer happiness scores in real-time</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0; padding: 12px; background-color: var(--bg-primary, #fff7e6); border-radius: 8px; border-left: 4px solid #FFD700;">💰 <strong>Expected Results:</strong> Reduce response time by 80% and handle 70% of inquiries automatically. Increase customer satisfaction by 45% while reducing support costs.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 20px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); padding: 18px; border-radius: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h3 style="margin: 0; color: var(--text-primary, #333333); font-size: 18px;">📊 Revenue Intelligence & Growth Engine</h3>
    <span style="font-size: 20px; color: var(--text-primary, #333333); user-select: none; font-weight: bold;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 2px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 12px 12px; display: none; overflow: hidden;">
    <div style="padding: 20px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-weight: 600;">🔧 <strong>SellSpark Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 16px 20px; line-height: 1.7;">
        <li>🎯 <strong>Multi-Channel Data Fusion:</strong> Automatically collect and sync customer data from all touchpoints</li>
        <li>📈 <strong>Real-time Performance Dashboards:</strong> Monitor KPIs, revenue, and growth metrics that matter</li>
        <li>🚨 <strong>Predictive Alerts:</strong> Get warned about potential issues before they impact your bottom line</li>
        <li>💡 <strong>Growth Opportunity Finder:</strong> AI identifies untapped revenue streams and optimization opportunities</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0; padding: 12px; background-color: var(--bg-primary, #fff7e6); border-radius: 8px; border-left: 4px solid #FFD700;">💰 <strong>Expected Results:</strong> Eliminate manual data entry completely and gain instant insights for better decision-making. Identify 15-25% additional revenue opportunities.</p>
    </div>
  </div>
</div>

<div style="background-color: var(--bg-primary, #fff7e6); color: var(--text-primary, #333333); padding: 24px; border-radius: 16px; margin-top: 24px; border: 2px solid var(--border-color, #FFD700); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);">
  <h3 style="color: var(--text-primary, #333333); margin: 0 0 12px 0; font-size: 20px;">🚀 Ready to Spark Your Growth?</h3>
  <p style="color: var(--text-primary, #333333); margin: 0; font-size: 16px; line-height: 1.6;">These SellSpark automations can save you <strong>10+ hours per week</strong> while growing your business by 25-50%. We've helped 500+ businesses just like yours achieve explosive growth. <strong>Want to see how we can implement this for YOUR business?</strong></p>
  <p style="color: var(--text-primary, #333333); margin: 12px 0 0 0; font-weight: 600;">📞 Book a free strategy call with our founder, Siraj, and let's spark your success!</p>
</div>

<script>
function toggleAccordion(trigger) {
  const content = trigger.nextElementSibling;
  const arrow = trigger.querySelector('span');
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    arrow.textContent = '▲';
  } else {
    content.style.display = 'none';
    arrow.textContent = '▼';
  }
}
</script>
`;
}

export async function generatePersonalizedGreeting(businessData: {
  businessName: string;
  businessType: string;
  targetAudience: string;
  services: string[];
  challenges: string[];
  websiteUrl: string;
}): Promise<string> {
  try {
    const gemini = await getAI();
    
    const greetingPrompt = `You are SellSpark's AI automation consultant. Generate a warm, personalized greeting message for a coaching business consultation.

BUSINESS ANALYSIS:
- Business Name: ${businessData.businessName}
- Business Type: ${businessData.businessType}  
- Target Audience: ${businessData.targetAudience}
- Services: ${businessData.services.join(', ')}
- Key Challenges: ${businessData.challenges.join(', ')}
- Website: ${businessData.websiteUrl}

Create a greeting that:
1. Mentions their specific business name and shows you've analyzed their website
2. References their specific coaching niche or services (like gymnastics, fitness, etc.)
3. Shows understanding of their target audience
4. Hints at specific automation opportunities you've identified
5. Asks for their name to start the personalized consultation
6. Is warm, professional, and coaching-focused
7. Mentions specific details from their website to prove analysis

Make it conversational and show genuine understanding of their coaching business. Keep it under 3 sentences.

Example structure: "Hi! I've just finished analyzing [BusinessName] and I'm impressed with [specific detail about their coaching]. I can already see some powerful automation opportunities for [specific service/audience]. To create your personalized automation strategy, could you tell me your name?"

Generate only the greeting text, no JSON or extra formatting.`;

    const result = await gemini.models.generateContent({
      model: "gemini-1.5-flash",
      contents: greetingPrompt,
    });
    const response = result.text || "";
    
    return response.trim();
  } catch (error) {
    console.error("Error generating personalized greeting:", error);
    // Fallback to a somewhat personalized message
    return `Hi there! I've just analyzed ${businessData.businessName} and I can see great automation potential for your ${businessData.businessType} serving ${businessData.targetAudience}. To create your personalized automation strategy, could you tell me your name?`;
  }
}

export async function generateBusinessOverview(businessData: {
  businessName: string;
  businessType: string;
  targetAudience: string;
  services: string[];
  websiteUrl: string;
  rawAnalysisData?: any;
}): Promise<{
  businessName: string;
  businessType: string;
  coreServices: string[];
  automationOpportunity: string;
  whatsMissing: string;
  trustBuilders: string[];
  coachingSpecialty: string;
  targetMarket: string;
}> {
  try {
    const gemini = await getAI();
    const overviewPrompt = `You are SellSpark's expert business analyst. Create a compelling, trust-building business overview for this coaching business.

BUSINESS DATA:
- Business Name: ${businessData.businessName}
- Business Type: ${businessData.businessType}
- Target Audience: ${businessData.targetAudience}
- Services: ${businessData.services.join(', ')}
- Website: ${businessData.websiteUrl}
- Raw Analysis: ${JSON.stringify(businessData.rawAnalysisData || {}, null, 2)}

Generate a persuasive business overview that builds instant trust and shows deep understanding:

1. **businessName**: Clean, professional version of the business name (remove HTML entities, extra characters)
2. **businessType**: Specific coaching niche (e.g., "Elite Gymnastics Coaching", "Youth Athletic Development", "Professional Sports Training")
3. **coreServices**: 3-4 specific, valuable services they offer (not generic descriptions)
4. **automationOpportunity**: One compelling automation opportunity that would save significant time/money
5. **whatsMissing**: One critical gap that's limiting their growth potential
6. **trustBuilders**: 4-5 specific trust-building statements that show expertise and understanding
7. **coachingSpecialty**: Their unique coaching focus or methodology
8. **targetMarket**: Specific audience they serve best

TRUST-BUILDING ELEMENTS TO INCLUDE:
- Automation opportunities that save significant time
- Marketing funnel optimization potential
- Email automation for client nurturing
- Lead generation and conversion improvements
- Revenue growth through systematic processes
- Competitive advantages through automation

Focus on SellSpark's core value: helping coaches automate their jobs, improve marketing funnels, email automation, and ads automation. Make it about business growth and efficiency, not generic coaching praise.`;

    const result = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object", 
          properties: {
            businessName: { type: "string" },
            businessType: { type: "string" },
            coreServices: { type: "array", items: { type: "string" } },
            automationOpportunity: { type: "string" },
            whatsMissing: { type: "string" },
            trustBuilders: { type: "array", items: { type: "string" } },
            coachingSpecialty: { type: "string" },
            targetMarket: { type: "string" }
          }
        }
      },
      contents: overviewPrompt,
    });

    const response = result.text || "{}";
    
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating business overview:", error);
    // Fallback to basic extraction
    return {
      businessName: businessData.businessName.replace(/&#8211;|&amp;/g, '').trim(),
      businessType: businessData.businessType,
      coreServices: businessData.services.slice(0, 3),
      automationOpportunity: "Lead management and client communication automation",
      whatsMissing: "Systematic follow-up and nurturing process",
      trustBuilders: [
        "Automated lead generation systems to scale your coaching business",
        "Email automation sequences that convert prospects into paying clients",
        "Marketing funnel optimization that doubles your conversion rates",
        "Social media and ads automation to reach more potential clients",
        "Client onboarding automation that saves 10+ hours per week"
      ],
      coachingSpecialty: "Athletic performance coaching",
      targetMarket: businessData.targetAudience
    };
  }
}

function getStepFocus(step: number): string {
  const stepFocuses = {
    1: "Ask about their biggest time-consuming challenge in their coaching business",
    2: "Discover what tools they're currently using to manage their coaching",
    3: "Understand their growth goals and revenue targets for their coaching business", 
    4: "Learn their timeline and urgency for implementing automation",
    5: "Identify their main concerns or barriers about automation",
    6: "Envision their ideal automated coaching business success scenario"
  };
  return stepFocuses[step as keyof typeof stepFocuses] || "Ask about their automation needs";
}

export async function generateNextQuestion(
  businessSummary: string,
  currentStep: number,
  userResponses: Record<string, string>
): Promise<{
  question: string;
  quickReplies: string[];
}> {
  // Parse business data for context-aware questions
  const parsedResponses = typeof userResponses === 'string' ? JSON.parse(userResponses) : userResponses;
  const businessType = parsedResponses.businessType || 'coaching business';
  const targetAudience = parsedResponses.targetAudience || 'clients';
  const automationResearch = parsedResponses.automationResearch || {};
  const businessName = parsedResponses.businessName || 'your business';
  const name = parsedResponses.name || 'there';
  
  // Search for relevant training contexts
  let trainingInsights = "";
  try {
    const query = `${businessSummary} ${JSON.stringify(userResponses)}`;
    const contexts = await pineconeService.searchSimilarContexts(query, 3);
    if (contexts.length > 0) {
      trainingInsights = contexts.map(ctx => ctx.content).join("\n");
    }
  } catch (error) {
    console.error("Error searching training contexts:", error);
  }
  
  // Use AI to generate fully personalized questions based on business analysis
  try {
    const gemini = await getAI();
    
    const personalizedPrompt = `You are SellSpark's AI consultation expert. Generate a highly personalized question for step ${currentStep} of a coaching business consultation.

BUSINESS CONTEXT:
- Business: ${businessName}
- Type: ${businessType}  
- Target Audience: ${targetAudience}
- Current user responses: ${JSON.stringify(userResponses)}
- Business summary: ${businessSummary}

RELEVANT COACHING AUTOMATIONS FROM KB:
${trainingInsights}

Generate a question that:
1. References specific details about their business from the analysis
2. Shows you understand their coaching niche and challenges
3. Uses their name (${name}) naturally if available, otherwise skip personal addressing
4. Connects to relevant automations from the KB knowledge base

STEP ${currentStep} FOCUS:
${getStepFocus(currentStep)}

Response format:
{
  "question": "Personalized question with specific business details and coaching context",
  "quickReplies": ["option1", "option2", "option3", "option4"]
}

Make it conversational, warm, and coach-specific!`;

    const result = await gemini.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: personalizedPrompt,
    });
    const response = result.text || "{}";
    
    try {
      const parsed = JSON.parse(response);
      return {
        question: parsed.question,
        quickReplies: parsed.quickReplies || []
      };
    } catch (parseError) {
      console.log("AI response parsing failed, using fallback");
    }
  } catch (error) {
    console.error("AI question generation error:", error);
  }

  // Simplified fallback questions - only 2 steps after initial greeting
  const questionPrompts = [
    {
      step: 1,
      context: "pain points",
      prompt: `Create a warm, personalized question about their biggest coaching business challenge.
Context: They are a coach working with ${targetAudience}.

Ask something like: "Hi! 👋 It's clear you're doing amazing work with your clients. To help you scale, what's the single biggest time-consuming task in your coaching business right now?"

Quick replies should be coach-specific:
- "Getting consistent leads"
- "Content creation & social media"
- "Client onboarding & forms"
- "Following up with prospects"`
    },
    {
      step: 2,
      context: "current tools", 
      prompt: `Ask about their current coaching tools in a friendly, discovery-oriented way.

Ask: "Perfect! Understanding your current setup helps me recommend the right integrations. What are you currently using to manage your coaching business? 🛠️"

Quick replies should be coaching-specific:
- "Just email and basic calendar"
- "Instagram + email marketing"
- "Simple CRM or spreadsheets"
- "Multiple tools, not connected"
- "Mostly manual processes"`
    }
  ];

  const currentPrompt = questionPrompts[currentStep - 1];
  if (!currentPrompt) {
    return {
      question: "Thank you for all the information! Let me analyze your needs and provide automation recommendations.",
      quickReplies: ["Generate my automation plan"]
    };
  }

  // Replace template variables in the prompt
  const processedPrompt = currentPrompt.prompt
    .replace(/\$\{name\}/g, name)
    .replace(/\$\{businessName\}/g, businessName)
    .replace(/\$\{businessType\}/g, businessType)
    .replace(/\$\{targetAudience\}/g, targetAudience);

  const fullPrompt = `${processedPrompt}

${trainingInsights ? `Additional Context from Training:\n${trainingInsights}\n` : ''}

Generate a conversational question and exactly 4 quick reply options that would be typical answers.
Keep the question natural and conversational. The quick replies should be specific and actionable.
Respond in JSON format:
{
  "question": "Your question here",
  "quickReplies": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`;

  try {
    const gemini = await getAI();
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            question: { type: "string" },
            quickReplies: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["question", "quickReplies"]
        }
      },
      contents: fullPrompt,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      question: result.question || "What would you like to automate?",
      quickReplies: result.quickReplies || ["Lead generation", "Customer support", "Data management", "Other"]
    };
  } catch (error) {
    console.error("Error in generateNextQuestion:", error);
    
    // Fallback questions based on step
    const fallbackQuestions = {
      1: { question: "What type of business do you run?", quickReplies: ["SaaS / Software", "Coaching / Consulting", "Ecommerce", "Marketing Agency", "Other"] },
      2: { question: "What's the biggest time drain in your business?", quickReplies: ["Manual data entry", "Following up with leads", "Customer support", "Scheduling calls"] },
      3: { question: "What would you love to fix, improve, or scale in your business right now?", quickReplies: ["Get more clients", "Save time", "Systemize my process", "Improve customer response time"] },
      4: { question: "Are you or your team currently using any automation or AI tools?", quickReplies: ["Yes, heavily", "Some basic tools", "Not yet", "Not sure"] },
      5: { question: "If automation could remove just one bottleneck in your business, what would you want it to help you achieve?", quickReplies: ["Save more time weekly", "Reply faster to leads", "Get better client results", "Scale without burnout"] }
    };
    
    return fallbackQuestions[currentStep as keyof typeof fallbackQuestions] || {
      question: "What's your main automation goal?",
      quickReplies: ["Lead generation", "Customer support", "Sales process", "Other"]
    };
  }
}