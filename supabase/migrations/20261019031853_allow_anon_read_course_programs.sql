GRANT SELECT ON TABLE public.programs TO anon;

CREATE POLICY "Allow anon to view course programs"
ON public.programs
FOR SELECT
TO anon
USING (true);