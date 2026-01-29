# 🧪 pom-config Frontend Test Utilities

Shared testing utilities for all Pom frontend applications. Provides consistent context mocking, render helpers, and test fixtures across Pomothy, PomAI, and future apps.

## Why Shared Test Utilities?

All Pom frontend apps share common patterns:

- **TenantContext** - Multi-tenant organization selection
- **AuthContext** - Supabase authentication state
- **UnifiedGlobalDataProvider** - Metadata, collections, field definitions

Testing these requires consistent mocking. This package ensures:

1. ✅ **Consistency** - Same mocks work across all apps
2. ✅ **Maintenance** - Update once, benefit everywhere
3. ✅ **Best Practices** - Follows the pom-config shared pattern

## Installation

The frontend test utilities sync with pom-config:

```bash
./scripts/pom_config.sh update
```

This places the utilities in `.pom_config_pkg/frontend/test/`.

## Setup

### 1. Configure Path Alias

In your app's `vite.config.ts` or `tsconfig.json`:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@pom-config': path.resolve(__dirname, '../../.pom_config_pkg'),
  },
}
```

Or in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@pom-config/*": ["./.pom_config_pkg/*"]
    }
  }
}
```

### 2. Import Pattern

**CRITICAL**: Mock modules BEFORE importing components:

```typescript
// ✅ CORRECT ORDER
import { vi } from 'vitest';
import { createTenantContextMock, createAuthContextMock } from '@pom-config/frontend/test';

// Mock FIRST
vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
vi.mock('../../contexts/AuthContext', () => createAuthContextMock());

// Import component AFTER
import MyComponent from '../MyComponent';
```

```typescript
// ❌ WRONG - Mocks applied too late
import MyComponent from '../MyComponent';
import { createTenantContextMock } from '@pom-config/frontend/test';
vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
```

## Usage Examples

### Basic Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import {
  createTenantContextMock,
  createAuthContextMock,
  createGlobalDataMock,
  renderWithProviders,
} from '@pom-config/frontend/test';

// Mock contexts
vi.mock('../../contexts/TenantContext', () => createTenantContextMock());
vi.mock('../../contexts/AuthContext', () => createAuthContextMock());
vi.mock('../../contexts/UnifiedGlobalDataProvider', () => createGlobalDataMock());

import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  it('renders with tenant name', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Prismatic')).toBeInTheDocument();
  });
});
```

### Custom Mock Values

```typescript
vi.mock('../../contexts/TenantContext', () =>
  createTenantContextMock({
    getCurrentTenantId: vi.fn().mockReturnValue('custom_tenant'),
    isLoading: true,
  })
);

vi.mock('../../contexts/AuthContext', () =>
  createAuthContextMock({
    isAuthenticated: false,
    user: null,
  })
);
```

### Testing with Routes

```typescript
renderWithProviders(<Navigation />, { route: '/dashboard/reports' });

// Or with MemoryRouter for isolated tests
renderWithProviders(<Breadcrumbs />, {
  useMemoryRouter: true,
  initialEntries: ['/page1', '/page2', '/page3'],
});
```

### Reset Mocks Between Tests

```typescript
import { resetAllMocks } from '@pom-config/frontend/test';

afterEach(() => {
  resetAllMocks();
});
```

## API Reference

### Mock Factories

| Function | Description |
|----------|-------------|
| `createTenantContextMock(overrides?)` | Mock for TenantContext |
| `createAuthContextMock(overrides?)` | Mock for AuthContext |
| `createGlobalDataMock(overrides?)` | Mock for UnifiedGlobalDataProvider |

### Mock Values

| Export | Description |
|--------|-------------|
| `mockTenantContext` | Default tenant context (prismatic, admin) |
| `mockAuthContext` | Default authenticated user |
| `mockUnifiedGlobalData` | Default global data state |
| `mockUnauthenticatedContext` | Auth context for logged-out state |
| `mockLoadingAuthContext` | Auth context during loading |
| `mockEmptyGlobalData` | Empty global data state |

### Render Helpers

| Function | Description |
|----------|-------------|
| `renderWithProviders(ui, options?)` | Custom render with all providers |
| `AllProviders` | Wrapper component for manual use |
| `waitForAsync()` | Wait for microtask queue |
| `createMockApiResponse(data, status?)` | Create mock fetch response |

### Test Utilities

| Function | Description |
|----------|-------------|
| `createTestTenant(overrides?)` | Create custom tenant for testing |
| `createTestUser(overrides?)` | Create custom user for testing |
| `createTestField(overrides?)` | Create custom field definition |
| `resetAllMocks()` | Clear all mock function calls |

## Default Mock Data

### Tenant

```typescript
{
  tenant_id: 'prismatic',
  tenant_name: 'Prismatic',
  role: 'admin',
  permissions: ['read', 'write', 'admin', 'delete'],
}
```

### User

```typescript
{
  id: 'test-user-id-12345',
  email: 'test@pomothy.local',
  user_metadata: { name: 'Test User' },
}
```

### Collections

```typescript
['Source', 'Company_opportunity', 'Domain', 'Page_content', 'Research']
```

## Relationship to pom-config

This follows the same pattern as other pom-config shared resources:

| Resource | Directory | Purpose |
|----------|-----------|---------|
| **Schemas** | `schemas/` | Weaviate collection definitions |
| **Data Cards** | `data_cards/` | DataFactory fetch configurations |
| **Prompts** | `prompts/` | LLM prompt templates |
| **Frontend Test** | `frontend/test/` | Shared test utilities |

All sync via `./scripts/pom_config.sh update`.

## See Also

- [Frontend Testing Standards](../../../pom-docs/docs/web/FRONTEND_TESTING_STANDARDS.md)
- [Shared Config Guide](../../../pom-docs/docs/infrastructure/SHARED_CONFIG_GUIDE.md)
- [pom-config Strategy](../../../pom-docs/docs/architecture/POM_CONFIG_STRATEGY.md)
