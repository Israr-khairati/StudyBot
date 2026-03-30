# StudyBot — AI Student Management App

An AI-powered student assistant built with the **T3 Stack** (Next.js, tRPC, Prisma, NextAuth) and **Claude AI** (Anthropic).

## Features

| Feature | Description |
|---|---|
| 💬 **Doubt Solver** | Subject-tagged AI chat. Ask anything, get clear explanations with examples |
| 📅 **Timetable Generator** | AI generates a weekly study schedule from your subjects and free slots |
| 📝 **Smart Notes** | Create notes manually or generate them from a topic using AI. One-click AI summarisation |
| 🎯 **Exam Prep** | Track upcoming exams, generate practice MCQs/short answers, get a personalised study plan |

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **API**: [tRPC v11](https://trpc.io) — end-to-end type-safe APIs
- **Database ORM**: [Prisma](https://prisma.io) + PostgreSQL
- **Auth**: [NextAuth.js v4](https://next-auth.js.org) (Google OAuth + Email magic link)
- **AI**: [Anthropic Claude](https://anthropic.com) (`claude-sonnet-4-20250514`)
- **Validation**: [Zod](https://zod.dev)

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech))
- Anthropic API key — [get one here](https://console.anthropic.com)

### 2. Clone and install

```bash
git clone <your-repo>
cd studybot
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

Optional (for Google sign-in):
```
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 4. Set up the database

```bash
npm run db:push
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected app routes (require auth)
│   │   ├── layout.tsx      # Sidebar layout
│   │   ├── chat/           # Doubt solving chat
│   │   ├── timetable/      # Weekly timetable
│   │   ├── notes/          # Notes management
│   │   └── exams/          # Exam prep & practice
│   ├── api/
│   │   ├── trpc/[trpc]/    # tRPC handler
│   │   └── auth/[...nextauth]/ # NextAuth handler
│   ├── auth/signin/        # Sign-in page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── Providers.tsx       # Session + tRPC + React Query
│   └── Sidebar.tsx         # Navigation sidebar
├── server/
│   ├── trpc.ts             # tRPC init + context
│   ├── root.ts             # Root router
│   └── routers/
│       ├── doubt.ts        # AI doubt solving
│       ├── timetable.ts    # Schedule generation
│       ├── notes.ts        # Notes CRUD + AI
│       └── exams.ts        # Exam tracking + practice Qs
├── lib/
│   ├── anthropic.ts        # Anthropic client
│   ├── prisma.ts           # Prisma client (singleton)
│   ├── auth.ts             # NextAuth config
│   └── trpc.ts             # tRPC React client
prisma/
└── schema.prisma           # Database schema
```

---

## AI Capabilities

### Doubt Solver (`routers/doubt.ts`)
- Maintains conversation history per chat session
- Subject-aware system prompts (Physics, Maths, Chemistry, CS, English)
- Streamed responses via Claude

### Timetable Generator (`routers/timetable.ts`)
- Takes subjects, desired hours/week, and available time slots
- Returns a structured JSON timetable parsed and validated with Zod
- Saves to the database; editable slot-by-slot

### Notes AI (`routers/notes.ts`)
- **Summarise**: Condenses existing notes into key exam bullet points
- **Generate from topic**: Creates structured notes at brief/detailed/comprehensive depth

### Exam Prep (`routers/exams.ts`)
- **Practice questions**: Generates MCQ, short answer, long answer, or true/false questions
- **Study plan**: Day-by-day revision plan based on exam date and chapters covered

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard. Use a hosted PostgreSQL (Neon or Supabase).

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Customisation

### Adding subjects
Edit `SUBJECTS` arrays in page components and `SUBJECT_PROMPTS` in `routers/doubt.ts`.

### Changing the AI model
Update `model: "claude-sonnet-4-20250514"` in any router file to use a different Claude model.

### Adding more question types
Extend `QuestionTypeSchema` in `routers/exams.ts`.

---

## License

MIT
