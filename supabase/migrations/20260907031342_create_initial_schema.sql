-- USERS TABLE
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email text not null,
  fullname text not null,
  nickname text,
  phone text,

  role text not null default 'student'
    check (
      role in (
        'student',
        'instructor',
        'platform_admin'
      )
    ),

  subscription_status text,
  student_limit integer
);
-- HANDLE NEW USER
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    fullname,
    nickname,
    phone,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'fullname',
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    new.raw_user_meta_data ->> 'nickname',
    new.raw_user_meta_data ->> 'phone',
    'student'
  );

  return new;
end;
$$;
-- FUNCTION ON AUTH USER CREATED
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
