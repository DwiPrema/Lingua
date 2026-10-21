BEGIN;

DROP POLICY IF EXISTS "Course admins can update enrollments"
ON public.enrollments;

COMMIT;