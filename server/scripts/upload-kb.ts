import fs from 'fs';
import path from 'path';
import { pineconeService } from '../services/pinecone';
import { storage } from '../storage';

async function uploadKnowledgeBase() {
  try {
    console.log('Starting knowledge base upload to Pinecone...');
    
    // Read the kb.md file
    const kbPath = path.join(process.cwd(), 'kb.md');
    const kbContent = fs.readFileSync(kbPath, 'utf-8');
    
    // Split the content into sections based on pain points
    const sections = kbContent.split('###').filter(section => section.trim().length > 0);
    
    console.log(`Found ${sections.length} sections in knowledge base`);
    
    // Create a training file record
    const kbFile = await storage.createTrainingFile({
      filename: 'kb.md',
      originalName: 'kb.md',
      mimeType: 'text/markdown',
      size: kbContent.length,
      path: './kb.md',
      content: kbContent,
      status: 'completed'
    });
    
    console.log(`Created training file record with ID: ${kbFile.id}`);
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Extract title from the first line
      const lines = section.split('\n');
      const title = lines[0].trim() || `Knowledge Base Section ${i + 1}`;
      
      // Extract keywords from the section
      const keywords = extractKeywords(section);
      
      console.log(`Processing section: ${title}`);
      
      // Create training context
      const context = await storage.createTrainingContext({
        fileId: kbFile.id,
        title: title,
        content: section,
        keywords: keywords
      });
      
      // Upload to Pinecone
      await pineconeService.upsertContext(context);
      
      console.log(`✓ Uploaded section ${i + 1}/${sections.length}: ${title}`);
    }
    
    console.log('✅ Knowledge base successfully uploaded to Pinecone!');
    console.log(`Total sections processed: ${sections.length}`);
    
  } catch (error) {
    console.error('❌ Error uploading knowledge base:', error);
    throw error;
  }
}

function extractKeywords(content: string): string[] {
  const keywords = new Set<string>();
  
  // Extract common automation-related terms
  const automationTerms = [
    'automation', 'AI', 'workflow', 'lead', 'funnel', 'conversion',
    'chatbot', 'email', 'DM', 'social media', 'content', 'nurture',
    'follow-up', 'sales', 'marketing', 'CRM', 'integration'
  ];
  
  const lowerContent = content.toLowerCase();
  
  automationTerms.forEach(term => {
    if (lowerContent.includes(term.toLowerCase())) {
      keywords.add(term);
    }
  });
  
  // Extract tools mentioned
  const toolRegex = /(make|zapier|manychat|airtable|chatgpt|convertkit|highlevel|notion|canva|mailchimp|slack|instagram|facebook|tiktok)/gi;
  const toolMatches = content.match(toolRegex);
  if (toolMatches) {
    toolMatches.forEach(tool => keywords.add(tool.toLowerCase()));
  }
  
  // Extract pain points (words after "Pain:" or "🔍")
  const painRegex = /(?:pain:|🔍)\s*(.+?)(?:\n|$)/gi;
  const painMatches = content.match(painRegex);
  if (painMatches) {
    painMatches.forEach(match => {
      const cleanMatch = match.replace(/(?:pain:|🔍)\s*/gi, '').trim();
      if (cleanMatch.length > 3 && cleanMatch.length < 50) {
        keywords.add(cleanMatch);
      }
    });
  }
  
  return Array.from(keywords);
}

// Export for use in routes
export { uploadKnowledgeBase };

// Run if called directly
if (require.main === module) {
  uploadKnowledgeBase()
    .then(() => {
      console.log('Upload completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Upload failed:', error);
      process.exit(1);
    });
}