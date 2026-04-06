# Restful Booker API Tests

This repository is a portfolio-oriented API automation project built to demonstrate SDET skills against the public Restful Booker API. It focuses on smoke checks, authentication, CRUD coverage, filters, contract validation, negative scenarios, and full booking lifecycle workflows.

## Why Restful Booker

Restful Booker is a better portfolio target than a trivial demo API because it provides:

- Authentication with token generation
- Booking CRUD operations
- Query-based filtering
- Publicly accessible API with no account setup
- Known quirks and weak validation that are useful for bug-oriented testing

## Coverage

The suite currently covers:

- `GET /ping` smoke validation
- `POST /auth` success and failure paths
- auth missing-field, empty-field, and malformed-json handling
- Booking creation and retrieval
- booking create variants and weak-validation coverage
- Booking listing and filter queries
- special-character filter handling
- Full update with `PUT`
- Partial update with `PATCH`
- Delete flow with verification after deletion
- Unauthorized update, patch, and delete behavior
- End-to-end create -> get -> update -> patch -> delete workflow
- token reuse and parallel create/update scenarios
- Contract validation for auth, booking detail, booking creation, and booking id lists

## Stack

- Jest 30
- SuperTest
- AJV
- ESLint flat config
- Husky

## Setup

Install dependencies:

```bash
npm install
```

Optional environment overrides:

```bash
RESTFUL_BOOKER_BASE_URL=https://restful-booker.herokuapp.com
RESTFUL_BOOKER_USERNAME=admin
RESTFUL_BOOKER_PASSWORD=password123
```

The defaults already work with the public API, so no account or API key setup is required.

## Scripts

Run the full suite:

```bash
npm test
```

Run smoke coverage only:

```bash
npm run test:smoke
```

Run booking and workflow coverage:

```bash
npm run test:booking
```

Lint the project:

```bash
npm run lint
```

Clear Jest cache:

```bash
npm run clear
```

## Project Structure

```text
__tests__/auth/       Authentication coverage
__tests__/booking/    Booking CRUD, filters, and negative cases
__tests__/smoke/      API availability checks
__tests__/workflow/   End-to-end workflow coverage
config/               Environment and HTTP client setup
factories/            Data builders for booking payloads
helpers/              Auth, cleanup, validation, and quirk handling
schemas/              JSON schema contracts
```

## Notes

- The suite uses the raw HTTP API directly to keep the request and response contract explicit.
- Created bookings are tracked and cleaned up when possible.
- Some negative tests intentionally document weak validation or inconsistent behavior in the public API.
- Date-based filter behavior is intentionally treated as a public API quirk: the endpoint accepts the filters reliably, but the returned matches are not deterministic enough for strict data assertions.
- HTML test reports are generated under `html-report/`.
