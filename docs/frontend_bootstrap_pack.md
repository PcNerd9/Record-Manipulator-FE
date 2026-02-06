# Frontend Bootstrap Pack — CRUD Dataset Manipulator Platform

> Purpose: Provide a **production-grade project skeleton** for a schema-driven, API-first, autosave-enabled dataset manipulation frontend.

This structure is optimized for:

* Scalability
* Maintainability
* Performance
* Cursor code generation accuracy
* Clean separation of concerns

---

# Tech Assumptions

* React + TypeScript
* Vite or Next.js (structure is framework-agnostic)
* Fetch API
* Cookie-based auth
* API-driven state

---

# Folder Structure

```
src/
├── api/                    # Domain API modules
│   ├── auth.api.ts
│   ├── dataset.api.ts
│   ├── record.api.ts
│   └── index.ts
│
├── lib/                    # Core utilities
│   ├── apiClient.ts        # transport layer
│   ├── env.ts
│   └── constants.ts
│
├── state/                  # State management
│   ├── auth.store.ts
│   ├── dataset.store.ts
│   ├── record.store.ts
│   ├── autosave.store.ts
│   └── index.ts
│
├── engines/                # Core logic engines
│   ├── autosave.engine.ts
│   ├── dirty.engine.ts
│   ├── pagination.engine.ts
│   ├── export.engine.ts
│   └── schema.engine.ts
│
├── components/             # Pure UI components
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── auth/
│   │   └── LoginForm.tsx
│   │
│   ├── dataset/
│   │   ├── DatasetList.tsx
│   │   ├── DatasetCard.tsx
│   │   └── UploadDataset.tsx
│   │
│   ├── table/
│   │   ├── DataTable.tsx
│   │   ├── TableHeader.tsx
│   │   ├── TableRow.tsx
│   │   ├── EditableCell.tsx
│   │   └── VirtualTable.tsx
│   │
│   ├── search/
│   │   └── RecordSearch.tsx
│   │
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loader.tsx
│   │   ├── Modal.tsx
│   │   └── EmptyState.tsx
│
├── pages/                  # Page-level composition
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── DatasetPage.tsx
│   └── UploadPage.tsx
│
├── routes/                 # Routing config
│   └── router.tsx
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useDatasets.ts
│   ├── useRecords.ts
│   ├── useAutosave.ts
│   ├── useInfiniteScroll.ts
│   └── useSchema.ts
│
├── types/                  # Global types
│   ├── auth.types.ts
│   ├── dataset.types.ts
│   ├── record.types.ts
│   └── api.types.ts
│
├── utils/                  # Helpers
│   ├── debounce.ts
│   ├── throttle.ts
│   ├── download.ts
│   └── validators.ts
│
└── main.tsx / App.tsx
```

---

# Core Files

## Transport Layer

### `lib/apiClient.ts`

```ts
export class APIClient {
  constructor(private baseUrl: string) {}

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { status: res.status, ...err };
    }

    return res.json();
  }

  get<T>(path: string) { return this.request<T>(path, { method: "GET" }); }
  post<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    });
  }
  put<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined
    });
  }
  delete<T>(path: string) { return this.request<T>(path, { method: "DELETE" }); }
}
```

---

# Engines

## Dirty Engine

```ts
export class DirtyEngine {
  private dirty = new Map<string, any>();

  mark(id: string, data: any) {
    this.dirty.set(id, data);
  }

  clear(id: string) {
    this.dirty.delete(id);
  }

  flush() {
    const payload = Array.from(this.dirty.values());
    this.dirty.clear();
    return payload;
  }

  hasDirty() {
    return this.dirty.size > 0;
  }
}
```

---

## Autosave Engine

```ts
export class AutosaveEngine {
  private timer: any = null;

  constructor(
    private flushFn: () => Promise<void>,
    private delay = 60000
  ) {}

  schedule() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flushFn(), this.delay);
  }

  force() {
    if (this.timer) clearTimeout(this.timer);
    return this.flushFn();
  }
}
```

---

## Pagination Engine

```ts
export class PaginationEngine {
  page = 1;
  hasMore = true;

  next() {
    if (!this.hasMore) return null;
    return ++this.page;
  }

  reset() {
    this.page = 1;
    this.hasMore = true;
  }
}
```

---

## Schema Engine

```ts
export function buildSchema(schema: Record<string, string>) {
  return Object.entries(schema).map(([key, type]) => ({ key, type }));
}
```

---

# Autosave Flow

```
Edit Row → Mark Dirty → Buffer → Autosave Timer → Batch API Call → Clear Dirty
```

---

# Dataset Page Data Flow

```
Upload → dataset_id
   ↓
Fetch Records (page 1)
   ↓
Render Table
   ↓
Scroll → fetch next page
   ↓
Edit → dirty engine
   ↓
Autosave engine
```

---

# Export Flow

```
Export Button → API → File Stream → Download Helper
```

---

# Mental Model

UI = Renderer
State = Controller
API = Authority
Engines = Logic

---

# Cursor Prompt Examples

"Generate DataTable component using schema.engine.ts and record.store.ts"

"Generate autosave integration using AutosaveEngine and DirtyEngine"

"Generate infinite scroll using pagination.engine.ts"

"Generate upload flow using dataset.api.ts"

---

# System Identity

Schema-driven
API-first
Autosave-native
Stateful-data
Stateless-UI

---

End of Bootstrap Pack
