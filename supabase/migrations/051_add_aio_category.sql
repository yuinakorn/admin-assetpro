-- Migration: 051_add_aio_category.sql
-- Description: Adds AIO (All-in-One) category to equipment categories
-- Date: 2024-12-19
-- Author: Assistant

-- Add AIO category
INSERT INTO equipment_categories (name, code, description, icon, color, sort_order) VALUES
('คอมพิวเตอร์ All-in-One', 'AIO', 'คอมพิวเตอร์ All-in-One ที่รวมจอภาพและเครื่องคอมพิวเตอร์ไว้ในเครื่องเดียว', 'Monitor', '#6366F1', 3)
ON CONFLICT (code) DO NOTHING;

-- Update sort order for existing categories to make room for AIO
UPDATE equipment_categories SET sort_order = 4 WHERE code = 'MONITOR';
UPDATE equipment_categories SET sort_order = 5 WHERE code = 'PRINTER';
UPDATE equipment_categories SET sort_order = 6 WHERE code = 'UPS';
UPDATE equipment_categories SET sort_order = 7 WHERE code = 'NETWORK'; 