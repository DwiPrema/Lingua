BEGIN;

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
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT e.course_id
    INTO v_course_id
    FROM public.enrollments e
    WHERE e.id = p_enrollment_id
      AND e.status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending enrollment not found';
    END IF;

    IF NOT (
        EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = v_user_id
              AND u.role = 'platform_admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.courses c
            WHERE c.id = v_course_id
              AND c.owner_id = v_user_id
        )
        OR EXISTS (
            SELECT 1
            FROM public.courses c
            JOIN public.organization_member om
              ON om.organization_id = c.organization_id
            WHERE c.id = v_course_id
              AND om.admin_id = v_user_id
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized to review this enrollment';
    END IF;

    UPDATE public.enrollments
    SET status = 'approved',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        approved_at = now(),
        rejection_reason = NULL,
        updated_at = now()
    WHERE id = p_enrollment_id
      AND status = 'pending';
END;
$$;


CREATE OR REPLACE FUNCTION public.reject_enrollment(
    p_enrollment_id uuid,
    p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_course_id uuid;
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
        RAISE EXCEPTION 'Rejection reason is required';
    END IF;

    SELECT e.course_id
    INTO v_course_id
    FROM public.enrollments e
    WHERE e.id = p_enrollment_id
      AND e.status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending enrollment not found';
    END IF;

    IF NOT (
        EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = v_user_id
              AND u.role = 'platform_admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.courses c
            WHERE c.id = v_course_id
              AND c.owner_id = v_user_id
        )
        OR EXISTS (
            SELECT 1
            FROM public.courses c
            JOIN public.organization_member om
              ON om.organization_id = c.organization_id
            WHERE c.id = v_course_id
              AND om.admin_id = v_user_id
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized to review this enrollment';
    END IF;

    UPDATE public.enrollments
    SET status = 'rejected',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        approved_at = NULL,
        rejection_reason = trim(p_reason),
        updated_at = now()
    WHERE id = p_enrollment_id
      AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_enrollment(uuid)
    FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_enrollment(uuid, text)
    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.approve_enrollment(uuid)
    TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_enrollment(uuid, text)
    TO authenticated;

COMMIT;
