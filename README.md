# Shape Up Planner

A local-first annual planner based on the [Shape Up](https://basecamp.com/shapeup) methodology by 37signals. Plan your year in 6-week cycles, mark vacation weeks, drag tasks between weeks.

Live: https://7nolikov.dev/planner/

## Background

I work in backend / distributed systems (Go, Java). This was a weekend project to try SolidJS — an excuse to ship something in a reactive frontend framework outside React. AI assistance for the SolidJS-specific idioms.

Not a finished product. A working, deployed sandbox.

## Features

- 6-week sprint cycles
- Up to 5 vacation weeks between sprints
- Tasks per week, drag between weeks
- All state in `localStorage` — no backend
- Responsive, works on mobile

## Stack

- **Framework:** SolidJS
- **Styling:** Tailwind CSS
- **Icons:** Lucide-Solid
- **Build:** Vite
- **Storage:** `localStorage`

## Local development

```bash
git clone https://github.com/7nolikov/planner.git
cd planner
npm install
npm run dev
```

Production build:

```bash
npm run build
# output in dist/
```

## Usage

- **Start a sprint:** click "Start Sprint" on any unassigned week; the app creates a 6-week sprint from there.
- **Vacation:** click the palm tree icon on an unassigned week (max 5/year, must be between sprints).
- **Tasks:** click `+` on a week, drag between weeks, click to edit, check to complete.

## Deployment

Configured for GitHub Pages. Push to `main` to trigger the Actions workflow, or build locally and deploy `dist/` to any static host.

## Architecture

```
src/
├── components/    # SolidJS components
├── stores/        # Reactive state
├── services/      # Storage and utilities
├── types/         # TypeScript definitions
└── styles/        # Tailwind
```

## License

MIT.
