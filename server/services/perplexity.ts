interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

import { configService } from "./config";

export class PerplexityService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  private async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = await configService.getApiKey("PERPLEXITY_API_KEY");
    }
    return this.apiKey;
  }

  async makeRequest(messages: any[]): Promise<PerplexityResponse> {
    const apiKey = await this.getApiKey();
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages,
        max_tokens: 2000,
        temperature: 0.1,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<PerplexityResponse>;
  }

  async analyzeWebsite(websiteUrl: string): Promise<{
    summary: string;
    businessType: string;
    targetAudience: string;
    services: string[];
    challenges: string[];
  }> {
    const messages = [
      {
        role: 'system',
        content: `You are a business analysis expert. Analyze the given website and provide a comprehensive business analysis. Focus on identifying the business type, target audience, services offered, and potential operational challenges.`
      },
      {
        role: 'user',
        content: `Analyze this website: ${websiteUrl}
        
        Please provide:
        1. A brief summary of what the business does
        2. The specific business type/industry (e.g., e-commerce, SaaS, consulting, healthcare, etc.)
        3. Target audience
        4. Main services/products offered
        5. Potential operational challenges they might face
        
        Be specific and focus on actionable insights.`
      }
    ];

    const response = await this.makeRequest(messages);
    const content = response.choices[0]?.message?.content || '';

    // Parse the response to extract structured data
    const businessType = this.extractBusinessType(content);
    
    return {
      summary: content,
      businessType,
      targetAudience: this.extractSection(content, 'target audience'),
      services: this.extractServices(content),
      challenges: this.extractChallenges(content)
    };
  }

  async findAutomationOpportunities(businessType: string, businessSummary: string): Promise<{
    recommendations: string;
    specificTools: string[];
    implementations: string[];
  }> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI automation expert specializing in business process optimization. Your task is to research and recommend the best AI automation tools and agents specifically for different business types.`
      },
      {
        role: 'user',
        content: `Based on this business analysis:
        
        Business Type: ${businessType}
        Business Summary: ${businessSummary}
        
        Please research and provide:
        1. The top 3-5 AI automation tools/agents specifically designed for ${businessType} businesses
        2. Specific implementation strategies for each tool
        3. Expected ROI and time savings
        4. Integration requirements and complexity
        5. Real-world case studies or success stories if available
        
        Focus on current, proven solutions that are actively being used in ${businessType} industry. Include both general automation tools and industry-specific solutions.`
      }
    ];

    const response = await this.makeRequest(messages);
    const content = response.choices[0]?.message?.content || '';

    return {
      recommendations: content,
      specificTools: this.extractTools(content),
      implementations: this.extractImplementations(content)
    };
  }

  private extractBusinessType(content: string): string {
    // Look for business type patterns in the content
    const businessTypePatterns = [
      /business type[:\s]+([^\n\.]+)/i,
      /industry[:\s]+([^\n\.]+)/i,
      /type of business[:\s]+([^\n\.]+)/i,
      /operates in[:\s]+([^\n\.]+)/i,
      /classified as[:\s]+([^\n\.]+)/i
    ];

    for (const pattern of businessTypePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: try to identify common business types
    const commonTypes = [
      'e-commerce', 'saas', 'consulting', 'healthcare', 'retail', 'manufacturing',
      'real estate', 'finance', 'education', 'marketing', 'technology', 'service'
    ];

    for (const type of commonTypes) {
      if (content.toLowerCase().includes(type)) {
        return type;
      }
    }

    return 'general business';
  }

  private extractSection(content: string, sectionName: string): string {
    const patterns = [
      new RegExp(`${sectionName}[:\s]+([^\n\.]+)`, 'i'),
      new RegExp(`\\d+\\.\\s*${sectionName}[:\s]+([^\n\.]+)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractServices(content: string): string[] {
    const services: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('service') || line.includes('product') || line.includes('offer')) {
        const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (cleanLine && cleanLine.length > 10) {
          services.push(cleanLine);
        }
      }
    }

    return services.slice(0, 5); // Return top 5 services
  }

  private extractChallenges(content: string): string[] {
    const challenges: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('challenge') || line.includes('problem') || line.includes('issue')) {
        const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (cleanLine && cleanLine.length > 10) {
          challenges.push(cleanLine);
        }
      }
    }

    return challenges.slice(0, 5); // Return top 5 challenges
  }

  async researchAutomationSolutions(businessType: string, targetAudience: string, challenges: string[]): Promise<{
    recommendations: string;
    specificTools: string[];
    implementations: string[];
  }> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI automation expert specializing in business process optimization for coaches and service businesses.`
      },
      {
        role: 'user',
        content: `Research automation solutions for:
        
        Business Type: ${businessType}
        Target Audience: ${targetAudience}
        Key Challenges: ${challenges.join(', ')}
        
        Provide specific automation recommendations with tools and implementation strategies.`
      }
    ];

    const response = await this.makeRequest(messages);
    const content = response.choices[0]?.message?.content || '';

    return {
      recommendations: content,
      specificTools: this.extractTools(content),
      implementations: this.extractImplementations(content)
    };
  }

  private extractTools(content: string): string[] {
    const tools: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('tool') || line.includes('platform') || line.includes('software')) {
        const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (cleanLine && cleanLine.length > 10) {
          tools.push(cleanLine);
        }
      }
    }

    return tools.slice(0, 10); // Return top 10 tools
  }

  private extractImplementations(content: string): string[] {
    const implementations: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('implement') || line.includes('integration') || line.includes('setup')) {
        const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (cleanLine && cleanLine.length > 10) {
          implementations.push(cleanLine);
        }
      }
    }

    return implementations.slice(0, 8); // Return top 8 implementations
  }
}