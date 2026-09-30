# Database Design

┌──────────────┐
│     User     │
├──────────────┤
│ id           │
│ email        │
│ password     │
│ role         │
│ createdAt    │
└──────────────┘


┌──────────────┐
│    Event     │
├──────────────┤
│ id           │
│ name         │
└──────┬───────┘
       │
       │ 1 : N
       ▼
┌──────────────┐
│  TicketType  │
├──────────────┤
│ id           │
│ name         │
│ price        │
│ totalQuantity│
│ availableQty │
│ eventId      │
└──────┬───────┘
       │
       │ 1 : N
       ▼
┌──────────────┐
│ Reservation  │
├──────────────┤
│ id           │
│ quantity     │
│ status       │
│ expiresAt    │
│ createdAt    │
│ ticketTypeId │
└──────┬───────┘
       │
       │ 1 : N
       ▼
┌──────────────┐
│    Order     │
├──────────────┤
│ id           │
│ quantity     │
│ totalAmount  │
│ createdAt    │
│ reservationId│
└──────────────┘