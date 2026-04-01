# StudyBot Technical Documentation

StudyBot is a modern, AI-powered student management platform built with the T3 stack. It provides tools for students to manage their notes, exams, timetables, and solve academic doubts using state-of-the-art AI.

## 🚀 Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | PostgreSQL (Managed via Prisma) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) |
| **API Layer** | [tRPC](https://trpc.io/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **AI Integration** | [Groq SDK (Llama 3)](https://groq.com/) & [Anthropic SDK (Claude)](https://anthropic.com/) |
| **Form Handling** | [Zod](https://zod.dev/) |

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    User([User]) <--> NextJS[Next.js App Router]
    NextJS <--> TRPC[tRPC API Layer]
    TRPC <--> Prisma[Prisma ORM]
    Prisma <--> DB[(PostgreSQL Database)]
    NextJS <--> NextAuth[NextAuth.js]
    TRPC <--> AI[Groq / Anthropic SDK]
```

---

## 📂 Project Structure

```text
studybot/
├── prisma/
│   └── schema.prisma      # Database models and schema
├── src/
│   ├── app/               # Next.js App Router (Pages and API)
│   │   ├── (app)/         # Main application routes (Authenticated)
│   │   ├── api/           # Next.js API routes (NextAuth, tRPC)
│   │   └── auth/          # Authentication pages (Login/Signup)
│   ├── components/        # Reusable UI components
│   ├── lib/               # Shared utilities (Prisma client, TRPC helpers)
│   └── server/            # Backend logic
│       ├── routers/       # tRPC routers (Business logic)
│       ├── root.ts        # Main tRPC router
│       └── trpc.ts        # tRPC configuration
├── public/                # Static assets (Images, Fonts)
└── tailwind.config.ts     # Tailwind CSS configuration
```

---

## 🏗️ Core Features

### 1. AI Doubt Solving (Chat)
- **Description**: Interactive chat interface where students can ask academic questions.
- **Provider**: Uses Groq API with Llama 3 for fast, accurate responses.
- **Persistence**: Chat history is stored in the database, allowing users to revisit past queries.

### 2. Note Management
- **Description**: A full-featured note-taking system with AI-assisted features.
- **Organization**: Notes are categorized by subject and chapter.
- **AI Integration**: AI can summarize long notes or generate study materials.

### 3. Exam Tracker
- **Description**: Allows students to track upcoming exams.
- **Details**: Tracks subject name, exam date, duration, room number, and specific chapters covered.

### 4. Smart Timetable
- **Description**: A digital schedule manager for classes and study sessions.
- **Format**: Organizes slots by day, time intervals, subject, and room.

---

## 📊 Data Models

The application uses Prisma with a PostgreSQL database. Key models include:

- **`User`**: Stores user credentials, profile information, and role.
- **`Account` / `Session` / `VerificationToken`**: Standard NextAuth models for secure authentication.
- **`Note`**: Stores content, summaries, and academic metadata.
- **`Chat` / `Message`**: Tracks AI conversation history per user.
- **`TimetableSlot`**: Represents a single period in a student's schedule.
- **`Exam`**: Represents a scheduled assessment.

---

## 🔐 Authentication & Authorization

- **NextAuth.js**: Implements secure user authentication.
- **Credentials Provider**: Uses email and password with `bcryptjs` for hashing.
- **Role-Based Access**: Supports `USER` and `ADMIN` roles (defined in Prisma schema).

---

## 🛠️ Getting Started (Development)

### Prerequisites
- Node.js installed
- A PostgreSQL database instance
- Groq API Key and Anthropic API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd studybot
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/studybot"
    NEXTAUTH_SECRET="your-secret"
    NEXTAUTH_URL="http://localhost:3000"
    GROQ_API_KEY="your-groq-key"
    ANTHROPIC_API_KEY="your-anthropic-key"
    ```

4.  **Database Sync**:
    ```bash
    npx prisma db push
    ```

5.  **Run Dev Server**:
    ```bash
    npm run dev
    ```

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**.

1.  Push the code to GitHub/GitLab.
2.  Connect the repository to Vercel.
3.  Configure environment variables in the Vercel dashboard.
4.  Ensure the Prisma postinstall script `prisma generate` runs on every build (handled in `package.json`).

---

## 🧪 Testing

The project uses **Vitest** for unit and integration testing. All external services (Prisma, Groq, Bcrypt) are mocked to ensure fast and reliable execution.

- **Run all tests**: `npm run test`
- **Watch mode**: `npm run test:watch`
- **Detailed Docs**: Refer to [Testing Documentation](file:///C:/Users/israr/.gemini/antigravity/brain/219fb1b1-38c2-4674-bd3f-5a62911c1f22/artifacts/testing_documentation.md).

---

## 🛠️ Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
