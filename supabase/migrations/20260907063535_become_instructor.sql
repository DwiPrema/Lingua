create or replace function public.become_instructor()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set
    role = 'instructor',
    updated_at = now()
  where id = (select auth.uid())
    and role = 'student';

  if not found then
    raise exception 'User cannot become instructor';
  end if;
end;
$$;
revoke execute
on function public.become_instructor()
from public;
revoke execute
on function public.become_instructor()
from anon;
grant execute
on function public.become_instructor()
to authenticated;
