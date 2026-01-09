-- Update RLS policy to allow explorers to accept bids on their requests
DROP POLICY IF EXISTS "Explorers can update their pending requests" ON booking_requests;

CREATE POLICY "Explorers can update their own requests"
ON booking_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = explorer_id)
WITH CHECK (auth.uid() = explorer_id);