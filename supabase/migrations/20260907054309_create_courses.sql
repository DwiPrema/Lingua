create table public.courses (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  description text,
  address text,

  owner_id uuid not null
    references public.users(id)
    on delete restrict
);
create index idx_courses_owner_id
on public.courses(owner_id);
