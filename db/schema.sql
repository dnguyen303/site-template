create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  street_1 text,
  street_2 text,
  city text,
  state text,
  zip text not null,
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  address_id uuid not null references addresses(id) on delete cascade,
  service_type text not null,
  load_size text not null,
  stairs boolean not null default false,
  preferred_date date,
  preferred_time_window text,
  estimated_price integer not null,
  status text not null default 'new',
  source text not null default 'website',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  item_type text not null,
  quantity integer not null default 1,
  notes text,
  created_at timestamptz not null default now()
);
