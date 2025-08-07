## Overview
This project is a comprehensive AI-powered automation consultation tool for SellSpark. Its main purpose is to help businesses identify and implement automation opportunities by analyzing their websites, conducting structured consultations, and providing intelligent, personalized automation recommendations. Key capabilities include website analysis, AI-driven structured questioning, real-time AI responses, and seamless integration with scheduling systems. The business vision is to provide an accessible and efficient way for companies to discover and leverage automation for growth and efficiency, positioning SellSpark as a leader in AI-driven business transformation.

## January 2025 - Complete UI/UX Overhaul & New Features
- **Professional Header & Footer**: Enhanced header with centered logo, Past Projects and AI Expert navigation; completely redesigned footer with company info, contact details, and services
- **Improved Chat Interface**: Removed blue effects, changed bot icon to yellow spark/bolt icon, improved message bubbles with better contrast and readability
- **Enhanced Quick Replies**: Shortened suggestions to avoid horizontal scrolling, limited to 4 options with truncation for better UX
- **AI Agent Expert Page**: New comprehensive form for custom AI automation consultation requests with detailed business analysis fields
- **Interactive Loading Page**: Added 4-step progress bar with real-time analysis details (Website Analysis, AI Intelligence, Industry Research, Generating Recommendations)
- **Enhanced Summary Page**: Professional business overview with automation insights and "Continue to Personalized Recommendation" button
- **Centered Chat Logo**: SellSpark AI logo prominently displayed in chat consultation with conversational AI flow, removed duplicate headers
- **Improved Copy**: Changed "Automation Tools Identified" to "Tools you can use" for better user understanding

## January 2025 - Conversion-Focused Landing Page Redesign
- **Above-the-Fold "Money Zone"**: Implemented conversion-focused copy with eyebrow text, dream outcome headline, and psychological triggers
- **Real-Time Validation Bar**: Added FOMO-generating notifications showing coaches taking action
- **Interactive 3-Step Demo**: Built on-page product experience showing automation recommendations
- **Comparison Table**: "Old Way vs Freelancers vs SellSpark AI" positioning with detailed feature comparisons
- **Risk Crushers**: Added warranty badges and trust-building elements
- **AI-Powered Recommendations**: Updated copy to reflect instant AI recommendation system rather than setup process
- **Social Proof Variations**: Created 5 alternative trust statements to replace generic "17 countries" claim
- **Content Accuracy**: Removed unverified media mentions and clarified offer (5 free automation plans to first 5 businesses)
- **Tech Partnerships**: Changed "Powered by" to "Partnered With" including ManyChat, Zapier, Make, Semrush, OpenAI

## January 2025 - Adaptive Q&A Discovery Loop 2.0
- **Pain Taxonomy System**: Implemented 8-bucket pain classification (Lead Flow, Follow-Up, Onboarding, Accountability, Content, Upsell, Retention, Admin)
- **Real-Time Pain Scoring**: Gemini 1.5 Flash updates pain matrix after each answer with cumulative scoring (0-10 scale)
- **Micro-Persona Assignment**: 5 coach personas (Solo Scaling Sally, Content-Crushed Carl, etc.) assigned when 2+ buckets surpass 7/10
- **Adaptive Question Generation**: AI generates next questions targeting highest information gain areas using pain matrix analysis
- **ROI-First Monte Carlo Prioritiser**: Calculates automation ROI using simulated benchmarks, coach profile analysis, and risk assessment
- **Confidence-Indexed Output**: Final recommendations include ranked automations with payback days, ROI percentiles, and quoted user reasoning
- **Real-Time Visualization**: Live pain matrix display and persona matching during consultation process

## User Preferences
Preferred communication style: Simple, everyday language.
Branding: SellSpark with golden/yellow color scheme (#FFD700)
Typography: Poppins font family
Design: Modern, clean interface with soft shadows and rounded corners

## System Architecture
### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, incorporating Glassmorphism UI effects.
- **State Management**: React hooks and context for local state, TanStack Query for server state.
- **Routing**: Wouter for lightweight client-side routing.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework.
- **Language**: TypeScript with ESM modules.
- **Development**: tsx for direct TypeScript execution.
- **Production**: esbuild for bundling server code.

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Database**: PostgreSQL (configured for Neon Database).
- **Schema**: Shared schema definitions between client and server.
- **Migrations**: Drizzle Kit for database migrations.

### Core System Design
- **Consultation Flow**: Advanced adaptive Q&A system with real-time pain scoring, persona assignment, and ROI-prioritized recommendations. Features live pain matrix visualization and Monte Carlo ROI simulation.
- **AI Analysis Pipeline**: A sophisticated multi-stage process:
    1.  **Data Extraction**: Comprehensive business data summary from scraped website content.
    2.  **Industry Research**: Perplexity API researches industry-specific automation solutions.
    3.  **Pain Matrix Analysis**: Real-time scoring across 8 pain buckets with Gemini 1.5 Flash.
    4.  **Persona Assignment**: Micro-forking into 5 coach personas when confidence thresholds are met.
    5.  **ROI Calculation**: Monte Carlo simulation for automation ROI with payback timeline visualization.
    6.  **Narrative Generation**: GPT-style confident explanations with concrete outcome predictions.
- **Theme System**: Context-based theme management with light/dark mode toggling, utilizing CSS variables for dynamic color schemes.
- **Storage Layer**: Abstracted data persistence using an `IStorage` interface, with a `DatabaseStorage` implementation backed by PostgreSQL.
- **UI/UX Decisions**: Modern, clean design with soft shadows, rounded corners, and a consistent golden/yellow color scheme for SellSpark branding. Comprehensive mobile-first responsive design with optimized typography, touch-friendly interfaces, and performance enhancements. Glassmorphism effects are applied to key UI elements. Full mobile optimization includes video popups, WhatsApp chat, footer, and all interactive components.
- **Data Flow**: User input triggers website analysis, which informs AI-generated questions. User responses are processed to refine recommendations. The final analysis is presented on a dedicated results page with options for further engagement.

## Google Sheets Integration (January 2025)
- **Complete Session Export**: Automatically saves all consultation data including chat history, pain matrix scores, persona assignments, and ROI calculations
- **Admin Dashboard**: Located at `/sheets-admin` for managing Google Sheets integration and data export
- **Dual Sheet Structure**: 
  - **Sessions Sheet**: Summary data with business info, pain scores, personas, and completion metrics
  - **Messages Sheet**: Individual chat messages with timestamps and session linking
- **Auto-Save on Completion**: Sessions automatically save to Google Sheets when consultation completes (if configured)
- **Manual Export**: Batch export all existing sessions via admin interface
- **Required Setup**: Google Service Account key and Google Sheets API access

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection.
- **drizzle-orm**: ORM for database interactions.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **vite**: Frontend build tool.
- **tsx**: TypeScript execution for Node.js.
- **esbuild**: JavaScript bundler.
- **googleapis**: Google Sheets API integration for data export and analytics.
- **Gemini AI (Google)**: Used for intelligent response generation, business analysis, structured questioning, and automation recommendations. Utilizes `gemini-2.5-pro` and `text-embedding-004` models.
- **Perplexity API**: Used for real-time web analysis, business insights, industry classification, and target audience identification, utilizing `sonar-reasoning-pro` model.
- **Pinecone Vector Database**: Stores embeddings of training contexts for semantic search, enhancing context-aware responses and recommendations.
- **Calendly Integration**: For meeting scheduling follow-ups.
- **BrightData API**: For comprehensive web scraping and structured data extraction from websites.