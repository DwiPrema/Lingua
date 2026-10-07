create unique index unique_active_enrollment
on public.enrollments(student_id, course_id)
where status in ('pending', 'approved');
