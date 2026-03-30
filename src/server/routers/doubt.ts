// src/server/routers/doubt.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { groq } from "@/lib/grok";

const SUBJECT_PROMPTS: Record<string, string> = {
  Physics:
    "You are an expert Physics tutor. Use clear explanations with formulas (in plain text), diagrams described in words, and real-world examples. Cover concepts from standard high school / undergraduate Physics.",
  Maths:
    "You are an expert Mathematics tutor. Provide step-by-step solutions with clear reasoning. Show all working. Use plain text for formulas (e.g. x^2 + 2x + 1).",
  Chemistry:
    "You are an expert Chemistry tutor. Explain concepts with equations, periodic table context, and reaction mechanisms where relevant.",
  CS: "You are an expert Computer Science tutor. Explain algorithms, data structures and programming concepts with pseudocode or code snippets where helpful.",
  English:
    "You are an expert English Literature and Language tutor. Help with comprehension, essay writing, grammar, and literary analysis.",
};

export const doubtRouter = createTRPCRouter({
  // Get all chats for the current user
  getChats: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chat.findMany({
      where: { userId: ctx.session.user.id },
      include: { 
        messages: { 
          orderBy: { createdAt: "desc" }, 
          take: 1 
        } 
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Get messages for a specific chat
  getMessages: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.prisma.chat.findUnique({
        where: { id: input.chatId, userId: ctx.session.user.id },
        include: { 
          messages: { 
            orderBy: { createdAt: "asc" } 
          } 
        },
      });
      if (!chat) throw new Error("Chat not found");
      return chat;
    }),

  // Create a new chat
  createChat: protectedProcedure
    .input(z.object({ subject: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chat.create({
        data: { userId: ctx.session.user.id, subject: input.subject },
      });
    }),

  // Send a message and get AI response with full session history
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        message: z.string().min(1).max(2000),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, message, subject } = input;

      // Verify chat belongs to user and load previous messages for context
      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId, userId: ctx.session.user.id },
        include: {
          messages: { 
            orderBy: { createdAt: "asc" }, 
            take: 50 // Increased context window for better history
          },
        },
      });
      if (!chat) throw new Error("Chat not found");

      // Save user message first to keep DB in sync
      await ctx.prisma.message.create({
        data: { chatId, role: "user", content: message },
      });

      // Update chat's updatedAt timestamp
      await ctx.prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      // Build conversation history for the AI
      const history = chat.messages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));
      
      // Add the current message to the AI context
      history.push({ role: "user", content: message });

      // Pick system prompt based on subject
      const systemPrompt =
        (subject && SUBJECT_PROMPTS[subject]) ??
        "You are StudyBot, a helpful AI tutor for high school and undergraduate students. Answer questions clearly and concisely. Use examples. You have access to the conversation history below to provide contextual answers.";

      // Call Groq with the full history
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
        ],
      });

      const assistantContent =
        response.choices[0]?.message?.content ??
        "Sorry, I could not generate a response.";

      // Save assistant message to the same chat history
      const saved = await ctx.prisma.message.create({
        data: { chatId, role: "assistant", content: assistantContent },
      });

      return { message: saved };
    }),

  // Delete a chat (and its history via Cascade)
  deleteChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.chat.delete({
        where: { id: input.chatId, userId: ctx.session.user.id },
      });
      return { success: true };
    }),
});
