/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/trpc';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock tRPC react hooks
vi.mock('@/lib/trpc', () => ({
  api: {
    doubt: {
      getChats: {
        useQuery: vi.fn(),
      },
    },
  },
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as any).mockReturnValue('/chat');
    (useSession as any).mockReturnValue({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });
  });

  it('renders the application logo and title', () => {
    (api.doubt.getChats.useQuery as any).mockReturnValue({ data: [], isLoading: false });
    render(<Sidebar />);
    expect(screen.getByText('StudyBot')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    (api.doubt.getChats.useQuery as any).mockReturnValue({ data: [], isLoading: false });
    render(<Sidebar />);
    expect(screen.getByText('Ask a doubt')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('displays user name and a sign out button when authenticated', () => {
    (api.doubt.getChats.useQuery as any).mockReturnValue({ data: [], isLoading: false });
    render(<Sidebar />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('displays recent chats when loaded', () => {
    const mockChats = [
      { id: 'chat-1', subject: 'Physics', messages: [{ content: 'Hello' }] },
    ];
    (api.doubt.getChats.useQuery as any).mockReturnValue({ data: mockChats, isLoading: false });
    
    render(<Sidebar />);
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows loading state for chats', () => {
    (api.doubt.getChats.useQuery as any).mockReturnValue({ data: undefined, isLoading: true });
    render(<Sidebar />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
