-- Trip Planner data model. Run in the Supabase SQL editor for your project.
-- Requires Supabase's built-in auth.users table (Auth already provides this).

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled trip',
  start_date date,
  end_date date,
  display_currency text not null default 'USD',
  traveler_count integer not null default 1 check (traveler_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trip_collaborators (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  granularity text not null check (granularity in ('place', 'city', 'province', 'country')),
  lat double precision,
  lng double precision,
  place_id text,
  created_at timestamptz not null default now()
);

create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete cascade,
  place_id text,
  name text not null,
  category text not null check (category in ('attraction', 'restaurant', 'hotel', 'custom')),
  day_date date,
  duration_minutes integer,
  cost numeric(12, 2),
  cost_currency text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists travel_legs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  from_item_id uuid not null references itinerary_items(id) on delete cascade,
  to_item_id uuid not null references itinerary_items(id) on delete cascade,
  selected_mode text check (selected_mode in ('public', 'private')),
  cost numeric(12, 2),
  cost_currency text,
  created_at timestamptz not null default now()
);

-- Row Level Security -------------------------------------------------------

alter table trips enable row level security;
alter table trip_collaborators enable row level security;
alter table destinations enable row level security;
alter table itinerary_items enable row level security;
alter table travel_legs enable row level security;

create or replace function is_trip_owner(trip uuid)
returns boolean language sql stable as $$
  select exists (select 1 from trips where id = trip and owner_id = auth.uid());
$$;

create or replace function is_trip_editor(trip uuid)
returns boolean language sql stable as $$
  select is_trip_owner(trip) or exists (
    select 1 from trip_collaborators
    where trip_id = trip and user_id = auth.uid() and role = 'editor'
  );
$$;

create or replace function has_trip_access(trip uuid)
returns boolean language sql stable as $$
  select is_trip_owner(trip) or exists (
    select 1 from trip_collaborators where trip_id = trip and user_id = auth.uid()
  );
$$;

-- trips
create policy "trips_select" on trips for select using (has_trip_access(id));
create policy "trips_insert" on trips for insert with check (owner_id = auth.uid());
create policy "trips_update" on trips for update using (is_trip_editor(id));
create policy "trips_delete" on trips for delete using (is_trip_owner(id));

-- trip_collaborators (only the owner manages sharing; collaborators can see who else has access)
create policy "collaborators_select" on trip_collaborators for select using (has_trip_access(trip_id));
create policy "collaborators_insert" on trip_collaborators for insert with check (is_trip_owner(trip_id));
create policy "collaborators_update" on trip_collaborators for update using (is_trip_owner(trip_id));
create policy "collaborators_delete" on trip_collaborators for delete using (is_trip_owner(trip_id));

-- destinations / itinerary_items / travel_legs share the same access shape
create policy "destinations_select" on destinations for select using (has_trip_access(trip_id));
create policy "destinations_write" on destinations for insert with check (is_trip_editor(trip_id));
create policy "destinations_update" on destinations for update using (is_trip_editor(trip_id));
create policy "destinations_delete" on destinations for delete using (is_trip_editor(trip_id));

create policy "items_select" on itinerary_items for select using (has_trip_access(trip_id));
create policy "items_write" on itinerary_items for insert with check (is_trip_editor(trip_id));
create policy "items_update" on itinerary_items for update using (is_trip_editor(trip_id));
create policy "items_delete" on itinerary_items for delete using (is_trip_editor(trip_id));

create policy "legs_select" on travel_legs for select using (has_trip_access(trip_id));
create policy "legs_write" on travel_legs for insert with check (is_trip_editor(trip_id));
create policy "legs_update" on travel_legs for update using (is_trip_editor(trip_id));
create policy "legs_delete" on travel_legs for delete using (is_trip_editor(trip_id));

-- Lets a trip owner resolve a collaborator's email to their user id in order
-- to share a trip, without granting broad read access to auth.users.
create or replace function find_user_id_by_email(email text)
returns uuid language sql security definer set search_path = public as $$
  select id from auth.users where lower(auth.users.email) = lower(email) limit 1;
$$;

revoke all on function find_user_id_by_email(text) from public;
grant execute on function find_user_id_by_email(text) to authenticated;
