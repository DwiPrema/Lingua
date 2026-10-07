create table public.enrollments (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  enrolled_at timestamptz,

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  program_id uuid not null
    references public.programs(id)
    on delete restrict,

  student_id uuid not null
    references public.users(id)
    on delete cascade,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'cancelled'
      )
    ),

  fullname text not null,
  address text,
  education_level text
);
create index idx_enrollments_student_id
on public.enrollments(student_id);
create index idx_enrollments_course_id
on public.enrollments(course_id);
create index idx_enrollments_program_id
on public.enrollments(program_id);
create index idx_enrollments_status
on public.enrollments(status);
