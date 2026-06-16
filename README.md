# FitWise — Adaptive Bio-Coach

A full-stack fitness and nutrition coaching web application. Users register, receive AI-generated workout and meal plans tailored to their goals, log workouts, track meals, submit weekly check-ins, and monitor progress over time. Admins manage users, exercises, and food items through a dedicated panel.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [ORM Setup (Prisma)](#orm-setup-prisma)
- [Running the Project](#running-the-project)
- [Authentication Model](#authentication-model)
- [Demo Accounts](#demo-accounts)
- [API Endpoints](#api-endpoints)
- [WebSocket Feature](#websocket-feature)
- [AI Features](#ai-features)
- [Known Limitations](#known-limitations)

---

## Project Purpose

FitWise is a personalized fitness coach web app. On registration, the system uses the Gemini AI API to generate a complete, calorie-targeted workout plan and meal plan based on the user's height, weight, age, goal, and activity level. As the user logs workouts, meals, and weekly weigh-ins, an AI analysis engine tracks trends and surfaces actionable recommendations. A real-time chat widget lets users ask their AI coach questions at any time.

---

## Tech Stack

| Layer | Technology | Port |
|---|---|---|
| Backend API | Node.js + Express 5 | 3000 |
| Frontend SPA | React 18 + React Router v6 | 5173 |
| Database | MySQL / MariaDB | 3306 |
| ORM | Prisma 6 | — |
| Real-time | Socket.IO 4 | 3000 (same server) |
| AI | Google Gemini 2.5 Flash | — |

---

## Prerequisites

Install all of these before continuing:

- **Node.js** v18 or later — https://nodejs.org
- **MySQL** or **MariaDB** running locally on port 3306
- A **Google Gemini API key** — https://aistudio.google.com/app/apikey (free tier is sufficient)

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd FitWise
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Environment Variables

Both directories ship with a `.env.example` file. Copy it to `.env` and fill in your values.

### Backend

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and set your values:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/fitwise"
GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string. Format: `mysql://user:password@host:port/database` |
| `GEMINI_API_KEY` | Google Gemini API key used for plan generation, analysis, and chat |

### Frontend

```bash
cp client/.env.example client/.env
```

The frontend `.env` only controls the dev server port (default `5173`). No other values are needed — the backend URL is hardcoded to `http://localhost:3000` in `client/src/services/api.js`.

---

## Database Setup

### 1. Create the database

Open your MySQL client (MySQL Workbench, DBeaver, or the CLI) and run:

```sql
CREATE DATABASE fitwise;
```

### 2. Run Prisma migrations

From the `backend/` directory, apply all migrations to create the tables:

```bash
cd backend
npx prisma migrate deploy
```

This runs the three migrations in `backend/prisma/migrations/` in order:
- `20260614000000_init` — Initial schema
- `20260614000001_schema_v2_redesign` — Schema redesign
- `20260614000002_add_denormalized_name_columns` — Name denormalization

### 3. Seed demo data

Populate the database with exercises, food items, and six demo user accounts:

```bash
npx prisma db seed
```

The seed script is at `backend/prisma/seed.js`. It inserts the exercise library, food database, and the demo accounts listed in [Demo Accounts](#demo-accounts) below.

---

## ORM Setup (Prisma)

The project uses **Prisma 6** as its ORM, targeting MySQL with the MariaDB adapter.

### Schema location

```
backend/prisma/
├── schema.prisma       ← Data model definitions
├── prismaClient.js     ← Singleton Prisma client (import this in services)
├── seed.js             ← Demo data seeding script
└── migrations/         ← Auto-generated migration history
```

### Models (database tables)

| Model | Purpose |
|---|---|
| `User` | Account credentials and role (user / admin / manager) |
| `Profile` | Fitness profile: height, weight, age, goal, activity level |
| `Settings` | Display preferences per user |
| `Progress` | Daily aggregated metrics (calories, workouts, active minutes) |
| `WorkoutPlan` | A named workout plan assigned to a user |
| `WorkoutPlanDay` | Individual days within a plan (day number, name) |
| `PlanExercise` | Exercises scheduled for a plan day (sets, reps, duration) |
| `Exercise` | Exercise library (muscle group, difficulty, equipment type) |
| `WorkoutLog` | A completed workout session |
| `LogExercise` | Exercises performed within a log |
| `LogSet` | Individual sets within a logged exercise |
| `DailyMealPlan` | A meal plan assigned to a user (caloric target, macros) |
| `Meal` | A named meal within a plan (breakfast, lunch, etc.) |
| `MealFoodItem` | Food items in a meal with portion weights |
| `FoodItem` | Food database (nutrition per 100 g) |
| `CheckIn` | Weekly weigh-in records |
| `AiRecommendation` | Stored AI analysis results |

### Regenerate the Prisma client (after schema changes)

```bash
cd backend
npx prisma generate
```

### Open Prisma Studio (visual DB browser)

```bash
cd backend
npx prisma studio
```

---

## Running the Project

Open two terminals.

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

The backend starts on `http://localhost:3000`. Nodemon restarts automatically on file changes.

**Terminal 2 — Frontend**

```bash
cd client
npm start
```

The React dev server starts on `http://localhost:5173` and opens the browser automatically.

---

## Authentication Model

> This is a university project. Authentication is simulated — there are no JWTs or session tokens.

After login, the server returns the user's `id` and `role`. The React frontend stores these in `localStorage` and attaches them as HTTP headers on every subsequent request:

| Header | Value | Purpose |
|---|---|---|
| `userid` | User's numeric ID | Identifies the caller |
| `x-user-id` | User's numeric ID | Alias used by some routes |
| `x-user-role` | `user` / `admin` / `manager` | Role-based access control |

The backend's `authorize` middleware reads these headers directly. **There is no signature verification** — any client that knows a user's ID and role can impersonate them.

### Roles

| Role | Permissions |
|---|---|
| `user` | Own data only |
| `manager` | Read all users, manage exercises and food items |
| `admin` | Full access including user management |

---

## Demo Accounts

These accounts are inserted by the seed script. All passwords are `password123`.

| Email | Role | Display Name |
|---|---|---|
| john@example.com | user | John Doe |
| noam@example.com | user | Noam |
| dana@example.com | user | Dana |
| roi@example.com | admin | Roi |
| maya@example.com | manager | Maya |
| eitan@example.com | user | Eitan |

---

## API Endpoints

All endpoints are prefixed with `/api`. Every response follows this envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On failure `success` is `false`, `data` is `null`, and `error` contains a message string.

---

### Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | None | `{ email, password, firstName, lastName, role? }` | Create account; triggers AI plan generation |
| POST | `/api/auth/login` | None | `{ email, password }` | Returns `{ id, role, email, firstName, lastName }` |
| POST | `/api/auth/logout` | User | — | Clears session (no-op server-side) |

---

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin/Manager | List all users |
| GET | `/api/users/:id` | Admin/Manager | Get one user |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

### Exercises — `/api/exercises`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/exercises` | User | List all exercises (supports `?muscleGroup=`, `?difficulty=`, `?equipment=`) |
| GET | `/api/exercises/:id` | User | Get one exercise |
| POST | `/api/exercises` | Admin/Manager | Create exercise |
| PUT | `/api/exercises/:id` | Admin/Manager | Update exercise |
| DELETE | `/api/exercises/:id` | Admin/Manager | Delete exercise |

---

### Food Items — `/api/food-items`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/food-items` | User | List all food items |
| GET | `/api/food-items/:id` | User | Get one food item |
| GET | `/api/food-items/:id/alternatives` | User | Get 3 similar-calorie alternatives |
| POST | `/api/food-items` | Admin/Manager | Create food item |
| PUT | `/api/food-items/:id` | Admin/Manager | Update food item |
| DELETE | `/api/food-items/:id` | Admin/Manager | Delete food item |

---

### Workout Plans — `/api/workout-plans`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/workout-plans` | User | Get current user's plans |
| GET | `/api/workout-plans/:id` | User | Get plan with days and exercises |
| POST | `/api/workout-plans` | User | Create a plan |
| PUT | `/api/workout-plans/:id` | User | Update plan metadata |
| DELETE | `/api/workout-plans/:id` | User | Delete plan |
| GET | `/api/workout-plans/:id/days` | User | List days for a plan |
| POST | `/api/workout-plans/:id/days` | User | Add a day to a plan |
| PUT | `/api/workout-plans/:id/days/:dayId` | User | Update a plan day |
| DELETE | `/api/workout-plans/:id/days/:dayId` | User | Remove a plan day |
| GET | `/api/workout-plans/:id/days/:dayId/exercises` | User | List exercises for a day |
| POST | `/api/workout-plans/:id/days/:dayId/exercises` | User | Add exercise to a day |
| PUT | `/api/workout-plans/:id/days/:dayId/exercises/:exId` | User | Update plan exercise |
| DELETE | `/api/workout-plans/:id/days/:dayId/exercises/:exId` | User | Remove exercise from day |

---

### Workout Logs — `/api/workout-logs`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/workout-logs` | User | List current user's logs |
| GET | `/api/workout-logs/:id` | User | Get log with exercises and sets |
| POST | `/api/workout-logs` | User | Start a workout log session |
| PUT | `/api/workout-logs/:id` | User | Update log (e.g. mark complete) |
| DELETE | `/api/workout-logs/:id` | User | Delete a log |
| POST | `/api/workout-logs/:id/exercises` | User | Add exercise to log |
| POST | `/api/workout-logs/:id/exercises/:exId/sets` | User | Add a set to a logged exercise |

---

### Daily Meal Plans — `/api/daily-meal-plans`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/daily-meal-plans` | User | Get current user's meal plans |
| GET | `/api/daily-meal-plans/:id` | User | Get plan with meals and food items |
| POST | `/api/daily-meal-plans` | User | Create meal plan |
| PUT | `/api/daily-meal-plans/:id` | User | Update meal plan |
| DELETE | `/api/daily-meal-plans/:id` | User | Delete meal plan |
| GET | `/api/daily-meal-plans/:id/meals` | User | List meals in a plan |
| POST | `/api/daily-meal-plans/:id/meals` | User | Add meal to plan |
| PUT | `/api/daily-meal-plans/:id/meals/:mealId` | User | Update a meal |
| DELETE | `/api/daily-meal-plans/:id/meals/:mealId` | User | Remove a meal |
| POST | `/api/daily-meal-plans/:id/meals/:mealId/food-items` | User | Add food item to meal |
| DELETE | `/api/daily-meal-plans/:id/meals/:mealId/food-items/:fiId` | User | Remove food item from meal |

---

### Check-Ins — `/api/check-ins`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/check-ins` | User | List all check-ins for current user |
| GET | `/api/check-ins/:id` | User | Get one check-in |
| POST | `/api/check-ins` | User | Submit weekly weigh-in `{ weight, notes? }` |
| PUT | `/api/check-ins/:id` | User | Update a check-in |
| DELETE | `/api/check-ins/:id` | User | Delete a check-in |

---

### Profiles — `/api/profiles`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profiles/:userId` | User | Get profile for a user |
| POST | `/api/profiles` | User | Create profile |
| PUT | `/api/profiles/:userId` | User | Update profile |
| POST | `/api/profiles/:userId/replan` | User | Trigger AI to regenerate workout and meal plans |

---

### Progress Data — `/api/progress`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/progress` | User | Get all daily progress records for current user |
| GET | `/api/progress/:date` | User | Get progress for a specific date (`YYYY-MM-DD`) |
| POST | `/api/progress` | User | Create or update a daily progress record |
| PUT | `/api/progress/:date` | User | Update specific date progress |

---

### Settings — `/api/settings`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/settings/:userId` | User | Get display settings |
| PUT | `/api/settings/:userId` | User | Update display settings (theme, display name) |

---

### AI Recommendations — `/api/ai`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/recommendations` | User | Run AI analysis; stores result in DB |
| GET | `/api/ai/recommendations` | User | Fetch the most recent stored recommendation |

---

## WebSocket Feature

FitWise includes a real-time AI chat widget powered by **Socket.IO 4** and **Gemini 2.5 Flash**. The chat is available on every page as a floating button in the bottom-right corner.

### Connection

The frontend connects to `http://localhost:3000` (same origin as the REST API) after login. Connection uses manual connect (`autoConnect: false`) so it only activates when the chat widget is opened.

### Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `chat:join` | `{ userId }` | Join the user's private chat room |
| `chat:message` | `{ userId, message }` | Send a message to the AI coach |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `chat:joined` | `{ message }` | Confirms the user has joined their room |
| `chat:typing` | `true / false` | Typing indicator while AI is generating a response |
| `chat:response` | `{ message, timestamp }` | The AI coach's reply |

### Isolation

Each user is placed in a Socket.IO room named `chat_${userId}`, so messages are never sent to other users' sessions.

### AI Persona

The AI coach is instructed to respond in 2–4 sentences, use metric units, and act as an expert fitness coach. It maintains conversation history within a single chat session.

---

## AI Features

FitWise has three distinct AI integration points, all using **Google Gemini 2.5 Flash** via the `@google/generative-ai` SDK.

### 1. Plan Generation on Registration

**File:** `backend/services/planGenerator.js`

When a user completes registration:

1. BMR is calculated using the Mifflin-St Jeor equation based on the user's profile.
2. A caloric target is derived from BMR × activity multiplier ± goal adjustment.
3. A prompt is sent to Gemini asking it to produce a structured workout plan (days with exercises pulled from the existing exercise library IDs) and a meal plan (meals with food items pulled from the existing food item IDs).
4. The AI output is validated against real database IDs.
5. All records are written to the database.

This also runs when the user triggers `/api/profiles/:userId/replan`.

### 2. Progress Analysis

**File:** `backend/services/aiAnalysisService.js`  
**Endpoint:** `POST /api/ai/recommendations`

When triggered (manually from the Settings page):

1. The service collects the user's profile, last 8 check-ins, recent workout logs, and current plans.
2. A structured prompt is built that includes weight trend, workout performance, and current nutrition.
3. Gemini returns a JSON object with three assessment fields (`weightAssessment`, `nutritionAssessment`, `workoutAssessment`) and an array of `recommendations`.
4. The result is stored in the `AiRecommendation` table and returned to the client.

### 3. Real-Time Chat

**File:** `backend/sockets/chat.socket.js`

Described in the [WebSocket Feature](#websocket-feature) section above. The chat service maintains an in-process conversation history per socket connection, and each `chat:message` event appends to that history before calling Gemini.

---

## Known Limitations

These are intentional simplifications for a university project context.

| Limitation | Detail |
|---|---|
| **No real authentication** | Auth headers (`userid`, `x-user-role`) are sent unverified by the client. Any user can impersonate another by changing localStorage. |
| **No password hashing** | Passwords are stored and compared in plain text. Never deploy this publicly. |
| **Single-origin CORS** | The backend only allows requests from `http://localhost:5173`. Changing either port requires updating `backend/server.js` and the Socket.IO init options. |
| **Frontend API URL is hardcoded** | `client/src/services/api.js` points to `http://localhost:3000`. If you change the backend port, update this file manually. |
| **Gemini API rate limits** | The free tier of the Gemini API has per-minute request limits. Rapid registrations or repeated `/replan` calls may hit these limits. |
| **No input sanitization** | There is minimal server-side validation on request bodies. |
| **Chat history is in-memory** | Restarting the backend clears all active chat histories. Conversation context does not persist across page refreshes. |
| **No file uploads** | Profile photos and similar media are not supported. |
| **No email verification** | Registration accepts any email format without sending a confirmation email. |
