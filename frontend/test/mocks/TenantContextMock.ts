/**
 * 🏢 Shared TenantContext Mock
 *
 * Provides consistent tenant context mocking across all Pom frontend apps.
 * Part of pom-config shared frontend testing utilities.
 *
 * Usage in test files:
 *   import { createTenantContextMock, mockTenantContext } from '@pom-config/frontend/test';
 *
 *   vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
 */

import { vi } from 'vitest';
import type { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Tenant {
  tenant_id: string;
  tenant_name: string;
  description?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}

export interface TenantContextValue {
  availableTenants: Tenant[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  loadAvailableTenants: () => Promise<void>;
  selectTenant: (tenantId: string) => void;
  getCurrentTenantId: () => string;
  getCurrentTenant: () => Tenant | null;
}

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================

export const defaultTenants: Tenant[] = [
  {
    tenant_id: 'prismatic',
    tenant_name: 'Prismatic',
    description: 'Primary test tenant',
    role: 'admin',
    permissions: ['read', 'write', 'admin', 'delete'],
  },
  {
    tenant_id: 'test_db',
    tenant_name: 'Test DB',
    description: 'Secondary test tenant',
    role: 'viewer',
    permissions: ['read'],
  },
];

// ============================================================================
// MOCK CONTEXT VALUE
// ============================================================================

/**
 * Standard mock TenantContext value
 * Customize by spreading and overriding specific properties
 */
export const mockTenantContext: TenantContextValue = {
  // State
  availableTenants: defaultTenants,
  currentTenant: defaultTenants[0],
  isLoading: false,
  error: null,

  // Actions (vi.fn() for assertion/customization)
  loadAvailableTenants: vi.fn().mockResolvedValue(undefined),
  selectTenant: vi.fn(),
  getCurrentTenantId: vi.fn().mockReturnValue('prismatic'),
  getCurrentTenant: vi.fn().mockReturnValue(defaultTenants[0]),
};

// ============================================================================
// MOCK FACTORY
// ============================================================================

/**
 * Creates a vi.mock module replacement for TenantContext
 *
 * @param overrides - Partial context to override defaults
 * @returns Object suitable for vi.mock()
 *
 * @example
 * // At top of test file, BEFORE component imports:
 * vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
 *
 * @example
 * // With custom values:
 * vi.mock('../../contexts/TenantContext', () => createTenantContextMock({
 *   isLoading: true,
 *   getCurrentTenantId: vi.fn().mockReturnValue('custom_tenant'),
 * }));
 */
export const createTenantContextMock = (overrides: Partial<TenantContextValue> = {}) => ({
  useTenant: () => ({ ...mockTenantContext, ...overrides }),
  TenantProvider: ({ children }: { children: ReactNode }) => children,
  TenantContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
    Consumer: ({ children }: { children: (value: TenantContextValue) => ReactNode }) =>
      children({ ...mockTenantContext, ...overrides }),
  },
});

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Reset all mock functions in mockTenantContext
 */
export const resetTenantMocks = () => {
  mockTenantContext.loadAvailableTenants.mockClear();
  mockTenantContext.selectTenant.mockClear();
  mockTenantContext.getCurrentTenantId.mockClear();
  mockTenantContext.getCurrentTenant.mockClear();
};

/**
 * Create a custom tenant for testing
 */
export const createTestTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
  tenant_id: 'test_tenant',
  tenant_name: 'Test Tenant',
  description: 'Created for testing',
  role: 'admin',
  permissions: ['read', 'write'],
  ...overrides,
});

export default {
  mockTenantContext,
  createTenantContextMock,
  resetTenantMocks,
  createTestTenant,
  defaultTenants,
};
