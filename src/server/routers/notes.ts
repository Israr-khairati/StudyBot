// src/server/routers/notes.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { groq } from "@/lib/grok";

export const notesRouter = createTRPCRouter({
  // Get all notes
  getAll: protectedProcedure
    .input(
      z.object({
        subject: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.note.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.subject ? { subject: input.subject } : {}),
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" } },
                  { content: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  // Get single note
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.note.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),

  // Create note
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        subject: z.string(),
        chapter: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.note.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  // Update note
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        subject: z.string().optional(),
        chapter: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.note.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  // Delete note
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.note.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),

  // AI summarise a note
  summarise: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.prisma.note.findUnique({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      if (!note) throw new Error("Note not found");

      const prompt = `Summarise the following ${note.subject} notes into key bullet points. 
Focus on the most important concepts, formulas, and facts a student would need for an exam.
Format as clear, concise bullet points grouped by topic.

Notes title: ${note.title}
${note.chapter ? `Chapter: ${note.chapter}` : ""}

Notes content:
${note.content}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const summary = response.choices[0]?.message?.content ?? "Could not generate summary.";

      return ctx.prisma.note.update({
        where: { id: input.id },
        data: { summary },
      });
    }),

  // AI generate notes from a topic
  generateFromTopic: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(2),
        subject: z.string(),
        chapter: z.string().optional(),
        depth: z.enum(["brief", "detailed", "comprehensive"]).default("detailed"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { topic, subject, chapter, depth } = input;

      const depthGuide = {
        brief: "2-3 paragraphs with key points only",
        detailed: "comprehensive notes with explanations, examples and formulas",
        comprehensive:
          "full structured notes with introduction, main concepts, worked examples, common mistakes, and exam tips",
      };

      const prompt = `Generate ${depthGuide[depth]} on the topic: "${topic}" for a ${subject} student.
${chapter ? `This is part of chapter: ${chapter}` : ""}

Format the notes clearly with headings, bullet points, formulas (in plain text), and examples where relevant.
Make the content accurate, educational, and exam-focused.`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content ?? "Could not generate notes.";

      return ctx.prisma.note.create({
        data: {
          title: `${topic} — AI Notes`,
          content,
          subject,
          chapter,
          userId: ctx.session.user.id,
        },
      });
    }),
});
