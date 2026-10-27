# 🎓 Proofly — Campus Professional Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

> **Proof Over Claims.** Turn campus activities, coursework, and technical milestones into an evidence-based professional profile backed by an AI skill constellation, institutional project similarity auditing, and intelligent opportunity matching.

---

## 🌟 Overview

Traditional resumes rely on self-reported buzzwords and unverifiable claims. **Proofly** bridges the gap between campus achievements and industry recruiters by converting student work into a verifiable **Evidence Chain**:

```
[01. Raw Artifact / Commit] 
         ↓
[02. AST & Similarity Scan] 
         ↓
[03. Faculty Attestation] 
         ↓
[04. Dynamic Skill Confidence Calibration] 
         ↓
[05. Direct Opportunity Match]
```

---

## ✨ Key Features

### 1. 📂 Evidence Locker & Student Dashboard
- **Proof Score Calculation**: Dynamic algorithm that weights verified GitHub commits, research papers, certifications, and competition trophies over self-assertions.
- **Multimodal Artifact Ingestion**: Log projects, internships, hackathon wins, and open-source contributions with direct file/link verification.
- **Public Verified Portfolio**: Clean, recruiter-ready profile showcasing authenticated milestones, GPA records, and attestation badges.

### 2. 🌌 AI Skill Constellation
- **Confidence Calibration**: Skill levels (Beginner, Intermediate, Advanced) dynamically recalibrate based on evidence weight and freshness.
- **Visual Categorization**: Categorizes proficiencies across Programming, ML/AI, Cloud, Data, Embedded/IoT, Design, and Leadership.

### 3. 🔍 Institutional Project Idea & Novelty Checker
- **4-Dimensional Similarity Analysis**: Analyzes student project proposals against institutional archives across:
  - **Domain** (Problem space overlap)
  - **Problem Statement** (Core challenge uniqueness)
  - **Technology Stack** (Tools & framework redundancy)
  - **Methodology** (Architectural differentiation)
- **Originality Assurance**: Identifies high-overlap past submissions to encourage original research and prevent redundant capstone projects.

### 4. 👨‍🏫 Faculty Attestation Portal
- **Verification Queue**: Allows department professors to inspect student code benchmarks, project reports, and deliverables.
- **Digital Sign-off**: Faculty members can review, digitally verify, or request revisions on student evidence items.

### 5. 💼 Placement & Recruiter Portal
- **Evidence-Based Talent Search**: Search candidates by verified skill confidence rather than keyword matching.
- **Multi-Vector Match Scoring**:
  - Structural Skill Fit (required vs. proven skills)
  - Semantic Alignment (domain affinity)
  - Evidence Strength (peer/faculty-attested weight)
- **Skill Gap Diagnostics**: Provides students with actionable "You Have" vs. "You Need" insights and next best steps.

### 6. ⚡ Quick Access Command Palette
- Universal keyboard shortcut (`Ctrl + K` / `Cmd + K`) for instant navigation, quick action triggering, and role-switching.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **Animation & UI** | [Motion](https://motion.dev/) (Framer Motion successor), [Lucide React](https://lucide.dev/), [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **AI Integration** | [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`) |

---

## 📂 Project Structure

```
Proofly/
├── .env.example             # Example environment configuration
├── index.html               # Main HTML entry point
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite + Tailwind + React setup
└── src/
    ├── main.tsx             # React DOM root entry
    ├── App.tsx              # Root component & view router
    ├── index.css            # Global CSS & Tailwind imports
    ├── types/
    │   └── index.ts         # TypeScript definitions (User, Evidence, Skill, Project, etc.)
    ├── context/
    │   └── AppContext.tsx   # Global application state & active tab management
    ├── data/
    │   └── mockData.ts      # Sample data for students, faculty, projects & opportunities
    ├── lib/
    │   └── logic.ts         # Scoring algorithms, similarity calculations & matching engine
    └── components/
        ├── common/          # Header, EvidenceEncoding, CommandPalette
        ├── auth/            # AuthModal & role switcher
        ├── overview/        # Platform landing page & feature highlights
        ├── student/         # StudentDashboard, Profile, SkillsExplorer, Checker, ActivityWizard
        ├── faculty/         # Faculty verification queue & attestation controls
        └── placement/       # Placement dashboard, job postings & candidate matcher
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (v9+) or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rupesh-3/Proofly.git
   cd Proofly
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: Use `--legacy-peer-deps` to ensure compatibility between Vite 8 and the bundled build tools).*

3. **Set up Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   APP_URL="http://localhost:3000"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Starts the local development server at `http://localhost:3000` with HMR.
- `npm run build` — Builds the optimized production bundle into the `dist/` directory.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Runs TypeScript type-checking without emitting files.

---

## 🔐 Environment Variables

| Variable | Description | Required |
| :--- | :--- | :---: |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/) for AI-assisted features | Yes (for AI features) |
| `APP_URL` | Base application URL for routing and callbacks | Optional |
| `DISABLE_HMR` | Set to `true` to disable hot module replacement (used in certain headless environments) | Optional |

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).
