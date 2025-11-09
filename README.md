# 🛡️ Dangerless

An application for providing travelers with real-time neighborhood safety ratings and local safety news alerts.

## Quick Start

1. **Clone and install**

   ```bash
   git clone https://github.com/parunchxi/dangerless.git
   cd dangerless
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials to `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## Features (Planned)

- 🗺️ **Real-time Safety Map** - Interactive map with red zone overlays
- 🔐 **Google OAuth Authentication** - Secure user authentication
- 📢 **Community Alerts** - Local safety news and reports
- 📊 **Historical Analysis** - Safety trend analysis over time
- 🏠 **Neighborhood Monitoring** - Area-specific safety ratings

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + PostGIS)
- **Authentication:** Supabase Auth with Google OAuth
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Project Structure

```
app/
├── page.tsx              # Main map application
├── layout.tsx            # Root layout with theme provider
├── globals.css           # Global styles
├── auth/                 # Authentication routes
│   ├── confirm/          # Email confirmation
│   └── error/            # Auth error handling
└── api/
    └── map/              # Map API routes

components/
├── navigation/           # Navigation bar components
│   ├── NavigationBar.tsx
│   ├── NavItem.tsx
│   ├── NavLogo.tsx
│   ├── NavThemeSwitcher.tsx
│   └── NavUserSection.tsx
├── modes/                # Map mode components
│   ├── NewsMode.tsx
│   └── AddNewsMode.tsx
├── trays/                # Sidebar tray components
│   ├── NewsTray.tsx
│   └── ReportTray.tsx
├── controls/             # Map controls
│   ├── MapControls.tsx
│   └── LayerSelector.tsx
├── search/               # Search functionality
│   ├── MapSearchBar.tsx
│   └── ui/               # Search UI components
├── mobile/               # Mobile-specific components
│   ├── CollapsibleSection.tsx
│   ├── DragHandle.tsx
│   ├── ThemeSwitcher.tsx
│   └── UserSection.tsx
├── shared/               # Shared UI components
│   ├── EmptyState.tsx
│   ├── FormField.tsx
│   └── TrayComponents.tsx
├── ui/                   # shadcn/ui components
├── MapCanvas.tsx         # Main map component
├── MobileBottomSheet.tsx # Mobile UI container
└── SidebarTray.tsx       # Desktop sidebar container

lib/
├── contexts/             # React contexts
│   ├── MapDataContext.tsx
│   ├── MapLayerContext.tsx
│   ├── MapModeContext.tsx
│   └── MapViewContext.tsx
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useMapControls.ts
│   ├── useMapInstance.ts
│   ├── useMapMarkers.ts
│   ├── useMapSearch.ts
│   ├── useMapSelection.ts
│   ├── useNavigationState.ts
│   └── useUserLocation.ts
├── services/             # External services
│   └── geocoding.ts
├── supabase/             # Supabase client
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── constants/            # App constants
│   └── navigation.ts
└── utils.ts              # Utility functions

types/
├── map.ts                # Map-related types
└── navigation.ts         # Navigation types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run type-check`
5. Submit a pull request
