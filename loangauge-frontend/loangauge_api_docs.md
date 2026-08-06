# LoanGauge Backend — Complete API Reference

> For AI agents building the frontend. All endpoints are routed through the **API Gateway on port `8080`**.

---

## 🏗️ Architecture Overview

| Service                  | Direct Port | Gateway Prefix | Database        |
| ------------------------ | ----------- | -------------- | --------------- |
| **API Gateway**          | `8080`      | —              | —               |
| **Auth Service**         | `8081`      | `/auth/**`     | MySQL           |
| **Financial Service**    | `8082`      | `/api/**`      | MySQL + MongoDB |
| **Notification Service** | `8083`      | `/notify/**`   | MongoDB         |
| **Eureka Server**        | `8761`      | —              | —               |

> **All frontend calls go to `http://localhost:8080`**. The gateway routes automatically.

---

## 🔐 Authentication

### Token Strategy

- **Access Token**: Short-lived JWT (15 min), returned in response body as `accessToken`.
- **Refresh Token**: Long-lived (7 days), stored in an **HttpOnly cookie** named `refreshToken`.
- All protected endpoints require: `Authorization: Bearer <accessToken>`

### Roles

| Role                | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `USER`              | Standard free-tier user (max 3 assessments)             |
| `PREMIUM_USER`      | Paid tier — unlimited assessments + consultation access |
| `FINANCIAL_ADVISOR` | Can view/respond to consultation requests               |
| `ADMINISTRATOR`     | Full admin access                                       |

---

## 📦 Standard Response Envelope

All endpoints return this wrapper:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {
    /* payload */
  }
}
```

Error responses use the same shape with `"success": false`.

---

## 1. Auth Service (`/auth/**`)

### POST `/auth/register`

Register a new user.

**Request Body:**

```json
{
  "firstName": "Aditya", // required, max 100 chars
  "lastName": "Kumar", // required, max 100 chars
  "email": "aditya@example.com", // required, valid email
  "password": "Password@123", // required, must pass @ValidPassword
  "confirmPassword": "Password@123", // required, must match password
  "phone": "9876543210" // optional, Indian 10-digit (starts with 6-9)
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJ...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "firstName": "Aditya",
      "lastName": "Kumar",
      "email": "aditya@example.com",
      "phone": "9876543210",
      "role": "USER",
      "status": "ACTIVE",
      "subscriptionPlan": null,
      "createdAt": "2026-08-05T10:00:00"
    }
  }
}
```

> Sets `refreshToken` HttpOnly cookie automatically.

---

### POST `/auth/login`

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "aditya@example.com",
  "password": "Password@123"
}
```

**Response `200`:** Same shape as `/auth/register`.

---

### POST `/auth/refresh-token`

Get a new access token using the refresh token cookie.

**No request body.** Reads `refreshToken` cookie automatically.

**Response `200`:** Same `AuthResponse` shape.

---

### POST `/auth/logout`

Invalidate the refresh token and clear the cookie.

**No request body.**

**Response `200`:**

```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### POST `/auth/forgot-password`

Send a password reset email.

**Request Body:**

```json
{ "email": "aditya@example.com" }
```

**Response `200`:** Always returns success (prevents email enumeration).

---

### POST `/auth/reset-password`

Reset password using a token from the email link.

**Request Body:**

```json
{
  "token": "<token-from-email>",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

---

## 2. User Profile (Auth Service) — 🔒 Requires Bearer Token

Base path: `/api/users`

### GET `/api/users/profile`

Get the authenticated user's profile.

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "firstName": "Aditya",
    "lastName": "Kumar",
    "email": "aditya@example.com",
    "phone": "9876543210",
    "role": "USER",
    "status": "ACTIVE",
    "subscriptionPlan": "PREMIUM",
    "createdAt": "2026-08-05T10:00:00"
  }
}
```

---

### PUT `/api/users/profile`

Update the authenticated user's name and phone.

**Request Body:**

```json
{
  "firstName": "Aditya",
  "lastName": "Kumar",
  "phone": "9876543210"
}
```

---

### PUT `/api/users/change-password`

Change the authenticated user's password.

**Request Body:**

```json
{
  "oldPassword": "OldPass@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

---

## 3. Loan Types — 🔓 Public (No Auth Required)

### GET `/api/loan-types`

List all active loan products.

**Response `200`:**

```json
{
  "data": [
    {
      "loanTypeId": 1,
      "loanName": "Home Loan",
      "category": "HOME", // enum: HOME, PERSONAL, VEHICLE, EDUCATION, BUSINESS
      "interestRate": 8.5,
      "maxTenureMonths": 360,
      "description": "For purchasing or constructing a home"
    }
  ]
}
```

---

## 4. Financial Profile — 🔒 Requires Bearer Token

Base path: `/api/financial-profile`

### GET `/api/financial-profile/exists`

Check if the user already has a financial profile.

**Response `200`:**

```json
{ "data": true }
```

---

### POST `/api/financial-profile`

Create the user's financial profile. **Fails if one already exists.**

### PUT `/api/financial-profile`

Update the existing financial profile.

**Request Body (same for POST and PUT):**

```json
{
  "age": 30,
  "maritalStatus": "SINGLE", // SINGLE | MARRIED | DIVORCED | WIDOWED
  "dependents": 0,
  "cityType": "METRO", // METRO | URBAN | SEMI_URBAN | RURAL
  "employmentType": "SALARIED", // SALARIED | SELF_EMPLOYED | BUSINESS | FREELANCER
  "workExperienceYears": 5,
  "incomeStability": "STABLE", // STABLE | MODERATE | UNSTABLE
  "monthlyIncome": 80000.0,
  "monthlyExpenses": 30000.0,
  "existingLoans": 1,
  "monthlyEmi": 10000.0,
  "creditCardBalance": 5000.0,
  "savings": 200000.0,
  "fixedDeposits": 50000.0, // optional
  "investments": 100000.0, // optional
  "emergencyFund": 150000.0,
  "cibilScore": 750, // 300–900
  "creditUtilization": 25.0, // 0–100 (%)
  "notes": "Optional freetext notes" // optional, max 255 chars
}
```

**Response `201` (POST) / `200` (PUT):**

```json
{
  "data": {
    "profileId": 1,
    "userId": 1,
    "age": 30,
    "maritalStatus": "SINGLE",
    "dependents": 0,
    "cityType": "METRO",
    "employmentType": "SALARIED",
    "workExperienceYears": 5,
    "incomeStability": "STABLE",
    "monthlyIncome": 80000.0,
    "monthlyExpenses": 30000.0,
    "existingLoans": 1,
    "monthlyEmi": 10000.0,
    "creditCardBalance": 5000.0,
    "savings": 200000.0,
    "fixedDeposits": 50000.0,
    "investments": 100000.0,
    "emergencyFund": 150000.0,
    "cibilScore": 750,
    "creditUtilization": 25.0,
    "notes": null
  }
}
```

### GET `/api/financial-profile`

Get the authenticated user's financial profile.

**Response:** Same as above.

---

## 5. Assessments — 🔒 Requires Bearer Token

Base path: `/api/assessments`

> **Free tier (`USER` role) is limited to 3 total assessments.**

### POST `/api/assessments`

Run a new financial readiness assessment.

**Request Body:**

```json
{
  "loanTypeId": 1,
  "loanAmount": 5000000.0,
  "tenureMonths": 240,
  "interestRate": 8.5
}
```

**Validation:**

- `loanAmount`, `tenureMonths`, `interestRate` must fall within the chosen loan type's configured bounds.
- A financial profile must exist before running an assessment.

**Response `201`:**

```json
{
  "data": {
    "assessmentId": 42,
    "loanTypeId": 1,
    "loanTypeName": "Home Loan",
    "loanAmount": 5000000.0,
    "tenureMonths": 240,
    "interestRate": 8.5,
    "emi": 43391.2,
    "foir": 66.74, // Fixed Obligation to Income Ratio (%)
    "dti": 66.74, // Debt-to-Income Ratio (%)
    "savingsRatio": 62.5,
    "emergencyFundCoverageMonths": 5.0,
    "creditUtilization": 25.0,
    "disposableIncome": 16608.8,
    "financialScore": 62, // 0–100
    "riskLevel": "MODERATE", // EXCELLENT | GOOD | MODERATE | NEEDS_IMPROVEMENT | HIGH_RISK
    "eligibleAmount": 4800000.0,
    "status": "COMPLETED",
    "assessmentDate": "2026-08-05T10:00:00"
  }
}
```

> **Side effect:** Triggers an async RabbitMQ event → Gemini AI generates personalized recommendations saved to MongoDB → email notification sent.

---

### GET `/api/assessments/{assessmentId}`

Get a specific assessment (only the caller's own).

**Response `200`:** Same `AssessmentResponseDto` shape.

---

### GET `/api/assessments/history`

Get the caller's full assessment history, newest first.

**Response `200`:**

```json
{
  "data": [
    /* array of AssessmentResponseDto */
  ]
}
```

---

## 6. Assessment Comparison — 🔒 Requires Bearer Token

### POST `/api/comparisons`

Compare 2–5 past assessments and get metric trends.

**Request Body:**

```json
{
  "assessmentIds": [10, 15, 20] // 2–5 IDs, must belong to the caller
}
```

**Response `200`:**

```json
{
  "data": {
    "assessments": [
      /* array of AssessmentResponseDto, oldest first */
    ],
    "trends": [
      {
        "metricName": "financialScore",
        "values": [55, 62, 70] // same order as assessments array
      },
      { "metricName": "foir", "values": [72.1, 66.7, 60.2] },
      { "metricName": "dti", "values": [72.1, 66.7, 60.2] },
      { "metricName": "savingsRatio", "values": [50.0, 55.0, 62.5] },
      { "metricName": "creditUtilization", "values": [35.0, 30.0, 25.0] }
    ],
    "summary": "Your financial score improved from 55 to 70 over 3 assessments..."
  }
}
```

---

## 7. Financial Goals — 🔒 Requires Bearer Token

Base path: `/api/goals`

### POST `/api/goals`

Create a new savings goal.

**Request Body:**

```json
{
  "goalName": "Emergency Fund",
  "targetAmount": 300000.0,
  "currentAmount": 50000.0, // optional, defaults to 0
  "targetDate": "2027-01-01", // must be in the future (ISO date)
  "notes": "6 months expenses" // optional, max 255 chars
}
```

**Response `201`:**

```json
{
  "data": {
    "goalId": 5,
    "goalName": "Emergency Fund",
    "targetAmount": 300000.0,
    "currentAmount": 50000.0,
    "targetDate": "2027-01-01",
    "status": "IN_PROGRESS", // NOT_STARTED | IN_PROGRESS | COMPLETED | PAUSED
    "notes": "6 months expenses",
    "remainingAmount": 250000.0, // computed
    "progressPercentage": 16.67, // computed
    "monthsRemaining": 5, // computed
    "requiredMonthlySavings": 50000.0, // computed
    "createdAt": "2026-08-05T10:00:00"
  }
}
```

---

### GET `/api/goals`

List all goals for the caller.

**Response `200`:** Array of `GoalResponseDto`.

---

### GET `/api/goals/{goalId}`

Get a specific goal.

---

### PUT `/api/goals/{goalId}`

Update a goal's details (same request shape as POST).

---

### PATCH `/api/goals/{goalId}/progress`

Update only the current saved amount.

**Request Body:**

```json
{ "currentAmount": 120000.0 }
```

---

### DELETE `/api/goals/{goalId}`

Delete a goal.

---

## 8. Consultations — 🔒 Premium Only (`PREMIUM_USER` or `ADMINISTRATOR`)

Base path: `/api/consultations`

### POST `/api/consultations`

Request a financial advisor consultation linked to an assessment.

**Request Body:**

```json
{ "assessmentId": 42 }
```

**Response `200`:**

```json
{
  "data": {
    "id": 3,
    "assessmentId": 42,
    "userId": 1,
    "advisorUserId": null, // null until an advisor picks it up
    "remarks": null,
    "status": "PENDING", // PENDING | RESPONDED
    "createdAt": "2026-08-05T10:00:00",
    "updatedAt": "2026-08-05T10:00:00"
  }
}
```

---

### GET `/api/consultations`

List the authenticated user's consultations.

**Response `200`:** Array of `ConsultationResponseDto`.

---

## 9. Advisor Endpoints — 🔒 `FINANCIAL_ADVISOR` Role Only

Base path: `/api/advisor/consultations`

### GET `/api/advisor/consultations`

List all pending consultations.

---

### PUT `/api/advisor/consultations/{id}`

Submit remarks for a consultation.

**Request Body:**

```json
{ "remarks": "Based on your FOIR of 66%, I recommend..." }
```

**Response `200`:** Updated `ConsultationResponseDto` with `status: "RESPONDED"`.

---

## 10. Notifications — 🔒 Requires Bearer Token

> **Note:** The notification service is internally proxied. The gateway maps `/notify/**` to the notification service but current routing uses `/api/**`. Check with your team on the exact public path. The internal paths are listed below.

### GET `/api/notifications/{userId}`

Get all notifications for a user.

**Response `200`:**

```json
{
  "data": [
    {
      "id": "mongo-object-id",
      "userId": "1",
      "message": "...",
      "read": false,
      "createdAt": "..."
    }
  ]
}
```

---

### PUT `/api/notifications/{id}/read`

Mark a notification as read.

---

## 11. Payments (Razorpay) — 🔒 Requires Bearer Token

### POST `/api/payments/order`

Create a Razorpay payment order.

**Request Body:**

```json
{ "amount": 99900 } // in paise (₹999.00 = 99900 paise)
```

**Response `200`:** Returns a Razorpay `Order` object.

---

### POST `/api/payments/verify`

Verify payment and upgrade user to PREMIUM.

**Request Body:**

```json
{
  "userId": 1,
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "sig_xxx"
}
```

**Response `200`:**

```json
{ "data": true }
```

> If `true`, the user's role is automatically upgraded to `PREMIUM_USER` via internal service call.

---

## 12. Admin (Auth Service) — 🔒 `ADMINISTRATOR` Only

Base path: `/api/admin` (auth service)

### GET `/api/admin/users`

List all users.

### PUT `/api/admin/users/{userId}/role`

Update a user's role.

**Query Param:** `?roleName=FINANCIAL_ADVISOR`

### PUT `/api/admin/users/{userId}/status`

Update a user's status.

**Query Param:** `?status=ACTIVE` or `?status=SUSPENDED`

### GET `/api/admin/subscriptions`

List all subscription plans.

### POST `/api/admin/subscriptions`

Create a subscription plan.

**Request Body:**

```json
{
  "planName": "PREMIUM",
  "price": 999.0,
  "status": "ACTIVE"
}
```

### PUT `/api/admin/subscriptions/{id}`

Update a subscription plan (same body as POST).

---

## 13. Admin (Financial Service) — 🔒 `ADMINISTRATOR` Only

Base path: `/api/admin` (financial service)

### GET `/api/admin/dashboard`

Get platform statistics.

**Response `200`:**

```json
{
  "data": {
    "totalAssessments": 1042,
    "totalGoals": 350,
    "pendingConsultations": 12,
    "totalProfiles": 520
  }
}
```

### POST `/api/admin/loan-types`

Create a new loan type (internal use, includes scoring thresholds).

### PUT `/api/admin/loan-types/{id}`

Update an existing loan type.

---

## 🤖 AI Feature Details

After every successful assessment:

1. `financial-service` publishes an `assessment.completed` RabbitMQ event.
2. `notification-service` listener picks it up.
3. Calls **Google Gemini 1.5 Flash** API with a prompt containing the assessment's score and risk level.
4. Returns a **JSON array of personalized tips** (e.g., `["Reduce FOIR by prepaying credit card", ...]`).
5. Falls back to a **rule-based recommender** if Gemini fails.
6. Saves recommendations to **MongoDB** (`Recommendation` collection).
7. Sends an **email notification** via SMTP (Brevo).

---

## 🌐 Swagger / OpenAPI Docs

| Service              | Swagger UI URL                          |
| -------------------- | --------------------------------------- |
| Auth Service         | `http://localhost:8081/swagger-ui.html` |
| Financial Service    | `http://localhost:8082/swagger-ui.html` |
| Notification Service | `http://localhost:8083/swagger-ui.html` |
| Auth API Docs (JSON) | `http://localhost:8081/v3/api-docs`     |

---

## 🔑 Environment Variables Required

| Variable                                        | Used By                          |
| ----------------------------------------------- | -------------------------------- |
| `DB_USERNAME` / `DB_PASSWORD`                   | Auth + Financial service (MySQL) |
| `MONGODB_URI`                                   | Financial + Notification service |
| `JWT_SECRET`                                    | Auth + Financial service         |
| `INTERNAL_API_SECRET`                           | Service-to-service calls         |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | Auth + Notification service      |
| `GEMINI_API_KEY`                                | Notification service (AI)        |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`       | Notification service             |
| `RABBITMQ_USERNAME` / `RABBITMQ_PASSWORD`       | Financial + Notification service |

---
