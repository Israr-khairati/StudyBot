# 🛡️ StudyBot Testing: Edge Case Guide

This guide outlines critical edge cases and "unhappy paths" that should be tested to ensure StudyBot's resilience in production.

---

## 🔐 1. Authentication & Security

| Feature | Edge Case | Expected Behavior |
|---|---|---|
| **Signup** | Password < 6 characters | Rejected by Zod (UI shows error). |
| **Signup** | Invalid email format (e.g. `test@test`) | Rejected by Zod. |
| **Signup** | Duplicate email registration | Should throw `CONFLICT` (handled in integration tests). |
| **Signin** | Incorrect password for existing email | Should throw `UNAUTHORIZED`. |
| **Account** | Accessing `/chat` while logged out | Auto-redirect to `/auth/signin`. |
| **Session** | Session expires while user is typing | Graceful re-authentication (using `NextAuth` middleware). |

---

## 🧠 2. AI Doubts & Chat (Groq Integration)

| Feature | Edge Case | Expected Behavior |
|---|---|---|
| **Input** | Sending an empty message | Button should be disabled (preventing empty API calls). |
| **Input** | Extremely long message (> 2000 chars) | UI should prevent input or truncate; server should reject. |
| **AI Failure** | Groq API returns a 500 error | Show "Sorry, I'm having trouble right now" to the user. |
| **AI Response** | Assistant returns malformed Markdown | React markdown renderer should handle it without crashing. |
| **History** | Returning to a chat with > 50 messages | Context window should use the last 50, not overflow token limits. |
| **Context** | AI hallucinations | UI should provide a disclaimer ("AI can make mistakes"). |

---

## 📝 3. Note Management

| Feature | Edge Case | Expected Behavior |
|---|---|---|
| **Creation** | Empty title or content | UI validation preventing save. |
| **Formatting** | Note with special math chars (`∫`, `∑`, `π`) | Should render correctly in the note viewer. |
| **AI Summary** | Summarizing a note that is only one sentence | Summary should be concise, not "AI-fluff." |
| **Delete** | Deleting a note while it's being summarized | Summary save should fail gracefully if note ID is missing. |
| **Search** | Searching for a term with special regex chars (`*`, `?`) | Search should treat them as literals, not crash the server. |

---

## 📅 4. Timetable & Exam Tracker

| Feature | Edge Case | Expected Behavior |
|---|---|---|
| **Timetable** | Overlapping slots (e.g. two classes at 9:00 AM) | UI should visually highlight the overlap; AI should avoid overlaps. |
| **Timetable** | Slot crossing midnight | Start time 23:00, End time 01:00 should handle duration correctly. |
| **Exams** | Date set in the past | Allowed (historical tracking) but marked clearly in UI. |
| **Exam Plan** | 0 days until exam | AI should generate an "emergency" cramming plan. |
| **Questions** | AI fails to return valid JSON for questions | UI should show "Failed to generate questions. Please try again." |

---

## 📱 5. UI & Responsiveness (System Tests)

| Feature | Edge Case | Expected Behavior |
|---|---|---|
| **Sidebar** | Mobile screen width | Sidebar should collapse into a "hamburger" menu or slide away. |
| **Modals** | Pressing `Esc` key during note creation | Should confirm if the user wants to discard changes. |
| **Loading** | Slow 3G network | Show skeletons or spinners for all dynamic content (Recent Chats, Notes). |
| **Refresh** | Refreshing `/chat/[id]` directly | Should load the specific chat history correctly (tested in E2E). |

---

## 🛠️ Testing these Cases
Most of these are verified in the `*.test.ts` files or `tests/e2e/*.spec.ts`.
- **To test an AI failure**: Mock `groq.chat.completions.create` to throw an error in your test.
- **To test validation**: Try sending invalid inputs to your tRPC caller and `expect(result.code).toBe("BAD_REQUEST")`.
