
-- =====================================================
-- 1. SUBMIT PAYMENT
-- Student submits payment proof for an invoice
-- =====================================================

CREATE OR REPLACE FUNCTION public.submit_payment(
    p_payment_id uuid,
    p_invoice_id uuid,
    p_payment_method text,
    p_amount numeric,
    p_proof_path text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_student_id uuid;
    v_invoice_status text;
    v_total_amount numeric;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF p_payment_id IS NULL OR p_invoice_id IS NULL THEN
        RAISE EXCEPTION 'Payment ID and invoice ID are required.';
    END IF;

    IF p_payment_method IS NULL
   OR p_payment_method NOT IN ('bank_transfer', 'qris') THEN
        RAISE EXCEPTION 'Invalid payment method.';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    IF p_proof_path IS NULL OR p_proof_path = '' THEN
        RAISE EXCEPTION 'Payment proof is required.';
    END IF;

    -- Lock invoice and verify enrollment ownership.
    SELECT
        e.student_id,
        i.status,
        i.total_amount
    INTO
        v_student_id,
        v_invoice_status,
        v_total_amount
    FROM public.invoices i
    JOIN public.enrollments e
        ON e.id = i.enrollment_id
    WHERE i.id = p_invoice_id
    FOR UPDATE OF i;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found.';
    END IF;

    IF v_student_id <> v_user_id THEN
        RAISE EXCEPTION 'You are not authorized to pay this invoice.';
    END IF;

    IF v_invoice_status <> 'unpaid' THEN
        RAISE EXCEPTION 'Invoice is not available for payment.';
    END IF;

    IF p_amount <> v_total_amount THEN
        RAISE EXCEPTION 'Payment amount does not match invoice amount.';
    END IF;

    -- Ensure the proof belongs to this user and payment ID.
    IF p_proof_path NOT LIKE
        v_user_id::text || '/' || p_payment_id::text || '/%'
    THEN
        RAISE EXCEPTION 'Invalid payment proof path.';
    END IF;

    -- Ensure the uploaded file actually exists.
    IF NOT EXISTS (
        SELECT 1
        FROM storage.objects so
        WHERE so.bucket_id = 'payment-proofs'
          AND so.name = p_proof_path
    ) THEN
        RAISE EXCEPTION 'Payment proof file not found.';
    END IF;

    -- Create payment record.
    INSERT INTO public.payments (
        id,
        invoice_id,
        payment_method,
        amount,
        proof_path,
        status
    )
    VALUES (
        p_payment_id,
        p_invoice_id,
        p_payment_method,
        p_amount,
        p_proof_path,
        'pending_verification'
    );

    -- Update invoice status.
    UPDATE public.invoices
    SET
        status = 'pending_verification',
        updated_at = now()
    WHERE id = p_invoice_id;

    RETURN p_payment_id;
END;
$$;


-- =====================================================
-- 2. VERIFY PAYMENT
-- Authorized course/organization owner or platform admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.verify_payment(
    p_payment_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_invoice_id uuid;
    v_payment_status text;
    v_invoice_type text;
    v_enrollment_id uuid;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Lock payment and invoice.
    SELECT
        p.invoice_id,
        p.status,
        i.invoice_type,
        i.enrollment_id
    INTO
        v_invoice_id,
        v_payment_status,
        v_invoice_type,
        v_enrollment_id
    FROM public.payments p
    JOIN public.invoices i
        ON i.id = p.invoice_id
    WHERE p.id = p_payment_id
    FOR UPDATE OF p, i;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found.';
    END IF;

    -- Verify reviewer authorization.
    IF NOT (
        EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = v_user_id
              AND u.role = 'platform_admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.courses c
                ON c.id = e.course_id
            WHERE e.id = v_enrollment_id
              AND c.owner_id = v_user_id
        )
        OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.courses c
                ON c.id = e.course_id
            JOIN public.organization_member om
                ON om.organization_id = c.organization_id
            WHERE e.id = v_enrollment_id
              AND om.admin_id = v_user_id
              AND om.role = 'owner'
        )
    ) THEN
        RAISE EXCEPTION 'You are not authorized to verify this payment.';
    END IF;

    IF v_payment_status <> 'pending_verification' THEN
        RAISE EXCEPTION 'Payment is not awaiting verification.';
    END IF;

    UPDATE public.payments
    SET
        status = 'verified',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        rejection_reason = NULL,
        updated_at = now()
    WHERE id = p_payment_id;

    UPDATE public.invoices
    SET
        status = 'paid',
        updated_at = now()
    WHERE id = v_invoice_id
      AND status = 'pending_verification';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice is not awaiting payment verification.';
    END IF;

    -- Activate enrollment only for the initial invoice.
    IF v_invoice_type = 'initial' THEN
        UPDATE public.enrollments
        SET
            status = 'active',
            enrolled_at = COALESCE(enrolled_at, now()),
            updated_at = now()
        WHERE id = v_enrollment_id;
    END IF;

    RETURN p_payment_id;
END;
$$;


-- =====================================================
-- 3. REJECT PAYMENT
-- Authorized course/organization owner or platform admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.reject_payment(
    p_payment_id uuid,
    p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_invoice_id uuid;
    v_payment_status text;
    v_enrollment_id uuid;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
        RAISE EXCEPTION 'Rejection reason is required.';
    END IF;

    -- Lock payment and invoice.
    SELECT
        p.invoice_id,
        p.status,
        i.enrollment_id
    INTO
        v_invoice_id,
        v_payment_status,
        v_enrollment_id
    FROM public.payments p
    JOIN public.invoices i
        ON i.id = p.invoice_id
    WHERE p.id = p_payment_id
    FOR UPDATE OF p, i;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found.';
    END IF;

    -- Verify reviewer authorization.
    IF NOT (
        EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = v_user_id
              AND u.role = 'platform_admin'
        )
        OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.courses c
                ON c.id = e.course_id
            WHERE e.id = v_enrollment_id
              AND c.owner_id = v_user_id
        )
        OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.courses c
                ON c.id = e.course_id
            JOIN public.organization_member om
                ON om.organization_id = c.organization_id
            WHERE e.id = v_enrollment_id
              AND om.admin_id = v_user_id
              AND om.role = 'owner'
        )
    ) THEN
        RAISE EXCEPTION 'You are not authorized to reject this payment.';
    END IF;

    IF v_payment_status <> 'pending_verification' THEN
        RAISE EXCEPTION 'Payment is not awaiting verification.';
    END IF;

    UPDATE public.payments
    SET
        status = 'rejected',
        reviewed_by = v_user_id,
        reviewed_at = now(),
        rejection_reason = trim(p_reason),
        updated_at = now()
    WHERE id = p_payment_id;

    UPDATE public.invoices
    SET
        status = 'unpaid',
        updated_at = now()
    WHERE id = v_invoice_id
      AND status = 'pending_verification';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice is not awaiting payment verification.';
    END IF;

    -- Enrollment remains approved.
    -- Student can submit a new payment proof.

    RETURN p_payment_id;
END;
$$;


-- =====================================================
-- 4. FUNCTION PERMISSIONS
-- =====================================================

REVOKE ALL ON FUNCTION public.submit_payment(
    uuid, uuid, text, numeric, text
) FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.verify_payment(uuid)
FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.reject_payment(uuid, text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.submit_payment(
    uuid, uuid, text, numeric, text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.verify_payment(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.reject_payment(uuid, text)
TO authenticated;
