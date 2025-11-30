# Travel Planner SaaS

A production-grade AI-powered travel planning application built with Next.js 15, Prisma, MongoDB, and Gemini AI.

## Features

- **AI-Generated Itineraries**: Personalized multi-day travel plans using Gemini AI
- **Mood-Adaptive Planning**: Real-time itinerary adjustments based on user behavior
- **Weather-Smart Replanning**: Automatic adjustments for adverse weather conditions
- **Habit Learning Engine**: Learns from travel history to personalize future trips
- **Budget Tracking**: Track expenses by category with visual progress
- **Travel Journal**: Document experiences with AI-generated summaries

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS + Shadcn UI
- Prisma ORM
- MongoDB
- Gemini AI API
- Weather API integration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your API keys and MongoDB connection string.

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_APP_URL`: Your app URL
- `GEMINI_API_KEY`: Google Gemini API key (Optional - users can provide their own in settings)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens (min 32 characters)
- `WEATHER_API_KEY`: Weather API key

## Deployment

This app is designed to be deployed on Vercel:

```bash
npm run build
```

## License

MIT
