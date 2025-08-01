-- supabase/migrations/044_update_category_stats_function.sql
-- Description: Updates the get_categories_with_stats function to include all categories, regardless of their is_active status.

CREATE OR REPLACE FUNCTION get_categories_with_stats()
RETURNS TABLE (
  id uuid,
  name character varying,
  code character varying,
  description text,
  icon character varying,
  color character varying,
  is_active boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz,
  equipment_count bigint
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.id,
    ec.name,
    ec.code,
    ec.description,
    ec.icon,
    ec.color,
    ec.is_active,
    ec.sort_order,
    ec.created_at,
    ec.updated_at,
    COUNT(e.id) as equipment_count
  FROM
    public.equipment_categories ec
  LEFT JOIN
    public.equipment e ON ec.id = e.category_id
  GROUP BY
    ec.id
  ORDER BY
    ec.sort_order,
    ec.name;
END;
$$ LANGUAGE plpgsql;
