
CREATE OR REPLACE FUNCTION public.join_organization(
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_organization public.organizations%ROWTYPE;
    v_existing_member public.organization_member%ROWTYPE;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT role::TEXT
    INTO v_user_role
    FROM public.users
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    IF v_user_role NOT IN ('student', 'instructor') THEN
        RAISE EXCEPTION 'Your account cannot join an organization.';
    END IF;

    SELECT *
    INTO v_organization
    FROM public.organizations
    WHERE id = p_organization_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found.';
    END IF;

    IF v_organization.owner_id = v_user_id THEN
        RAISE EXCEPTION 'You are already the owner of this organization.';
    END IF;

    SELECT *
    INTO v_existing_member
    FROM public.organization_member
    WHERE organization_id = p_organization_id
      AND admin_id = v_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.organization_member (
            organization_id,
            admin_id,
            role
        )
        VALUES (
            p_organization_id,
            v_user_id,
            'instructor'
        );
    END IF;

    UPDATE public.users
    SET role = 'instructor'
    WHERE id = v_user_id;

    RETURN to_jsonb(v_organization);
END;
$$;

REVOKE ALL ON FUNCTION public.join_organization(UUID)
FROM PUBLIC;

REVOKE ALL ON FUNCTION public.join_organization(UUID)
FROM anon;

GRANT EXECUTE ON FUNCTION public.join_organization(UUID)
TO authenticated;