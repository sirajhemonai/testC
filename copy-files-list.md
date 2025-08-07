# Essential Files to Copy for Vercel Deployment

## Root Level Files
- package.json (with @types/pdf-parse)
- package-lock.json
- vercel.json (fixed runtime)
- tsconfig.json
- vite.config.ts
- tailwind.config.ts
- postcss.config.js
- drizzle.config.ts
- components.json
- README.md
- replit.md

## API Folder
- api/index.ts (fixed Vercel types)

## Server Folder (Complete)
- server/index.ts
- server/routes.ts
- server/storage.ts (fixed interface)
- server/db.ts
- server/vite.ts
- server/routes/training.ts (fixed types)
- server/routes/chat.ts
- server/routes/sessions.ts
- server/routes/admin.ts
- server/routes/chatbot-modes.ts
- server/services/brightdata.ts
- server/services/business-analyzer.ts
- server/services/chatbot-mode.ts (fixed Gemini API)
- server/services/config.ts
- server/services/emailService.ts
- server/services/gemini.ts
- server/services/googleSheets.ts
- server/services/pain-analyzer.ts
- server/services/perplexity.ts
- server/services/pinecone.ts
- server/services/roi-calculator.ts

## Client Folder (Complete)
- client/src/main.tsx
- client/src/App.tsx
- client/src/index.css
- client/src/lib/ (all files)
- client/src/pages/ (all files)
- client/src/components/ (all files)
- client/src/hooks/ (all files)
- client/src/styles/ (all files)

## Shared Folder
- shared/schema.ts

## Documentation
- ENV_VARIABLES_GUIDE.md
- NEON_VERCEL_SETUP.md
- DEPLOYMENT_INSTRUCTIONS.md

## Assets (if needed)
- attached_assets/ (logo and images used in the app)