
-- =====================================================
-- Get organization payment account by invoice ID
-- Only the student who owns the invoice can access it.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_payment_account_by_invoice_id(
    p_invoice_id UUID
)
RETURNS TABLE (
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    qris_url TEXT,
    payment_notes TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        o.bank_name,
        o.account_number,
        o.account_name,
        o.qris_url,
        o.payment_notes
    FROM public.invoices AS i
    INNER JOIN public.enrollments AS e
        ON e.id = i.enrollment_id
    INNER JOIN public.courses AS c
        ON c.id = e.course_id
    INNER JOIN public.organizations AS o
        ON o.id = c.organization_id
    WHERE
        i.id = p_invoice_id
        AND e.student_id = auth.uid();
$$;

-- Only authenticated users can execute this function.
REVOKE ALL ON FUNCTION
    public.get_payment_account_by_invoice_id(UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.get_payment_account_by_invoice_id(UUID)
TO authenticated;

COMMENT ON FUNCTION
    public.get_payment_account_by_invoice_id(UUID)
IS 'Returns organization payment account details only to the student who owns the invoice.';
