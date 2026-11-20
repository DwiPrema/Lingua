CREATE OR REPLACE FUNCTION public.get_landing_statistics()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT json_build_object(
        'total_students',
        (
            SELECT COUNT(*)
            FROM public.users
            WHERE role = 'student'
        ),
        'total_course_owners',
        (
            SELECT COUNT(*)
            FROM public.users
            WHERE role = 'instructor'
        ),
        'total_users',
        (
            SELECT COUNT(*)
            FROM public.users
            WHERE role IN ('student', 'instructor')
        )
    );
$$;

-- Allow anonymous users to execute this function
REVOKE ALL ON FUNCTION public.get_landing_statistics() FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.get_landing_statistics()
TO anon, authenticated;