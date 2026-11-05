
-- =====================================================
-- PAYMENTS: SELECT POLICY
-- =====================================================

CREATE POLICY "Authorized users can view payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
    -- Student can view payments belonging to their invoice
    EXISTS (
        SELECT 1
        FROM public.invoices i
        JOIN public.enrollments e
            ON e.id = i.enrollment_id
        WHERE i.id = payments.invoice_id
          AND e.student_id = (SELECT auth.uid())
    )

    OR

    -- Platform admin can view all payments
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'platform_admin'
    )

    OR

    -- Course owner can view payments from their course
    EXISTS (
        SELECT 1
        FROM public.invoices i
        JOIN public.enrollments e
            ON e.id = i.enrollment_id
        JOIN public.courses c
            ON c.id = e.course_id
        WHERE i.id = payments.invoice_id
          AND c.owner_id = (SELECT auth.uid())
    )

    OR

    -- Organization owner can view payments
    -- from courses within their organization
    EXISTS (
        SELECT 1
        FROM public.invoices i
        JOIN public.enrollments e
            ON e.id = i.enrollment_id
        JOIN public.courses c
            ON c.id = e.course_id
        JOIN public.organization_member om
            ON om.organization_id = c.organization_id
        WHERE i.id = payments.invoice_id
          AND om.admin_id = (SELECT auth.uid())
          AND om.role = 'owner'
    )
);

-- Ensure authenticated users have SELECT permission
GRANT SELECT ON public.payments TO authenticated;
