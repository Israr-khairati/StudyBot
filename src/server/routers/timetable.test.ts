/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timetableRouter } from './timetable';
import { createMockContext } from '@/test/trpc-helper';
import { prisma } from '@/lib/prisma';
import { groq } from '@/lib/grok';

describe('timetableRouter', () => {
  const ctx = createMockContext();
  const caller = timetableRouter.createCaller(ctx as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return timetable slots', async () => {
      const mockSlots = [{ id: '1', day: 'Mon', subject: 'Math' }];
      (prisma.timetableSlot.findMany as any).mockResolvedValue(mockSlots);

      const result = await caller.get();
      expect(result).toEqual(mockSlots);
    });
  });

  describe('generate', () => {
    it('should call Groq, clear old slots, and save new ones', async () => {
      const mockTimetable = { slots: [{ day: 'Mon', startTime: '09:00', endTime: '10:00', subject: 'CS' }] };
      (groq.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockTimetable) } }],
      });
      (prisma.timetableSlot.findMany as any).mockResolvedValue(mockTimetable.slots);

      const result = await caller.generate({
        subjects: ['CS'],
        hoursPerSubject: { 'CS': 2 },
        availableSlots: [{ day: 'Mon', startTime: '09:00', endTime: '12:00' }],
      });

      expect(prisma.timetableSlot.deleteMany).toHaveBeenCalled();
      expect(prisma.timetableSlot.createMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('should delete all slots for current user', async () => {
      const result = await caller.clearAll();
      expect(result.success).toBe(true);
      expect(prisma.timetableSlot.deleteMany).toHaveBeenCalled();
    });
  });
});
