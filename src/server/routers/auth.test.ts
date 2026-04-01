/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from './auth';
import { createMockContext } from '@/test/trpc-helper';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';


describe('authRouter', () => {
  describe('register', () => {
    const ctx = createMockContext(null); // No session needed for publicProcedure
    const caller = authRouter.createCaller(ctx as any);

    it('should register a new user', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user-1',
        name: input.name,
        email: input.email,
      });

      const result = await caller.register(input);

      expect(result).toEqual({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw CONFLICT if email already exists', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

      await expect(caller.register(input)).rejects.toThrow(
        new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      );
    });
  });

  describe('changePassword', () => {
    const ctx = createMockContext(); // Authed user
    const caller = authRouter.createCaller(ctx as any);

    it('should change password successfully', async () => {
      const input = {
        oldPassword: 'old_password',
        newPassword: 'new_password123',
      };

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'test-user-id',
        password: 'hashed_old_password',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await caller.changePassword(input);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED if old password is invalid', async () => {
      const input = {
        oldPassword: 'wrong_password',
        newPassword: 'new_password123',
      };

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'test-user-id',
        password: 'hashed_old_password',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(caller.changePassword(input)).rejects.toThrow(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid old password',
        })
      );
    });
  });
});
