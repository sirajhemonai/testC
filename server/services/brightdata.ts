import fetch from 'node-fetch';

interface BrightDataResponse {
  status: string;
  data?: any;
  error?: string;
}

interface ScrapedPage {
  url: string;
  content: string;
  title?: string;
}

export class BrightDataService {
  private apiKey: string;
  private baseUrl = 'https://api.brightdata.com/dca/trigger';

  constructor() {
    this.apiKey = process.env.BRIGHTDATA_API_KEY || 'f9d6d75d8c33d70c1a59639e824725defccb352100d0c292e9b06acb74f332a6';
  }

  async scrapeWebsite(domain: string): Promise<ScrapedPage[]> {
    console.log(`[BrightData] Starting website scrape for: ${domain}`);
    
    try {
      // Normalize domain
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const baseUrl = `https://${normalizedDomain}`;
      
      // Define pages to scrape
      const pagesToScrape = [
        '/',
        '/about',
        '/about-us',
        '/services',
        '/products',
        '/solutions',
        '/what-we-do',
        '/company',
        '/team',
        '/contact'
      ];

      const scrapedPages: ScrapedPage[] = [];
      
      // Scrape each page
      for (const page of pagesToScrape) {
        try {
          const url = `${baseUrl}${page}`;
          console.log(`[BrightData] Scraping: ${url}`);
          
          const response = await this.scrapePage(url);
          if (response) {
            scrapedPages.push(response);
            console.log(`[BrightData] Successfully scraped: ${url}`);
          }
        } catch (error) {
          console.log(`[BrightData] Failed to scrape ${page}: ${error.message}`);
          // Continue with other pages
        }
      }

      // If we couldn't scrape anything, try a simple fetch as fallback
      if (scrapedPages.length === 0) {
        console.log('[BrightData] No pages scraped via API, trying direct fetch...');
        const fallbackData = await this.fallbackScrape(baseUrl);
        if (fallbackData) {
          scrapedPages.push(fallbackData);
        }
      }

      console.log(`[BrightData] Total pages scraped: ${scrapedPages.length}`);
      return scrapedPages;
    } catch (error) {
      console.error('[BrightData] Scraping error:', error);
      throw new Error(`Failed to scrape website: ${error.message}`);
    }
  }

  private async scrapePage(url: string): Promise<ScrapedPage | null> {
    try {
      // For now, use direct fetch since BrightData API requires specific setup
      // In production, this would use the actual BrightData API endpoint
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      return {
        url: url,
        content: this.extractTextContent(html),
        title: this.extractTitle(html)
      };
    } catch (error) {
      console.error(`[BrightData] Error scraping ${url}:`, error);
      return null;
    }
  }

  private async fallbackScrape(url: string): Promise<ScrapedPage | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return {
        url: url,
        content: this.extractTextContent(html),
        title: this.extractTitle(html)
      };
    } catch (error) {
      console.error('[BrightData] Fallback scrape failed:', error);
      return null;
    }
  }

  private extractTextContent(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Extract important meta tags
    const metaDescription = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] || '';
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] || '';
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] || '';
    
    // Extract title
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
    
    // Extract main content areas - prioritize header, nav, and main sections
    const headerContent = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i)?.[1] || '';
    const navContent = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
    const mainContent = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    const articleContent = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] || '';
    
    // Extract h1-h3 headings for better service/product identification
    const headings = [...html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)].map(m => m[1]).slice(0, 20);
    
    // Combine all content
    let combinedContent = `Title: ${title}\n`;
    if (metaDescription) combinedContent += `Description: ${metaDescription}\n`;
    if (ogTitle && ogTitle !== title) combinedContent += `OG Title: ${ogTitle}\n`;
    if (ogDescription && ogDescription !== metaDescription) combinedContent += `OG Description: ${ogDescription}\n`;
    
    // Add headings
    if (headings.length > 0) {
      combinedContent += `Main Headings: ${headings.join(', ')}\n`;
    }
    
    // Process content in priority order
    const contentParts = [headerContent, navContent, mainContent, articleContent];
    let processedContent = '';
    
    for (const part of contentParts) {
      if (part && processedContent.length < 5000) {
        // Remove HTML tags
        let cleanText = part.replace(/<[^>]+>/g, ' ');
        // Clean up whitespace
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        processedContent += cleanText + ' ';
      }
    }
    
    // If still not enough content, use body
    if (processedContent.length < 1000) {
      const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      processedContent = bodyText;
    }
    
    // Remove common boilerplate and footer content
    const boilerplatePatterns = [
      /cookie\s*policy/gi,
      /accept\s*cookies/gi,
      /privacy\s*policy/gi,
      /terms\s*of\s*service/gi,
      /copyright\s*©?\s*\d{4}/gi,
      /all\s*rights\s*reserved/gi,
      /sign\s*up\s*for\s*newsletter/gi,
      /subscribe\s*to\s*our/gi,
      /©\s*\d{4}.*$/gi,
      /footer.*$/gi,
      /legal.*$/gi
    ];
    
    boilerplatePatterns.forEach(pattern => {
      processedContent = processedContent.replace(pattern, '');
    });
    
    combinedContent += processedContent;
    
    // Limit length to avoid token limits
    return combinedContent.substring(0, 8000);
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  formatScrapedContent(pages: ScrapedPage[]): any[] {
    return pages.map((page, index) => ({
      id: `C${index + 1}`,
      source_url: page.url,
      content: page.content,
      title: page.title
    }));
  }
}