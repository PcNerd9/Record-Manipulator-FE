# Implementation Plan — Dataset Manipulator Platform

> **Purpose**: Step-by-step roadmap for building the dataset manipulation platform from ground up.
> 
> **Architecture**: API-first, Schema-driven, Performance-oriented
> 
> **Last Updated**: 2026-02-06

---

## Implementation Philosophy

1. **Bottom-up approach**: Build foundation layers first, then build upon them
2. **Test as you go**: Verify each layer before moving to the next
3. **Incremental integration**: Connect layers incrementally, not all at once
4. **Performance by design**: Consider performance implications at each step

---

## Phase 1: Foundation Layer ⚙️

**Goal**: Establish core infrastructure that all other layers depend on.

### 1.1 Environment & Configuration
- [x] **File**: `src/lib/env.ts`
  - Create environment variable utilities
  - API base URL configuration
  - Environment detection (dev/prod)
  - **Acceptance**: Can read `VITE_API_BASE_URL` from environment ✅

### 1.2 Constants
- [x] **File**: `src/lib/constants.ts`
  - API endpoints constants
  - Autosave delay (60s)
  - Pagination defaults
  - Error messages
  - **Acceptance**: All constants exported and typed ✅

### 1.3 Type Definitions
- [x] **File**: `src/types/api.types.ts`
  - API response types
  - Error response types
  - Generic API types
- [x] **File**: `src/types/auth.types.ts`
  - User type
  - Login request/response
  - Auth state types
- [x] **File**: `src/types/dataset.types.ts`
  - Dataset type
  - Dataset list response
  - Upload response
- [x] **File**: `src/types/record.types.ts`
  - Record type (with dirty flag) - renamed to `DatasetRecord` to avoid conflict
  - Record list response (paginated)
  - Record update payload
  - Schema type (`Record<string, string>`)
- [x] **Acceptance**: All types defined, no `any` types, proper exports ✅

### 1.4 API Client (Transport Layer)
- [x] **File**: `src/lib/apiClient.ts`
  - Implement `APIClient` class
  - Cookie-aware requests (`credentials: include`)
  - Error normalization
  - Request/response interceptors
  - Token handling (in-memory only)
  - Session expiration detection
  - **Acceptance**: 
    - Can make authenticated requests ✅
    - Handles errors gracefully ✅
    - Supports GET, POST, PUT, DELETE ✅
    - Cookie-based auth works ✅

**Dependencies**: env.ts, constants.ts, api.types.ts

---

## Phase 2: Domain API Layer 🔌

**Goal**: Implement domain-specific API modules that communicate with backend.

### 2.1 Auth API
- [x] **File**: `src/api/auth.api.ts`
  - `login(email, password)` → returns `{ access_token, user }`
  - `logout()` → clears session
  - `getCurrentUser()` → fetches current user
  - `refreshToken()` → refreshes access token using cookie
  - **Acceptance**: 
    - Login flow works end-to-end ✅
    - Token stored in memory (not localStorage) ✅
    - Cookie refresh handled automatically ✅

**Dependencies**: apiClient.ts, auth.types.ts ✅

### 2.2 Dataset API
- [x] **File**: `src/api/dataset.api.ts`
  - `getDatasets()` → returns list of datasets
  - `getDataset(id)` → returns single dataset with schema
  - `uploadDataset(file)` → uploads CSV/Excel, returns `dataset_id`
  - `deleteDataset(id)` → deletes dataset
  - `exportDataset(id, format)` → triggers export (CSV/Excel), returns Blob
  - **Acceptance**: 
    - File upload works (FormData) ✅
    - Can fetch dataset list ✅
    - Can get dataset details with schema ✅

**Dependencies**: apiClient.ts, dataset.types.ts ✅

### 2.3 Record API
- [x] **File**: `src/api/record.api.ts`
  - `getRecords(datasetId, page, limit, search?)` → paginated records
  - `updateRecords(datasetId, records[])` → batch update (autosave)
  - `deleteRecord(datasetId, recordId)` → delete single record
  - `searchRecords(datasetId, column, value)` → search records
  - **Acceptance**: 
    - Pagination works ✅
    - Batch updates work ✅
    - Search functionality works ✅

**Dependencies**: apiClient.ts, record.types.ts ✅

**Dependencies**: Phase 1 complete ✅

---

## Phase 3: Utility Layer 🛠️

**Goal**: Build reusable utilities that support engines and components.

### 3.1 Core Utilities
- [x] **File**: `src/utils/debounce.ts`
  - Debounce function implementation ✅
  - Type-safe generic debounce ✅
  - Debounce with immediate execution option ✅
- [x] **File**: `src/utils/throttle.ts`
  - Throttle function implementation ✅
  - Type-safe generic throttle ✅
  - Throttle with leading/trailing edge options ✅
- [x] **File**: `src/utils/download.ts`
  - File download helper ✅
  - Blob to download conversion ✅
  - Filename handling ✅
  - Auto filename detection from content type ✅
- [x] **File**: `src/utils/validators.ts`
  - Schema-based validation utilities ✅
  - Type validation helpers ✅
  - Value conversion and sanitization ✅
- [x] **Acceptance**: All utilities tested and typed ✅

**Dependencies**: None (can be built in parallel) ✅

---

## Phase 4: Engine Layer 🎯

**Goal**: Implement core business logic engines.

### 4.1 Schema Engine
- [x] **File**: `src/engines/schema.engine.ts`
  - `buildSchema(schema)` → converts schema to array format ✅
  - `getInputType(type)` → maps schema type to input type ✅
  - `validateValueAgainstSchema(value, type)` → validates value against schema type ✅
  - Additional helpers: `getSchemaField`, `getSchemaKeys`, `hasSchemaField` ✅
  - **Acceptance**: 
    - Can parse schema ✅
    - Can determine input types from schema ✅
    - Validation works ✅

**Dependencies**: record.types.ts, validators.ts ✅

### 4.2 Dirty Engine
- [x] **File**: `src/engines/dirty.engine.ts`
  - Implement `DirtyEngine` class ✅
  - `mark(id, data)` → mark record as dirty ✅
  - `clear(id)` → clear dirty flag ✅
  - `flush()` → get all dirty records and clear ✅
  - `hasDirty()` → check if any dirty records ✅
  - `getDirty(id)` → get specific dirty record ✅
  - Additional methods: `update`, `getDirtyCount`, `clearAll`, `getDirtyIds` ✅
  - **Acceptance**: 
    - Tracks dirty records correctly ✅
    - Flush clears all dirty flags ✅
    - Can check dirty state ✅

**Dependencies**: record.types.ts ✅

### 4.3 Pagination Engine
- [x] **File**: `src/engines/pagination.engine.ts`
  - Implement `PaginationEngine` class ✅
  - `next()` → increment page, return page number ✅
  - `reset()` → reset to page 1 ✅
  - `setHasMore(hasMore)` → update pagination state ✅
  - `getCurrentPage()` → get current page ✅
  - Additional methods: `prev`, `goToPage`, `setMeta`, `getState` ✅
  - **Acceptance**: 
    - Page tracking works ✅
    - Can detect end of pagination ✅
    - Reset works correctly ✅

**Dependencies**: None ✅

### 4.4 Autosave Engine
- [x] **File**: `src/engines/autosave.engine.ts`
  - Implement `AutosaveEngine` class ✅
  - `schedule()` → schedule autosave (60s delay) ✅
  - `force()` → force immediate flush ✅
  - `cancel()` → cancel pending autosave ✅
  - Additional methods: `isSavingNow`, `isScheduled`, `setFlushFn`, `setDelay` ✅
  - **Acceptance**: 
    - Autosave triggers after 60s ✅
    - Force flush works immediately ✅
    - Can cancel pending autosave ✅

**Dependencies**: dirty.engine.ts ✅

### 4.5 Export Engine
- [x] **File**: `src/engines/export.engine.ts`
  - `exportDatasetAndDownload(datasetId, format, filename?)` → trigger export and download ✅
  - `handleDownload(blob, filename)` → handle file download ✅
  - Convenience functions: `exportAsCSV`, `exportAsExcel` ✅
  - **Acceptance**: 
    - Can trigger exports ✅
    - Downloads work correctly ✅

**Dependencies**: dataset.api.ts, download.ts ✅

**Dependencies**: Phase 2 & 3 complete

---

## Phase 5: State Management Layer 📦

**Goal**: Implement centralized state management for application data.

### 5.1 Auth Store
- [x] **File**: `src/state/auth.store.ts`
  - User state (current user, access token) ✅
  - Login state (loading, error) ✅
  - `login()`, `logout()`, `getUser()` actions ✅
  - Token management (in-memory) ✅
  - Observer pattern for React integration ✅
  - `initialize()` method to check existing auth ✅
  - **Acceptance**: 
    - Can store/retrieve user ✅
    - Login state tracked ✅
    - Logout clears state ✅

**Dependencies**: auth.api.ts, auth.types.ts ✅

### 5.2 Dataset Store
- [x] **File**: `src/state/dataset.store.ts`
  - Dataset list state ✅
  - Active dataset state (current dataset + schema) ✅
  - Loading/error states ✅
  - `fetchDatasets()`, `setActiveDataset()`, `addDataset()` actions ✅
  - `uploadDataset()`, `deleteDataset()` actions ✅
  - Observer pattern for React integration ✅
  - **Acceptance**: 
    - Can manage dataset list ✅
    - Active dataset tracked ✅
    - Loading states work ✅

**Dependencies**: dataset.api.ts, dataset.types.ts ✅

### 5.3 Record Store
- [x] **File**: `src/state/record.store.ts`
  - Records state (paginated records) ✅
  - Pagination state ✅
  - Search state ✅
  - Loading/error states ✅
  - `fetchRecords()`, `updateRecord()`, `deleteRecord()`, `searchRecords()` actions ✅
  - Integration with DirtyEngine ✅
  - Integration with PaginationEngine ✅
  - Support for infinite scroll (append mode) ✅
  - **Acceptance**: 
    - Records stored correctly ✅
    - Pagination state managed ✅
    - Can update/delete records ✅

**Dependencies**: record.api.ts, record.types.ts, dirty.engine.ts, pagination.engine.ts ✅

### 5.4 Autosave Store
- [x] **File**: `src/state/autosave.store.ts`
  - Autosave state (pending, saving, last saved, error) ✅
  - Integration with AutosaveEngine ✅
  - Integration with DirtyEngine (via record store) ✅
  - `triggerAutosave()`, `forceSave()`, `getAutosaveStatus()` actions ✅
  - Tracks dirty count automatically ✅
  - Observer pattern for React integration ✅
  - **Acceptance**: 
    - Autosave state tracked ✅
    - Can trigger autosave ✅
    - Status updates correctly ✅

**Dependencies**: autosave.engine.ts, dirty.engine.ts, record.api.ts ✅

**Dependencies**: Phase 2 & 4 complete

---

## Phase 6: Custom Hooks Layer 🎣

**Goal**: Create React hooks that bridge state/engines with components.

### 6.1 Auth Hooks
- [x] **File**: `src/hooks/useAuth.ts`
  - `useAuth()` → returns auth state and actions ✅
  - Handles login/logout flow ✅
  - Auto-initializes auth on mount ✅
  - **Acceptance**: Components can use auth state ✅

**Dependencies**: auth.store.ts ✅

### 6.2 Dataset Hooks
- [x] **File**: `src/hooks/useDatasets.ts`
  - `useDatasets()` → returns dataset list and actions ✅
  - `useDataset(id)` → returns single dataset ✅
  - Auto-fetches datasets on mount ✅
  - **Acceptance**: Components can fetch/manage datasets ✅

**Dependencies**: dataset.store.ts ✅

### 6.3 Record Hooks
- [x] **File**: `src/hooks/useRecords.ts`
  - `useRecords(datasetId)` → returns records and pagination ✅
  - `useRecord(datasetId, recordId)` → returns single record ✅
  - Auto-fetches records when datasetId changes ✅
  - Provides access to dirty and pagination engines ✅
  - **Acceptance**: Components can fetch/manage records ✅

**Dependencies**: record.store.ts ✅

### 6.4 Autosave Hook
- [x] **File**: `src/hooks/useAutosave.ts`
  - `useAutosave()` → returns autosave state and controls ✅
  - Handles autosave lifecycle ✅
  - Provides status, dirty count, and time remaining ✅
  - **Acceptance**: Components can trigger/manage autosave ✅

**Dependencies**: autosave.store.ts ✅

### 6.5 Schema Hook
- [x] **File**: `src/hooks/useSchema.ts`
  - `useSchema(datasetId)` → returns schema and utilities ✅
  - Provides schema fields, validation, and field helpers ✅
  - Memoized for performance ✅
  - **Acceptance**: Components can access schema ✅

**Dependencies**: dataset.store.ts, schema.engine.ts ✅

### 6.6 Infinite Scroll Hook
- [x] **File**: `src/hooks/useInfiniteScroll.ts`
  - `useInfiniteScroll(options)` → handles infinite scroll ✅
  - `useInfiniteScrollWindow(options)` → window-based scroll ✅
  - Integration with pagination engine ✅
  - Configurable threshold and enabled state ✅
  - **Acceptance**: Can detect scroll and trigger pagination ✅

**Dependencies**: pagination.engine.ts ✅

**Dependencies**: Phase 5 complete

---

## Phase 7: Common UI Components 🎨

**Goal**: Build reusable, pure UI components.

### 7.1 Basic Components
- [ ] **File**: `src/components/common/Button.tsx`
  - Button component with variants (primary, secondary, danger)
  - Loading state support
  - Disabled state
- [ ] **File**: `src/components/common/Input.tsx`
  - Input component with types (text, email, password, number)
  - Error state support
  - Label support
- [ ] **File**: `src/components/common/Loader.tsx`
  - Loading spinner component
  - Size variants
- [ ] **File**: `src/components/common/Modal.tsx`
  - Modal/dialog component
  - Open/close state management
- [ ] **File**: `src/components/common/EmptyState.tsx`
  - Empty state component
  - Customizable message and CTA
- [ ] **Acceptance**: 
  - All components styled with Tailwind
  - Accessible (ARIA labels)
  - Type-safe props

**Dependencies**: None (pure UI)

---

## Phase 8: Layout Components 🏗️

**Goal**: Build application shell and navigation.

### 8.1 App Shell
- [ ] **File**: `src/components/layout/AppShell.tsx`
  - Main application layout
  - Header, content area, footer structure
- [ ] **File**: `src/components/layout/Navbar.tsx`
  - Navigation bar
  - User menu
  - Logout button
- [ ] **File**: `src/components/layout/Sidebar.tsx` (optional)
  - Sidebar navigation (if needed)
- [ ] **Acceptance**: 
  - Layout works on all pages
  - Navigation functional
  - Responsive design

**Dependencies**: useAuth.ts, common components

---

## Phase 9: Feature Components 🔧

**Goal**: Build domain-specific components.

### 9.1 Auth Components
- [ ] **File**: `src/components/auth/LoginForm.tsx`
  - Email/password inputs
  - Submit handler
  - Error display
  - Loading state
  - **Acceptance**: Login flow works end-to-end

**Dependencies**: useAuth.ts, common components

### 9.2 Dataset Components
- [ ] **File**: `src/components/dataset/DatasetList.tsx`
  - List of datasets
  - Empty state
  - Loading state
- [ ] **File**: `src/components/dataset/DatasetCard.tsx`
  - Individual dataset card
  - Name, dates display
  - Click to navigate
- [ ] **File**: `src/components/dataset/UploadDataset.tsx`
  - File input
  - Upload handler
  - Progress indicator
  - **Acceptance**: 
    - Can upload files
    - Shows progress
    - Redirects after upload

**Dependencies**: useDatasets.ts, common components

### 9.3 Table Components
- [ ] **File**: `src/components/table/VirtualTable.tsx`
  - Virtual scrolling implementation
  - Performance optimization
- [ ] **File**: `src/components/table/DataTable.tsx`
  - Main table component
  - Schema-driven columns
  - Row rendering
- [ ] **File**: `src/components/table/TableHeader.tsx`
  - Column headers from schema
  - Sort indicators (if needed)
- [ ] **File**: `src/components/table/TableRow.tsx`
  - Individual row component
  - Edit mode support
  - Delete button
- [ ] **File**: `src/components/table/EditableCell.tsx`
  - Editable cell component
  - Schema-based input types
  - Dirty tracking integration
  - **Acceptance**: 
    - Table renders from schema
    - Can edit cells
    - Dirty tracking works
    - Virtual scrolling smooth

**Dependencies**: useRecords.ts, useSchema.ts, useAutosave.ts, schema.engine.ts, common components

### 9.4 Search Components
- [ ] **File**: `src/components/search/RecordSearch.tsx`
  - Column selector (from schema)
  - Value input
  - Search button
  - Clear button
  - **Acceptance**: Search works correctly

**Dependencies**: useRecords.ts, useSchema.ts, common components

**Dependencies**: Phase 6 & 7 complete

---

## Phase 10: Pages 📄

**Goal**: Compose pages from components.

### 10.1 Login Page
- [ ] **File**: `src/pages/LoginPage.tsx`
  - LoginForm component
  - Redirect logic (if already logged in)
  - **Acceptance**: Can login and redirect to dashboard

**Dependencies**: LoginForm.tsx, useAuth.ts

### 10.2 Dashboard Page
- [ ] **File**: `src/pages/DashboardPage.tsx`
  - DatasetList component
  - Upload button
  - Empty state handling
  - **Acceptance**: 
    - Shows dataset list
    - Can navigate to upload
    - Empty state shows correctly

**Dependencies**: DatasetList.tsx, UploadDataset.tsx, useDatasets.ts

### 10.3 Upload Page
- [ ] **File**: `src/pages/UploadPage.tsx`
  - UploadDataset component
  - Loading state ("Dataset is being processed...")
  - Auto-redirect after upload
  - **Acceptance**: 
    - Upload works
    - Shows loading state
    - Redirects to dataset page

**Dependencies**: UploadDataset.tsx, useDatasets.ts

### 10.4 Dataset Page
- [ ] **File**: `src/pages/DatasetPage.tsx`
  - DataTable component
  - RecordSearch component
  - Export buttons (CSV/Excel)
  - Manual save button
  - Autosave status indicator
  - Infinite scroll integration
  - **Acceptance**: 
    - Table renders with data
    - Can edit records
    - Autosave works
    - Search works
    - Export works
    - Infinite scroll works

**Dependencies**: DataTable.tsx, RecordSearch.tsx, useRecords.ts, useAutosave.ts, export.engine.ts

**Dependencies**: Phase 9 complete

---

## Phase 11: Routing 🛣️

**Goal**: Set up application routing.

### 11.1 Router Configuration
- [ ] **File**: `src/routes/router.tsx`
  - Install React Router (if not using framework router)
  - Define routes:
    - `/login` → LoginPage
    - `/dashboard` → DashboardPage
    - `/upload` → UploadPage
    - `/dataset/:id` → DatasetPage
  - Protected routes (require auth)
  - Redirect logic
  - **Acceptance**: 
    - All routes work
    - Protected routes redirect to login
    - Navigation works

**Dependencies**: All pages, useAuth.ts

### 11.2 App Integration
- [ ] **File**: `src/App.tsx`
  - Router integration
  - Error boundary
  - Global error handling
  - **Acceptance**: App runs with routing

**Dependencies**: router.tsx

**Dependencies**: Phase 10 complete

---

## Phase 12: Integration & Polish ✨

**Goal**: Final integration, error handling, and optimizations.

### 12.1 Error Handling
- [ ] Global error boundary
  - **File**: `src/components/common/ErrorBoundary.tsx`
  - Catches React errors
  - Displays error UI
- [ ] API error handling
  - Session expiration handling
  - Network error handling
  - Validation error display
- [ ] **Acceptance**: Errors handled gracefully

### 12.2 Loading States
- [ ] Consistent loading indicators
- [ ] Skeleton loaders (optional)
- [ ] **Acceptance**: Loading states consistent

### 12.3 Performance Optimization
- [ ] Memoization (React.memo, useMemo, useCallback)
- [ ] Code splitting (lazy loading routes)
- [ ] Virtual scrolling optimization
- [ ] **Acceptance**: App performs well with large datasets

### 12.4 Accessibility
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] **Acceptance**: App is accessible

### 12.5 Testing & Validation
- [ ] Test critical flows:
  - Login flow
  - Upload flow
  - Edit + autosave flow
  - Search flow
  - Export flow
- [ ] **Acceptance**: All critical flows work

**Dependencies**: All previous phases

---

## Implementation Checklist Summary

### Foundation (Phase 1-2)
- [x] Environment & Constants ✅
- [x] Type Definitions ✅
- [x] API Client ✅
- [x] Domain APIs (Auth, Dataset, Record) ✅

### Core Logic (Phase 3-4)
- [x] Utilities (debounce, throttle, download, validators) ✅
- [x] Engines (Schema, Dirty, Pagination, Autosave, Export) ✅

### State & Hooks (Phase 5-6)
- [x] State Stores (Auth, Dataset, Record, Autosave) ✅
- [x] Custom Hooks (useAuth, useDatasets, useRecords, useAutosave, useSchema, useInfiniteScroll) ✅

### UI (Phase 7-9)
- [ ] Common Components
- [ ] Layout Components
- [ ] Feature Components (Auth, Dataset, Table, Search)

### Pages & Routing (Phase 10-11)
- [ ] All Pages (Login, Dashboard, Upload, Dataset)
- [ ] Router Configuration

### Polish (Phase 12)
- [ ] Error Handling
- [ ] Performance Optimization
- [ ] Accessibility
- [ ] Testing

---

## Key Principles to Follow

1. **API-first**: Always use domain APIs, never raw fetch in components
2. **Schema-driven**: No hardcoded columns or forms
3. **Performance**: Virtual scrolling, memoization, batched updates
4. **Stateful data, stateless UI**: Business logic in stores/engines, UI is pure
5. **Autosave reliability**: Zero data loss, retry on failure
6. **Clean separation**: Each layer has single responsibility

---

## Notes

- **State Management**: Consider using Zustand, Jotai, or similar lightweight state library
- **Virtual Scrolling**: Consider `react-window` or `@tanstack/react-virtual` for virtualization
- **Form Handling**: Consider `react-hook-form` if complex forms needed
- **Date Formatting**: Consider `date-fns` or similar for date display
- **File Upload**: Use native FormData API

---

## Success Metrics

- ✅ All pages functional
- ✅ Autosave works reliably (60s timer)
- ✅ Can handle 1000+ records smoothly
- ✅ Zero data loss on autosave
- ✅ Search works correctly
- ✅ Export works (CSV/Excel)
- ✅ No hardcoded schemas
- ✅ Clean, maintainable codebase

---

**Next Steps**: Start with Phase 1.1 (Environment & Configuration)
