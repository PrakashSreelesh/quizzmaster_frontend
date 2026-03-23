# QuizzMaster Frontend 🎨

The modern, interactive web interface for the QuizzMaster platform, built with **Next.js**, **React**, and **Tailwind CSS**.

## 📖 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Authentication & Security](#authentication--security)
- [Architecture](#architecture)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Docker & Deployment](#docker--deployment)

---

## 🔍 Overview
QuizzMaster's frontend provides a high-fidelity user experience for both instructors and students. It features a desktop-first design with smooth transitions, real-time feedback, and automated session management.

## 🛠 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (Latest version for modern visuals)
- **Icons**: Lucide React
- **Client**: Axios (Configured for cookie-based auth)
- **State Management**: React Context API (`AuthContext`, `ToastContext`)
- **Animation**: Framer Motion for smooth page and element transitions

## ✨ Key Features
- **Dynamic Quiz Builder**: Add, edit, and reorder questions with live previews.
- **Bulk Excel Import**: Seamlessly generate quizzes from standard spreadsheet templates.
- **Real-time Quiz Session**: Interactive timer, auto-saving of answers, and immediate results.
- **Deep Analytics**: Gorgeous visualizations for instructors to track quiz and student performance.
- **Responsive Layouts**: Clean, glassy UI components that provide a premium feel.

## 🔐 Authentication & Security
The frontend is deeply integrated with the backend's **HttpOnly Cookie** security model:
- **Zero Token Management**: Tokens are handled entirely via secure cookies. The frontend does not use `localStorage` for sensitive data, making it resistant to XSS and token theft.
- **Automated Refresh**: An Axios response interceptor monitors `401 Unauthorized` responses and automatically triggers a silent session refresh, retrying failed requests without user intervention.
- **Role-Based Guards**: Intelligent redirection automatically routes users based on their role:
    - **Instructors** -> `/dashboard`
    - **Students** -> `/analytics` (My Progress)
- **Public Landing Page**: Unauthenticated users are allowed to view the Home page but redirected to login for protected assets.

## 🏗 Architecture
- **`/app`**: Next.js App Router for routing and page structure.
- **`/components`**: Reusable UI components (buttons, cards, navigation).
- **`/context`**: Global contexts for Auth, Toast notifications, etc.
- **`/lib`**: Core utilities, type definitions, and the configured Axios instance (`api.ts`).

## 💻 Local Development
1. **Environment Setup**:
   ```bash
   cd frontend
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## ⚙️ Environment Variables
Create a `.env.local` file in the `frontend/` directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API Base URL | `http://localhost:8000/api/v1` |

## 🐳 Docker & Deployment
### Running with Docker Compose
Run the entire stack from the root directory:
```bash
docker-compose up --build
```

### Manual Docker Build
```bash
docker build -t quizzmaster-frontend:latest .
docker run -p 3000:3000 --env NEXT_PUBLIC_API_URL=http://your-api.com/api/v1 quizzmaster-frontend:latest
```

### CI/CD & Image Tags
Images are tagged for deployment:
- `main`: `quizzmaster-frontend:latest`
- Versioning: `quizzmaster-frontend:v1.x.x`
