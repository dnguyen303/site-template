# Database Schema

## Core principle
Start small. Only create tables needed for the MVP.

## Tables

### customers
- id UUID primary key
- first_name text not null
- last_name text null
- phone text not null
- email text null
- created_at timestamptz default now()
- updated_at timestamptz default now()

### addresses
- id UUID primary key
- customer_id UUID references customers(id)
- street_1 text null
- street_2 text null
- city text null
- state text null
- zip text not null
- access_notes text null
- created_at timestamptz default now()
- updated_at timestamptz default now()

### bookings
- id UUID primary key
- customer_id UUID references customers(id)
- address_id UUID references addresses(id)
- service_type text not null
- load_size text not null
- stairs boolean default false
- preferred_date date null
- preferred_time_window text null
- estimated_price integer not null
- status text not null default 'new'
- source text not null default 'website'
- notes text null
- created_at timestamptz default now()
- updated_at timestamptz default now()

### booking_items
- id UUID primary key
- booking_id UUID references bookings(id)
- item_type text not null
- quantity integer not null default 1
- notes text null
- created_at timestamptz default now()

## Status values
- new
- quoted
- booked
- scheduled
- en_route
- complete
- canceled

## Notes
- This schema is intentionally lean.
- Do not add payments, users, automations, or photos until needed.
