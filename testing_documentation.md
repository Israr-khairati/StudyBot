# 🧪 StudyBot Testing Documentation

This document provides an overview of the testing infrastructure in StudyBot, explaining how to run, maintain, and expand the test suite.

---

## 🚀 1. Testing Stack

We use **Vitest** as our primary testing framework. It is chosen for its speed, compatibility with the T3 stack (Next.js/Vite), and native support for TypeScript.

| Component | Tool | Purpose |
|---|---|---|
| **Test Runner** | [Vitest](https://vitest.dev/) | High-performance unit and integration runner. |
| **Environment** | `jsdom` / `node` | Simulates browser (jsdom) or server (node) context. |
| **API Mocking** | `vi.mock` | Mocks Prisma, AI SDKs (Groq), and encryption (Bcrypt). |
| **Component Testing** | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Used for UI testing (optional future use). |

---

## 🏃 2. How to Run Tests

All test commands are available via `npm`:

```bash
# Run all tests once
npm run test

# Active development mode (watches for file changes)
npm run test:watch

# Run a specific test file
npx vitest src/server/routers/auth.test.ts
```

---

## 📂 3. Directory Structure

```text
studybot/
├── vitest.config.ts      # Main configuration (environment, aliases, setup)
├── src/
│   ├── test/
│   │   ├── setup.ts      # Global mocks and setup (Prisma, Groq, Bcrypt)
│   │   └── trpc-helper.ts # Factory for creating mocked tRPC callers
│   └── server/
│       └── routers/
│           └── *.test.ts # Integration tests for each tRPC router
└── src/lib/
    └── utils.test.ts     # Unit tests for core utilities
```

---

## 🧩 4. Mocking Strategy

To keep tests fast, reliable, and free of API costs, we mock major external dependencies in `src/test/setup.ts`:

### **Database (Prisma)**
We mock the entire `prisma` client. Each test case can control the database response using mocked functions.
```typescript
// Example usage in a test
(prisma.note.findMany as any).mockResolvedValue([ { id: '1', title: 'Test Note' } ]);
```

### **AI SDK (Groq)**
All LLM completions are mocked. This prevents real network calls and allows us to test how the application handles different AI responses (valid JSON, error strings, etc.).

### **Authentication (NextAuth)**
We use a mock session context that defaults to a `test-user-id` with a `USER` role. This is handled by `createMockContext()` in `trpc-helper.ts`.

---

## 📝 5. Test Suite Descriptions

### **Unit Tests (`src/lib/utils.test.ts`)**
- Tests core text and date formatting functions.
- Ensures edge cases (like very long strings or invalid dates) are handled gracefully.

### **Auth Router (`auth.test.ts`)**
- **Registration**: Ensures new users can sign up and duplicate emails are rejected.
- **Password Change**: Verifies password hashing and validation of old credentials.

### **Notes Router (`notes.test.ts`)**
- **CRUD**: Full testing of note creation, retrieval, updates, and deletion.
- **Context**: Verifies that users can only see and modify their own notes.

### **Exams Router (`exams.test.ts`)**
- Tests exam scheduling logic.
- **AI Integration**: Mocks practice question generation.

### **Timetable Router (`timetable.test.ts`)**
- Tests manual slot management.
- **AI Integration**: Verifies that AI-generated schedules correctly overwrite old data.

### **Doubt Router (`doubt.test.ts`)**
- **AI Chat Flow**: Tests message sending, history building, and assistant reply persistence.

---

## 🛠️ 6. Writing New Tests

1.  **Utilities**: Create a `filename.test.ts` next to the code. Wrap tests in `describe()` and use `expect()`.
2.  **Routers**: Use the `/** @vitest-environment node */` header. Use `createMockContext()` to get a caller, and utilize `prisma` mocks to simulate database results.

> [!TIP]
> **Pro Tip**: Always use `vi.mockResolvedValue` to define the "Success path" and `vi.mockRejectedValue` to test "Error paths" (like a database failure).
