
-- =====================================================
-- INVOICES: SELECT POLICY
-- =====================================================

CREATE POLICY "Authorized users can view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
    -- Student can view invoices belonging to their enrollment
    EXISTS (
        SELECT 1
        FROM public.enrollments e
        WHERE e.id = invoices.enrollment_id
          AND e.student_id = (SELECT auth.uid())
    )

    OR

    -- Platform admin can view all invoices
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'platform_admin'
    )

    OR

    -- Course owner can view invoices belonging to their course
    EXISTS (
        SELECT 1
        FROM public.enrollments e
        JOIN public.courses c
          ON c.id = e.course_id
        WHERE e.id = invoices.enrollment_id
          AND c.owner_id = (SELECT auth.uid())
    )

    OR

    -- Organization owner can view invoices belonging
    -- to courses within their organization
    EXISTS (
        SELECT 1
        FROM public.enrollments e
        JOIN public.courses c
          ON c.id = e.course_id
        JOIN public.organization_member om
          ON om.organization_id = c.organization_id
        WHERE e.id = invoices.enrollment_id
          AND om.admin_id = (SELECT auth.uid())
          AND om.role = 'owner'
    )
);

-- Ensure authenticated users have SELECT permission
GRANT SELECT ON public.invoices TO authenticated;
