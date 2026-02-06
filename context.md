# Frontend System Context — CRUD Dataset Manipulator Platform


This project is a **data platform frontend**, not a simple CRUD UI. It is API-driven, schema-driven, stateful, and performance-oriented.

---

## Core Principles

* API-first (backend is source of truth)
* Schema-driven UI (no hardcoded columns/forms)
* Modular architecture
* Clean separation of concerns
* Predictable state management
* Autosave reliability
* Scalable data handling
* Performance-first rendering
* Stateless UI, stateful data layer
* Backend-controlled auth/session

---

## Product Scope

A **dataset manipulation platform** that allows users to:

* Upload CSV/Excel files
* Process datasets on backend
* View records in paginated tables
* Edit records dynamically
* Autosave modified records
* Delete records
* Search records by column/value
* Export datasets as CSV/Excel
* Manage multiple datasets

---

## Authentication Flow

### Login

1. User submits `email + password`
2. Backend validates
3. Backend returns:

   * `access_token`
   * `user object`
   * `refresh_token` (HTTP-only cookie)

Frontend behavior:

* Store access token in memory
* Use cookie-based refresh
* `credentials: include` for all requests
* No token storage in localStorage

---

## Application Pages

### 1. Login Page

* Email input
* Password input
* Submit → backend auth
* On success → redirect to dashboard

---

### 2. Dashboard Page

Displays user's datasets in list format:

Each dataset item shows:

* Dataset name
* Date created
* Date updated

Top-right:

* **Upload New Dataset** button

If no datasets:

* Empty state message
* Upload dataset CTA button

---

### 3. Upload Flow

User uploads CSV/Excel file:

Flow:

1. File selected
2. File sent to backend
3. Loading state:

   * "Dataset is being processed, please wait"
4. Backend returns `dataset_id`
5. Frontend automatically:

   * Fetch paginated records
   * Render dataset table

---

### 4. Dataset Viewer Page

Features:

#### Table

* Paginated records
* Dynamic columns (from schema)
* Infinite scroll
* Virtualized rendering

#### Row Editing

* Each row editable independently
* Edited rows marked as `dirty`

#### Autosave System

* Dirty rows buffered
* Autosave timer: 60s
* Batched updates
* Manual save button (force flush)

#### Delete

* Per-row delete button
* Immediate backend sync

#### Search

* Column selector
* Value input
* Backend query

#### Export

* Export as CSV
* Export as Excel

---

## Data Flow Architecture

```
Backend API
   ↓
API Client Layer
   ↓
Domain API Modules
   ↓
State Layer
   ↓
UI Components
```

---

## Frontend Architecture Layers

### 1. Transport Layer

* Central API client
* Cookie-aware
* Error normalization
* Request abstraction

---

### 2. Domain API Layer

Separated by domain:

* authAPI
* datasetAPI
* recordAPI

Each module:

* Single responsibility
* No UI logic

---

### 3. State Layer

Responsibilities:

* Dataset list state
* Active dataset state
* Record pagination state
* Dirty record buffer
* Autosave queue
* Loading states
* Error states

---

### 4. UI Layer

Responsibilities:

* Rendering only
* No business logic
* No API logic
* No validation logic

---

## Autosave Architecture

### Dirty Tracking

Each record:

```
{
  id: string,
  data: {},
  dirty: boolean
}
```

### Autosave Engine

* Buffer dirty records
* Debounced timer (60s)
* Batch send
* Retry on failure
* Manual flush support

---

## Pagination Strategy

* Infinite scroll
* Cursor or page-based pagination
* Virtualized rows
* Lazy loading

---

## Performance Requirements

* No full-table re-renders
* Row-level updates only
* Virtual scrolling
* Batched state updates
* Debounced autosave
* Lazy API fetching
* Schema memoization

---

## Schema-Driven UI

No hardcoded columns.

All UI generated from:

```
data_schema: Record<string, string>
```

Controls:

* Input types derived from schema
* Validation derived from schema
* Table headers derived from schema

---

## Export System

Frontend triggers backend export:

* CSV export endpoint
* Excel export endpoint

Frontend handles download

---

## Error Handling

* API error normalization
* Global error boundary
* Session expiration handling
* Autosave retry queue

---

## Non-Goals

* No frontend auth logic
* No token lifecycle logic
* No business rules in UI
* No schema hardcoding
* No backend logic duplication

---

## Implementation Constraints

* Modular file structure
* Domain separation
* Single-responsibility components
* Predictable state
* Testable architecture
* Clean abstractions
* Low coupling
* High cohesion

---

## Cursor Optimization Rules

When generating code:

* Always use domain APIs
* Never use raw fetch in components
* Always isolate state
* No monolithic components
* No mixed responsibilities
* No hardcoded schemas
* No inline business logic
* No duplicated logic

---

## Mental Model

This is not a form app.
This is not a CRUD demo.
This is not a spreadsheet clone.

This is a:

> **Schema-driven data platform frontend**

---

## Success Criteria

* Handles large datasets
* Smooth scrolling
* Stable autosave
* Zero data loss
* Clean state flow
* Predictable behavior
* Maintainable codebase
* Scalable architecture

---

## Primary System Goal

Build a **production-grade dataset manipulation interface** that is:

* Fast
* Reliable
* Scalable
* Clean
* Maintainable
* API-driven
* Schema-driven
* User-safe

---

## Architectural Identity

"Thin UI, Thick Backend"
"Stateful Data Layer, Stateless UI"
"Schema as Contract"
"API as Authority"
"Performance by Design"

---

End of context
