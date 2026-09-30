# Mini-Ticmint

A backend-focused event ticketing system built with NestJS, TypeScript and PostgreSQL.

Mini-Ticmint models the core backend flow of an event-ticketing platform:

**User → Event → Ticket Type → Reservation → Order**

The project focuses on practical backend engineering problems involving ticket inventory, temporary reservations, concurrent requests, transactions and authentication.

## Features

- Event CRUD
- Ticket type and inventory management
- Temporary ticket reservations
- Automatic reservation expiry
- Inventory restoration after expiry
- Purchase/order creation
- JWT authentication
- Password hashing with bcrypt
- Request validation
- PostgreSQL persistence
- Database transactions
- Pessimistic row locking
- Concurrent reservation protection
- Concurrent purchase protection

## Tech Stack

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- TypeORM
- class-validator
- JWT / Passport
- bcrypt
- Git / GitHub

## Architecture

Client
  │
  │ HTTP
  ▼
NestJS Controllers
  │
  ▼
Services
  │
  ├── Authentication
  ├── Event Management
  └── Reservation / Purchase
  │
  ▼
TypeORM
  │
  ▼
PostgreSQL

## Core Flow

Event
  ↓
Ticket Type
  ↓
Reservation
  ├── Purchase → Order
  └── Expiry → Inventory Restored

## Concurrency Handling

Ticket inventory is a shared resource, so concurrent requests can cause overselling if they read and update inventory independently.

Mini-Ticmint uses PostgreSQL transactions with pessimistic row locking.

### Reservation

BEGIN
  ↓
Lock TicketType row
  ↓
Check inventory
  ↓
Decrease available quantity
  ↓
Create reservation
  ↓
COMMIT

### Purchase

BEGIN
  ↓
Lock Reservation row
  ↓
Check ACTIVE + not expired
  ↓
Create Order
  ↓
ACTIVE → PURCHASED
  ↓
COMMIT

The purchase flow was tested with two simultaneous requests against the same reservation:

2 simultaneous requests
        ↓
1 → HTTP 201
1 → HTTP 400
        ↓
Exactly 1 Order created

## Reservation Expiry

Reservations are held for 15 minutes.

A scheduled job runs every minute and processes expired reservations.

ACTIVE
  │
  ├── Purchase → PURCHASED
  │
  └── Timeout → EXPIRED
                    ↓
              Inventory Restored

## Authentication

Authentication uses bcrypt for password hashing and JWT for authenticated requests.

Register
   ↓
Password hashed
   ↓
Login
   ↓
JWT issued
   ↓
Authorization: Bearer <token>
   ↓
Protected endpoint

Event creation requires authentication.

## API Endpoints

### Authentication

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| POST   | `/auth/register` | Register a user       |
| POST   | `/auth/login`    | Login and receive JWT |

### Events

| Method | Endpoint      | Description                 |
| ------ | ------------- | --------------------------- |
| GET    | `/events`     | List events                 |
| GET    | `/events/:id` | Get an event                |
| POST   | `/events`     | Create event — JWT required |
| PATCH  | `/events/:id` | Update an event             |
| DELETE | `/events/:id` | Delete an event             |

### Ticket Types

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| GET    | `/events/:id/ticket-types` | List ticket types  |
| POST   | `/events/:id/ticket-types` | Create ticket type |

### Reservations & Orders

| Method | Endpoint                                              | Description          |
| ------ | ----------------------------------------------------- | -------------------- |
| POST   | `/events/:id/ticket-types/:ticketTypeId/reservations` | Reserve tickets      |
| POST   | `/events/reservations/:reservationId/purchase`        | Purchase reservation |

### Requirements

* Node.js
* PostgreSQL

## Project Focus

This project was built to understand practical backend engineering concepts including:

* REST APIs
* NestJS architecture
* DTO validation
* PostgreSQL relationships
* Transactions
* Row-level locking
* Race conditions
* Inventory consistency
* Reservation state transitions
* Scheduled background processing
* JWT authentication
* Concurrent request handling

The project intentionally focuses on the core ticketing backend rather than reproducing the full architecture of a commercial ticketing platform.
