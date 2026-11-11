CREATE OR REPLACE FUNCTION public.can_view_student_profile(
    p_student_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.enrollments e
        JOIN public.courses c
            ON c.id = e.course_id
        WHERE e.student_id = p_student_id
          AND e.status IN ('approved', 'active')
          AND (
              c.owner_id = (SELECT auth.uid())

              OR

              EXISTS (
                  SELECT 1
                  FROM public.organization_member om
                  WHERE om.organization_id = c.organization_id
                    AND om.admin_id = (SELECT auth.uid())
                    AND om.role = 'owner'
              )
          )
    );
$$;

REVOKE ALL ON FUNCTION
    public.can_view_student_profile(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
    public.can_view_student_profile(uuid)
TO authenticated;

CREATE POLICY "Course owners can view enrolled student profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
    public.can_view_student_profile(id)
);
