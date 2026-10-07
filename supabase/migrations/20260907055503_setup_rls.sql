alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.course_admins enable row level security;
alter table public.programs enable row level security;
alter table public.enrollments enable row level security;
-- USERS
create policy "Users can view own profile"
on public.users
for select
to authenticated
using (
  id = auth.uid()
);
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'platform_admin'
  );
$$;
create or replace function public.is_course_admin(
  target_course_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.courses c
      where c.id = target_course_id
        and c.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.course_admins ca
      where ca.course_id = target_course_id
        and ca.admin_id = auth.uid()
    );
$$;
-- COURSES
create policy "Authenticated users can view courses"
on public.courses
for select
to authenticated
using (true);
create policy "Instructors can create courses"
on public.courses
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('instructor', 'platform_admin')
  )
);
create policy "Course admins can update courses"
on public.courses
for update
to authenticated
using (
    public.is_course_admin(id)
)
with check (
    public.is_course_admin(id)
);
create policy "Course admins can delete courses"
on public.courses
for delete
to authenticated
using(
    public.is_course_admin(id)
);
-- COURSE ADMINS
create policy "Course admins can view course admins"
on public.course_admins
for select 
to authenticated
using(
    public.is_course_admin(course_id)
);
create policy "Course owners can add course admins"
on public.course_admins
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courses
    where courses.id = course_id
      and courses.owner_id = auth.uid()
  )
);
create policy "Course owners can remove course admins"
on public.course_admins
for delete
to authenticated
using (
  exists (
    select 1
    from public.courses
    where courses.id = course_id
      and courses.owner_id = auth.uid()
  )
);
-- PROGRAMS
create policy "Authenticated users can view programs"
on public.programs
for select
to authenticated
using (true);
create policy "Course admins can create programs"
on public.programs
for insert
to authenticated
with check (
  public.is_course_admin(course_id)
);
create policy "Course admins can update programs"
on public.programs
for update
to authenticated
using (
  public.is_course_admin(course_id)
)
with check (
  public.is_course_admin(course_id)
);
create policy "Course admins can delete programs"
on public.programs
for delete
to authenticated
using (
  public.is_course_admin(course_id)
);
--ENROLLMENTS
create policy "Student can view own enrollments"
on public.enrollments
for select
to authenticated
using (
    student_id = auth.uid()
);
create policy "Course admins can view enrollments"
on public.enrollments
for select
to authenticated
using (
    public.is_course_admin(course_id)
);
create policy "Students can create own enrollments"
on public.enrollments
for insert
to authenticated
with check (
  student_id = auth.uid()
  and status = 'pending'
);
create policy "Course admins can update enrollments"
on public.enrollments
for update
to authenticated
using (
  public.is_course_admin(course_id)
)
with check (
  public.is_course_admin(course_id)
);
