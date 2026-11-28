CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        fullname,
        nickname,
        phone,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'fullname',
        NEW.raw_user_meta_data ->> 'nickname',
        NEW.raw_user_meta_data ->> 'phone',
        'student'
    );

    RETURN NEW;
END;
$$;