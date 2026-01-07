/**
 * 🧪 pom-config Frontend Test Utilities
 *
 * Shared testing utilities for all Pom frontend applications.
 * Provides consistent context mocking, render helpers, and test fixtures.
 *
 * Installation:
 *   Your app should sync pom-config via: ./scripts/pom_config.sh update
 *
 * Usage in test files:
 *   // Import mocks and helpers
 *   import {
 *     createTenantContextMock,
 *     createAuthContextMock,
 *     createGlobalDataMock,
 *     renderWithProviders,
 *   } from '@pom-config/frontend/test';
 *
 *   // Mock contexts BEFORE component imports
 *   vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
 *   vi.mock('../../contexts/AuthContext', () => createAuthContextMock());
 *   vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock());
 *
 *   // Import component AFTER mocks
 *   import MyComponent from '../MyComponent';
 *
 *   // Use renderWithProviders instead of render
 *   const { getByText } = renderWithProviders(<MyComponent />);
 *
 * @packageDocumentation
 */

// ============================================================================
// TENANT CONTEXT
// ============================================================================

export {
  // Types
  type Tenant,
  type TenantContextValue,
  // Mock values
  mockTenantContext,
  defaultTenants,
  // Factory
  createTenantContextMock,
  // Utilities
  resetTenantMocks,
  createTestTenant,
} from './mocks/TenantContextMock';

// ============================================================================
// AUTH CONTEXT
// ============================================================================

export {
  // Types
  type User,
  type Session,
  type AuthContextValue,
  // Mock values
  mockAuthContext,
  mockUnauthenticatedContext,
  mockLoadingAuthContext,
  defaultUser,
  defaultSession,
  // Factory
  createAuthContextMock,
  // Utilities
  resetAuthMocks,
  createTestUser,
  createTestSession,
} from './mocks/AuthContextMock';

// ============================================================================
// GLOBAL DATA CONTEXT
// ============================================================================

export {
  // Types
  type FieldDefinition,
  type ViewCard,
  type DataCard,
  type ReportCard,
  type LoadingStates,
  type UnifiedGlobalDataContextValue,
  // Mock values
  mockUnifiedGlobalData,
  mockLoadingGlobalData,
  mockEmptyGlobalData,
  defaultFields,
  defaultCollections,
  defaultViewCards,
  defaultDataCards,
  // Factory
  createGlobalDataMock,
  // Utilities
  resetGlobalDataMocks,
  createTestField,
  createTestViewCard,
  createTestDataCard,
} from './mocks/GlobalDataMock';

// ============================================================================
// RENDER HELPERS
// ============================================================================

export {
  // Types
  type ExtendedRenderOptions,
  type AllProvidersProps,
  // Components
  AllProviders,
  // Functions
  renderWithProviders,
  waitForAsync,
  waitFor,
  createMockApiResponse,
  createMockFetch,
} from './helpers/renderWithProviders';

// ============================================================================
// CONVENIENCE: RESET ALL MOCKS
// ============================================================================

import { resetTenantMocks } from './mocks/TenantContextMock';
import { resetAuthMocks } from './mocks/AuthContextMock';
import { resetGlobalDataMocks } from './mocks/GlobalDataMock';

/**
 * Reset all mock functions across all context mocks
 * Call this in afterEach() to ensure clean state between tests
 *
 * @example
 * afterEach(() => {
 *   resetAllMocks();
 * });
 */
export const resetAllMocks = (): void => {
  resetTenantMocks();
  resetAuthMocks();
  resetGlobalDataMocks();
};
