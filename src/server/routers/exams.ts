// src/server/routers/exams.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { groq } from "@/lib/grok";

const QuestionTypeSchema = z.enum(["mcq", "short", "long", "true_false"]);

export const examsRouter = createTRPCRouter({
  // Get all exams
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.exam.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { date: "asc" },
    });
  }),

  // Create exam
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        title: z.string().min(1),
        date: z.date(),
        duration: z.number().min(30).max(300),
        room: z.string().optional(),
        chapters: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.exam.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  // Update exam
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string().optional(),
        title: z.string().optional(),
        date: z.date().optional(),
        duration: z.number().optional(),
        room: z.string().optional(),
        chapters: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.exam.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  // Delete exam
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.exam.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),

  // Generate practice questions
  generateQuestions: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        chapters: z.array(z.string()),
        types: z.array(QuestionTypeSchema).default(["mcq", "short"]),
        count: z.number().min(1).max(30).default(10),
        difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { subject, chapters, types, count, difficulty } = input;

      const typeDescriptions = {
        mcq: "multiple choice questions (with 4 options and the correct answer marked)",
        short: "short answer questions (1-2 sentence answers)",
        long: "long answer / essay questions",
        true_false: "true or false questions (with explanation)",
      };

      const selectedTypes = types.map((t) => typeDescriptions[t]).join(", ");

      const prompt = `Generate ${count} practice exam questions for ${subject}.
Chapters / topics covered: ${chapters.join(", ")}
Question types to include: ${selectedTypes}
Difficulty: ${difficulty}

Return ONLY a valid JSON array. Each question object must have:
- id: number
- type: "mcq" | "short" | "long" | "true_false"
- question: string
- options: string[] (for MCQ only, 4 options)
- answer: string (correct answer or model answer)
- explanation: string (brief explanation of the answer)
- difficulty: "easy" | "medium" | "hard"
- chapter: string (which chapter/topic this covers)

Return only the JSON array, no markdown fences or explanation.`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "[]";

      try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const questions = JSON.parse(cleaned);
        return { questions };
      } catch {
        throw new Error("Failed to parse questions from AI response");
      }
    }),

  // Get AI study plan for an exam
  getStudyPlan: protectedProcedure
    .input(z.object({ examId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const exam = await ctx.prisma.exam.findUnique({
        where: { id: input.examId, userId: ctx.session.user.id },
      });
      if (!exam) throw new Error("Exam not found");

      const daysUntilExam = Math.ceil(
        (exam.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const prompt = `Create a focused study plan for a student preparing for their ${exam.subject} exam.

Exam: ${exam.title}
Days until exam: ${daysUntilExam}
Duration: ${exam.duration} minutes
Chapters to cover: ${exam.chapters.join(", ")}

Provide a day-by-day study plan with:
1. Which chapters/topics to cover each day
2. Recommended study techniques for each topic
3. Practice question suggestions
4. Revision and mock test days
5. Last-day revision tips

Be realistic about the timeframe and prioritise the most important topics.`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        plan: response.choices[0]?.message?.content ?? "Could not generate study plan.",
        daysUntilExam,
      };
    }),
});
