-- supabase/migrations/042_refactor_equipment_category_link.sql

-- Step 1: Add the new category_id column to the equipment table.
-- It's nullable for now to allow adding it to a table with existing data.
ALTER TABLE public.equipment
ADD COLUMN category_id UUID;

-- Step 2: Add the foreign key constraint.
-- This links the new column to the equipment_categories table.
ALTER TABLE public.equipment
ADD CONSTRAINT fk_equipment_category
FOREIGN KEY (category_id) REFERENCES public.equipment_categories(id);

-- Step 3: Populate the new category_id column based on the old 'type' enum.
-- This query assumes a mapping between the old enum values and the new category codes.
-- NOTE: This is a best-effort update. If category codes don't match this mapping,
-- those equipment items will have a NULL category_id.
UPDATE public.equipment e
SET category_id = (
  SELECT id FROM public.equipment_categories ec
  WHERE ec.code = 
    CASE e.type
      WHEN 'computer' THEN 'COMPUTER'
      WHEN 'laptop' THEN 'LAPTOP'
      WHEN 'monitor' THEN 'MONITOR'
      WHEN 'printer' THEN 'PRINTER'
      WHEN 'ups' THEN 'UPS'
      WHEN 'network_device' THEN 'NETWORK'
      ELSE NULL
    END
)
WHERE e.category_id IS NULL;

-- Step 4: Create an index on the new foreign key for performance.
CREATE INDEX IF NOT EXISTS idx_equipment_category_id ON public.equipment(category_id);
