create table public.programs (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  name text not null,
  description text,

  monthly_fee numeric(12,2) not null default 0,
  registration_fee numeric(12,2) not null default 0
);
create index idx_programs_course_id
on public.programs(course_id);
