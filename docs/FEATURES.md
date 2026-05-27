# VetHaul Features (Source of Truth)

This document defines ALL features. Claude must follow phase gating strictly.

---

## Core Product Definition

VetHaul is a:
- junk removal booking website
- lead capture system
- operational tool for scheduling and managing jobs

Primary goal:
Reduce friction from customer intent → booking.

---

## Phase 1 — MVP (Required for launch)

### Booking Flow
- multi-step booking UI
- service type selection
- location (ZIP + address)
- access details (stairs, etc.)
- preferred date/time
- contact info

### Pricing
- server-side pricing calculation
- base pricing:
  - single: 99
  - small: 149
  - medium: 249
  - large: 499
- add-ons:
  - stairs: +25

### Data
- store bookings in Postgres
- store customers and addresses

### Notifications
- email confirmation (customer)
- optional SMS alert (owner)

### Admin (minimal)
- view bookings list
- view booking details
- update status manually

---

## Phase 2 — Operations

### Booking Enhancements
- photo upload for quotes
- service area validation
- booking status updates

### Notifications
- booking confirmation SMS
- reminder SMS (before job)
- “crew on the way” message
- job completion message

### Admin Improvements
- filter bookings by status
- basic search
- status pipeline:
  - new
  - booked
  - scheduled
  - complete

---

## Phase 3 — Growth

### Automation
- abandoned quote follow-up
- missed lead follow-up
- review request automation
- referral messaging

### Analytics
- track lead source
- conversion tracking
- basic metrics:
  - quotes → bookings
  - bookings → completed

### Customer
- repeat customer tracking
- job history

---

## Phase 4 — AI Features

### AI Photo Pricing (HIGH PRIORITY)
- input: uploaded image
- output:
  - item detection
  - load size estimate
- feeds pricing engine

### AI SMS Assistant
- auto-respond to:
  - pricing questions
  - availability
  - service area
- uses business rules + pricing

### AI Lead Scoring
- classify:
  - high value (full cleanout)
  - low value (single item)
- route workflows based on value

### AI Quote Generator
- combine:
  - form data
  - photo
  - notes
- output structured estimate

---

## Phase 5 — Advanced

### Operations AI
- route grouping (location-based)
- schedule optimization

### Pricing AI
- dynamic pricing:
  - demand
  - urgency
  - distance

### Voice AI
- phone call booking agent

---

## Rules

- Do NOT implement features outside current phase
- Do NOT jump to AI features before MVP is complete
- Always prefer simple implementation first