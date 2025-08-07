# SellSpark - AI-Powered Automation Consultation Platform

A comprehensive AI-powered business intelligence platform that provides website analysis and actionable automation insights with enhanced mobile responsiveness and performance optimization.

## 🚀 Features

### Core Functionality
- **Website Analysis**: Comprehensive business data extraction from websites
- **AI-Powered Consultation**: Structured questionnaire with intelligent follow-up questions
- **Personalized Recommendations**: Tailored automation solutions based on business needs
- **Past Projects Showcase**: Display of successful automation implementations
- **WhatsApp Integration**: Direct communication channel for instant support

### Technical Highlights
- **Mobile-First Design**: Fully responsive across all devices
- **AI Integration**: Google Gemini and Perplexity API for intelligent analysis
- **Real-Time Processing**: Dynamic question generation and response analysis
- **Performance Optimized**: Fast loading with lazy loading and optimized assets
- **Accessibility**: WCAG compliant with reduced motion support

## 🛠 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **TanStack Query** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** with ESM modules
- **PostgreSQL** with Drizzle ORM
- **Google Gemini AI** for analysis
- **Perplexity API** for research

### Infrastructure
- **Neon Database** for PostgreSQL hosting
- **Replit** for development and deployment
- **BrightData** for web scraping

## 📱 Mobile Optimization

- **Responsive Typography**: Scales from mobile to desktop
- **Touch-Friendly Interface**: 44px minimum touch targets
- **Optimized Layouts**: Stack and adapt for different screen sizes
- **Performance Enhancements**: Lazy loading, optimized fonts, smooth scrolling
- **Accessibility**: Reduced motion support, proper contrast ratios

## 🎯 Business Focus

SellSpark specializes in automation solutions for coaches and service-based businesses:

- **Lead Generation Automation**
- **Email & SMS Marketing**
- **CRM Integration**
- **Booking & Scheduling Systems**
- **WhatsApp Business Automation**
- **Custom Workflow Solutions**

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Required API keys (Gemini, Perplexity, BrightData)

### Environment Variables
```bash
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
BRIGHTDATA_API_KEY=your_brightdata_api_key
```

### Development Setup
```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

## 📊 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── styles/         # CSS and styling
├── server/                 # Express backend
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── scripts/            # Utility scripts
├── shared/                 # Shared types and schemas
└── uploads/                # File upload directory
```

## 🤝 API Integration

### AI Services
- **Google Gemini**: Business analysis and recommendation generation
- **Perplexity**: Real-time web research and industry insights
- **BrightData**: Website scraping and data extraction

### External Services
- **Calendly**: Meeting scheduling integration
- **WhatsApp Business**: Direct customer communication
- **Neon Database**: Managed PostgreSQL hosting

## 📈 Performance Metrics

- **Mobile PageSpeed**: 90+ score
- **Accessibility**: WCAG AA compliant
- **SEO Optimized**: Meta tags and structured data
- **Core Web Vitals**: Optimized LCP, FID, and CLS

## 🎨 Design System

### Color Palette
- **Primary**: Golden Yellow (#FFD700)
- **Secondary**: Black (#000000)
- **Background**: White to Amber gradient
- **Text**: Gray scale for optimal contrast

### Typography
- **Font Family**: Poppins
- **Responsive Scaling**: 14px mobile to 16px desktop base
- **Weights**: 300, 400, 500, 600, 700

## 🔒 Security Features

- **Environment Variables**: Sensitive data protection
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Controlled API access
- **Rate Limiting**: Protection against abuse

## 📞 Contact & Support

- **WhatsApp**: +8801919201192
- **Email**: hello@sellspark.ai
- **Website**: [SellSpark.ai](https://sellspark.ai)

## 📄 License

This project is proprietary to SellSpark. All rights reserved.

---

Built with ❤️ by the SellSpark team to help businesses save time and grow through intelligent automation.