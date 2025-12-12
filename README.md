# 🛡️ Dangerless

An application for providing travelers with real-time neighborhood safety ratings and local safety news alerts.

## Prerequisites

Make sure you have these installed:

- **Node.js** v20 or higher
- **npm** v10 or higher (comes with Node.js)
- **Supabase Account** (free account at [supabase.com](https://supabase.com/))
- **Git**

Verify installation:

```bash
node --version
npm --version
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/parunchxi/Dangerless.git
   cd Dangerless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Configuration

### Environment Variables

1. **Rename `.env.example` to `.env.local`**

   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials in `.env.local`:**

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key

   # For Google Sign-In Test Account (Optional)
   GOOGLE_SIGNIN_EMAIL=your-email
   GOOGLE_SIGNIN_PASSWORD=your-password
   ```

   Get Supabase credentials from: Supabase Dashboard → Your Project → Settings → API

### Database Setup

**Important:** Import database files BEFORE running the app.

1. Open **Supabase Dashboard** → Go to **SQL Editor**

2. Copy and run these SQL files **in order**:

   - `database/enum.sql` (creates enums)
   - `database/schema.sql` (creates tables)
   - `database/functions.sql` (creates functions)
   - `database/triggers.sql` (creates triggers)
   - `database/appSetting.sql` (adds initial data)

3. Enable required extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## How to Run

**Start the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

**Sign in with your Google account:**

1. Click "Sign in" on the login page
2. Use your own Google account credentials
3. Grant necessary permissions when prompted

All users start as **Standard Users** with these permissions:

- View safety map and news
- Submit safety reports
- View own submissions

## Project Status & Known Issues

### ✅ Working Features

- Interactive safety map with color-coded danger zones
- Google OAuth authentication
- User can submit safety reports (location, severity, category)
- Search for locations and view safety info
- Responsive design (desktop and mobile)
- Light/dark theme switching
- Map controls (layers, zoom, user location)

### ⚠️ Known Issues

1. **History Feature - Not fully implemented**

   - Original plan included advanced time filters (1M, 6M, 1Y, 5Y)
   - Could not be completed within sprint timeline due to complexity
   - **Solution:** Reduced to MVP version, shows recent news only

2. **Data Consistency - Fixed**
   - Frontend and backend used different field names early in development
   - Caused mismatched data and rendering errors
   - **Solution:** Standardized data structure and API response format across both ends
