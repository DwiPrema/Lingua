
CREATE OR REPLACE FUNCTION public.approve_enrollment(
    p_enrollment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_course_id uuid;
    v_program_id uuid;
    v_user_id uuid := auth.uid();

    v_registration_fee numeric(12, 2);
    v_monthly_fee numeric(12, 2);
    v_total_amount numeric(12, 2);
BEGIN
    -- =========================================
    -- 1. Validate authenticated user
    -- =========================================

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;


    -- =========================================
    -- 2. Get enrollment and program fees
    -- Lock enrollment row to prevent concurrent approval.
    -- =========================================

    SELECT
        e.course_id,
        e.program_id,
        p.registration_fee,
        p.monthly_fee
    INTO
        v_course_id,
        v_program_id,
        v_registration_fee,
        v_monthly_fee
    FROM public.enrollments e
    JOIN public.programs p
        ON p.id = e.program_id
       AND p.course_id = e.course_id
    WHERE
        e.id = p_enrollment_id
        AND e.status = 'pending'
    FOR UPDATE OF e;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending enrollment not found';
    END IF;


    -- =========================================
    -- 3. Validate authorization
    -- =========================================

    IF NOT (
        -- Platform administrator
        EXISTS (
            SELECT 1
            FROM public.users u
            WHERE
                u.id = v_user_id
                AND u.role = 'platform_admin'
        )

        OR

        -- Course owner
        EXISTS (
            SELECT 1
            FROM public.courses c
            WHERE
                c.id = v_course_id
                AND c.owner_id = v_user_id
        )

        OR

        -- Organization owner
        EXISTS (
            SELECT 1
            FROM public.courses c
            JOIN public.organization_member om
                ON om.organization_id = c.organization_id
            WHERE
                c.id = v_course_id
                AND om.admin_id = v_user_id
                AND om.role = 'owner'
        )
    ) THEN
        RAISE EXCEPTION
            'Not authorized to review this enrollment';
    END IF;


    -- =========================================
    -- 4. Calculate invoice amount
    -- =========================================

    v_registration_fee := COALESCE(v_registration_fee, 0);
    v_monthly_fee := COALESCE(v_monthly_fee, 0);

    v_total_amount :=
        v_registration_fee + v_monthly_fee;

    IF v_total_amount <= 0 THEN
        RAISE EXCEPTION
            'Cannot generate invoice: total amount must be greater than zero';
    END IF;


    -- =========================================
    -- 5. Update enrollment status
    -- =========================================

    UPDATE public.enrollments
    SET
        status = 'approved',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        approved_at = now(),
        rejection_reason = NULL,
        updated_at = now()
    WHERE
        id = p_enrollment_id
        AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Enrollment approval failed';
    END IF;


    -- =========================================
    -- 6. Generate initial invoice
    -- =========================================

    INSERT INTO public.invoices (
        enrollment_id,
        invoice_type,
        registration_fee,
        monthly_fee,
        total_amount,
        status
    )
    VALUES (
        p_enrollment_id,
        'initial',
        v_registration_fee,
        v_monthly_fee,
        v_total_amount,
        'unpaid'
    );

END;
$$;


-- =========================================
-- 7. Function permissions
-- =========================================

REVOKE ALL ON FUNCTION
    public.approve_enrollment(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
    public.approve_enrollment(uuid)
TO authenticated;
