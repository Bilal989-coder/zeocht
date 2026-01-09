-- Make service_id nullable in bookings table for custom requests
ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL;