# 🏗️ StudyBot System Architecture

This UML diagram illustrates the flow of data and the relationship between the core components of the StudyBot platform.

```mermaid
graph TD
    subgraph Client ["Client (Next.js Frontend)"]
        User(["👤 User"])
        Sidebar["Sidebar Component"]
        ChatPage["Chat Section (Doubt)"]
        NotesPage["Notes Section"]
        TimetablePage["Timetable Section"]
        ExamsPage["Exam Prep Section"]
    end

    subgraph API ["API Layer (tRPC)"]
        TRPC["tRPC Middleware / Procedures"]
        AuthRouter["Auth Router"]
        NoteRouter["Note Router"]
        DoubtRouter["Doubt Router"]
        TimetableRouter["Timetable Router"]
        ExamsRouter["Exams Router"]
    end

    subgraph Services ["External Services"]
        Prisma["Prisma ORM"]
        DB[("PostgreSQL Database")]
        Groq["Groq AI (Llama 3)"]
    end

    %% Flow Relationships
    User --> Sidebar
    User --> ChatPage
    User --> NotesPage
    
    Sidebar -.-> TRPC
    ChatPage == "Queries/Mutations" ==> TRPC
    NotesPage == "Queries/Mutations" ==> TRPC
    
    TRPC --- AuthRouter
    TRPC --- NoteRouter
    TRPC --- DoubtRouter
    TRPC --- TimetableRouter
    TRPC --- ExamsRouter

    NoteRouter --> Groq
    DoubtRouter --> Groq
    TimetableRouter --> Groq
    ExamsRouter --> Groq

    AuthRouter --> Prisma
    NoteRouter --> Prisma
    DoubtRouter --> Prisma
    TimetableRouter --> Prisma
    ExamsRouter --> Prisma

    Prisma --> DB
```

### 🧱 Key Component Roles:
1.  **Next.js Frontend**: Handles the rich UI, animations, and client-side state (React Query managed by tRPC).
2.  **tRPC Layer**: Provides end-to-end type safety between the frontend and the business logic.
3.  **Server Routers**: Contain the main application logic, input validation (Zod), and session checks.
4.  **Groq AI**: Powerhouse for generating summaries, answering doubts, and creating study plans.
5.  **Prisma & DB**: Persistent storage for users, notes, chat history, and schedules.
