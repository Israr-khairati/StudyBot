/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notesRouter } from './notes';
import { createMockContext } from '@/test/trpc-helper';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

describe('notesRouter', () => {
  const ctx = createMockContext();
  const caller = notesRouter.createCaller(ctx as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return notes for the current user', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1', userId: 'test-user-id' },
        { id: '2', title: 'Note 2', content: 'Content 2', userId: 'test-user-id' },
      ];

      (prisma.note.findMany as any).mockResolvedValue(mockNotes);

      const result = await caller.getAll({});

      expect(result).toEqual(mockNotes);
      expect(prisma.note.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter by subject', async () => {
      await caller.getAll({ subject: 'Math' });

      expect(prisma.note.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id', subject: 'Math' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const newNote = {
        title: 'New Note',
        content: 'New Content',
        subject: 'Science',
        chapter: 'Biology',
      };

      (prisma.note.create as any).mockResolvedValue({ id: 'new-id', ...newNote, userId: 'test-user-id' });

      const result = await caller.create(newNote);

      expect(result.title).toBe('New Note');
      expect(prisma.note.create).toHaveBeenCalledWith({
        data: { ...newNote, userId: 'test-user-id' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a note', async () => {
      (prisma.note.delete as any).mockResolvedValue({ id: '1' });

      const result = await caller.delete({ id: '1' });

      expect(result.success).toBe(true);
      expect(prisma.note.delete).toHaveBeenCalledWith({
        where: { id: '1', userId: 'test-user-id' },
      });
    });
  });
});
