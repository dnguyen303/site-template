# API Spec

## MVP endpoints

### POST /api/quote
Purpose:
- accept quote or booking request data
- validate payload
- calculate estimate
- write to Postgres
- trigger confirmation email

### GET /api/admin/bookings
Purpose:
- fetch latest booking requests for internal admin view

## POST /api/quote request example
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "5551234567",
  "email": "john@example.com",
  "zip": "80027",
  "serviceType": "junk_removal",
  "loadSize": "medium",
  "stairs": true,
  "preferredDate": "2026-05-01",
  "preferredTimeWindow": "10am-12pm",
  "items": [
    { "itemType": "couch", "quantity": 1 },
    { "itemType": "boxes", "quantity": 8 }
  ],
  "notes": "Gate on left side"
}
```

## Response example
```json
{
  "ok": true,
  "bookingId": "uuid",
  "estimatedPrice": 274,
  "status": "new"
}
```

## Validation rules
- firstName required
- phone required
- zip required
- loadSize required
- items optional for MVP
- stairs defaults to false

## Pricing rules for MVP
- single: 99
- small: 149
- medium: 249
- large: 499
- stairs: +25
