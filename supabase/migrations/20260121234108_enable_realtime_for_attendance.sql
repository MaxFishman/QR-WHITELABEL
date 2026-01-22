/*
  # Enable Real-time for Attendance System

  1. Changes
    - Enable replica identity for attendance_records table
    - Add attendance_records to realtime publication
    - This allows instant updates when students check in

  2. Purpose
    - Enables Supabase real-time subscriptions for attendance tracking
    - Teachers will see student check-ins appear immediately without refreshing
*/

-- Enable replica identity for real-time
ALTER TABLE attendance_records REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
