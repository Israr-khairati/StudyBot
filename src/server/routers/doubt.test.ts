/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doubtRouter } from './doubt';
import { createMockContext } from '@/test/trpc-helper';
import { prisma } from '@/lib/prisma';
import { groq } from '@/lib/grok';

describe('doubtRouter', () => {
  const ctx = createMockContext();
  const caller = doubtRouter.createCaller(ctx as any);

  describe('getChats', () => {
    it('should return recent chats', async () => {
      const mockChats = [{ id: '1', subject: 'Math' }];
      (prisma.chat.findMany as any).mockResolvedValue(mockChats);

      const result = await caller.getChats();
      expect(result).toEqual(mockChats);
    });
  });

  describe('sendMessage', () => {
    it('should save user msg, get AI response, and save assistant msg', async () => {
      const mockChat = { id: 'c1', userId: 'test-user-id', messages: [] };
      const aiReply = 'AI Reply content';

      (prisma.chat.findUnique as any).mockResolvedValue(mockChat);
      (groq.chat.completions.create as any).mockResolvedValue({
        choices: [{ message: { content: aiReply } }],
      });
      (prisma.message.create as any).mockResolvedValue({ id: 'msg-new', content: aiReply });

      const result = await caller.sendMessage({
        chatId: 'c1',
        message: 'Sample question',
        subject: 'Math',
      });

      expect(result.message.content).toBe(aiReply);
      expect(prisma.message.create).toHaveBeenCalledTimes(2); // user msg + assistant msg
      expect(groq.chat.completions.create).toHaveBeenCalled();
    });
  });
});
