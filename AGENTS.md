# AGENTS Guide - PortafolioV2 Backend

This file helps AI coding agents become productive quickly in this repository.

## Scope

- Applies to the backend workspace root.
- Prefer minimal, targeted edits; do not refactor unrelated files.

## Stack and Runtime

- Node.js 18+
- ES Modules (`"type": "module"`)
- Express + Supabase + Joi

## Source of Truth

- Project overview and endpoints: [README.md](README.md)
- Environment template: [.env.example](.env.example)

## Commands

Use npm scripts from [package.json](package.json):

- Install dependencies: `npm install`
- Dev server (watch mode): `npm run dev`
- Production start: `npm start`
- Run tests: `npm test`
- Watch tests: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Dependency audit: `npm run security-audit`

## Architecture Map

- Entry point: [server.js](server.js)
- Express app setup: [src/app.js](src/app.js)
- Routes: [src/routes](src/routes)
- Controllers: [src/controllers](src/controllers)
- Services/Supabase integration: [src/services/services.js](src/services/services.js)
- Validation schemas and middleware:
  - [src/models/Schemas.js](src/models/Schemas.js)
  - [src/middleware/validationMiddleware.js](src/middleware/validationMiddleware.js)
- Security and auth middleware:
  - [src/middleware/securityMiddleware.js](src/middleware/securityMiddleware.js)
  - [src/middleware/supabaseSecurityMiddleware.js](src/middleware/supabaseSecurityMiddleware.js)
  - [src/middleware/authMiddleware.js](src/middleware/authMiddleware.js)
- Error handling: [src/middleware/errorMiddleware.js](src/middleware/errorMiddleware.js)

## Project Conventions (Important)

- Keep async route handlers wrapped with `catchAsync` from [src/middleware/errorMiddleware.js](src/middleware/errorMiddleware.js).
- Preserve middleware order in [src/app.js](src/app.js), especially around CORS, rate limiting, and security middleware.
- Validate request input before controller logic using [src/middleware/validationMiddleware.js](src/middleware/validationMiddleware.js).
- Maintain field mapping consistency between API payloads and Supabase column names in [src/services/services.js](src/services/services.js).
- For project image uploads, follow existing upload/cleanup flow in [src/controllers/projectController.js](src/controllers/projectController.js).

## Guardrails for Changes

- Do not expose secrets from `.env` in code, logs, or docs.
- Do not weaken security middleware, auth checks, or rate limits without explicit request.
- Do not edit generated coverage assets under [coverage](coverage) unless explicitly asked.
- Keep changes scoped; avoid renaming public routes unless required.

## Quick Debug Pointers

- CORS issues: check allowed origins and CORS middleware setup in [src/app.js](src/app.js).
- Auth issues: verify bearer token flow in [src/middleware/authMiddleware.js](src/middleware/authMiddleware.js).
- Validation failures: inspect Joi schemas and validators in [src/middleware/validationMiddleware.js](src/middleware/validationMiddleware.js).
- Data persistence issues: inspect Supabase calls in [src/services/services.js](src/services/services.js).
