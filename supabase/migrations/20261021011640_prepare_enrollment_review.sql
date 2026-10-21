BEGIN;

ALTER TABLE public.enrollments
    ADD COLUMN IF NOT EXISTS reviewed_by uuid
        REFERENCES public.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
    ADD COLUMN IF NOT EXISTS approved_at timestamptz,
    ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.enrollments
    DROP CONSTRAINT IF EXISTS enrollments_status_check;

ALTER TABLE public.enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (
        status IN (
            'pending',
            'approved',
            'rejected',
            'cancelled',
            'active'
        )
    );

DROP INDEX IF EXISTS public.unique_active_enrollment;

CREATE UNIQUE INDEX IF NOT EXISTS unique_current_enrollment
    ON public.enrollments (student_id, course_id)
    WHERE status IN ('pending', 'approved', 'active');

COMMIT;
