// src/server/routers/timetable.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { groq } from "@/lib/grok";

const SlotSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri"]),
  startTime: z.string(),
  endTime: z.string(),
  subject: z.string(),
  room: z.string().optional(),
});

export const timetableRouter = createTRPCRouter({
  // Get current timetable
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.timetableSlot.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  }),

  // Generate timetable via AI
  generate: protectedProcedure
    .input(
      z.object({
        subjects: z.array(z.string()).min(1).max(10),
        hoursPerSubject: z.record(z.string(), z.number()),
        availableSlots: z.array(
          z.object({
            day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri"]),
            startTime: z.string(),
            endTime: z.string(),
          })
        ),
        preferences: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { subjects, hoursPerSubject, availableSlots, preferences } = input;

      const prompt = `Generate a weekly study timetable for a student.
      
Subjects: ${subjects.join(", ")}
Desired hours per week per subject: ${JSON.stringify(hoursPerSubject)}
Available time slots: ${JSON.stringify(availableSlots)}
Additional preferences: ${preferences ?? "None"}

You MUST return a JSON object with a single key "slots" which contains an array of timetable slots.
Each slot must have:
- day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri"
- startTime: "HH:MM" (24hr format)
- endTime: "HH:MM" (24hr format)
- subject: string
- room: string (e.g. "Room 101", "Library", "Home")

Distribute subjects evenly and respect the available slots. Return ONLY the JSON object.`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";

      let slots: z.infer<typeof SlotSchema>[] = [];
      try {
        const parsed = JSON.parse(raw);
        // Llama with json_object usually returns { "slots": [...] } or similar
        const slotsData = parsed.slots || parsed.timetable || (Array.isArray(parsed) ? parsed : []);
        slots = z.array(SlotSchema).parse(slotsData);
      } catch (e) {
        console.error("Timetable parse error:", e, raw);
        throw new Error("Failed to parse timetable from AI response. Please try again.");
      }

      // Clear existing timetable and save new one
      await ctx.prisma.timetableSlot.deleteMany({
        where: { userId: ctx.session.user.id },
      });

      await ctx.prisma.timetableSlot.createMany({
        data: slots.map((s) => ({ ...s, userId: ctx.session.user.id })),
      });

      return ctx.prisma.timetableSlot.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
      });
    }),

  // Add a single slot manually
  addSlot: protectedProcedure
    .input(SlotSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timetableSlot.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  // Delete a slot
  deleteSlot: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.timetableSlot.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
      return { success: true };
    }),

  // Clear entire timetable
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.timetableSlot.deleteMany({
      where: { userId: ctx.session.user.id },
    });
    return { success: true };
  }),
});
