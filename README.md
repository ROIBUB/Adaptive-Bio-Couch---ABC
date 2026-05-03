# FitWise Backend API

FitWise is a backend API skeleton for a fitness coaching web application.  
The API is built with Node.js and Express and currently uses mock data only.

At this stage, the project does not connect to a real database.  
All data is stored in JavaScript arrays and is kept in memory while the server is running.

---

## Technologies

- Node.js
- Express.js
- JavaScript
- Mock data stored in local model files
- Postman for API testing

---

## Project Structure

FitWise/
│
├── README.md
├── server.js
├── package.json
├── package-lock.json
│
├── routes/
│   ├── users.routes.js
│   └── exercises.routes.js
│
├── controllers/
│   ├── users.controller.js
│   └── exercises.controller.js
│
├── models/
│   ├── users.model.js
│   └── exercises.model.js
│
├── middleware/
│   ├── logger.js
│   └── auth.js

```

---

## Installation Instructions

To install the project dependencies, run:

```bash
npm install
```

---

## Running the Server

To start the server, run:

```bash
node server.js
```

The server runs locally on port `3000`.

---

## Base URL

```text
http://localhost:3000
```

Current API base paths:

```text
/api/users
/api/exercises
```

---

## General Assumptions

- The project uses mock data only.
- Data is stored in memory and resets when the server restarts.
- IDs are generated based on the last item in the relevant mock data array.
- Request and response bodies are in JSON format.
- Authentication is not implemented in this stage.
- Authorization is simulated using the `x-user-role` request header.
- The API is tested using Postman.

Example authorization header:

```http
x-user-role: admin
```

Supported example roles:

```text
admin
user
```

---

## Required Request Format

For requests that include a body, such as `POST` and `PUT`, the request body must be sent as JSON.

In Postman:

```text
Body → raw → JSON
```

The following header should be included:

For protected routes, include:

```http
x-user-role: admin
```

or another allowed role, depending on the route.

---

## Response Format

All API responses follow a consistent JSON structure.

### Success Response Format

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

---

## HTTP Status Codes

The API uses the following HTTP status codes:

| Status Code | Meaning |
|---|---|
| 200 OK | Successful GET, PUT, or DELETE request |
| 201 Created | Successful POST request |
| 400 Bad Request | Validation error or invalid input |
| 403 Forbidden | User does not have permission |
| 404 Not Found | Requested item does not exist |
| 500 Internal Server Error | Unexpected server error |

---

# API Reference

---

# Users API

Base path:

```text
/api/users
```

The Users API manages user records and fitness profile information.

A user object currently includes the following fields:

```json
    {
      "userid": 1,
      "firstName": "John",
      "lastName": "Doe",
      "createDate": "DATE-FORMAT",
      "updateDate": "DATE-FORMAT",
      "userRole": "user",
      "age": 25,
      "gender": "male",
      "height": 175,
      "weight": 75,
      "activityLevel": 1,
      "fitnessGoal": "muscle gain",
      "preferences": 5
    }
```

---

## Get All Users

```http
GET /api/users
```

Returns all users from the mock data array.

### Request Body

No request body is required.

### Example Success Response

```json
{
  "success": true,
  "data": [
    {
      "userid": 1,
      "firstName": "John",
      "lastName": "Doe",
      "createDate": "DATE-FORMAT",
      "updateDate": "DATE-FORMAT",
      "userRole": "user",
      "age": 25,
      "gender": "male",
      "height": 175,
      "weight": 75,
      "activityLevel": 1,
      "fitnessGoal": "muscle gain",
      "preferences": 5
    }
  ],
  "error": null
}
```

### Success Status Code

```http
200 OK
```

---

## Get User By ID

```http
GET /api/users/:id
```

Returns a single user by ID.

### Example Request

```http
GET /api/users/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The user ID |

### Request Body

No request body is required.

### Example Success Response

```json
  {
    "userid": 1,
    "firstName": "John",
    "lastName": "Doe",
    "createDate": "DATE-FORMAT",
    "updateDate": "DATE-FORMAT",
    "userRole": "user",
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 75,
    "activityLevel": 1,
    "fitnessGoal": "muscle gain",
    "preferences": 5
  },
  "error": null

```

### Success Status Code

```http
200 OK
```

### Example Error Response

If the user does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

### Error Status Code

```http
404 Not Found
```

---

## Create User

```http
POST /api/users
```

Creates a new user and adds it to the mock data array.

### Required Request Body Fields

The following fields are required:

```text
firstName
lastName
userRole
age
gender
height
weight
activityLevel
fitnessGoal
```

The following field is optional:

```text
preferences
```

### Example Request Body

```json
{
  "firstName": "Dana",
  "lastName": "Cohen",
  "userRole": "user",
  "age": 26,
  "gender": "female",
  "height": 165,
  "weight": 60,
  "activityLevel": 2,
  "fitnessGoal": "fat_loss",
  "preferences": 3
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "userid": 3,
    "firstName": "Dana",
    "lastName": "Cohen",
    "userRole": "user",
    "age": 26,
    "gender": "female",
    "height": 165,
    "weight": 60,
    "activityLevel": 2,
    "fitnessGoal": "fat_loss",
    "preferences": "1",
    "createDate": "2026-05-03T10:00:00.000Z",
    "updateDate": "2026-05-03T10:00:00.000Z"
  },
  "error": null
}
```

### Success Status Code

```http
201 Created
```

### Example Validation Error Response

If a required field is missing, for example `firstName`:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: firstName",
    "details": {
      "field": "firstName"
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

---

## Update User

```http
PUT /api/users/:id
```

Updates an existing user by ID.

### Example Request

```http
PUT /api/users/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The user ID |

### Required Request Body Fields

The current implementation expects the following required fields:

```text
firstName
lastName
userRole
age
gender
height
weight
activityLevel
fitnessGoal
```

The following field is optional:

```text
preferences
```

### Example Request Body

```json
{
  "firstName": "Israela",
  "lastName": "Israeli",
  "userRole": "user",
  "age": 24,
  "gender": "female",
  "height": 158,
  "weight": 51,
  "activityLevel": 2,
  "fitnessGoal": "muscle_gain",
  "preferences": 5
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "userid": 1,
    "firstName": "Israela",
    "lastName": "MaiIsraelimon",
    "userRole": "manuserager",
    "age": 24,
    "gender": "female",
    "height": 158,
    "weight": 51,
    "activityLevel": 2,
    "fitnessGoal": "muscle_gain",
    "preferences": "5",
    "createDate": "2026-05-03T10:00:00.000Z",
    "updateDate": "2026-05-03T10:30:00.000Z"
  },
  "error": null
}
```

### Success Status Code

```http
200 OK
```

### Example Not Found Error Response

If the user does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

### Error Status Code

```http
404 Not Found
```

### Example Validation Error Response

If a required field is missing, for example `weight`:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: weight",
    "details": {
      "field": "weight"
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

---

## Delete User

```http
DELETE /api/users/:id
```

Deletes an existing user by ID.

### Example Request

```http
DELETE /api/users/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The user ID |

### Request Body

No request body is required.

### Example Success Response

```json
{
  "userid": 1,
  "firstName": "John",
  "lastName": "Doe",
  "createDate": "DATE-FORMAT",
  "updateDate": "DATE-FORMAT",
  "userRole": "user",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 75,
  "activityLevel": 1,
  "fitnessGoal": "muscle gain",
  "preferences": 5
},
  "error": null

```

### Success Status Code

```http
200 OK
```

### Example Error Response

If the user does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

### Error Status Code

```http
404 Not Found
```

---

# Exercises API

Base path:

```text
/api/exercises
```

The Exercises API manages exercise records.

An exercise object includes the following fields:

```json
{
  "exerciseId": 1,
  "name": "Leg Press",
  "muscleGroup": "Legs",
  "difficultyLevel": "Beginner",
  "equipment": "Machine",
  "description": "A lower-body exercise that mainly targets the quadriceps, glutes, and hamstrings."
}
```

---

## Get All Exercises

```http
GET /api/exercises
```

Returns all exercises from the mock data array.

### Request Body

No request body is required.

### Example Success Response

```json
{
  "success": true,
  "data": [
    {
      "exerciseId": 1,
      "name": "Leg Press",
      "muscleGroup": "Legs",
      "difficultyLevel": "Beginner",
      "equipment": "Machine",
      "description": "A lower-body exercise that mainly targets the quadriceps, glutes, and hamstrings."
    },
    {
      "exerciseId": 2,
      "name": "Chest Press",
      "muscleGroup": "Chest",
      "difficultyLevel": "Beginner",
      "equipment": "Machine",
      "description": "An upper-body pushing exercise that mainly targets the chest muscles."
    }
  ],
  "error": null
}
```

### Success Status Code

```http
200 OK
```

---

## Get Exercise By ID

```http
GET /api/exercises/:id
```

Returns a single exercise by ID.

### Example Request

```http
GET /api/exercises/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The exercise ID |

### Request Body

No request body is required.

### Example Success Response

```json
{
  "success": true,
  "data": {
    "exerciseId": 1,
    "name": "Leg Press",
    "muscleGroup": "Legs",
    "difficultyLevel": "Beginner",
    "equipment": "Machine",
    "description": "A lower-body exercise that mainly targets the quadriceps, glutes, and hamstrings."
  },
  "error": null
}
```

### Success Status Code

```http
200 OK
```

### Example Invalid ID Error Response

If the ID parameter is invalid:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid exercise id",
    "details": {
      "field": "id"
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

### Example Not Found Error Response

If the exercise does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exercise not found",
    "details": {
      "exerciseId": 999
    }
  }
}
```

### Error Status Code

```http
404 Not Found
```

---

## Create Exercise

```http
POST /api/exercises
```

Creates a new exercise and adds it to the mock data array.

### Required Request Body Fields

The following fields are required:

```text
name
muscleGroup
difficultyLevel
```

The following fields are optional:

```text
equipment
description
```

If `equipment` or `description` are not provided, they are saved as empty strings.

### Example Request Body

```json
{
  "name": "Cable Row",
  "muscleGroup": "Back",
  "difficultyLevel": "Beginner",
  "equipment": "Cable Machine",
  "description": "An upper-body pulling exercise that targets the back muscles."
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "exerciseId": 8,
    "name": "Cable Row",
    "muscleGroup": "Back",
    "difficultyLevel": "Beginner",
    "equipment": "Cable Machine",
    "description": "An upper-body pulling exercise that targets the back muscles."
  },
  "error": null
}
```

### Success Status Code

```http
201 Created
```

### Example Validation Error Response

If one of the required fields is missing:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": {
      "required": [
        "name",
        "muscleGroup",
        "difficultyLevel"
      ]
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

---

## Update Exercise

```http
PUT /api/exercises/:id
```

Updates an existing exercise by ID.

### Example Request

```http
PUT /api/exercises/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The exercise ID |

### Required Request Body Fields

The following fields are required:

```text
name
muscleGroup
difficultyLevel
```

The following fields are optional:

```text
equipment
description
```

If `equipment` or `description` are not provided, they are saved as empty strings.

### Example Request Body

```json
{
  "name": "Barbell Hip Thrust",
  "muscleGroup": "Glutes",
  "difficultyLevel": "Intermediate",
  "equipment": "Barbell",
  "description": "A glute-focused exercise using a barbell."
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "exerciseId": 1,
    "name": "Barbell Hip Thrust",
    "muscleGroup": "Glutes",
    "difficultyLevel": "Intermediate",
    "equipment": "Barbell",
    "description": "A glute-focused exercise using a barbell."
  },
  "error": null
}
```

### Success Status Code

```http
200 OK
```

### Example Invalid ID Error Response

If the ID parameter is invalid:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid exercise id",
    "details": {
      "field": "id"
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

### Example Validation Error Response

If one of the required fields is missing:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": {
      "required": [
        "name",
        "muscleGroup",
        "difficultyLevel"
      ]
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

### Example Not Found Error Response

If the exercise does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exercise not found",
    "details": {
      "exerciseId": 999
    }
  }
}
```

### Error Status Code

```http
404 Not Found
```

---

## Delete Exercise

```http
DELETE /api/exercises/:id
```

Deletes an existing exercise by ID.

### Example Request

```http
DELETE /api/exercises/1
```

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| id | number | The exercise ID |

### Request Body

No request body is required.

### Example Success Response

```json
{
  "success": true,
  "data": {
    "exerciseId": 1
  },
  "error": null
}
```

### Success Status Code

```http
200 OK
```

### Example Invalid ID Error Response

If the ID parameter is invalid:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid exercise id",
    "details": {
      "field": "id"
    }
  }
}
```

### Error Status Code

```http
400 Bad Request
```

### Example Not Found Error Response

If the exercise does not exist:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exercise not found",
    "details": {
      "exerciseId": 999
    }
  }
}
```

### Error Status Code

```http
404 Not Found
```

---

# Middleware

---

## Logger Middleware

The logger middleware records basic information about incoming requests and prints it to the server console.

It should run globally for all routes.

The logger may include:

```text
HTTP method
Requested URL
Date and time of the request
Response status code
```

Example console output:

```text
[2026-05-03T12:00:00.000Z] GET /api/exercises - 200
```

---

## Authorization Middleware

Authorization is simulated using the request header:

```http
x-user-role
```

Example:

```http
x-user-role: admin
```

If a route is protected, the middleware checks whether the provided user role is allowed to perform the requested action.

If authorization fails, the API returns:

```http
403 Forbidden
```

Example authorization error response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {}
  }
}
```

If no role is provided, the API may return:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "No role provided",
    "details": {}
  }
}
```

---

# Validation Rules

---

## Users Validation

For `POST /api/users` and `PUT /api/users/:id`, the following fields are required:

```text
firstName
lastName
userRole
age
gender
height
weight
activityLevel
fitnessGoal
```

If a required field is missing, the API returns:

```http
400 Bad Request
```

with the following error format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: fieldName",
    "details": {
      "field": "fieldName"
    }
  }
}
```

If the requested user ID does not exist, the API returns:

```http
404 Not Found
```

with the following error format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {}
  }
}
```

---

## Exercises Validation

For `GET /api/exercises/:id`, `PUT /api/exercises/:id`, and `DELETE /api/exercises/:id`, the ID parameter must be valid.

If the ID is invalid, the API returns:

```http
400 Bad Request
```

with the following error format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid exercise id",
    "details": {
      "field": "id"
    }
  }
}
```

For `POST /api/exercises` and `PUT /api/exercises/:id`, the following fields are required:

```text
name
muscleGroup
difficultyLevel
```

If one of the required fields is missing, the API returns:

```http
400 Bad Request
```

with the following error format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": {
      "required": "fieldName"
    }
  }
}
```

If the requested exercise ID does not exist, the API returns:

```http
404 Not Found
```

with the following error format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exercise not found",
    "details": {
      "exerciseId": 999
    }
  }
}
```

---

# Postman Testing Instructions

The submitted Postman collection should include all implemented endpoints.

---

## Users Requests

```text
GET    http://localhost:3000/api/users
GET    http://localhost:3000/api/users/1
POST   http://localhost:3000/api/users
PUT    http://localhost:3000/api/users/1
DELETE http://localhost:3000/api/users/1
```

---

## Exercises Requests

```text
GET    http://localhost:3000/api/exercises
GET    http://localhost:3000/api/exercises/1
POST   http://localhost:3000/api/exercises
PUT    http://localhost:3000/api/exercises/1
DELETE http://localhost:3000/api/exercises/1
```

---

## Postman Setup for POST and PUT Requests

For every `POST` or `PUT` request:

1. Go to the `Body` tab.
2. Select `raw`.
3. Select `JSON`.
4. Add the relevant JSON body.
5. Add the following header if the route is protected:

```http
x-user-role: admin
```

or another allowed role.

---


# Example Postman Request Bodies

---

## Create User Body

Use this body for:

```http
POST /api/users
```

```json
{
  "firstName": "Dana",
  "lastName": "Cohen",
  "userRole": "user",
  "age": 26,
  "gender": "female",
  "height": 165,
  "weight": 60,
  "activityLevel": "moderate",
  "fitnessGoal": "fat_loss",
  "preferences": 3
}
```

---

## Update User Body

Use this body for:

```http
PUT /api/users/1
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userRole": "User",
  "age": 25,
  "gender": "Male",
  "height": 175,
  "weight": 75,
  "activityLevel": 1,
  "fitnessGoal": "muscle_gain",
  "preferences": "5
}
```

---

## Create Exercise Body

Use this body for:

```http
POST /api/exercises
```

```json
{
  "name": "Cable Row",
  "muscleGroup": "Back",
  "difficultyLevel": "Beginner",
  "equipment": "Cable Machine",
  "description": "An upper-body pulling exercise that targets the back muscles."
}
```

---

## Update Exercise Body

Use this body for:

```http
PUT /api/exercises/1
```

```json
{
  "name": "Barbell Hip Thrust",
  "muscleGroup": "Glutes",
  "difficultyLevel": "Intermediate",
  "equipment": "Barbell",
  "description": "A glute-focused exercise using a barbell."
}
```

---

# Notes

This backend is an initial API skeleton for the FitWise final project.

In the next development stages, the mock data can be replaced with a real database while keeping the same API structure.