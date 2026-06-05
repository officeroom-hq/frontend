# Officeroom — Frontend

> AI-native business operating platform. Electron + React desktop application.

## Tech Stack

- **Framework:** Electron + React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Real-time:** Laravel Echo + Socket.io
- **HTTP Client:** Axios
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/officeroom/frontend.git
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_BASE_URL=https://staging.officeroom.com/api/v1
VITE_SOCKET_URL=https://staging.officeroom.com
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── layouts/          # Layout wrappers
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state stores
│   ├── services/         # API call functions
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── electron/             # Electron main process
├── public/               # Static assets
├── .env.example          # Environment variable template
└── vite.config.ts
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — deployed automatically |
| `develop` | Staging — all PRs merge here first |
| `feature/*` | Individual feature work |
| `fix/*` | Bug fixes |

**Rules:**
- Never push directly to `main` or `develop`
- All PRs require review from the CTO before merge
- No self-merges

## API Contract

All API endpoints are documented in the `/docs` repository.  
Base URL: `https://api.officeroom.com/api/v1`

## Scripts

```bash
npm run dev          # Start Electron + React in development
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
```

## Owner

**Anzy** — CTO, Officeroom Technologies  
For questions, open an issue or reach out on Slack.
