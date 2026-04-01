import { prisma } from '@/lib/prisma';

export const createMockContext = (session: any = null) => {
  return {
    session: session || {
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com', role: 'USER' },
      expires: new Date().toISOString(),
    },
    prisma,
  };
};
