# CarbonWise AI

CarbonWise AI is a premium, production-quality carbon footprint tracking and awareness platform designed to help individuals understand, monitor, and reduce their environmental impact. Built with Next.js 15, TypeScript, Tailwind CSS, Recharts, and Google Gemini AI, it delivers real-time analytics and personalized coaching in a stunning, accessible glassmorphic UI.

---

## 🌟 Features

1. **First-Visit Onboarding Wizard**: Guides new users through calibrating their region, household size, transit habits, and dietary profile to pre-seed calculations and targets.
2. **Comprehensive Carbon Tracker**: High-fidelity tabbed form logging transit (car, bus, metro, train, motorcycle, flights, active), energy (monthly kWh), diet, waste, and shopping.
3. **Live Calculator Side-panel**: Dynamically computes daily, monthly, and annual estimates with environmental equivalents (seedlings, gasoline gallons) as the user types.
4. **Interactive Analytics Dashboard**: Beautiful charts powered by Recharts, featuring category divisions (Pie Chart) and 6-month historical trendlines (Area Chart).
5. **Gemini AI Sustainability Coach**: Conversational assistant interface powered securely via server-side API routing, falling back to a client-side rule-based recommendation engine when no API key is set.
6. **Highest Impact Reduction Engine**: Automatically identifies the user's top emission categories and quantifies annual CO₂ savings for behavior adjustments.
7. **Habit & Streak Tracker**: Daily checkable habits (active transport, turning off utilities, reusable bags) with streak multipliers.
8. **Weekly Eco Challenges**: High-contrast interactive challenges (e.g. "Walk 10 km") with animations.
9. **Achievements & Badges**: Grids of unlocked badges with date stamps representing green milestones.
10. **PDF Report Export & JSON Download**: PDF-ready CSS printable templates and JSON-blob data profile downloads for portability.

---

## 🛠️ Tech Stack

* **Core**: Next.js 15 (App Router) & React 19
* **Language**: TypeScript (strict mode)
* **Styling**: Tailwind CSS & Framer Motion (animations)
* **Charts**: Recharts
* **Forms**: React Hook Form + Zod validation
* **Icons**: Lucide Icons
* **AI Engine**: Google Gemini API via `@google/generative-ai` SDK
* **Testing**: Jest + React Testing Library

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### Installation

1. Clone or navigate to the workspace directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

To enable real Gemini AI coaching, add your Gemini API key to your environment variables:
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If no API key is specified, the application will automatically fall back to its local, rule-based recommendation engine seamlessly.*

### Running Locally

To run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Running Tests

To execute the unit test suites:
```bash
npm test
```

---

## 📐 Architecture & Layout

```
src/
├── app/
│   ├── layout.tsx                # Context providers (Theme, Carbon, Toast) and OnboardingModal
│   ├── page.tsx                  # Premium Landing Page with hero, stats, features, and footer
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard with Recharts, AI coach, habits, challenges, badges
│   ├── tracker/
│   │   └── page.tsx              # Input form with validation, live-updating summary side panel
│   └── api/
│       └── chat/
│           └── route.ts          # Server route for Gemini API chat
├── components/
│   ├── ui/                       # Reusable styling primitives (Button, Toast context)
│   ├── Navbar.tsx                # Responsive floating header with Dark Mode toggle
│   └── Footer.tsx                # Responsive eco footer
├── context/
│   ├── ThemeContext.tsx          # System + user dark mode context
│   └── CarbonContext.tsx         # Central state for footprint, goals, habits, badges, challenges
└── utils/
    ├── regions.ts                # Regional carbon coefficients
    ├── carbonCalculations.ts     # Calculations engine
    ├── scoreGenerator.ts         # Carbon score algorithms and rating bands
    ├── aiCoach.ts                # Local recommendation logic
    ├── achievements.ts           # Badges config
    └── challenges.ts             # Challenges config
```

---

## 🌟 Future Improvements

* **Database Persistence**: Swapping local storage context with Prisma / PostgreSQL for multi-device sync.
* **Smart Utility Integrations**: Directly fetch kWh from smart meters or utility APIs.
* **Geographical Mapping**: Integration with Google Maps API to track real travel miles automatically.
