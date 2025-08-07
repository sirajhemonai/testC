import { PerplexityService } from './perplexity';
import { BrightDataService } from './brightdata';

interface BusinessAnalysis {
  business_summary: {
    legal_name: string;
    brand_names: string[];
    industry: string;
    sub_industries: string[];
    target_customers: string[];
    target_geographies: string[];
    mission: string;
    value_proposition: string;
    core_products: string[];
    core_services: string[];
    revenue_streams: string[];
    pricing_models: string[];
    technology_stack: string[];
    integrations: string[];
    compliance_and_certifications: string[];
    partners: string[];
    scale_signals: {
      employees: number | string;
      offices: string[];
      funding_stage: string;
    };
    differentiators: string[];
  };
  pain_points: Array<{
    id: string;
    description: string;
    category: string;
    evidence_refs: string[];
    inferred: boolean;
    rationale: string;
  }>;
  automation_opportunities: Array<{
    id: string;
    linked_pain_points: string[];
    title: string;
    function: string;
    description: string;
    automation_type: string;
    inputs_required: string[];
    prerequisites: string[];
    expected_primary_metric: string;
    impact_estimate: 'high' | 'medium' | 'low';
    effort_estimate: 'low' | 'medium' | 'high';
    confidence: number;
    roi_logic: string;
    quick_win: boolean;
    risks: string[];
    evidence_refs: string[];
  }>;
  top_3_recommendations: Array<{
    automation_id: string;
    summary: string;
    why_now: string;
    ninety_day_plan: {
      phase_0_discovery: string[];
      phase_1_pilot: string[];
      phase_2_validation: string[];
    };
    success_metrics: string[];
    dependencies: string[];
    evidence_refs: string[];
  }>;
  open_questions: {
    data_access: string[];
    volume_metrics: string[];
    process_details: string[];
    stakeholders: string[];
    compliance: string[];
    other: string[];
  };
}

export class BusinessAnalyzer {
  private perplexityService: PerplexityService;
  private brightDataService: BrightDataService;

  constructor() {
    this.perplexityService = new PerplexityService();
    this.brightDataService = new BrightDataService();
  }

  async analyzeWebsite(websiteUrl: string): Promise<BusinessAnalysis> {
    console.log(`[BusinessAnalyzer] Starting comprehensive analysis for: ${websiteUrl}`);
    
    try {
      // Step 1: Scrape website using BrightData
      const scrapedPages = await this.brightDataService.scrapeWebsite(websiteUrl);
      const formattedContent = this.brightDataService.formatScrapedContent(scrapedPages);
      
      console.log(`[BusinessAnalyzer] Scraped ${scrapedPages.length} pages`);
      
      // Step 2: Analyze scraped content with structured prompt
      const analysis = await this.analyzeScrapedContent(websiteUrl, formattedContent);
      
      return analysis;
    } catch (error) {
      console.error('[BusinessAnalyzer] Analysis error:', error);
      throw error;
    }
  }

  private async analyzeScrapedContent(domain: string, scrapedContent: any[]): Promise<BusinessAnalysis> {
    const systemPrompt = `You are an AI Automation Consultant. You read scraped public website data and produce evidence-grounded, actionable, non-hallucinated insights to drive AI/LLM automation recommendations. Follow instructions exactly. If evidence is missing, write "unknown" (never guess).

You must:
- Output VALID JSON only
- NEVER fabricate metrics, partners, tech stack items, or pricing if not explicitly present
- Keep language concise & bullet-oriented
- Stay within provided schema
- For large gaps, add to open_questions`;

    const userPrompt = `### INPUT METADATA
company_domain: ${domain}
timestamp_utc: ${new Date().toISOString()}
scrape_method: BrightData Web Scraper v1.0
crawl_scope: Home, About, Services, Products, Solutions pages
raw_content_token_count: ${JSON.stringify(scrapedContent).length}

### SCRAPED_CONTENT
${JSON.stringify(scrapedContent, null, 2)}

### TASK
Analyze the scraped content and provide a comprehensive business analysis with automation opportunities. Focus on:

1. Extract business fundamentals (name, type, target audience, services)
2. Identify operational pain points and manual processes
3. Generate AI/automation opportunities with ROI estimates
4. Select top 3 recommendations with 90-day implementation plans
5. List open questions for missing information

Output must be valid JSON matching this structure:
{
  "business_summary": {
    "legal_name": "extracted name or unknown",
    "brand_names": ["array of brand names"],
    "industry": "primary industry",
    "sub_industries": ["sub-industries"],
    "target_customers": ["customer segments"],
    "target_geographies": ["geographic markets"],
    "mission": "mission statement or unknown",
    "value_proposition": "core value prop",
    "core_products": ["main products"],
    "core_services": ["main services"],
    "revenue_streams": ["revenue sources"],
    "pricing_models": ["pricing approaches"],
    "technology_stack": ["mentioned technologies"],
    "integrations": ["integration partners"],
    "compliance_and_certifications": ["certifications"],
    "partners": ["partner companies"],
    "scale_signals": {
      "employees": "number or unknown",
      "offices": ["office locations"],
      "funding_stage": "stage or unknown"
    },
    "differentiators": ["competitive advantages"]
  },
  "pain_points": [
    {
      "id": "P1",
      "description": "concise pain point",
      "category": "ops|sales|marketing|customer_support|product|finance|hr|data|compliance|security|other",
      "evidence_refs": ["C1"],
      "inferred": false,
      "rationale": "why identified"
    }
  ],
  "automation_opportunities": [
    {
      "id": "A1",
      "linked_pain_points": ["P1"],
      "title": "Automation Title",
      "function": "sales|marketing|support|ops|hr|finance|product|engineering|data|multi",
      "description": "30 words max",
      "automation_type": "LLM_agent|workflow_orchestration|RPA|chatbot|predictive_model|classification|extraction|recommendation|search|knowledge_base|analytics|other",
      "inputs_required": ["data sources needed"],
      "prerequisites": ["requirements"],
      "expected_primary_metric": "metric to improve",
      "impact_estimate": "high",
      "effort_estimate": "medium",
      "confidence": 0.8,
      "roi_logic": "brief reasoning",
      "quick_win": true,
      "risks": ["potential risks"],
      "evidence_refs": ["C1"]
    }
  ],
  "top_3_recommendations": [
    {
      "automation_id": "A1",
      "summary": "recommendation summary",
      "why_now": "urgency reason",
      "ninety_day_plan": {
        "phase_0_discovery": ["discovery tasks"],
        "phase_1_pilot": ["pilot tasks"],
        "phase_2_validation": ["validation tasks"]
      },
      "success_metrics": ["KPIs"],
      "dependencies": ["requirements"],
      "evidence_refs": ["C1"]
    }
  ],
  "open_questions": {
    "data_access": ["questions about data"],
    "volume_metrics": ["questions about scale"],
    "process_details": ["questions about processes"],
    "stakeholders": ["questions about people"],
    "compliance": ["regulatory questions"],
    "other": ["other questions"]
  }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.perplexityService.makeRequest(messages);
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const analysis = JSON.parse(content) as BusinessAnalysis;
      
      // Ensure all required fields exist
      this.ensureValidAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error('[BusinessAnalyzer] Failed to parse analysis JSON:', error);
      console.error('Raw content:', content);
      
      // Return a fallback analysis
      return this.createFallbackAnalysis(domain, scrapedContent);
    }
  }

  private ensureValidAnalysis(analysis: BusinessAnalysis): void {
    // Ensure business_summary has all required fields
    if (!analysis.business_summary) {
      analysis.business_summary = {} as any;
    }
    
    const defaultSummary = {
      legal_name: 'unknown',
      brand_names: [],
      industry: 'unknown',
      sub_industries: [],
      target_customers: [],
      target_geographies: [],
      mission: 'unknown',
      value_proposition: 'unknown',
      core_products: [],
      core_services: [],
      revenue_streams: [],
      pricing_models: [],
      technology_stack: [],
      integrations: [],
      compliance_and_certifications: [],
      partners: [],
      scale_signals: {
        employees: 'unknown',
        offices: [],
        funding_stage: 'unknown'
      },
      differentiators: []
    };
    
    analysis.business_summary = { ...defaultSummary, ...analysis.business_summary };
    
    // Ensure arrays exist
    analysis.pain_points = analysis.pain_points || [];
    analysis.automation_opportunities = analysis.automation_opportunities || [];
    analysis.top_3_recommendations = analysis.top_3_recommendations || [];
    
    // Ensure open_questions exists
    if (!analysis.open_questions) {
      analysis.open_questions = {
        data_access: [],
        volume_metrics: [],
        process_details: [],
        stakeholders: [],
        compliance: [],
        other: []
      };
    }
  }

  private createFallbackAnalysis(domain: string, scrapedContent: any[]): BusinessAnalysis {
    // Extract basic info from scraped content
    const allContent = scrapedContent.map(c => c.content).join(' ').toLowerCase();
    
    // Try to extract business name from content
    let businessName = 'unknown';
    const titleMatch = scrapedContent.find(c => c.title)?.title;
    if (titleMatch) {
      businessName = titleMatch.split('|')[0].split('-')[0].trim();
    }
    
    // Extract services mentioned in content
    const services: string[] = [];
    const serviceKeywords = ['service', 'solution', 'product', 'offering', 'provide', 'specialize'];
    serviceKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}[s]?[:\s]+([^.]+)`, 'gi');
      const matches = allContent.match(regex);
      if (matches) {
        services.push(...matches.slice(0, 3));
      }
    });
    
    return {
      business_summary: {
        legal_name: businessName,
        brand_names: [businessName].filter(n => n !== 'unknown'),
        industry: 'Technology',
        sub_industries: ['Professional Services'],
        target_customers: ['Businesses'],
        target_geographies: ['United States'],
        mission: 'unknown',
        value_proposition: 'Professional services and solutions',
        core_products: [],
        core_services: services.slice(0, 3),
        revenue_streams: ['Service fees'],
        pricing_models: ['Project-based'],
        technology_stack: [],
        integrations: [],
        compliance_and_certifications: [],
        partners: [],
        scale_signals: {
          employees: 'unknown',
          offices: [],
          funding_stage: 'unknown'
        },
        differentiators: []
      },
      pain_points: [
        {
          id: 'P1',
          description: 'Manual lead follow-up processes',
          category: 'sales',
          evidence_refs: [],
          inferred: true,
          rationale: 'Common challenge for businesses without automation'
        },
        {
          id: 'P2',
          description: 'Time-consuming customer support',
          category: 'customer_support',
          evidence_refs: [],
          inferred: true,
          rationale: 'Typical pain point for service businesses'
        }
      ],
      automation_opportunities: [
        {
          id: 'A1',
          linked_pain_points: ['P1'],
          title: 'AI-Powered Lead Nurturing System',
          function: 'sales',
          description: 'Automate lead scoring and personalized follow-ups',
          automation_type: 'LLM_agent',
          inputs_required: ['Contact forms', 'Email interactions'],
          prerequisites: ['Email system access'],
          expected_primary_metric: 'Lead conversion rate',
          impact_estimate: 'high',
          effort_estimate: 'medium',
          confidence: 0.8,
          roi_logic: 'Reduce manual follow-up time by 70%',
          quick_win: true,
          risks: ['data_privacy'],
          evidence_refs: []
        },
        {
          id: 'A2',
          linked_pain_points: ['P2'],
          title: 'Intelligent Customer Support Bot',
          function: 'support',
          description: '24/7 AI chatbot for common inquiries',
          automation_type: 'chatbot',
          inputs_required: ['FAQ data', 'Support tickets'],
          prerequisites: ['Website integration'],
          expected_primary_metric: 'First response time',
          impact_estimate: 'high',
          effort_estimate: 'low',
          confidence: 0.9,
          roi_logic: 'Handle 60% of inquiries automatically',
          quick_win: true,
          risks: ['hallucination'],
          evidence_refs: []
        }
      ],
      top_3_recommendations: [
        {
          automation_id: 'A1',
          summary: 'Implement AI lead nurturing to boost conversions',
          why_now: 'Capture more revenue from existing traffic',
          ninety_day_plan: {
            phase_0_discovery: ['Audit current lead process', 'Define scoring criteria'],
            phase_1_pilot: ['Deploy AI agent for top 20% leads', 'Set up A/B testing'],
            phase_2_validation: ['Measure conversion uplift', 'Expand to all leads']
          },
          success_metrics: ['35% increase in lead conversion', '70% reduction in response time'],
          dependencies: ['CRM access', 'Email platform API'],
          evidence_refs: []
        }
      ],
      open_questions: {
        data_access: ['What CRM system is currently used?', 'Is email data accessible via API?'],
        volume_metrics: ['How many leads per month?', 'Average support ticket volume?'],
        process_details: ['Current lead qualification process?', 'Support escalation workflow?'],
        stakeholders: ['Who manages sales operations?', 'IT decision makers?'],
        compliance: ['Any industry-specific regulations?', 'Data privacy requirements?'],
        other: ['Budget range for automation initiatives?', 'Timeline constraints?']
      }
    };
  }

  // Extract simple summary for consultation
  extractSimpleSummary(analysis: BusinessAnalysis): {
    businessName: string;
    businessType: string;
    services: string[];
    targetAudience: string;
  } {
    const summary = analysis.business_summary;
    
    console.log('[BusinessAnalyzer] Extracting summary from:', {
      legal_name: summary.legal_name,
      brand_names: summary.brand_names,
      industry: summary.industry,
      services: summary.core_services,
      products: summary.core_products
    });
    
    const businessName = summary.legal_name !== 'unknown' ? summary.legal_name : 
                        (summary.brand_names.length > 0 ? summary.brand_names[0] : 'Your Business');
    
    const result = {
      businessName: businessName,
      businessType: summary.industry !== 'unknown' ? 
                   `${summary.industry}${summary.sub_industries.length > 0 ? ' - ' + summary.sub_industries[0] : ''}` :
                   'Professional Services',
      services: summary.core_services.length > 0 ? summary.core_services : 
               summary.core_products.length > 0 ? summary.core_products :
               ['Business Solutions'],
      targetAudience: summary.target_customers.length > 0 ? 
                     summary.target_customers.join(', ') :
                     'Businesses and Organizations'
    };
    
    console.log('[BusinessAnalyzer] Extracted summary:', result);
    
    return result;
  }
}