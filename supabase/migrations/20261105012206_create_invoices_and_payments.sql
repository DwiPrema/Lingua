
-- =========================================================
-- 1. Invoice number sequence
-- =========================================================

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq
    START WITH 1
    INCREMENT BY 1;

-- =========================================================
-- 2. INVOICES
-- =========================================================

CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_number text NOT NULL UNIQUE
        DEFAULT (
            'INV-' ||
            to_char(now(), 'YYYYMMDD') ||
            '-' ||
            lpad(
                nextval('public.invoice_number_seq')::text,
                6,
                '0'
            )
        ),

    enrollment_id uuid NOT NULL
        REFERENCES public.enrollments(id)
        ON DELETE RESTRICT,

    invoice_type text NOT NULL DEFAULT 'initial'
        CHECK (invoice_type IN ('initial', 'monthly')),

    registration_fee numeric(12, 2) NOT NULL DEFAULT 0
        CHECK (registration_fee >= 0),

    monthly_fee numeric(12, 2) NOT NULL DEFAULT 0
        CHECK (monthly_fee >= 0),

    total_amount numeric(12, 2) NOT NULL
        CHECK (total_amount > 0),

    status text NOT NULL DEFAULT 'unpaid'
        CHECK (
            status IN (
                'unpaid',
                'pending_verification',
                'paid',
                'cancelled'
            )
        ),

    billing_period_start date,
    billing_period_end date,

    due_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT invoices_amount_consistency
        CHECK (
            total_amount = registration_fee + monthly_fee
        ),

    CONSTRAINT invoices_billing_period_consistency
        CHECK (
            (
                invoice_type = 'initial'
                AND billing_period_start IS NULL
                AND billing_period_end IS NULL
            )
            OR
            (
                invoice_type = 'monthly'
                AND billing_period_start IS NOT NULL
                AND billing_period_end IS NOT NULL
                AND billing_period_end >= billing_period_start
                AND registration_fee = 0
                AND monthly_fee > 0
            )
        )
);

-- Maksimal satu invoice awal per enrollment.
CREATE UNIQUE INDEX invoices_one_initial_per_enrollment
    ON public.invoices (enrollment_id)
    WHERE invoice_type = 'initial';

-- Mencegah invoice bulanan ganda untuk periode yang sama.
CREATE UNIQUE INDEX invoices_one_monthly_per_period
    ON public.invoices (
        enrollment_id,
        billing_period_start,
        billing_period_end
    )
    WHERE invoice_type = 'monthly';

CREATE INDEX invoices_status_created_at_idx
    ON public.invoices (status, created_at DESC);

CREATE INDEX invoices_enrollment_id_idx
    ON public.invoices (enrollment_id);

-- =========================================================
-- 3. PAYMENTS
-- =========================================================

CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_id uuid NOT NULL
        REFERENCES public.invoices(id)
        ON DELETE RESTRICT,

    payment_method text NOT NULL
        CHECK (
            payment_method IN (
                'bank_transfer',
                'qris'
            )
        ),

    amount numeric(12, 2) NOT NULL
        CHECK (amount > 0),

    proof_path text NOT NULL
        CHECK (length(trim(proof_path)) > 0),

    status text NOT NULL DEFAULT 'pending_verification'
        CHECK (
            status IN (
                'pending_verification',
                'verified',
                'rejected'
            )
        ),

    submitted_at timestamptz NOT NULL DEFAULT now(),

    reviewed_by uuid
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    reviewed_at timestamptz,
    rejection_reason text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT payments_review_consistency
        CHECK (
            (
                status = 'pending_verification'
                AND reviewed_at IS NULL
                AND reviewed_by IS NULL
                AND rejection_reason IS NULL
            )
            OR
            (
                status = 'verified'
                AND reviewed_at IS NOT NULL
                AND reviewed_by IS NOT NULL
                AND rejection_reason IS NULL
            )
            OR
            (
                status = 'rejected'
                AND reviewed_at IS NOT NULL
                AND reviewed_by IS NOT NULL
                AND rejection_reason IS NOT NULL
                AND length(trim(rejection_reason)) > 0
            )
        )
);

-- Satu invoice hanya boleh memiliki satu pengajuan
-- yang sedang menunggu verifikasi.
CREATE UNIQUE INDEX payments_one_pending_per_invoice
    ON public.payments (invoice_id)
    WHERE status = 'pending_verification';

CREATE INDEX payments_invoice_created_at_idx
    ON public.payments (invoice_id, created_at DESC);

CREATE INDEX payments_status_created_at_idx
    ON public.payments (status, created_at DESC);

-- =========================================================
-- 4. ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
