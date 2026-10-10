SET local check_function_bodies = off;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

CREATE TABLE "public"."courses" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "name"            text                     NOT NULL,
  "description"     text,
  "address"         text,
  "owner_id"        uuid                     NOT NULL,
  "organization_id" uuid,
  CONSTRAINT "courses_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."courses"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."enrollments" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "enrolled_at"     timestamp with time zone,
  "course_id"       uuid                     NOT NULL,
  "program_id"      uuid                     NOT NULL,
  "student_id"      uuid                     NOT NULL,
  "status"          text                     NOT NULL DEFAULT 'pending'::text,
  "fullname"        text                     NOT NULL,
  "address"         text,
  "education_level" text,
  "phone"           text                     NOT NULL,
  "school_name"     text                     NOT NULL,
  CONSTRAINT "enrollments_pkey" PRIMARY KEY (id),
  CONSTRAINT "enrollments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."enrollments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organization_member" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "admin_id"        uuid                     NOT NULL,
  "organization_id" uuid                     NOT NULL,
  "role"            text                     NOT NULL DEFAULT 'admin'::text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "course_admins_admin_id_course_id_key" UNIQUE (admin_id, organization_id),
  CONSTRAINT "course_admins_pkey" PRIMARY KEY (id),
  CONSTRAINT "organization_member_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'instructor'::text])))
);

ALTER TABLE "public"."organization_member"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organizations" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"           text                     NOT NULL,
  "owner_id"       uuid                     NOT NULL,
  "bank_name"      text,
  "account_number" text,
  "account_name"   text,
  "qris_url"       text,
  "payment_notes"  text,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organizations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."organizations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."programs" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "course_id"        uuid                     NOT NULL,
  "name"             text                     NOT NULL,
  "description"      text,
  "monthly_fee"      numeric(12,2)            NOT NULL DEFAULT 0,
  "registration_fee" numeric(12,2)            NOT NULL DEFAULT 0,
  CONSTRAINT "programs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."programs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"                  uuid                     NOT NULL,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "email"               text                     NOT NULL,
  "fullname"            text                     NOT NULL,
  "nickname"            text,
  "phone"               text,
  "role"                text                     NOT NULL DEFAULT 'student'::text,
  "subscription_status" text,
  "student_limit"       integer,
  CONSTRAINT "users_email_key" UNIQUE (email),
  CONSTRAINT "users_pkey" PRIMARY KEY (id),
  CONSTRAINT "users_role_check" CHECK ((role = ANY (ARRAY['student'::text, 'instructor'::text, 'platform_admin'::text])))
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$begin
  insert into public.users (id, email, role, fullname, nickname, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'fullname',
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;$function$;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon", "authenticated", "service_role";

CREATE OR REPLACE FUNCTION public.is_course_admin (
  target_course_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.courses c
      where c.id = target_course_id
        and c.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.course_admins ca
      where ca.course_id = target_course_id
        and ca.admin_id = auth.uid()
    );
$function$;

REVOKE ALL ON FUNCTION "public"."is_course_admin"(uuid) FROM "anon", "authenticated", "service_role";

CREATE OR REPLACE FUNCTION public.is_instructor()
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
      AND role = 'instructor'
  );
END;
$function$;

REVOKE ALL ON FUNCTION "public"."is_instructor"() FROM "anon", "authenticated", "service_role";

CREATE OR REPLACE FUNCTION public.is_organization_owner (
  p_organization_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organizations
        WHERE id = p_organization_id
          AND owner_id = auth.uid()
    );
$function$;

REVOKE ALL ON FUNCTION "public"."is_organization_owner"(uuid) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.is_platform_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'platform_admin'
  );
$function$;

REVOKE ALL ON FUNCTION "public"."is_platform_admin"() FROM "anon", "authenticated", "service_role";

CREATE OR REPLACE FUNCTION public.organization_exists (
  p_organization_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organizations
        WHERE id = p_organization_id
    );
$function$;

REVOKE ALL ON FUNCTION "public"."organization_exists"(uuid) FROM PUBLIC, "anon", "service_role";

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."organizations"
  ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."courses"
  ADD CONSTRAINT "courses_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_member"
  ADD CONSTRAINT "organization_member_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."programs"
  ADD CONSTRAINT "programs_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE RESTRICT;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."courses"
  ADD CONSTRAINT "courses_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE "public"."enrollments"
  ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_member"
  ADD CONSTRAINT "course_admins_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX idx_course_admins_admin_id ON public.organization_member USING btree (admin_id);

CREATE INDEX idx_course_admins_course_id ON public.organization_member USING btree (organization_id);

CREATE INDEX idx_courses_owner_id ON public.courses USING btree (owner_id);

CREATE INDEX idx_enrollments_course_id ON public.enrollments USING btree (course_id);

CREATE INDEX idx_enrollments_program_id ON public.enrollments USING btree (program_id);

CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);

CREATE INDEX idx_enrollments_student_id ON public.enrollments USING btree (student_id);

CREATE INDEX idx_programs_course_id ON public.programs USING btree (course_id);

CREATE UNIQUE INDEX unique_active_enrollment ON public.enrollments USING btree (student_id, course_id)
  WHERE (status = ANY (ARRAY['pending'::text, 'approved'::text]));

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Anon can see the data" ON "public"."courses"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "courses_delete_own" ON "public"."courses"
  FOR DELETE
  TO "authenticated"
  USING ((organization_id IN ( SELECT organizations.id
   FROM public.organizations
  WHERE (organizations.owner_id = auth.uid()))));

CREATE POLICY "courses_insert_own" ON "public"."courses"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((organization_id IN ( SELECT organizations.id
   FROM public.organizations
  WHERE (organizations.owner_id = auth.uid()))));

CREATE POLICY "courses_update_own" ON "public"."courses"
  FOR UPDATE
  TO "authenticated"
  USING ((organization_id IN ( SELECT organizations.id
   FROM public.organizations
  WHERE (organizations.owner_id = auth.uid()))))
  WITH CHECK ((organization_id IN ( SELECT organizations.id
   FROM public.organizations
  WHERE (organizations.owner_id = auth.uid()))));

CREATE POLICY "Course admins can update enrollments" ON "public"."enrollments"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_course_admin(course_id))
  WITH CHECK (public.is_course_admin(course_id));

CREATE POLICY "Course admins can view enrollments" ON "public"."enrollments"
  FOR SELECT
  TO "authenticated"
  USING (public.is_course_admin(course_id));

CREATE POLICY "Student can view own enrollments" ON "public"."enrollments"
  FOR SELECT
  TO "authenticated"
  USING ((student_id = auth.uid()));

CREATE POLICY "Students can create own enrollments" ON "public"."enrollments"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((student_id = auth.uid()) AND (status = 'pending'::text)));

CREATE POLICY "Students can delete their own enrollments when status is pendin" ON "public"."enrollments"
  FOR DELETE
  TO "authenticated"
  USING (((student_id = auth.uid()) AND (status = 'pending'::text)));

CREATE POLICY "Organization owners can delete members" ON "public"."organization_member"
  FOR DELETE
  TO "authenticated"
  USING (public.is_organization_owner(organization_id));

CREATE POLICY "Organization owners can update members" ON "public"."organization_member"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_organization_owner(organization_id))
  WITH CHECK (public.is_organization_owner(organization_id));

CREATE POLICY "Users can join organization" ON "public"."organization_member"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((admin_id = auth.uid()) AND public.organization_exists(organization_id)));

CREATE POLICY "Users can view organization members" ON "public"."organization_member"
  FOR SELECT
  TO "authenticated"
  USING (((admin_id = auth.uid()) OR public.is_organization_owner(organization_id)));

CREATE POLICY "org_delete_own" ON "public"."organizations"
  FOR DELETE
  TO "authenticated"
  USING ((owner_id = auth.uid()));

CREATE POLICY "org_insert_own" ON "public"."organizations"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((owner_id = auth.uid()));

CREATE POLICY "org_select_own" ON "public"."organizations"
  FOR SELECT
  TO "authenticated"
  USING ((owner_id = auth.uid()));

CREATE POLICY "org_update_own" ON "public"."organizations"
  FOR UPDATE
  TO "authenticated"
  USING ((owner_id = auth.uid()))
  WITH CHECK ((owner_id = auth.uid()));

CREATE POLICY "Authenticated users can view programs" ON "public"."programs"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Course admins can create programs" ON "public"."programs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_course_admin(course_id));

CREATE POLICY "Course admins can delete programs" ON "public"."programs"
  FOR DELETE
  TO "authenticated"
  USING (public.is_course_admin(course_id));

CREATE POLICY "Course admins can update programs" ON "public"."programs"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_course_admin(course_id))
  WITH CHECK (public.is_course_admin(course_id));

CREATE POLICY "Instructor can search other instructor" ON "public"."users"
  FOR SELECT
  TO "authenticated"
  USING ((public.is_instructor() AND (ROLE = 'instructor'::text)));

CREATE POLICY "Users can update their own profile" ON "public"."users"
  FOR UPDATE
  TO "authenticated"
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "Users can view own profile" ON "public"."users"
  FOR SELECT
  TO "authenticated"
  USING ((id = auth.uid()));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_course_admin"(uuid) TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."is_course_admin"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_course_admin"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_instructor"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."is_instructor"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_instructor"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_organization_owner"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_organization_owner"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_organization_owner"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_platform_admin"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."is_platform_admin"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_platform_admin"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."organization_exists"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."organization_exists"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."organization_exists"(uuid) TO "postgres";

REVOKE ALL ON TABLE "public"."courses" FROM "anon";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE ON TABLE "public"."courses" TO "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."courses" TO "authenticated";

REVOKE ALL ON TABLE "public"."courses" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."courses" TO "postgres";

REVOKE ALL ON TABLE "public"."courses" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."courses" TO "service_role";

REVOKE ALL ON TABLE "public"."enrollments" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."enrollments" TO "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."enrollments" TO "authenticated";

REVOKE ALL ON TABLE "public"."enrollments" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."enrollments" TO "postgres";

REVOKE ALL ON TABLE "public"."enrollments" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."enrollments" TO "service_role";

REVOKE ALL ON TABLE "public"."organization_member" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."organization_member" TO "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organization_member" TO "authenticated";

REVOKE ALL ON TABLE "public"."organization_member" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organization_member" TO "postgres";

REVOKE ALL ON TABLE "public"."organization_member" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."organization_member" TO "service_role";

REVOKE ALL ON TABLE "public"."organizations" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."organizations" TO "anon";

REVOKE ALL ON TABLE "public"."organizations" FROM "authenticated";

GRANT INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "authenticated";

REVOKE ALL ON TABLE "public"."organizations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "postgres";

REVOKE ALL ON TABLE "public"."organizations" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."organizations" TO "service_role";

REVOKE ALL ON TABLE "public"."programs" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."programs" TO "anon";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."programs" TO "authenticated";

REVOKE ALL ON TABLE "public"."programs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."programs" TO "postgres";

REVOKE ALL ON TABLE "public"."programs" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."programs" TO "service_role";

REVOKE ALL ON TABLE "public"."users" FROM "anon";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."users" TO "anon";

REVOKE ALL ON TABLE "public"."users" FROM "authenticated";

GRANT MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

REVOKE ALL ON TABLE "public"."users" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "service_role";

