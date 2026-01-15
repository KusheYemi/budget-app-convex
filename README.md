# Budget App

A modern, responsive monthly budgeting web app built with Next.js and Convex.

## Features

- **Monthly Budget Management**: Set your income and allocate funds to categories
- **Smart Savings Logic**: Default 20% savings rate with required reason when saving less
- **User-Defined Categories**: Create custom budget categories with colors
- **Real-Time Calculations**: See remaining budget update instantly as you allocate
- **Historical Tracking**: View past months (read-only) and track trends over time
- **Insights & Statistics**: Visualize spending patterns with charts and aggregated data
- **Multi-Currency Support**: SLE (default), USD, GBP, EUR, NGN
- **Account Settings**: Change preferred currency and reset password
- **Dark/Light Mode**: Toggle between themes

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Backend/Database**: Convex
- **Auth**: Convex Auth (email/password)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **State**: Zustand
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- A Convex project (free tier works)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
```

Set Convex Auth server-side variables via `npx convex env set` (e.g. `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`).

### Installation

```bash
# Install dependencies
npm install

# Run Convex dev backend (first run configures your project)
npx convex dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── budget/[year]/[month]/  # Historical month view
│   ├── insights/         # Statistics page
│   └── page.tsx          # Dashboard (current month)
├── convex/               # Convex functions + schema
├── components/
│   ├── auth/             # Auth forms
│   ├── budget/           # Budget UI components
│   ├── charts/           # Recharts components
│   ├── layout/           # Header, navigation
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── utils.ts          # Utility functions
│   └── validators.ts     # Zod schemas
├── hooks/
│   └── use-auth.ts        # Convex auth hook
└── stores/
    └── budget-store.ts   # Zustand store
```

## Key Features Explained

### Savings Rate Logic

The app enforces a default 20% savings rate. If a user wants to save less than 20%, they must provide a reason (minimum 10 characters). This encourages mindful financial decisions.

### Default Categories

New users get these categories automatically:
- Savings (system category, cannot be deleted)
- Transport & Food
- Utilities
- Partner & Child Support
- Subscriptions
- Fun
- Remittance

### Read-Only Historical Months

Past months are automatically locked and displayed in read-only mode. Only the current month can be edited.

## Database Schema

Core Convex tables:
- **users**: Email, currency preference
- **budgetMonths**: Year, month, income, savings rate, adjustment reason
- **categories**: Name, color, sort order, isSavings flag
- **allocations**: Links budget months to categories with amounts

Convex Auth adds its own auth tables for accounts, sessions, and tokens.

## Deployment

The app can be deployed to Vercel:

```bash
npx convex deploy
npm run build
```

Make sure to:
1. Set environment variables in your hosting platform
2. Configure Convex Auth env vars in your Convex deployment

## License

MIT
