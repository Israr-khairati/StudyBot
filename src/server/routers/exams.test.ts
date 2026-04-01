/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { examsRouter } from './exams';
import { createMockContext } from '@/test/trpc-helper';
import { prisma } from '@/lib/prisma';
import { groq } from '@/lib/grok';

describe('examsRouter', () => {
  const ctx = createMockContext();
  const caller = examsRouter.createCaller(ctx as any);

  describe('getAll', () => {
    it('should return exams sorted by date', async () => {
      const mockExams = [{ id: '1', title: 'Math Final', date: new Date() }];
      (prisma.exam.findMany as any).mockResolvedValue(mockExams);

      const result = await caller.getAll();
      expect(result).toEqual(mockExams);
      expect(prisma.exam.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        orderBy: { date: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create an exam', async () => {
      const input = {
        subject: 'Physics',
        title: 'Midterm',
        date: new Date(),
        duration: 120,
        chapters: ['Mechanics'],
      };

      (prisma.exam.create as any).mockResolvedValue({ id: 'ex-1', ...input });

      const result = await caller.create(input);
      expect(result.id).toBe('ex-1');
    });
  });

  describe('generateQuestions', () => {
    it('should call Groq and parse JSON response', async () => {
      const mockQuestions = [{ id: 1, question: 'What is F=ma?', answer: 'Newton 2nd Law' }];
      (groq.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockQuestions) } }],
      });

      const result = await caller.generateQuestions({
        subject: 'Physics',
        chapters: ['Force'],
      });

      expect(result).toEqual({ questions: mockQuestions });
      expect(groq.chat.completions.create).toHaveBeenCalled();
    });
  });
});
