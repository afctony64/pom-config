/**
 * 🔐 Shared AuthContext Mock
 *
 * Provides consistent authentication context mocking across all Pom frontend apps.
 * Part of pom-config shared frontend testing utilities.
 *
 * Usage in test files:
 *   import { createAuthContextMock, mockAuthContext } from '@pom-config/frontend/test';
 *
 *   vi.mock('../../contexts/AuthContext', () => createAuthContextMock());
 */

import { vi } from 'vitest';
import type { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: unknown;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle?: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
}

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================

export const defaultUser: User = {
  id: 'test-user-id-12345',
  email: 'test@pomothy.local',
  user_metadata: {
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
  },
  app_metadata: {
    provider: 'email',
  },
};

export const defaultSession: Session = {
  access_token: 'mock-access-token-xyz',
  refresh_token: 'mock-refresh-token-abc',
  expires_at: Date.now() + 3600000, // 1 hour from now
  expires_in: 3600,
  token_type: 'bearer',
};

// ============================================================================
// MOCK CONTEXT VALUE
// ============================================================================

/**
 * Standard mock AuthContext value - authenticated user
 * Customize by spreading and overriding specific properties
 */
export const mockAuthContext: AuthContextValue = {
  user: defaultUser,
  session: defaultSession,
  isAuthenticated: true,
  isLoading: false,
  error: null,

  // Actions (vi.fn() for assertion/customization)
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  signUp: vi.fn().mockResolvedValue(undefined),
  signInWithGoogle: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue(undefined),
};

/**
 * Mock AuthContext for unauthenticated state
 */
export const mockUnauthenticatedContext: AuthContextValue = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  signUp: vi.fn().mockResolvedValue(undefined),
};

/**
 * Mock AuthContext for loading state
 */
export const mockLoadingAuthContext: AuthContextValue = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
};

// ============================================================================
// MOCK FACTORY
// ============================================================================

/**
 * Creates a vi.mock module replacement for AuthContext
 *
 * @param overrides - Partial context to override defaults
 * @returns Object suitable for vi.mock()
 *
 * @example
 * // Authenticated user (default):
 * vi.mock('../../contexts/AuthContext', () => createAuthContextMock());
 *
 * @example
 * // Unauthenticated state:
 * vi.mock('../../contexts/AuthContext', () => createAuthContextMock({
 *   user: null,
 *   session: null,
 *   isAuthenticated: false,
 * }));
 *
 * @example
 * // Loading state:
 * vi.mock('../../contexts/AuthContext', () => createAuthContextMock({
 *   isLoading: true,
 *   isAuthenticated: false,
 * }));
 */
export const createAuthContextMock = (overrides: Partial<AuthContextValue> = {}) => ({
  useAuth: () => ({ ...mockAuthContext, ...overrides }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  AuthContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
    Consumer: ({ children }: { children: (value: AuthContextValue) => ReactNode }) =>
      children({ ...mockAuthContext, ...overrides }),
  },
});

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Reset all mock functions in mockAuthContext
 */
export const resetAuthMocks = () => {
  mockAuthContext.signIn.mockClear();
  mockAuthContext.signOut.mockClear();
  mockAuthContext.signUp.mockClear();
  mockAuthContext.signInWithGoogle?.mockClear();
  mockAuthContext.resetPassword?.mockClear();
};

/**
 * Create a custom user for testing
 */
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'custom-user-id',
  email: 'custom@test.local',
  user_metadata: { name: 'Custom User' },
  ...overrides,
});

/**
 * Create a custom session for testing
 */
export const createTestSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'custom-access-token',
  refresh_token: 'custom-refresh-token',
  expires_at: Date.now() + 3600000,
  ...overrides,
});

export default {
  mockAuthContext,
  mockUnauthenticatedContext,
  mockLoadingAuthContext,
  createAuthContextMock,
  resetAuthMocks,
  createTestUser,
  createTestSession,
  defaultUser,
  defaultSession,
};
