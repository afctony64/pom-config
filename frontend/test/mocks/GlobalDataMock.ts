/**
 * 📊 Shared UnifiedGlobalDataProvider Mock
 *
 * Provides consistent global data context mocking across all Pom frontend apps.
 * Part of pom-config shared frontend testing utilities.
 *
 * Usage in test files:
 *   import { createGlobalDataMock, mockUnifiedGlobalData } from '@pom-config/frontend/test';
 *
 *   vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock());
 */

import { vi } from 'vitest';
import type { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface FieldDefinition {
  name: string;
  label: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  description?: string;
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ViewCard {
  id: string;
  name: string;
  display_type: 'table' | 'pivot' | 'chart' | 'cards';
  description?: string;
}

export interface DataCard {
  id: string;
  name: string;
  collection: string;
  description?: string;
}

export interface ReportCard {
  id: string;
  name: string;
  description?: string;
}

export interface LoadingStates {
  collections: boolean;
  viewCards: boolean;
  dataCards: boolean;
  reportCards?: boolean;
  fields?: boolean;
}

export interface UnifiedGlobalDataContextValue {
  // Core state
  isLoading: boolean;
  metadata: Record<string, unknown>;
  collections: string[];
  viewCards: ViewCard[];
  dataCards: DataCard[];
  reportCards: ReportCard[];
  loadingStates: LoadingStates;
  errors: Record<string, string>;

  // Field accessors
  getFieldsBySet: (setName: string) => FieldDefinition[];
  getFieldSets: () => string[];
  getDataCardFields: (dataCardId: string) => FieldDefinition[];

  // Actions
  refreshMetadata: () => Promise<void>;
  setCurrentTenant: (tenantId: string) => void;
}

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================

export const defaultFields: FieldDefinition[] = [
  { name: 'accountName', label: 'Company Name', dataType: 'string', sortable: true, filterable: true },
  { name: 'industry', label: 'Industry', dataType: 'string', sortable: true, filterable: true },
  { name: 'annualRevenue', label: 'Annual Revenue', dataType: 'number', sortable: true },
  { name: 'employeeCount', label: 'Employees', dataType: 'number', sortable: true },
  { name: 'website', label: 'Website', dataType: 'string' },
  { name: 'createdAt', label: 'Created', dataType: 'date', sortable: true },
];

export const defaultCollections: string[] = [
  'Company_source',
  'Company_opportunity',
  'Domain',
  'Page_content',
  'Company_research',
];

export const defaultViewCards: ViewCard[] = [
  { id: 'basic_table', name: 'Basic Table', display_type: 'table' },
  { id: 'pivot_table', name: 'Pivot Table', display_type: 'pivot' },
  { id: 'revenue_chart', name: 'Revenue Chart', display_type: 'chart' },
];

export const defaultDataCards: DataCard[] = [
  { id: 'company_source', name: 'Company Source', collection: 'Company_source' },
  { id: 'domain_list', name: 'Domain List', collection: 'Domain' },
  { id: 'opportunities', name: 'Opportunities', collection: 'Company_opportunity' },
];

// ============================================================================
// MOCK CONTEXT VALUE
// ============================================================================

/**
 * Standard mock UnifiedGlobalData value
 * Customize by spreading and overriding specific properties
 */
export const mockUnifiedGlobalData: UnifiedGlobalDataContextValue = {
  // Core state
  isLoading: false,
  metadata: {},
  collections: defaultCollections,
  viewCards: defaultViewCards,
  dataCards: defaultDataCards,
  reportCards: [],
  loadingStates: {
    collections: false,
    viewCards: false,
    dataCards: false,
    reportCards: false,
    fields: false,
  },
  errors: {},

  // Field accessors (vi.fn() for assertion/customization)
  getFieldsBySet: vi.fn().mockReturnValue(defaultFields),
  getFieldSets: vi.fn().mockReturnValue(['standard', 'extended', 'all']),
  getDataCardFields: vi.fn().mockReturnValue(defaultFields.slice(0, 3)),

  // Actions
  refreshMetadata: vi.fn().mockResolvedValue(undefined),
  setCurrentTenant: vi.fn(),
};

/**
 * Mock for loading state
 */
export const mockLoadingGlobalData: UnifiedGlobalDataContextValue = {
  ...mockUnifiedGlobalData,
  isLoading: true,
  loadingStates: {
    collections: true,
    viewCards: true,
    dataCards: true,
    reportCards: true,
    fields: true,
  },
};

/**
 * Mock for empty state (no data loaded)
 */
export const mockEmptyGlobalData: UnifiedGlobalDataContextValue = {
  ...mockUnifiedGlobalData,
  collections: [],
  viewCards: [],
  dataCards: [],
  reportCards: [],
  getFieldsBySet: vi.fn().mockReturnValue([]),
  getDataCardFields: vi.fn().mockReturnValue([]),
};

// ============================================================================
// MOCK FACTORY
// ============================================================================

/**
 * Creates a vi.mock module replacement for UnifiedGlobalDataProvider
 *
 * @param overrides - Partial context to override defaults
 * @returns Object suitable for vi.mock()
 *
 * @example
 * // Default with data:
 * vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock());
 *
 * @example
 * // Loading state:
 * vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock({
 *   isLoading: true,
 *   loadingStates: { collections: true, viewCards: true, dataCards: true },
 * }));
 *
 * @example
 * // Custom collections:
 * vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock({
 *   collections: ['Custom_collection'],
 *   getFieldsBySet: vi.fn().mockReturnValue([{ name: 'custom', label: 'Custom', dataType: 'string' }]),
 * }));
 */
export const createGlobalDataMock = (overrides: Partial<UnifiedGlobalDataContextValue> = {}) => ({
  useUnifiedGlobalData: () => ({ ...mockUnifiedGlobalData, ...overrides }),
  UnifiedGlobalDataProvider: ({ children }: { children: ReactNode }) => children,
});

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Reset all mock functions in mockUnifiedGlobalData
 */
export const resetGlobalDataMocks = () => {
  mockUnifiedGlobalData.getFieldsBySet.mockClear();
  mockUnifiedGlobalData.getFieldSets.mockClear();
  mockUnifiedGlobalData.getDataCardFields.mockClear();
  mockUnifiedGlobalData.refreshMetadata.mockClear();
  mockUnifiedGlobalData.setCurrentTenant.mockClear();
};

/**
 * Create a custom field definition for testing
 */
export const createTestField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition => ({
  name: 'testField',
  label: 'Test Field',
  dataType: 'string',
  sortable: true,
  filterable: true,
  ...overrides,
});

/**
 * Create a custom view card for testing
 */
export const createTestViewCard = (overrides: Partial<ViewCard> = {}): ViewCard => ({
  id: 'test_view',
  name: 'Test View',
  display_type: 'table',
  ...overrides,
});

/**
 * Create a custom data card for testing
 */
export const createTestDataCard = (overrides: Partial<DataCard> = {}): DataCard => ({
  id: 'test_data',
  name: 'Test Data Card',
  collection: 'Test_collection',
  ...overrides,
});

export default {
  mockUnifiedGlobalData,
  mockLoadingGlobalData,
  mockEmptyGlobalData,
  createGlobalDataMock,
  resetGlobalDataMocks,
  createTestField,
  createTestViewCard,
  createTestDataCard,
  defaultFields,
  defaultCollections,
  defaultViewCards,
  defaultDataCards,
};
