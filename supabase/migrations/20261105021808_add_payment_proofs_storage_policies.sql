
-- =====================================================
-- PAYMENT PROOFS: STORAGE INSERT POLICY
-- Students can upload files into their own folder
-- =====================================================

CREATE POLICY "Students can upload their own payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);


-- =====================================================
-- PAYMENT PROOFS: STORAGE SELECT POLICY
-- Users can only read files belonging to payments
-- they are authorized to view through payments RLS
-- =====================================================

CREATE POLICY "Authorized users can view payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
        SELECT 1
        FROM public.payments p
        WHERE p.proof_path = storage.objects.name
    )
);
