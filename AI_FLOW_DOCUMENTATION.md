# SellSpark AI Flow Documentation

## Overview
This document outlines the complete AI-powered consultation flow in the SellSpark application, from website analysis to personalized automation recommendations.

## 1. Website Analysis Flow

### Initial Website Submission
```
User enters website URL
    ↓
Frontend: handleWebsiteSubmit()
    ↓
API Call: POST /api/consultation/start
    ↓
Backend: BusinessAnalyzer.analyzeWebsite()
```

### Website Scraping Process
```
BusinessAnalyzer
    ↓
BrightDataService.scrapeWebsite()
    ↓
Scrapes multiple pages:
    - Homepage
    - About page
    - Services page
    - Contact page
    - Products page (if exists)
    - Team page (if exists)
    ↓
Returns raw HTML content
```

### Business Analysis
```
Raw website data
    ↓
PerplexityService.analyzeWebsite()
    ↓
AI Analysis using Perplexity API:
    - Business classification
    - Industry identification
    - Service extraction
    - Target audience analysis
    ↓
Returns structured business data:
    {
        businessName: string,
        businessType: string,
        services: string[],
        targetAudience: string,
        challenges: string[],
        specificTools: string[],
        implementations: string[]
    }
```

## 2. Enhanced Business Overview Generation

### Business Overview API Flow
```
Frontend: WebsiteSummary component loads
    ↓
API Call: POST /api/business-overview
    ↓
Backend: generateBusinessOverview() (Gemini AI)
    ↓
Gemini 2.5 Pro Analysis:
    - Clean business name
    - Identify coaching specialty
    - Extract core services
    - Find automation opportunities
    - Identify what's missing
    - Generate trust builders
    ↓
Returns enhanced overview:
    {
        businessName: string,
        businessType: string,
        coreServices: string[],
        automationOpportunity: string,
        whatsMissing: string,
        trustBuilders: string[],
        coachingSpecialty: string,
        targetMarket: string
    }
```

## 3. Personalized Greeting Generation

### AI Greeting Flow
```
Business analysis complete
    ↓
generatePersonalizedGreeting() (Gemini AI)
    ↓
Gemini 1.5 Flash generates:
    - Personalized greeting mentioning business name
    - References specific coaching niche
    - Shows understanding of target audience
    - Hints at automation opportunities
    - Asks for user's name
    ↓
Greeting message stored in database
    ↓
Displayed in chat interface
```

## 4. Consultation Question Flow

### Dynamic Question Generation
```
User responds to previous question
    ↓
API Call: POST /api/consultation/respond
    ↓
Backend: generateNextQuestion()
    ↓
Process:
    1. Parse user responses
    2. Search knowledge base (Pinecone)
    3. Get training insights
    4. Generate context-aware question
    ↓
Gemini AI generates:
    - Step-specific question (steps 1-6)
    - Quick reply options
    - Coaching-focused language
    ↓
Question stored and displayed
```

### Question Steps Structure
```
Step 1: Biggest time-consuming challenge
Step 2: Current tools and systems
Step 3: Growth goals and revenue targets
Step 4: Timeline and urgency
Step 5: Concerns about automation
Step 6: Ideal success scenario
Step 7: Final analysis generation
```

## 5. Final Analysis Generation

### Automation Analysis Flow
```
All questions answered (Step 7)
    ↓
analyzeBusinessForAutomation() (Gemini AI)
    ↓
Process:
    1. Combine business summary + user responses
    2. Search knowledge base for relevant automations
    3. Generate personalized recommendations
    ↓
Gemini 2.5 Pro creates:
    - Comprehensive automation roadmap
    - Interactive accordion sections
    - Implementation steps
    - ROI estimates
    - Next steps with SellSpark
    ↓
Analysis stored in session
    ↓
User redirected to results page
```

## 6. AI Services Architecture

### Gemini AI Integration
```
services/gemini.ts
├── getAI() - Initialize Google Gemini client
├── generatePersonalizedGreeting() - First message
├── generateBusinessOverview() - Enhanced summary
├── generateNextQuestion() - Dynamic questions
└── analyzeBusinessForAutomation() - Final analysis
```

### Models Used
- **Gemini 2.5 Pro**: Complex analysis, JSON responses, business overview
- **Gemini 1.5 Flash**: Quick greetings, simple text generation
- **Text Embedding 004**: Knowledge base search vectors

### Knowledge Base Integration
```
Pinecone Vector Database
    ↓
Stores training contexts as embeddings
    ↓
Semantic search during question generation
    ↓
Provides relevant automation examples
```

## 7. Data Flow Through System

### Database Storage
```
consultation_sessions table:
├── id, websiteUrl, businessSummary
├── currentStep, userResponses
├── isComplete, finalAnalysis
└── timestamps

messages table:
├── content, isUser, messageType
├── quickReplies (JSON)
└── timestamp
```

### Session Management
```
1. Create session on website submission
2. Store business analysis in session
3. Update step and responses on each interaction
4. Mark complete when analysis generated
5. Store final analysis for results page
```

## 8. Frontend AI Integration

### React Query Integration
```
useQuery hooks for:
├── Current session state
├── Message history
├── Business overview generation
└── Real-time consultation status
```

### Component Flow
```
Chat.tsx (Main container)
├── WebsiteInput (URL submission)
├── AnalysisProgress (Processing indicator)
├── WebsiteSummary (Enhanced AI overview)
├── ChatMessages (Q&A interface)
└── Results page (Final analysis)
```

## 9. Error Handling & Fallbacks

### AI Service Failures
```
Gemini API Error
    ↓
Fallback to:
├── Generic coaching-focused messages
├── Standard automation opportunities
├── Basic business classification
└── Template responses
```

### Progressive Enhancement
```
1. Start with basic analysis
2. Enhance with AI when available
3. Graceful degradation on failures
4. User never sees technical errors
```

## 10. Performance Optimizations

### Caching Strategy
```
├── Business overview cached per business name
├── Session state cached in browser
├── Knowledge base embeddings pre-computed
└── Fallback responses pre-defined
```

### Async Processing
```
├── Website scraping (30+ seconds)
├── AI analysis (5-10 seconds per call)
├── Parallel API calls where possible
└── Progressive loading indicators
```

## Current AI Configuration

### API Keys Required
- `GEMINI_API_KEY`: Google Gemini AI access
- `PERPLEXITY_API_KEY`: Business analysis
- `BRIGHTDATA_API_KEY`: Website scraping
- `PINECONE_API_KEY`: Knowledge base search

### Model Selection Logic
```javascript
// Fast responses (greetings, simple questions)
model: "gemini-1.5-flash"

// Complex analysis (business overview, final recommendations)  
model: "gemini-2.5-pro"

// Structured JSON responses
responseMimeType: "application/json"
responseSchema: { /* defined schema */ }
```

This flow ensures every message is AI-generated and personalized based on the specific coaching business being analyzed, creating a truly customized consultation experience.