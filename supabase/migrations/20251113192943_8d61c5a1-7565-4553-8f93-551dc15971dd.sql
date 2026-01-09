-- Drop the existing check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new check constraint with pending_confirmation included
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('confirmed', 'pending_confirmation', 'cancelled', 'completed'));