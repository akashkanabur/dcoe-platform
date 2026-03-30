# D-CoE Exam Platform — IISc Bengaluru

> Centre of Excellence in Design · Full-Stack Exam & Learning Management Platform

A production-ready **Next.js 14** application combining a public-facing landing page with a role-based exam platform for the Department of Design and Manufacturing, IISc Bengaluru.

---

## Features at a Glance

**Landing Page** — Animated hero, 9 course cards, FAQ accordion, testimonials carousel, contact form, responsive navbar.

**Trainer Dashboard** — Create/publish/archive tests, 4-question-type builder (MCQ, Multi-Select, True/False, Short Answer), student results table, analytics overview.

**Student Dashboard** — Browse & attempt tests, countdown timer, auto-submit, anti-refresh guard, detailed result + answer review.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (jose) + HttpOnly cookies |
| Passwords | bcryptjs |
| Fonts | Playfair Display + DM Sans |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Project Structure

```
dcoe-platform/
├── app/
│   ├── page.tsx                      # Public landing page
│   ├── layout.tsx / globals.css      # Root layout + design tokens
│   ├── auth/login / signup           # Auth pages
│   ├── dashboard/
│   │   ├── layout.tsx                # Auth-guarded shell
│   │   ├── trainer/                  # Trainer pages
│   │   └── student/                  # Student pages
│   ├── exam/
│   │   ├── [testId]/page.tsx         # Exam interface
│   │   └── result/[attemptId]/       # Result + review
│   └── api/                          # REST API routes
│       ├── auth/{login,signup,logout,me}
│       ├── tests/[id]
│       ├── questions
│       └── results
├── components/
│   ├── landing/                      # 10 landing sections
│   └── dashboard/Sidebar.tsx
├── lib/
│   ├── supabase-client.ts            # Supabase admin client
│   ├── auth.ts                       # JWT helpers
│   └── utils.ts
├── types/index.ts
├── middleware.ts                     # Route protection
└── .env.example
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy the **Project URL**, **anon public key**, and **service_role key**
4. Run the schema migrations provided in `supabase-schema.sql` in the **SQL Editor** of your Supabase dashboard.

### 3. Environment Variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
JWT_SECRET=<generate with: openssl rand -base64 32>

TRAINER_EMAIL=trainer@dcoe-iisc.in
TRAINER_PASSWORD=dcoe@IISc2024
```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Database Tables

Refer to `supabase-schema.sql` for the full table definitions including:
- `users`: Student accounts
- `tests`: Exam metadata
- `questions`: Test questions (MCQ, Multi-select, etc.)
- `attempts`: Student exam results
- `exam_enrollments`: Test access control

---

## Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository into **Vercel**.
3. Add all environment variables from `.env.local`.
4. Click **Deploy**.

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Trainer | `trainer@dcoe-iisc.in` | `dcoe@IISc2024` |
| Student | Register on `/auth/signup` | Your choice |

> Change trainer credentials in `.env.local` before going live.

---

## Design Tokens

| Token | Value |
|-------|-------|
| IISc Red | `#9B1C1C` |
| Dark Navy | `#0F172A` |
| Display Font | Playfair Display |
| Body Font | DM Sans |

---

**D-CoE, IISc Bengaluru** · dcoe@fsid-iisc.in · +91 7204830111
