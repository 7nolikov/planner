# Shape Up Planner - Project Assessment

## What It Is

A local-first, browser-based annual planning tool built on the Shape Up methodology (37signals). Users plan their year in 6-week sprint cycles with vacation tracking and per-week task management. No backend, no accounts - everything lives in `localStorage`.

**Stack**: SolidJS + TypeScript + Tailwind CSS + Vite. ~2,000 lines of source across 18 files. Two runtime dependencies (`solid-js`, `lucide-solid`).

---

## Architecture

```
Browser (localStorage)
  └── SolidJS App
        ├── Stores (yearStore, sprintStore, uiStore)
        │     └── createStore + produce() for immutable reactive state
        ├── Services
        │     ├── StorageService  → localStorage read/write
        │     ├── YearGenerator   → ISO 8601 week generation
        │     └── DragDropManager → HTML5 drag-drop abstraction
        └── Components
              ├── App.tsx         → Shell (header, main, footer)
              ├── YearView        → Orchestrates sections (sprints, vacation, unassigned)
              ├── SprintCard      → 6-week sprint with color bar + edit button
              ├── VacationCard    → Grouped vacation weeks
              ├── WeekCell        → Single week card with tasks + actions
              ├── TaskItem        → Draggable task row
              ├── EditModal       → Sprint title/goal editor
              └── YearSelector    → Year navigation (prev/next)
```

**Data flow**: Components dispatch actions to stores -> stores mutate state via `produce()` -> `StorageService.saveYear()` persists to `localStorage` -> SolidJS reactivity re-renders affected components.

**Data model**: `YearData` contains `Week[]` (52-53 per year), `Sprint[]` (up to 8), and `vacationWeekIds[]` (max 5). Each `Week` holds `Task[]`. Sprints reference weeks by ID.

### Architecture Verdict

Clean and appropriate for the scope. SolidJS's fine-grained reactivity means no unnecessary re-renders. The store/service/component separation is solid. The codebase is small enough that the current architecture doesn't over-abstract anything.

---

## Feature Analysis

### Necessary Features (keep)

| Feature | Why |
|---------|-----|
| **6-week sprint creation** | Core of Shape Up methodology. Click any unassigned week -> creates sprint spanning 6 consecutive weeks. Works well. |
| **Sprint metadata (title, goal pitch, color)** | Essential for differentiating sprints at a glance. 8 color themes with auto-assignment. |
| **Vacation week toggle** | Shape Up prescribes cooldown between cycles. Max-5 constraint enforces discipline. |
| **Per-week task management** | Needed to break sprint goals into weekly deliverables. CRUD operations work. |
| **Task drag-and-drop between weeks** | Rescheduling tasks across weeks is a core planning interaction. HTML5 drag API with visual feedback. |
| **Year navigation** | Multi-year planning is a real need. Previous/next year buttons with independent data per year. |
| **localStorage persistence** | The local-first constraint is a feature, not a limitation. Zero setup, zero hosting cost, works offline. |
| **"Fill year pattern" seeding** | Good onboarding - instantly creates 8 sprints with vacation gaps so users see the intended layout. |

### Redundant / Dead Features (remove or rethink)

| Feature | Issue |
|---------|-------|
| **`reorderWeeks()` function** | Exported from `yearStore` (line 208-233) but never called anywhere. No UI for week reordering exists. Week order is determined by calendar position - reordering weeks doesn't make conceptual sense in an annual planner. **Remove.** |
| **`WEEKS_PER_YEAR` constant** | Defined in `types/index.ts:73` but never used. Years can have 52 or 53 weeks, so a hardcoded 52 is also wrong. **Remove.** |
| **`exportAll()` / `importAll()` in StorageService** | Implemented (lines 122-149) but no UI exposes them. Export/import is useful but currently dead code. **Either wire up to UI or remove.** |
| **`hasYear()` in StorageService** | Never called. `loadYear()` already returns `null` when no data exists, making this redundant. **Remove.** |
| **Week editing in `EditModal`** | The `EditModalState` type supports `type: 'week'` and `EditModal` has conditional branches for it, but no code ever opens the modal in `'week'` mode. **Remove the dead branch or implement it.** |
| **`availableWeeks` memo in `YearView`** | Wraps `unassignedWeeks()` with zero transformation (line 53-55). Adds indirection with no value. **Inline or remove.** |
| **ESLint script without config** | `package.json` has `"lint": "eslint src --ext .ts,.tsx"` but no `.eslintrc` file exists. Running `npm run lint` would fail. **Either add config or remove the script.** |
| **"Clear all data" button placement** | Two separate `<div>` containers in the footer for two buttons that should be in the same row. Minor but sloppy. |

### Missing Features (would add real value)

| Feature | Rationale |
|---------|-----------|
| **Data export/import UI** | `StorageService` already has the logic. A "Download JSON" / "Upload JSON" button in the footer would protect users from data loss (browser clear, device switch). Low effort, high value. |
| **Sprint deletion confirmation** | Deleting a sprint loses all week assignments. Currently no confirmation dialog. |
| **Current week indicator** | `YearGenerator` has `getCurrentWeekId()` but no UI highlights "you are here." This is arguably the most useful at-a-glance information for a planner. |
| **Sprint progress indicator** | Tasks have `completed` status but there's no aggregated progress view (e.g., "4/7 tasks done" on the sprint card). |
| **Keyboard shortcuts** | No keyboard navigation. Tab/Enter for task creation, Escape to close modal, arrow keys for year navigation would improve power-user experience. |

---

## UX Assessment

### What Works

- **Dark theme with color-coded sprints**: Visually distinct sprint blocks make the year scannable. The 8-color palette is well-chosen.
- **Information density**: The year stats bar (weeks, sprints, vacation count, available weeks) gives instant context.
- **Empty state guidance**: When no sprints exist, a clear CTA explains what to do.
- **Responsive grid**: 7 columns on desktop (one per day-of-week mental model), 4 on tablet, 2 on mobile. Appropriate breakpoints.
- **Sticky header**: Year selector stays accessible while scrolling through 52 weeks of content.
- **Inline task creation**: Quick-add without modal interruption is the right call for frequent actions.

### What Doesn't Work

- **No sense of "now"**: There is no visual indicator of the current week. Users open the planner and have to mentally calculate where they are in the year. This is the single biggest UX gap.
- **Footer actions are buried**: "Fill year pattern" and "Clear all data" are at the bottom of a page that can be very long. These are setup/reset actions that most users need once. They could be in a settings dropdown in the header.
- **Sprint creation is inflexible**: Clicking "Start Sprint" on week 50 tries to create a 6-week sprint, but only 2-3 weeks remain. The system should either prevent this or warn the user.
- **No undo**: Deleting a sprint or clearing all data is permanent. `localStorage` makes undo cheap to implement (snapshot before destructive operations).
- **Vacation limit UX**: The max-5 vacation weeks constraint is silently enforced. Users click the vacation toggle and nothing happens with no feedback about why.
- **Goal pitch is plain text pretending to be markdown**: The `goalPitch` field is typed as "Markdown content" but rendered as plain text in the UI. Either add markdown rendering or drop the markdown pretense.
- **Modal-heavy sprint editing**: Editing a sprint title requires opening a modal. Inline editing (click title to edit) would be faster for this single-field operation.

---

## Scope Redefinition

The project is well-scoped as a lightweight planning tool. It does one thing and does it mostly right. The recommended scope adjustments:

### Trim

1. Remove dead code: `reorderWeeks`, `WEEKS_PER_YEAR`, `hasYear`, `availableWeeks` wrapper memo, dead week-edit modal branch
2. Remove the non-functional lint script or add proper ESLint config

### Add (high value, low effort)

1. Current week highlight - `YearGenerator.getCurrentWeekId()` already exists, just wire it to a CSS class
2. Export/import buttons - `StorageService.exportAll()`/`importAll()` already exist, just add UI
3. Silent failure feedback - show toast/message when vacation limit is reached
4. Sprint deletion confirmation dialog

### Do Not Add

- Cloud sync, authentication, or multi-user features - these would fundamentally change the architecture and the local-first value proposition
- Calendar integrations - out of scope for a planning tool
- Gantt charts or complex visualizations - the week grid is the right abstraction for Shape Up
- Mobile app - the responsive web app is sufficient

---

## Summary

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Architecture** | Good | Clean separation, appropriate tech choices, minimal dependencies |
| **Code quality** | Good | Strict TypeScript, consistent patterns, some dead code to clean up |
| **Feature completeness** | Adequate | Core planning loop works; missing "current week" and export are notable gaps |
| **UX** | Mixed | Strong visual design; weak on feedback, discoverability, and temporal orientation |
| **Test coverage** | None | No tests exist. Acceptable for current size, risky for growth |
| **Deployment** | Good | Automated GitHub Pages via Actions. Zero-config for users |

The project is a focused, well-built planning tool that needs minor cleanup (dead code removal) and a few targeted additions (current week indicator, export/import UI, user feedback on constraints) to be genuinely useful for day-to-day Shape Up planning.
