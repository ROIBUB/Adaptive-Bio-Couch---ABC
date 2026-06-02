# FitWise — Adaptive Bio-Coach

A full-stack fitness and nutrition coaching web application. Users log in, receive AI-generated workout and meal plans tailored to their goals, log workouts, track meals, submit weekly check-ins, and monitor progress over time. Admins can manage users, exercises, and food items.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Authentication Model](#authentication-model)
- [Demo Accounts](#demo-accounts)
- [Response Envelope](#response-envelope)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Exercises](#exercises)
  - [Food Items](#food-items)
  - [Workout Plans](#workout-plans)
  - [Workout Logs](#workout-logs)
  - [Daily Meal Plans](#daily-meal-plans)
  - [Check-Ins](#check-ins)
  - [Profiles](#profiles)
  - [Progress Data](#progress-data)
  - [Settings](#settings)

---

## Project Overview

FitWise is a two-tier web app:

| Layer | Tech | Port |
|---|---|---|
| Backend API | Node.js + Express 5 | 3000 |
| Frontend SPA | React 18 + React Router v6 | 5173 |

**Key features:**
- Registration with automatic plan generation (BMR-based caloric target, template workout & meal plans)
- Role-based access control (user / admin / manager)
- Workout plan browsing and workout session logging
- Daily meal plan browsing with food alternatives
- Weekly check-ins that update weight trend
- Progress tracking dashboard with SVG weight graph

> **Data persistence:** all data lives in-memory. The server ships with seed data for six demo users. Restarting the server resets everything to defaults.

---

## Getting Started

### Backend

```bash
# From the project root
npm install
npm start          # or: node server.js
```

The server starts on **http://localhost:3000**.  
All API routes are prefixed with `/api` (except the admin-only root `GET /`).

### Frontend

```bash
# From the client/ directory
cd client
npm install
npm run dev        # Vite dev server
```

Open **http://localhost:5173** in your browser.

> The frontend expects the backend to be running on `http://localhost:3000`. This is hardcoded in `client/src/services/api.js`.

---

## Authentication Model

This project uses **simulated header-based authentication** — there is no JWT or session cookie. After logging in, the frontend stores the user object in `localStorage` and attaches these headers to every subsequent API request:

| Header | Value | Purpose |
|---|---|---|
| `x-user-role` | `admin` \| `manager` \| `user` | Role for authorization checks |
| `x-user-id` | numeric user ID | Used by `/api/settings` |
| `userid` | numeric user ID | Used by most other protected routes |

`manager` is treated identically to `admin` throughout the codebase.

To test the API with a tool like Postman or curl, manually supply these headers.

---

## Demo Accounts

All passwords are `password123`.

| Email | Role | Notes |
|---|---|---|
| `john@fitwize.com` | user | Has workout logs and check-ins |
| `noam@fitwize.com` | admin | Full admin access |
| `dana@fitwize.com` | user | Basic user |
| `yossi@fitwize.com` | manager | Treated as admin |
| `maya@fitwize.com` | user | Basic user |
| `eitan@fitwize.com` | user | Basic user |

---

## Response Envelope

Every response follows this consistent shape:

```json
{ "success": true, "data": { ... } }
```
```json
{ "success": false, "error": { "message": "...", "details": "..." } }
```

Standard HTTP status codes used:

| Code | Meaning |
|---|---|
| 200 | OK (GET / PUT / DELETE success) |
| 201 | Created (POST success) |
| 400 | Validation error |
| 403 | Forbidden (wrong role or not your resource) |
| 404 | Not found |
| 500 | Internal server error |

---

## API Reference

---

### Auth

#### POST /api/auth/login

Validates credentials and returns the authenticated user.

**Request body:**
```json
{
  "email": "john@fitwize.com",
  "password": "password123"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "john@fitwize.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**Error responses:**

`400` — missing fields:
```json
{ "success": false, "error": { "message": "Email and password are required." } }
```

`403` — wrong credentials:
```json
{ "success": false, "error": { "message": "Invalid email or password." } }
```

---

#### POST /api/auth/logout

No-op endpoint. The frontend clears `localStorage` client-side; no server state exists to clear.

**Request body:** none required.

**Success response (200):**
```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

#### POST /api/auth/register

Creates a new user account, profile, and settings. Automatically generates a personalized workout plan and meal plan based on the supplied fitness profile.

**Request body:**
```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "securepass1",
  "age": 28,
  "gender": "female",
  "height": 165,
  "weight": 62,
  "fitnessGoal": "weight_loss",
  "activityLevel": "intermediate",
  "workoutsPerWeek": 4,
  "mealsPerDay": 3
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `firstName` | string | yes | |
| `lastName` | string | yes | |
| `email` | string | yes | must be unique |
| `password` | string | yes | |
| `age` | number | yes | 13–120 |
| `gender` | string | yes | `male` \| `female` |
| `height` | number | yes | cm, 100–250 |
| `weight` | number | yes | kg, 30–300 |
| `fitnessGoal` | string | yes | `weight_loss` \| `muscle_gain` \| `maintenance` |
| `activityLevel` | string | yes | `beginner` \| `intermediate` \| `advanced` |
| `workoutsPerWeek` | number | yes | |
| `mealsPerDay` | number | yes | |

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "userId": 7,
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": "user",
    "caloricTarget": 1642
  }
}
```

**Error responses:**

`400` — email taken:
```json
{ "success": false, "error": { "message": "Email already in use." } }
```

`400` — missing fields:
```json
{ "success": false, "error": { "message": "Missing required fields.", "details": ["age", "fitnessGoal"] } }
```

---

### Users

> Requires headers: `x-user-role`, `userid`

#### GET /api/users

Returns all users. **Admin only.**

**Headers required:** `x-user-role: admin`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    { "userId": 1, "firstName": "John", "lastName": "Doe", "email": "john@fitwize.com", "role": "user" },
    { "userId": 2, "firstName": "Noam", "lastName": "Admin", "email": "noam@fitwize.com", "role": "admin" }
  ]
}
```

`403` — not admin:
```json
{ "success": false, "error": { "message": "Access denied." } }
```

---

#### GET /api/users/me

Returns the currently authenticated user's data. Identified by the `userid` header.

**Headers required:** `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": { "userId": 1, "firstName": "John", "lastName": "Doe", "email": "john@fitwize.com", "role": "user" }
}
```

`404`:
```json
{ "success": false, "error": { "message": "User not found." } }
```

---

#### GET /api/users/:id

Returns a single user. Users may only access their own record; admins may access any.

**Success response (200):**
```json
{
  "success": true,
  "data": { "userId": 1, "firstName": "John", "lastName": "Doe", "email": "john@fitwize.com", "role": "user" }
}
```

`403` — accessing another user's record as non-admin:
```json
{ "success": false, "error": { "message": "Access denied." } }
```

---

#### POST /api/users

Creates a user. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body:**
```json
{
  "firstName": "Bob",
  "lastName": "Jones",
  "email": "bob@example.com",
  "password": "pass123",
  "role": "user"
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": { "userId": 8, "firstName": "Bob", "lastName": "Jones", "email": "bob@example.com", "role": "user" }
}
```

---

#### PUT /api/users/:id

Updates a user's fields. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body** (any subset of updatable fields):
```json
{
  "firstName": "Bobby",
  "role": "manager"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": { "userId": 8, "firstName": "Bobby", "lastName": "Jones", "email": "bob@example.com", "role": "manager" }
}
```

---

#### DELETE /api/users/:id

Deletes a user. **Admin only.**

**Headers required:** `x-user-role: admin`

**Success response (200):**
```json
{ "success": true, "data": { "message": "User deleted successfully." } }
```

`404`:
```json
{ "success": false, "error": { "message": "User not found." } }
```

---

### Exercises

> Read endpoints are public. Write endpoints require `x-user-role: admin`.

#### GET /api/exercises

Returns all exercises.

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "exerciseId": 1,
      "name": "Leg Press",
      "muscleGroup": "Legs",
      "difficultyLevel": "beginner",
      "equipment": "Machine",
      "description": "Push the platform away using your legs."
    }
  ]
}
```

---

#### GET /api/exercises/:id

Returns a single exercise.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "exerciseId": 3,
    "name": "Lat Pulldown",
    "muscleGroup": "Back",
    "difficultyLevel": "intermediate",
    "equipment": "Cable Machine",
    "description": "Pull the bar down to your chest level."
  }
}
```

`404`:
```json
{ "success": false, "error": { "message": "Exercise not found." } }
```

---

#### POST /api/exercises

Creates a new exercise. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body:**
```json
{
  "name": "Romanian Deadlift",
  "muscleGroup": "Hamstrings",
  "difficultyLevel": "intermediate",
  "equipment": "Barbell",
  "description": "Hinge at the hips keeping a neutral spine."
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `muscleGroup` | string | yes |
| `difficultyLevel` | string | yes |
| `equipment` | string | yes |
| `description` | string | no |

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "exerciseId": 8,
    "name": "Romanian Deadlift",
    "muscleGroup": "Hamstrings",
    "difficultyLevel": "intermediate",
    "equipment": "Barbell",
    "description": "Hinge at the hips keeping a neutral spine."
  }
}
```

---

#### PUT /api/exercises/:id

Updates an exercise. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body** (any subset):
```json
{ "difficultyLevel": "advanced" }
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "exerciseId": 8,
    "name": "Romanian Deadlift",
    "muscleGroup": "Hamstrings",
    "difficultyLevel": "advanced",
    "equipment": "Barbell",
    "description": "Hinge at the hips keeping a neutral spine."
  }
}
```

---

#### DELETE /api/exercises/:id

Deletes an exercise. **Admin only.**

**Headers required:** `x-user-role: admin`

**Success response (200):**
```json
{ "success": true, "data": { "message": "Exercise deleted successfully." } }
```

---

### Food Items

> Read endpoints are public. Write endpoints require `x-user-role: admin`.

#### GET /api/food-items

Returns all food items with per-100g macros.

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "foodItemId": 1,
      "name": "Chicken Breast",
      "caloriesPer100g": 165,
      "proteinPer100g": 31,
      "carbsPer100g": 0,
      "fatPer100g": 3.6
    }
  ]
}
```

---

#### GET /api/food-items/:id

Returns a single food item.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "foodItemId": 4,
    "name": "Salmon",
    "caloriesPer100g": 208,
    "proteinPer100g": 20,
    "carbsPer100g": 0,
    "fatPer100g": 13
  }
}
```

---

#### GET /api/food-items/alternatives/:foodItemId

Returns other food items with a similar caloric value (per serving), useful for meal substitutions.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `grams` | number | no | Serving size in grams used for calorie comparison (defaults to 100) |

**Example:** `GET /api/food-items/alternatives/1?grams=150`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "foodItemId": 4,
      "name": "Salmon",
      "caloriesPer100g": 208,
      "proteinPer100g": 20,
      "carbsPer100g": 0,
      "fatPer100g": 13
    },
    {
      "foodItemId": 9,
      "name": "Cottage Cheese",
      "caloriesPer100g": 98,
      "proteinPer100g": 11,
      "carbsPer100g": 3.4,
      "fatPer100g": 4.3
    }
  ]
}
```

---

#### POST /api/food-items

Creates a food item. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body:**
```json
{
  "name": "Brown Rice",
  "caloriesPer100g": 216,
  "proteinPer100g": 4.5,
  "carbsPer100g": 45,
  "fatPer100g": 1.8
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "foodItemId": 11,
    "name": "Brown Rice",
    "caloriesPer100g": 216,
    "proteinPer100g": 4.5,
    "carbsPer100g": 45,
    "fatPer100g": 1.8
  }
}
```

---

#### PUT /api/food-items/:id

Updates a food item. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body** (any subset):
```json
{ "caloriesPer100g": 220 }
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "foodItemId": 11,
    "name": "Brown Rice",
    "caloriesPer100g": 220,
    "proteinPer100g": 4.5,
    "carbsPer100g": 45,
    "fatPer100g": 1.8
  }
}
```

---

#### DELETE /api/food-items/:id

Deletes a food item. **Admin only.**

**Headers required:** `x-user-role: admin`

**Success response (200):**
```json
{ "success": true, "data": { "message": "Food item deleted successfully." } }
```

---

### Workout Plans

> Requires headers: `x-user-role`, `userid`

Plans have a three-level nested structure: **Plan → Days → Day Exercises**.

#### GET /api/workout-plans

Returns plans. Admins see all plans; regular users see only their own.

**Headers required:** `x-user-role: user`, `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "workoutPlanId": 1,
      "userId": 1,
      "planName": "Weight Loss – 3 Days/Week",
      "fitnessGoal": "weight_loss",
      "isActive": true,
      "createdAt": "2026-05-01",
      "days": [
        {
          "dayId": 1,
          "workoutPlanId": 1,
          "dayNumber": 1,
          "workoutTitle": "Full Body A",
          "exercises": [
            {
              "dayExerciseId": 1,
              "exerciseId": 1,
              "exerciseName": "Leg Press",
              "targetSets": 3,
              "targetReps": 12,
              "targetWeight": 50
            }
          ]
        }
      ]
    }
  ]
}
```

---

#### GET /api/workout-plans/:id

Returns a single plan with full nested structure. Users may only access their own plans; admins may access any.

**Success response (200):** same structure as a single item from the list above.

`403`:
```json
{ "success": false, "error": { "message": "Access denied." } }
```

`404`:
```json
{ "success": false, "error": { "message": "Workout plan not found." } }
```

---

#### POST /api/workout-plans

Creates a workout plan with nested days and exercises. **Admin only.**

**Headers required:** `x-user-role: admin`, `userid: <target-user-id>`

**Request body:**
```json
{
  "userId": 3,
  "planName": "Custom Strength Plan",
  "fitnessGoal": "muscle_gain",
  "isActive": true,
  "days": [
    {
      "dayNumber": 1,
      "workoutTitle": "Push Day",
      "exercises": [
        { "exerciseId": 2, "targetSets": 4, "targetReps": 8, "targetWeight": 60 },
        { "exerciseId": 4, "targetSets": 3, "targetReps": 10, "targetWeight": 40 }
      ]
    }
  ]
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "workoutPlanId": 7,
    "userId": 3,
    "planName": "Custom Strength Plan",
    "fitnessGoal": "muscle_gain",
    "isActive": true,
    "days": [
      {
        "dayId": 22,
        "dayNumber": 1,
        "workoutTitle": "Push Day",
        "exercises": [
          { "dayExerciseId": 64, "exerciseId": 2, "exerciseName": "Chest Press", "targetSets": 4, "targetReps": 8, "targetWeight": 60 }
        ]
      }
    ]
  }
}
```

---

#### PUT /api/workout-plans/:id

Updates a workout plan. Admin can update any plan; users can update their own.

**Request body** (any subset of plan-level fields; `days` array replaces existing days if provided):
```json
{
  "planName": "Renamed Plan",
  "isActive": false
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": { "workoutPlanId": 7, "planName": "Renamed Plan", "isActive": false }
}
```

---

#### DELETE /api/workout-plans/:id

Deletes a workout plan and all its days/exercises. Admin or owner.

**Success response (200):**
```json
{ "success": true, "data": { "message": "Workout plan deleted successfully." } }
```

---

### Workout Logs

> Requires headers: `x-user-role`, `userid`

Logs have a three-level nested structure: **Log → Log Exercises → Sets**.

#### GET /api/workout-logs

Returns completed workout sessions. Admins see all; users see their own.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `workoutDayId` | number | no | Filter logs by the source workout day |

**Headers required:** `x-user-role: user`, `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "workoutLogId": 1,
      "userId": 1,
      "workoutDayId": 1,
      "workoutTitle": "Full Body A",
      "date": "2026-05-20",
      "durationMinutes": 55,
      "difficultyRating": 7,
      "notes": "Felt strong today.",
      "exercises": [
        {
          "logExerciseId": 1,
          "exerciseId": 1,
          "exerciseName": "Leg Press",
          "sets": [
            { "logSetId": 1, "setNumber": 1, "reps": 12, "weight": 50 }
          ]
        }
      ]
    }
  ]
}
```

---

#### GET /api/workout-logs/:id

Returns a single log with full nested structure.

**Success response (200):** same structure as a single item from the list above.

---

#### POST /api/workout-logs

Creates a workout log session with nested exercises and sets.

**Headers required:** `x-user-role: user`, `userid: 1`

**Request body:**
```json
{
  "userId": 1,
  "workoutDayId": 1,
  "workoutTitle": "Full Body A",
  "date": "2026-06-02",
  "durationMinutes": 60,
  "difficultyRating": 6,
  "notes": "Good session.",
  "exercises": [
    {
      "exerciseId": 1,
      "sets": [
        { "setNumber": 1, "reps": 12, "weight": 50 },
        { "setNumber": 2, "reps": 10, "weight": 55 }
      ]
    }
  ]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `userId` | number | yes | |
| `workoutDayId` | number | yes | |
| `workoutTitle` | string | yes | |
| `date` | string | yes | YYYY-MM-DD |
| `durationMinutes` | number | yes | positive |
| `difficultyRating` | number | yes | 1–10 |
| `notes` | string | no | |
| `exercises` | array | yes | |
| `exercises[].exerciseId` | number | yes | |
| `exercises[].sets` | array | yes | |
| `exercises[].sets[].setNumber` | number | yes | |
| `exercises[].sets[].reps` | number | yes | positive |
| `exercises[].sets[].weight` | number | yes | positive |

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "workoutLogId": 4,
    "userId": 1,
    "workoutDayId": 1,
    "workoutTitle": "Full Body A",
    "date": "2026-06-02",
    "durationMinutes": 60,
    "difficultyRating": 6,
    "notes": "Good session.",
    "exercises": [ { "...": "..." } ]
  }
}
```

---

#### PUT /api/workout-logs/:id

Updates a workout log. Admin or owner.

**Request body** (any subset):
```json
{
  "durationMinutes": 65,
  "notes": "Updated note."
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": { "workoutLogId": 4, "durationMinutes": 65, "notes": "Updated note." }
}
```

---

#### DELETE /api/workout-logs/:id

Deletes a workout log. Admin or owner.

**Success response (200):**
```json
{ "success": true, "data": { "message": "Workout log deleted successfully." } }
```

---

### Daily Meal Plans

> Requires headers: `x-user-role`, `userid`

Plans have a three-level nested structure: **Plan → Meals → Meal Food Items**.

#### GET /api/daily-meal-plans

Returns meal plans. Admins see all; users see their own.

**Headers required:** `x-user-role: user`, `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "mealPlanId": 1,
      "userId": 1,
      "planName": "Weight Loss – 3 Meals/Day",
      "targetCalories": 1600,
      "targetProtein": 130,
      "isActive": true,
      "meals": [
        {
          "mealId": 1,
          "mealType": "Breakfast",
          "mealName": "Morning Protein Bowl",
          "foodItems": [
            {
              "mealFoodItemId": 1,
              "foodItemId": 2,
              "foodItemName": "Greek Yogurt",
              "grams": 200,
              "calories": 118,
              "protein": 20
            }
          ]
        }
      ]
    }
  ]
}
```

---

#### GET /api/daily-meal-plans/:id

Returns a single meal plan with full nested structure.

**Success response (200):** same structure as a single item from the list above.

---

#### POST /api/daily-meal-plans

Creates a meal plan with nested meals and food items. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body:**
```json
{
  "userId": 3,
  "planName": "Custom High Protein Plan",
  "targetCalories": 2200,
  "targetProtein": 180,
  "isActive": true,
  "meals": [
    {
      "mealType": "Breakfast",
      "mealName": "Egg and Oats",
      "foodItems": [
        { "foodItemId": 5, "grams": 150 },
        { "foodItemId": 6, "grams": 80 }
      ]
    }
  ]
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "mealPlanId": 7,
    "userId": 3,
    "planName": "Custom High Protein Plan",
    "targetCalories": 2200,
    "targetProtein": 180,
    "isActive": true,
    "meals": [ { "...": "..." } ]
  }
}
```

---

#### PUT /api/daily-meal-plans/:id

Full update of a meal plan. **Admin only.**

**Headers required:** `x-user-role: admin`

**Request body:** same structure as POST.

**Success response (200):**
```json
{
  "success": true,
  "data": { "mealPlanId": 7, "planName": "Custom High Protein Plan Updated" }
}
```

---

#### DELETE /api/daily-meal-plans/:id

Deletes a meal plan. **Admin only.**

**Headers required:** `x-user-role: admin`

**Success response (200):**
```json
{ "success": true, "data": { "message": "Meal plan deleted successfully." } }
```

---

### Check-Ins

> Requires headers: `x-user-role`, `userid`

Weekly progress check-ins. Creating a check-in also updates `currentWeight` on the user's profile.

#### GET /api/check-ins

Returns check-ins. Admins see all; users see their own.

**Headers required:** `x-user-role: user`, `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "checkInId": 1,
      "userId": 1,
      "weight": 82.5,
      "workoutsCompleted": 3,
      "checkInDate": "2026-05-20",
      "feedback": "Feeling good, energy is up."
    }
  ]
}
```

---

#### GET /api/check-ins/:id

Returns a single check-in. Users may access their own; admins may access any.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "checkInId": 1,
    "userId": 1,
    "weight": 82.5,
    "workoutsCompleted": 3,
    "checkInDate": "2026-05-20",
    "feedback": "Feeling good, energy is up."
  }
}
```

---

#### POST /api/check-ins

Creates a weekly check-in and syncs `currentWeight` on the user's profile.

**Headers required:** `x-user-role: user`, `userid: 1`

**Request body:**
```json
{
  "userId": 1,
  "weight": 81.0,
  "workoutsCompleted": 4,
  "checkInDate": "2026-06-02",
  "feedback": "Best week so far."
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `userId` | number | yes | |
| `weight` | number | yes | 30–300 kg |
| `workoutsCompleted` | number | yes | 0–7 |
| `checkInDate` | string | yes | YYYY-MM-DD, year ≥ 2000 |
| `feedback` | string | no | |

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "checkInId": 4,
    "userId": 1,
    "weight": 81.0,
    "workoutsCompleted": 4,
    "checkInDate": "2026-06-02",
    "feedback": "Best week so far."
  }
}
```

---

#### PUT /api/check-ins/:id

Updates a check-in. Admin or owner.

**Request body** (any subset):
```json
{ "feedback": "Updated note." }
```

**Success response (200):**
```json
{
  "success": true,
  "data": { "checkInId": 4, "feedback": "Updated note." }
}
```

---

#### DELETE /api/check-ins/:id

Deletes a check-in. Admin or owner.

**Success response (200):**
```json
{ "success": true, "data": { "message": "Check-in deleted successfully." } }
```

---

### Profiles

> Requires headers: `x-user-role`, `userid`

Each user has exactly one profile containing fitness stats and assigned plan IDs.

#### GET /api/profiles/:userId

Returns the profile for a given user. Users may access their own; admins may access any.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "profileId": 1,
    "userId": 1,
    "age": 30,
    "gender": "male",
    "height": 178,
    "currentWeight": 83,
    "targetWeight": 76,
    "fitnessGoal": "weight_loss",
    "activityLevel": "intermediate",
    "workoutsPerWeek": 3,
    "mealsPerDay": 3,
    "assignedWorkoutPlanId": 1,
    "assignedMealPlanId": 1,
    "caloricTarget": 1742,
    "onboardingCompleted": true
  }
}
```

---

#### POST /api/profiles

Creates a profile for a user.

**Request body:**
```json
{
  "userId": 7,
  "age": 25,
  "gender": "female",
  "height": 162,
  "currentWeight": 58,
  "targetWeight": 55,
  "fitnessGoal": "maintenance",
  "activityLevel": "beginner",
  "workoutsPerWeek": 3,
  "mealsPerDay": 3
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": { "profileId": 7, "userId": 7, "age": 25, "gender": "female" }
}
```

---

#### PUT /api/profiles/:userId

Updates a profile. Users may update their own; admins may update any.

**Request body** (any subset):
```json
{
  "currentWeight": 57,
  "fitnessGoal": "weight_loss",
  "activityLevel": "intermediate"
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": { "profileId": 7, "userId": 7, "currentWeight": 57, "fitnessGoal": "weight_loss" }
}
```

---

#### POST /api/profiles/:userId/replan

Regenerates workout and meal plans for a user based on their current profile. Deactivates all existing plans, creates new ones from templates, and resets today's `caloriesConsumed` to 0.

**Caloric target formula (Mifflin-St Jeor):**

| Goal | Adjustment |
|---|---|
| `weight_loss` | BMR × activity multiplier − 500 kcal |
| `muscle_gain` | BMR × activity multiplier + 300 kcal |
| `maintenance` | BMR × activity multiplier |

Activity multipliers: `beginner` = 1.375, `intermediate` = 1.55, `advanced` = 1.725

**Request body** (optional overrides; if omitted, uses the stored profile):
```json
{
  "fitnessGoal": "muscle_gain",
  "activityLevel": "advanced",
  "workoutsPerWeek": 5
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "caloricTarget": 2840,
    "assignedWorkoutPlanId": 4,
    "assignedMealPlanId": 4
  }
}
```

---

### Progress Data

> Requires headers: `x-user-role`, `userid`

Daily progress records tracking calories consumed, workouts completed, and active minutes.

#### GET /api/progress

Returns progress records. Admins see all; users see their own.

**Headers required:** `x-user-role: user`, `userid: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "progressId": 1,
      "userId": 1,
      "date": "2026-05-20",
      "caloriesConsumed": 1580,
      "workoutsCompleted": 1,
      "activeMinutes": 55
    }
  ]
}
```

---

#### GET /api/progress/:date

Returns the progress record for a specific date (`YYYY-MM-DD`). If no record exists for that date, a zeroed record is created automatically.

**Example:** `GET /api/progress/2026-06-02`

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "progressId": 6,
    "userId": 1,
    "date": "2026-06-02",
    "caloriesConsumed": 0,
    "workoutsCompleted": 0,
    "activeMinutes": 0
  }
}
```

---

#### POST /api/progress

Creates a new progress record for a given date.

**Request body:**
```json
{
  "userId": 1,
  "date": "2026-06-03",
  "caloriesConsumed": 1700,
  "workoutsCompleted": 1,
  "activeMinutes": 50
}
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "progressId": 7,
    "userId": 1,
    "date": "2026-06-03",
    "caloriesConsumed": 1700,
    "workoutsCompleted": 1,
    "activeMinutes": 50
  }
}
```

---

#### PUT /api/progress/:id

Updates a progress record by its numeric ID.

**Request body** (any subset):
```json
{
  "caloriesConsumed": 1820,
  "activeMinutes": 65
}
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "progressId": 7,
    "caloriesConsumed": 1820,
    "activeMinutes": 65
  }
}
```

---

### Settings

> Requires header: `x-user-id` (note: this endpoint uses `x-user-id`, not `userid`)

User display preferences. One settings record exists per user.

#### GET /api/settings

Returns settings for the authenticated user.

**Headers required:** `x-user-id: 1`

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "settingsId": 1,
    "userId": 1,
    "displayName": "John Doe",
    "email": "john@fitwize.com",
    "theme": "light",
    "fitnessGoal": "weight_loss",
    "activityLevel": "intermediate"
  }
}
```

---

#### PUT /api/settings

Updates settings for the authenticated user.

**Headers required:** `x-user-id: 1`

**Request body** (any subset of updatable fields):
```json
{
  "displayName": "Johnny",
  "theme": "dark"
}
```

| Field | Type | Allowed values |
|---|---|---|
| `displayName` | string | any |
| `theme` | string | `light` \| `dark` |
| `fitnessGoal` | string | `weight_loss` \| `muscle_gain` \| `maintenance` |
| `activityLevel` | string | `beginner` \| `intermediate` \| `advanced` |

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "settingsId": 1,
    "userId": 1,
    "displayName": "Johnny",
    "theme": "dark",
    "fitnessGoal": "weight_loss",
    "activityLevel": "intermediate"
  }
}
```

`404` — no settings found for this user:
```json
{ "success": false, "error": { "message": "Settings not found." } }
```

---

## Assumptions & Notes

- **IDs** are auto-incremented integers starting from the last seed value. There is no UUID scheme.
- **No password hashing** — passwords are stored as plain strings in memory. This is a university project; do not use real credentials.
- **No real authentication** — the `x-user-role` / `userid` headers are set by the client without server-side verification. Any client can claim any role.
- **Data resets on restart** — there is no database. All in-memory data returns to seed state when the Node.js process restarts.
- **CORS** is configured to allow only `http://localhost:5173`. API calls from other origins will be blocked by the browser (direct curl/Postman calls bypass CORS and work fine).
- **`manager` = `admin`** throughout the codebase — the `yossi` account demonstrates this.
- The `GET /` root endpoint is admin-only and returns a server status message. It is not part of the `/api` prefix.
