// src/server/root.ts
import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { doubtRouter } from "./routers/doubt";
import { timetableRouter } from "./routers/timetable";
import { notesRouter } from "./routers/notes";
import { examsRouter } from "./routers/exams";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  doubt: doubtRouter,
  timetable: timetableRouter,
  notes: notesRouter,
  exams: examsRouter,
});

export type AppRouter = typeof appRouter;
