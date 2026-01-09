-- Drop the existing status check constraint and add pending_payment as valid status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending_payment', 'confirmed', 'pending_confirmation', 'cancelled', 'completed'));