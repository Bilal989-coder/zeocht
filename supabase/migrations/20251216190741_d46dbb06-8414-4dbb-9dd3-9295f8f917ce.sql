-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;

-- Create a more restrictive INSERT policy
-- Transactions should only be created by authenticated guides for themselves
-- or through service role (edge functions)
CREATE POLICY "Guides can create their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = guide_id);