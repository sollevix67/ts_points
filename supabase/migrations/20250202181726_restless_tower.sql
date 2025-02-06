/*
  # Add street view heading field

  1. Changes
    - Add `streetview_heading` column to `delivery_points` table with a default value of 210
    - Update existing rows to have the default heading value

  2. Notes
    - The heading value represents the camera angle in degrees (0-360)
    - Default value of 210 matches the previous hardcoded value
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'delivery_points' 
    AND column_name = 'streetview_heading'
  ) THEN
    ALTER TABLE delivery_points 
    ADD COLUMN streetview_heading integer DEFAULT 210;
  END IF;
END $$;