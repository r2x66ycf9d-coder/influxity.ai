# Influxity.ai API Documentation

**Version:** 1.0.0
**Date:** December 06, 2025

---

## Introduction

Welcome to the Influxity.ai API documentation. This document provides a comprehensive overview of all available API endpoints, their functionalities, input/output schemas, and usage examples.

The API is built using **tRPC**, which provides end-to-end type safety. While you can interact with it as a standard REST API, it is best consumed by a tRPC client for a superior developer experience.

**Base URL:** `/api/trpc`

---

## Authentication

Most endpoints are **protected** and require a valid JSON Web Token (JWT) to be passed in the `Authorization` header as a Bearer token.

`Authorization: Bearer <your_jwt_token>`

Endpoints are marked as `protected` or `public`.

---

## Routers Summary

The API is organized into the following routers:

1.  **`auth`**: User authentication and session management.
2.  **`chat`**: Real-time AI chat conversations.
3.  **`email`**: AI-powered email generation.
4.  **`salesCopy`**: AI-powered sales copy generation.
5.  **`content`**: AI-powered content generation.
6.  **`analysis`**: AI-powered data analysis.
7.  **`stripe`**: Subscription and payment management.
8.  **`user`**: User profile and settings management.

---

## 1. `auth` Router

Handles user authentication, including login, logout, and session status.

### `auth.login`
- **Type:** `public procedure`
- **Description:** Initiates the OAuth login flow. Redirects the user to the configured OAuth provider.
- **Input:** `void`
- **Output:** `{ redirectUrl: string }`

### `auth.logout`
- **Type:** `protected procedure`
- **Description:** Logs the user out by clearing the session cookie.
- **Input:** `void`
- **Output:** `{ success: boolean }`

### `auth.getSession`
- **Type:** `public procedure`
- **Description:** Retrieves the current user session information.
- **Input:** `void`
- **Output:** `{ user: User | null }`
  - `User`: `{ id: number, openId: string, email: string, name: string, avatar: string }`

---

## 2. `chat` Router

Manages AI-powered chat conversations.

### `chat.createConversation`
- **Type:** `protected procedure`
- **Description:** Creates a new chat conversation.
- **Input:** `{ title: string }`
- **Output:** `{ id: number, title: string, userId: number, createdAt: Date }`

### `chat.getConversations`
- **Type:** `protected procedure`
- **Description:** Retrieves all conversations for the current user.
- **Input:** `void`
- **Output:** `Array<{ id: number, title: string, ... }>`

### `chat.sendMessage`
- **Type:** `protected procedure`
- **Description:** Sends a message to a conversation and gets an AI response.
- **Input:** `{ conversationId: number, message: string }`
- **Output:** `{ message: string }` (The AI-generated response)

---

## 3. `email` Router

Generates various types of emails using AI.

### `email.generate`
- **Type:** `protected procedure`
- **Description:** Generates an email based on type, context, and tone.
- **Input:**
  ```typescript
  {
    type: "sales" | "support" | "marketing" | "followup",
    context: string,
    tone?: "professional" | "friendly" | "casual"
  }
  ```
- **Output:** `{ content: string }`

### `email.getHistory`
- **Type:** `protected procedure`
- **Description:** Retrieves history of generated emails.
- **Input:** `{ type?: "sales" | "support" | ... }` (optional filter)
- **Output:** `Array<{ id: number, type: string, content: string, ... }>`

---

## 4. `salesCopy` Router

Generates sales and marketing copy.

### `salesCopy.generate`
- **Type:** `protected procedure`
- **Description:** Generates sales copy for a product.
- **Input:**
  ```typescript
  {
    type: "headline" | "cta" | "description" | "product",
    product: string,
    targetAudience?: string
  }
  ```
- **Output:** `{ content: string }`

### `salesCopy.getHistory`
- **Type:** `protected procedure`
- **Description:** Retrieves history of generated sales copy.
- **Input:** `void`
- **Output:** `Array<{ id: number, type: string, content: string, ... }>`

---

## 5. `content` Router

Generates long-form content.

### `content.generate`
- **Type:** `protected procedure`
- **Description:** Generates various types of marketing and business content.
- **Input:**
  ```typescript
  {
    type: "email_campaign" | "landing_page" | "social_media" | "blog_post" | "product_launch" | "case_study" | "faq",
    topic: string,
    details?: string
  }
  ```
- **Output:** `{ content: string }`

### `content.getHistory`
- **Type:** `protected procedure`
- **Description:** Retrieves history of generated content.
- **Input:** `{ type?: "blog_post" | ... }` (optional filter)
- **Output:** `Array<{ id: number, type: string, content: string, ... }>`

---

## 6. `analysis` Router

Performs data analysis and generates insights.

### `analysis.analyze`
- **Type:** `protected procedure`
- **Description:** Analyzes provided data and returns insights and recommendations.
- **Input:**
  ```typescript
  {
    type: "sales" | "customer_behavior" | "operational_efficiency" | "roi" | "competitive" | "growth",
    data: string, // Can be CSV, JSON, or natural language description
    context?: string
  }
  ```
- **Output:** `{ insights: string, recommendations: string }`

### `analysis.getHistory`
- **Type:** `protected procedure`
- **Description:** Retrieves history of data analyses.
- **Input:** `void`
- **Output:** `Array<{ id: number, analysisType: string, insights: string, ... }>`

---

## 7. `stripe` Router

Manages payments and subscriptions via Stripe.

### `stripe.createCheckout`
- **Type:** `protected procedure`
- **Description:** Creates a Stripe checkout session for a subscription plan.
- **Input:** `{ plan: "STARTER" | "PROFESSIONAL" }`
- **Output:** `{ checkoutUrl: string }`

---

## 8. `user` Router

Manages user-specific data and settings.

### `user.getUsage`
- **Type:** `protected procedure`
- **Description:** Retrieves the user's current API usage and limits.
- **Input:** `void`
- **Output:** `{ usage: number, limit: number, plan: string }`

### `user.getProfile`
- **Type:** `protected procedure`
- **Description:** Retrieves the user's profile information.
- **Input:** `void`
- **Output:** `{ id: number, email: string, name: string, plan: string, ... }`

---

## Error Handling

The API returns standard HTTP status codes for errors.

- **400 Bad Request:** Invalid input or schema validation failure.
- **401 Unauthorized:** Missing or invalid authentication token.
- **403 Forbidden:** User does not have permission to access the resource.
- **429 Too Many Requests:** Rate limit exceeded.
- **500 Internal Server Error:** An unexpected server error occurred.

Error responses include a message detailing the issue:
`{ "error": { "message": "Error details here" } }`
