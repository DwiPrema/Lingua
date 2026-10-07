create table public.course_admins (
  id uuid primary key default gen_random_uuid(),

  admin_id uuid not null
    references public.users(id)
    on delete cascade,

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  role text not null default 'admin'
    check (role = 'admin'),

  created_at timestamptz not null default now(),

  unique (admin_id, course_id)
);
create index idx_course_admins_admin_id
on public.course_admins(admin_id);
create index idx_course_admins_course_id
on public.course_admins(course_id);
