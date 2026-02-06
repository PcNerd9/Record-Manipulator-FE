# Cursor Rules — Dataset Manipulator Frontend

> Purpose: Enforce clean architecture, scalability, and production-grade frontend standards when generating code with Cursor.

These rules are **non-negotiable**. Any generated code must follow them.

---

## Global Architecture Rules

### 1. Layer Separation (Strict)

Code MUST respect this layering:

```
UI Components
    ↓
Hooks
    ↓
State Layer
    ↓
Domain APIs
    ↓
Transport Layer (apiClient)
```


### Forbidden:
- ❌ UI calling fetch()
- ❌ UI calling APIClient directly
- ❌ UI calling backend endpoints
- ❌ UI mutating backend payloads
- ❌ UI managing tokens
- ❌ UI storing auth state logic

---

## API Rules

- All backend communication must go through:
  - `apiClient.ts`
  - domain APIs (`auth.api.ts`, `dataset.api.ts`, `record.api.ts`)
- No raw fetch in components
- No inline endpoints in UI

---

## State Rules

- State is centralized
- No local component state for:
  - datasets
  - records
  - auth
  - autosave
  - pagination
- Components may only use derived state

---

## Schema Rules

- No hardcoded fields
- No hardcoded column names
- No hardcoded forms
- No hardcoded validation
- All rendering must be driven by `data_schema`

---

## Autosave Rules

- Must use:
  - `DirtyEngine`
  - `AutosaveEngine`
- No manual timers in components
- No inline debounce logic in UI
- No autosave logic in components

---

## Pagination Rules

- Must use `PaginationEngine`
- Infinite scroll only
- No page buttons
- No offset logic in UI

---

## Performance Rules

- Virtualized tables only
- No full re-renders on row edit
- Row-level state updates only
- Batched API calls
- Debounced autosave
- Memoized schema rendering

---

## Editing Rules

- Row editing is isolated
- Dirty state tracked per row
- No full-table dirty flags
- No global re-renders

---

## Export Rules

- Export via backend only
- No frontend CSV generation
- No frontend Excel generation
- Always use export engine

---

## Auth Rules

- Cookie-based session only
- No token persistence in localStorage
- No refresh logic in UI
- No token rotation logic
- No manual cookie handling

---

## Error Handling Rules

- Global error boundary
- API error normalization
- Retry queues for autosave
- Graceful degradation

---

## Folder Discipline

### No file may:
- exceed 300 lines
- mix responsibilities
- contain business logic in UI
- contain API logic in UI
- contain schema logic in UI
- contain state mutation in UI

---

## Naming Rules

- Engines → `*.engine.ts`
- Stores → `*.store.ts`
- APIs → `*.api.ts`
- Hooks → `use*.ts`
- Components → `*.tsx`

---

## Non-Goals Enforcement

### Cursor must never generate:
- monolithic components
- god objects
- mixed-layer files
- logic-heavy UI components
- schema-hardcoded forms
- fetch calls in components
- backend duplication logic
- token managers
- frontend auth logic

---

## Mental Model

UI = Renderer  
State = Controller  
API = Authority  
Engines = Logic  
Schema = Contract  

---

## System Identity

> Schema-driven, API-first, autosave-native, performance-oriented data platform frontend

---

## Enforcement Directive

If a request violates any rule:
- Do not generate code
- Respond with architectural correction
- Suggest compliant structure

---

End of Rules