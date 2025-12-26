# Shape Up Planner

A local-first web application for annual planning based on the **Shape Up** methodology by 37signals.

## Features

- **6-Week Sprint Cycles**: Plan your year in focused 6-week work sprints
- **Vacation Planning**: Mark up to 4 weeks as vacation between sprints
- **Task Management**: Add, edit, and drag tasks between weeks
- **Local-First**: All data stored in browser localStorage - no backend needed
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fast**: Built with SolidJS for maximum runtime performance

## Tech Stack

- **Framework**: SolidJS
- **Styling**: Tailwind CSS
- **Icons**: Lucide-Solid
- **Build**: Vite
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/planner.git
cd planner

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Creating a Sprint

1. Find an unassigned week in the year view
2. Click "Start Sprint" on that week
3. The app will automatically create a 6-week sprint starting from that week
4. Click the edit icon to set a title and goal pitch

### Managing Vacations

- Click the palm tree icon on any unassigned week to mark it as vacation
- You can have up to 5 vacation weeks per year
- Vacations must be placed between sprints, not within them

### Task Management

- Click the + button on any week to add a task
- Drag tasks between weeks to reschedule them
- Click a task to edit its title
- Check the checkbox to mark a task complete

## Deployment

This app is configured for GitHub Pages deployment.

### Automatic Deployment

Push to the `main` branch to trigger automatic deployment via GitHub Actions.

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Architecture

```
src/
├── components/    # SolidJS components
├── stores/        # Reactive state management
├── services/      # Storage and utilities
├── types/         # TypeScript definitions
└── styles/        # Tailwind CSS
```

## License

MIT
