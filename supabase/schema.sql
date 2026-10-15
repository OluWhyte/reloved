-- Reloved Supabase schema (run in SQL Editor)
-- Profiles extend auth.users; listings/claims/stories implement the 5-step flow.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  karma_points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  origin_story text not null,
  photos text[] not null default '{}',
  selection_method text not null default 'fcfs' check (selection_method in ('fcfs','manual')),
  status text not null default 'available' check (status in ('available','locked','in_transit','delivered')),
  locked_claim_id uuid,
  delivery_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  delivery_method text not null check (delivery_method in ('pickup','courier')),
  fee int not null default 0,
  distance_km numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending','locked','paid','pickup_confirmed','in_transit','delivered','story_shared')),
  is_chosen boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.thank_stories (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  donor_id uuid references public.profiles(id) on delete set null,
  recipient_id uuid references public.profiles(id) on delete set null,
  note text not null,
  photo text,
  created_at timestamptz not null default now()
);
