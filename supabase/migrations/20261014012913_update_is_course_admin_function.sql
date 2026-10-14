CREATE OR REPLACE FUNCTION public.is_course_admin(
    target_course_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT
        public.is_platform_admin()

        OR EXISTS (
            SELECT 1
            FROM public.courses AS c
            WHERE c.id = target_course_id
              AND c.owner_id = auth.uid()
        )

        OR EXISTS (
            SELECT 1
            FROM public.courses AS c
            JOIN public.organization_member AS om
                ON om.organization_id = c.organization_id
            WHERE c.id = target_course_id
              AND om.admin_id = auth.uid()
              AND om.role IN ('owner', 'instructor')
        );
$function$;