
DROP FUNCTION IF EXISTS public.complete_organization_setup(TEXT);

CREATE OR REPLACE FUNCTION public.complete_organization_setup(
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
    v_user_role TEXT;
    v_organization public.organizations;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NULLIF(TRIM(p_name), '') IS NULL THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;

    IF NULLIF(TRIM(p_bank_name), '') IS NULL THEN
        RAISE EXCEPTION 'Bank name is required';
    END IF;

    IF NULLIF(TRIM(p_account_number), '') IS NULL THEN
        RAISE EXCEPTION 'Account number is required';
    END IF;

    IF NULLIF(TRIM(p_account_name), '') IS NULL THEN
        RAISE EXCEPTION 'Account name is required';
    END IF;

    SELECT u.role::TEXT
    INTO v_user_role
    FROM public.users AS u
    WHERE u.id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF v_user_role NOT IN ('student', 'instructor') THEN
        RAISE EXCEPTION 'User is not allowed to create an organization';
    END IF;

    SELECT o.*
    INTO v_organization
    FROM public.organizations AS o
    WHERE o.owner_id = v_user_id
    FOR UPDATE;

    IF FOUND THEN

        UPDATE public.organizations
        SET
            name = TRIM(p_name),
            bank_name = TRIM(p_bank_name),
            account_number = TRIM(p_account_number),
            account_name = TRIM(p_account_name),
            qris_url = NULLIF(TRIM(p_qris_url), ''),
            payment_notes = NULLIF(TRIM(p_payment_notes), '')
        WHERE id = v_organization.id
        RETURNING * INTO v_organization;

    ELSE

        INSERT INTO public.organizations (
            owner_id,
            name,
            bank_name,
            account_number,
            account_name,
            qris_url,
            payment_notes
        )
        VALUES (
            v_user_id,
            TRIM(p_name),
            TRIM(p_bank_name),
            TRIM(p_account_number),
            TRIM(p_account_name),
            NULLIF(TRIM(p_qris_url), ''),
            NULLIF(TRIM(p_payment_notes), '')
        )
        RETURNING * INTO v_organization;

    END IF;

    UPDATE public.organization_member
    SET role = 'owner'
    WHERE organization_id = v_organization.id
      AND admin_id = v_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.organization_member (
            organization_id,
            admin_id,
            role
        )
        VALUES (
            v_organization.id,
            v_user_id,
            'owner'
        );
    END IF;

    UPDATE public.users
    SET role = 'instructor'
    WHERE id = v_user_id;

    RETURN v_organization;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_organization_setup(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.complete_organization_setup(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO authenticated;
