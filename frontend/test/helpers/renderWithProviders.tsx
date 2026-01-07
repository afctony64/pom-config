/**
 * 🎨 Shared Render Helper
 *
 * Provides a custom render function that wraps components with all required
 * context providers. Use this instead of @testing-library/react's render.
 *
 * Usage:
 *   import { renderWithProviders } from '@pom-config/frontend/test';
 *
 *   const { getByText } = renderWithProviders(<MyComponent />);
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement, ReactNode } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

export interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for testing navigation
   * @default '/'
   */
  route?: string;

  /**
   * Use MemoryRouter instead of BrowserRouter (better for isolated tests)
   * @default false
   */
  useMemoryRouter?: boolean;

  /**
   * Initial history entries for MemoryRouter
   */
  initialEntries?: string[];
}

export interface AllProvidersProps {
  children: ReactNode;
  route?: string;
  useMemoryRouter?: boolean;
  initialEntries?: string[];
}

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

/**
 * AllProviders - Wraps children with all required context providers
 *
 * Note: This assumes you've mocked the actual context modules at the top
 * of your test file using createTenantContextMock, createAuthContextMock, etc.
 *
 * This wrapper primarily provides routing context.
 */
export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  route = '/',
  useMemoryRouter = false,
  initialEntries,
}) => {
  if (useMemoryRouter) {
    const entries = initialEntries || [route];
    return <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>;
  }

  // For BrowserRouter, we need to set the route in history
  if (typeof window !== 'undefined' && route !== '/') {
    window.history.pushState({}, 'Test page', route);
  }

  return <BrowserRouter>{children}</BrowserRouter>;
};

// ============================================================================
// RENDER FUNCTION
// ============================================================================

/**
 * Custom render function that wraps component with all providers
 *
 * @param ui - The React element to render
 * @param options - Extended render options including route and router type
 * @returns RenderResult from @testing-library/react
 *
 * @example
 * // Basic usage:
 * const { getByText, getByRole } = renderWithProviders(<MyComponent />);
 *
 * @example
 * // With specific route:
 * renderWithProviders(<Dashboard />, { route: '/dashboard/reports' });
 *
 * @example
 * // With MemoryRouter for isolated tests:
 * renderWithProviders(<Navigation />, {
 *   useMemoryRouter: true,
 *   initialEntries: ['/page1', '/page2'],
 * });
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
): RenderResult {
  const {
    route = '/',
    useMemoryRouter = false,
    initialEntries,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      route={route}
      useMemoryRouter={useMemoryRouter}
      initialEntries={initialEntries}
    >
      {children}
    </AllProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// ============================================================================
// ADDITIONAL HELPERS
// ============================================================================

/**
 * Wait for async operations to complete
 * Useful for waiting for useEffect or state updates
 */
export const waitForAsync = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Wait for a specific amount of time
 * Use sparingly - prefer waitFor from testing-library
 */
export const waitFor = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock API response object
 */
export const createMockApiResponse = <T,>(
  data: T,
  status = 200
): {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
  text: () => Promise<string>;
} => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

/**
 * Create a mock fetch function for API testing
 */
export const createMockFetch = <T,>(data: T, status = 200) => {
  return jest.fn().mockResolvedValue(createMockApiResponse(data, status));
};

export default {
  AllProviders,
  renderWithProviders,
  waitForAsync,
  waitFor,
  createMockApiResponse,
  createMockFetch,
};
