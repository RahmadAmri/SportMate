# SportMate API Documentation

---

## Authentication

### Register
- **POST** `/register`
- **Body:**
  ```json
  {
    "fullName": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success (201):**
  ```json
  {
    "id": 1,
    "email": "string",
    "fullName": "string"
  }
  ```
- **Errors:** 400 (validation), 409 (duplicate email)

---

### Login
- **POST** `/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success (200):**
  ```json
  {
    "access_token": "string"
  }
  ```
- **Errors:** 400 (missing fields), 401 (invalid credentials)

---

### Google Login
- **POST** `/google-login`
- **Body:**
  ```json
  {
    "credential": "Google ID token (JWT)"
  }
  ```
- **Success (200):**
  ```json
  {
    "access_token": "string"
  }
  ```
- **Errors:** 400 (missing/invalid credential), 401 (verification failed)

---

## Progress Log (Authenticated)
**All endpoints below require:**
`Authorization: Bearer <access_token>`

### Get All Progress Logs
- **GET** `/api/progressLog`
- **Success (200):**
  ```json
  [
    {
      "id": 1,
      "UserId": 2,
      "sport": "Running",
      "duration": 30,
      "caloriesBurned": 300,
      "date": "2024-06-01"
    }
  ]
  ```

---

### Create Progress Log
- **POST** `/progressLog`
- **Body:**
  ```json
  {
    "sport": "string",
    "duration": 30,
    "caloriesBurned": 300,
    "date": "2024-06-01"
  }
  ```
- **Success (201):**
  ```json
  {
    "id": 1,
    "UserId": 2,
    "sport": "Running",
    "duration": 30,
    "caloriesBurned": 300,
    "date": "2024-06-01"
  }
  ```
- **Errors:** 400 (validation)

---

### Update Progress Log
- **PUT** `/progressLog/:id`
- **Body:**
  ```json
  {
    "sport": "Cycling",
    "duration": 45,
    "caloriesBurned": 400,
    "date": "2024-06-02"
  }
  ```
- **Success (200):**
  ```json
  {
    "message": "Progress log updated"
  }
  ```
- **Errors:** 404 (not found), 403 (not authorized)

---

### Delete Progress Log
- **DELETE** `/progressLog/:id`
- **Success (200):**
  ```json
  {
    "message": "Progress log deleted"
  }
  ```
- **Errors:** 404 (not found), 403 (not authorized)

---

## User Preferences (Authenticated)

### Get User Preferences
- **GET** `/user-preferences/:UserId`
- **Success (200):**
  ```json
  {
    "id": 1,
    "UserId": 2,
    "preferences": { }
  }
  ```
- **Errors:** 404 (not found)

---

### Update User Preferences
- **PUT** `/user-preferences/:UserId`
- **Body:**
  ```json
  {
    "preferences": { }
  }
  ```
- **Success (200):**
  ```json
  {
    "message": "User preferences updated"
  }
  ```
- **Errors:** 404 (not found)

---

## Sport Recommendation (Gemini API)

### Get Recommendations
- **GET** `/prompt`
- **Success (200):**
  ```json
  {
    "message": "Hello from Gemini API",
    "generation": [1,2,3],
    "sport": [
      {
        "id": 1,
        "sport": "Running",
        "caloriesBurned": 300,
        ...
      }
    ]
  }
  ```
- **Errors:** 500 (internal error)

---

## Error Responses
- 401 Unauthorized: `{ "message": "Invalid token" }`
- 403 Forbidden: `{ "message": "You are not authorized" }`
- 404 Not Found: `{ "message": "Data not found" }`
- 500 Internal Server Error: `{ "message": "Internal server error" }`