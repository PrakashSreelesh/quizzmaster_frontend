# QuizzMaster — Frontend Application

The frontend of QuizzMaster is a modern, responsive web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It features a premium "Glassmorphism" UI and focus on smooth user experience.

## 🎨 Design System
- **Theme**: Dark Mode with ambient background glows.
- **Components**: Custom UI primitives (Button, Input, Card) with glassmorphic effects.
- **Animations**: Framer Motion for page transitions and micro-interactions.
- **State**: React Context for Auth and Toast notifications.

## 🏗 Directory Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI primitives and feature-specific components.
- `context/`: Application-wide state (Auth, Toast).
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions (API client, types, constants).
- `public/`: Static assets.

## 🚀 Local Setup

### Using Docker
The easiest way is to use the root `docker-compose.yml`:
```bash
docker-compose up frontend
```

### Manual Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗 Build & Production
```bash
npm run build
npm start
```
