CREATE OR REPLACE FUNCTION public.update_organization_settings(
    p_name TEXT,
    p_bank_name TEXT,
    p_account_number TEXT,
    p_account_name TEXT,
    p_qris_url TEXT DEFAULT NULL,
    p_payment_notes TEXT DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_organization public.organizations;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF NULLIF(TRIM(p_name), '') IS NULL
       OR NULLIF(TRIM(p_bank_name), '') IS NULL
       OR NULLIF(TRIM(p_account_number), '') IS NULL
       OR NULLIF(TRIM(p_account_name), '') IS NULL
    THEN
        RAISE EXCEPTION 'Required organization fields cannot be empty.';
    END IF;

    UPDATE public.organizations
    SET
        name = TRIM(p_name),
        bank_name = TRIM(p_bank_name),
        account_number = TRIM(p_account_number),
        account_name = TRIM(p_account_name),
        qris_url = NULLIF(TRIM(p_qris_url), ''),
        payment_notes = NULLIF(TRIM(p_payment_notes), '')
    WHERE owner_id = v_user_id
    RETURNING * INTO v_organization;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found or permission denied.';
    END IF;

    RETURN v_organization;
END;
$$;

REVOKE ALL ON FUNCTION public.update_organization_settings(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.update_organization_settings(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM anon;

GRANT EXECUTE ON FUNCTION public.update_organization_settings(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;