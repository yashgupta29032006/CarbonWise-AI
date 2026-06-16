# 🌍 CarbonWise AI

> An AI-powered sustainability platform that helps individuals understand, track, and reduce their carbon footprint through personalized insights and actionable recommendations.

[![Demo Sandbox](https://img.shields.io/badge/Live%20Demo-Sandbox-emerald?style=for-the-badge)](https://example.com/live-demo-placeholder)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-zinc?style=for-the-badge&logo=github)](https://example.com/github-repo-placeholder)
[![Hackathon Submission](https://img.shields.io/badge/Devpost-Submission-blue?style=for-the-badge)](https://example.com/devpost-placeholder)

---

## 🌟 Vision

Climate change is one of the most pressing challenges of our generation. While global policies and industrial updates are vital, individual choices collectively account for a massive share of worldwide emissions. However, making sustainable choices is often difficult because carbon footprints are invisible.

**CarbonWise AI** was built to bridge this gap. Our vision is to democratize climate action by making carbon impact transparent, relatable, and actionable. By translating complex carbon data into simple daily habits and equivalents, CarbonWise AI empowers individuals to make informed decisions that align with a sustainable future—one step at a time.

---

## ⚠️ The Problem

Many individuals are eager to live more sustainably and reduce their environmental impact, but they face three critical barriers:

1. **Information Asymmetry**: It is extremely difficult to know where emissions originate. Is a steak dinner worse than driving 20 kilometers? How does a short regional flight compare to leaving the air conditioner on?
2. **Generic Recommendations**: Most carbon calculators offer generic, high-level tips (e.g., "drive less" or "eat organic") that fail to consider a user's specific lifestyle, occupation, region, or budget constraint.
3. **Lack of Actionability & Engagement**: Traditional tools feel like static spreadsheets. They compute a one-off yearly figure but lack a progress loop, habit building, daily streaks, or engaging visual analytics to sustain long-term commitment.

---

## ✅ The Solution

CarbonWise AI offers an interactive, data-driven, and highly personalized coaching ecosystem to solve these challenges:

* **Granular Multi-Category Tracker**: Log emissions in real-time across Transportation, Energy, Diet, Waste, and Shopping.
* **Region-Aware Calculations**: Emission math automatically calibrates based on the user's local electricity grid intensity and regional baselines.
* **AI Sustainability Coach**: A secure, server-side Gemini AI chatbot that analyzes the user's specific footprint and generates tailored roadmap plans.
* **Gamified Behavior Loops**: Build daily eco habits, accumulate streaks, unlock milestones, and complete targeted weekly challenges adapted to your weakest category.

---

## 🛠️ Key Features

### 🌱 Carbon Tracking
* High-fidelity, multi-tab tracker with real-time feedback.
* Supports active/public transit, electricity kWh, food preferences, waste sorting/composting, and circular shopping habits.
* Explanatory tooltips next to every input field to clarify why the data is being collected.

### 🤖 Gemini AI Sustainability Coach
* Interactive chatbot powered by `gemini-2.5-flash` with conversation memory.
* Analyzes a rich user profile payload server-side without exposing API keys.
* Generates practical, non-generic advice (e.g., tailored to a student's budget or local grid constraints).

### 📊 Interactive Analytics Dashboard
* Live-updating data visualizations built with Recharts.
* Category breakdown Pie Chart shows relative footprints.
* 6-month historical Area Chart tracks emissions reductions over time.

### 🎯 Sustainability Goals
* Set custom weekly reduction targets and monthly CO₂ limits.
* Visual indicators display percentage progress against targets.

### 📅 Habit Tracking
* Daily checkable checklist (e.g., cold washing, biking) that records completion.
* Streaks count and update multipliers on consecutive days of completion.

### 🏆 Weekly Challenges & Achievements
* Local engine dynamically suggests challenges matching the user's highest emission category.
* Badges panel tracks unlocked milestones with date stamps.

### 🌍 Environmental Equivalents
* Translates abstract metric tons of CO₂ into relatable equivalents: trees planted, gallons of gasoline avoided, kilometers not driven, and smartphones charged.

### 📈 Historical Progress Tracking
* Persists actual logged tracker submissions in localStorage to compute rolling averages and baseline improvement percentages.

### 📄 Downloadable Reports
* Generate a printable, professionally formatted Markdown sustainability report summarizing scores, habits, and coach advice.

### ♿ Accessibility & UI
* Screen-reader friendly semantic HTML, ARIA landmarks, keyboard focus rings, and high contrast colors.
* Premium dark-mode first design with glassmorphic backdrops and Framer Motion micro-animations.

---

## 🤖 AI Capabilities & Prompt Engineering

The Gemini AI Coach analyzes the user's data payload server-side to provide customized insights.

```
+-------------------------------------------------------------+
|                     User Context Payload                    |
| (Region, Household Size, Transport, Electricity, Diet,      |
|  Waste, Shopping, Score, High Category, Goals, History)     |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                    Gemini Context Builder                   |
| (Formats data into a structured sustainability profile text)|
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                System Prompt & AI Coach Routing             |
| (Expert coach instructions + user profile + chat memory)    |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                Personalized Action Plan Output              |
| (Markdown formatted: actionable tips, estimated CO2 saved)  |
+-------------------------------------------------------------+
```

### Robust Fallback Engine
If the Gemini API key is not configured, or if rate limits or connection errors occur, the application automatically invokes a **local rule-based recommendation engine** (`getLocalCoachResponse`). This ensures the application never crashes and continues to provide category-specific feedback alongside a friendly fallback notice.

---

## 🏗️ Architecture

CarbonWise AI utilizes a modern, unified Next.js 15 App Router architecture with client-side state providers and server-side secure routes.

```
 ┌────────────────────────────────────────────────────────┐
 │                      Next.js App                       │
 └───────────────────────────┬────────────────────────────┘
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                    CarbonContext                      │
 │    (State: profile, history, challenges, habits)       │
 └─────────────┬─────────────────────────────┬────────────┘
               ▼                             ▼
 ┌───────────────────────────┐ ┌──────────────────────────┐
 │         Client UI         │ │     Server API Route     │
 │  (Dashboard, Recharts,    │ │       (/api/chat)        │
 │   Onboarding, Tracker)    │ └─────────────┬────────────┘
 └─────────────┬─────────────┘               ▼
               │               ┌──────────────────────────┐
               │               │   Gemini API Endpoint    │
               │               │   (gemini-2.5-flash)     │
               ▼               └──────────────────────────┘
 ┌───────────────────────────┐
 │     Local Storage         │
 │ (Persistence of history)  │
 └───────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router) | High-performance React meta-framework |
| **Language** | TypeScript | Strictly typed development |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **Charts** | Recharts | Interactive svg-based SVG data charts |
| **Animations** | Framer Motion | Fluid micro-animations and route fades |
| **AI Integration** | Google Gemini API | Server-side REST content generation |
| **Validation** | Zod | Secure runtime type validation |
| **Forms** | React Hook Form | High-performance form state management |
| **Testing** | Jest | Unit and integration test suites |

---

## 📐 Carbon Calculation Methodology

Emissions factors utilized in CarbonWise AI are compiled from recognized sources (EPA, DEFRA, and Eora Global):

1. **Transportation**:
   * Car: `0.180 kg CO₂/km` (adjusted for regional averages)
   * Bus: `0.089 kg CO₂/km`
   * Metro/Train: `0.041 kg CO₂/km`
   * Flight: `0.250 kg CO₂/km` (incorporates high-altitude radiative forcing)
2. **Electricity**:
   * Base factor calibrated by region: US (`0.380 kg/kWh`), EU (`0.230 kg/kWh`), APAC (`0.520 kg/kWh`), Global average (`0.420 kg/kWh`).
   * Scaled by monthly consumption and divided by household size to reflect shared baseloads.
3. **Diet**:
   * Vegan: `1.5 kg CO₂/day`
   * Vegetarian: `2.0 kg CO₂/day`
   * Mixed: `4.7 kg CO₂/day`
   * Meat-Heavy: `7.2 kg CO₂/day`
4. **Waste**:
   * Standard generation adjusted by recycling frequency (saves up to `100 kg/year`) and composting status (saves `100 kg/year`).
5. **Shopping**:
   * Low: `150 kg CO₂/year`, Medium: `450 kg CO₂/year`, High: `900 kg CO₂/year`.

> [!NOTE]
> Calculations are educational estimates designed to establish relative baselines and help users focus on high-leverage areas. They should not be used as exact corporate auditable metrics.

---

## 📸 Screenshots

### 1. Landing Page
*(Placeholder for Landing Page Screenshot - Premium glassmorphic animations, platform stats, features)*

### 2. Dashboard Hub
*(Placeholder for Dashboard Screenshot - Recharts category pie, trends area chart, AI Coach, and Habits checklist)*

### 3. Footprint Tracker
*(Placeholder for Footprint Tracker Screenshot - Multi-category tabs with live summary side panel and relatable equivalents)*

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CarbonWise-AI.git
cd CarbonWise-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔒 Environment Variables

| Variable | Description | Location | Required |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini developer API Key | Server `.env` | Yes (for AI features) |

> [!IMPORTANT]
> The `GEMINI_API_KEY` must only reside in your server environment `.env` or `.env.local` file. It should never be prefixed with `NEXT_PUBLIC_` or exposed to client-side bundles.

---

## 🧪 Testing

We have implemented comprehensive Jest testing to validate math and score generators:

```bash
npm test
```

Test coverage includes:
* `calculations.test.ts`: Validates vehicle grids, regional scaling coefficients, dietary baselines, and waste reductions.
* `score.test.ts`: Checks exponential curve scoring, sustainable target calculations, and clamping bounds.
* `gemini.test.ts`: Verifies E2E API routing, message structure maps, and secure fallback logic.

---

## 🏗️ Production Build

To test production optimizations and check strict compilation limits:

```bash
npm run build
```

---

## ♿ Accessibility (a11y)

* **Contrast Ratios**: Color tokens adhere strictly to WCAG AA guidelines.
* **Keyboard Navigation**: Focus traps on modals, clear focus outlines on buttons, and fully tabbable forms.
* **Semantic Markups**: Utilizes HTML5 landmarks (`<main>`, `<section>`, `<nav>`, `<header>`) and appropriate ARIA descriptors.

---

## ⚡ Performance Optimization

* **Hydration Protection**: Components use deferred mounting hooks to bypass SSR/CSR hydration errors.
* **Deferred Charting**: Recharts svg elements load asynchronously on client-mount to prevent initial render blocking.
* **Static Site Optimization**: Core pages render statically where possible, optimizing Largest Contentful Paint (LCP) performance.

---

## 🛡️ Security Measures

* **Zero Key Exposure**: Gemini endpoints are queried exclusively via secure Next.js API routes (`/api/chat`).
* **Input Sanitization**: Request bodies are parsed and validated using TypeScript strict configurations before forwarding.
* **No Cache Leaks**: Local storage keys use unique prefixes to avoid collisions or cross-origin leakage.

---

## 🗺️ Future Roadmap

* **OCR Invoice Parsing**: Scan utility bills and petrol receipts directly using Gemini Multimodal vision capabilities.
* **Smart Device Integration**: Connect smart thermostats and home smart-plugs to log actual electric draw.
* **Carbon Offset Marketplace**: Integrate direct API endpoints to purchase certified gold-standard offsets.
* **Community Challenges**: Add local leaderboards and team challenges to scale community engagement.

---

## 🌱 Why CarbonWise AI Matters

Sustainability isn't about achieving individual perfection overnight; it is about making conscious, consistent choices every day. CarbonWise AI makes the invisible visible, helping users identify high-leverage adjustments that fit their lives. By matching intelligent technology with beautiful design, we turn environmental awareness into an achievable, daily habit.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
