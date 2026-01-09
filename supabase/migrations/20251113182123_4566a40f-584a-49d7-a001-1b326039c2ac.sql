-- Make service_id and guide_id nullable for custom requests
ALTER TABLE booking_requests 
  ALTER COLUMN service_id DROP NOT NULL,
  ALTER COLUMN guide_id DROP NOT NULL;

-- Add new fields for custom requests
ALTER TABLE booking_requests
  ADD COLUMN request_type text DEFAULT 'service_request' CHECK (request_type IN ('service_request', 'custom_request')),
  ADD COLUMN title text,
  ADD COLUMN location text,
  ADD COLUMN coordinates_lat numeric,
  ADD COLUMN coordinates_lng numeric,
  ADD COLUMN duration_minutes integer,
  ADD COLUMN category text,
  ADD COLUMN is_draft boolean DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX idx_booking_requests_type ON booking_requests(request_type);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_is_draft ON booking_requests(is_draft);

-- Update RLS policies to allow explorers to create custom requests without guide_id
DROP POLICY IF EXISTS "Explorers can create requests" ON booking_requests;

CREATE POLICY "Explorers can create requests"
ON booking_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = explorer_id AND 
  (
    (request_type = 'service_request' AND service_id IS NOT NULL AND guide_id IS NOT NULL) OR
    (request_type = 'custom_request' AND title IS NOT NULL AND location IS NOT NULL)
  )
);

-- Policy for guides to view custom requests
CREATE POLICY "Guides can view custom requests"
ON booking_requests
FOR SELECT
TO authenticated
USING (
  request_type = 'custom_request' AND 
  is_draft = false AND
  status = 'pending'
);