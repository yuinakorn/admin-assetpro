# Database Migration Guide
# คู่มือการจัดการฐานข้อมูล

## Overview

This guide explains how to set up and manage database migrations for the Computer Equipment Asset Management System using Supabase.

## Prerequisites

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Install Supabase CLI as Dev Dependency

```bash
npm install --save-dev supabase
```

### 3. Verify Installation

```bash
supabase --version
```

## Initial Setup

### 1. Initialize Supabase Project

```bash
# Initialize Supabase in your project
supabase init

# This creates:
# - supabase/config.toml
# - supabase/migrations/
# - supabase/seed.sql
# - supabase/functions/
```

### 2. Link to Supabase Project

```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref your-project-ref

# Example:
supabase link --project-ref abcdefghijklmnop
```

### 3. Configure Environment Variables

Create `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token
```

## Migration Commands

### Available Scripts

The following npm scripts are available in `package.json`:

```bash
# Generate TypeScript types from database
npm run db:generate

# Push migrations to remote database
npm run db:migrate

# Reset database (WARNING: This deletes all data)
npm run db:reset

# Show differences between local and remote
npm run db:diff

# Create new migration file
npm run db:new-migration

# Check migration status
npm run db:status
```

### Manual Supabase Commands

```bash
# Initialize new migration
supabase migration new migration_name

# Push migrations to remote
supabase db push

# Pull remote schema changes
supabase db pull

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## Migration Workflow

### 1. Development Workflow

```bash
# 1. Create new migration
npm run db:new-migration add_new_feature

# 2. Edit the generated migration file in supabase/migrations/
# 3. Test locally
supabase start
supabase db reset

# 4. Push to remote
npm run db:migrate

# 5. Generate updated types
npm run db:generate
```

### 2. Production Deployment

```bash
# 1. Check migration status
npm run db:status

# 2. Push migrations to production
npm run db:migrate

# 3. Verify deployment
supabase db diff
```

## Migration Files Structure

```
supabase/
├── config.toml              # Supabase configuration
├── migrations/              # Migration files
│   ├── 001_initial_schema.sql
│   ├── 002_seed_data.sql
│   └── 003_add_additional_indexes.sql
├── seed.sql                 # Seed data (optional)
└── functions/               # Edge functions (optional)
```

## Migration Best Practices

### 1. Naming Conventions

- Use descriptive names: `001_initial_schema.sql`
- Include version numbers: `002_add_user_roles.sql`
- Use snake_case for file names

### 2. Migration Content

```sql
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Computer Equipment Asset Management System
-- Date: 2024-01-01
-- Author: Your Name

-- Always include a description
-- Use comments to explain complex operations
-- Include rollback instructions if needed
```

### 3. Rollback Strategy

For complex migrations, include rollback instructions:

```sql
-- Migration: 004_add_new_table.sql
-- Rollback: DROP TABLE IF EXISTS new_table CASCADE;

CREATE TABLE new_table (
  -- table definition
);

-- Rollback instructions in comments
-- To rollback: DROP TABLE IF EXISTS new_table CASCADE;
```

### 4. Data Migration

For data migrations, use transactions:

```sql
BEGIN;

-- Perform data migration
UPDATE equipment SET status = 'normal' WHERE status IS NULL;

-- Verify migration
SELECT COUNT(*) FROM equipment WHERE status IS NULL;

COMMIT;
```

## Environment Management

### 1. Local Development

```bash
# Start local Supabase
supabase start

# This provides:
# - Local PostgreSQL database
# - Local API endpoints
# - Local dashboard
```

### 2. Staging Environment

```bash
# Link to staging project
supabase link --project-ref staging-project-ref

# Push migrations to staging
supabase db push
```

### 3. Production Environment

```bash
# Link to production project
supabase link --project-ref production-project-ref

# Push migrations to production
supabase db push
```

## Type Generation

### 1. Generate Types

```bash
# Generate TypeScript types
npm run db:generate

# This creates src/types/supabase.ts with:
# - Database types
# - Table interfaces
# - Function types
```

### 2. Use Generated Types

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Now you have full type safety
const { data: equipment } = await supabase
  .from('equipment')
  .select('*')
```

## Troubleshooting

### 1. Common Issues

**Migration Fails:**
```bash
# Check migration status
supabase db diff

# Reset and retry
supabase db reset
supabase db push
```

**Type Generation Fails:**
```bash
# Pull latest schema
supabase db pull

# Regenerate types
npm run db:generate
```

**Connection Issues:**
```bash
# Check project link
supabase status

# Re-link project
supabase link --project-ref your-project-ref
```

### 2. Debug Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Check database connection
supabase db ping
```

## Security Considerations

### 1. Row Level Security (RLS)

All tables have RLS enabled. Customize policies in migrations:

```sql
-- Example RLS policy
CREATE POLICY "Users can view their department equipment" ON equipment
FOR SELECT USING (
  department_id IN (
    SELECT department_id FROM users WHERE id = auth.uid()
  )
);
```

### 2. Environment Variables

Never commit sensitive data:

```bash
# .env.local (not committed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# .env.example (committed)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Monitoring and Maintenance

### 1. Migration History

```bash
# View migration history
supabase migration list

# Check applied migrations
supabase db diff
```

### 2. Performance Monitoring

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 3. Backup Strategy

```bash
# Create backup
supabase db dump > backup.sql

# Restore backup
supabase db reset
psql -d postgres -f backup.sql
```

## Advanced Features

### 1. Edge Functions

```bash
# Create edge function
supabase functions new my-function

# Deploy function
supabase functions deploy my-function
```

### 2. Database Hooks

```sql
-- Example: Audit trail trigger
CREATE OR REPLACE FUNCTION audit_equipment_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO equipment_activities (equipment_id, activity_type, description, user_id)
  VALUES (
    NEW.id,
    'update',
    'Equipment updated',
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Real-time Subscriptions

```typescript
// Subscribe to equipment changes
const subscription = supabase
  .channel('equipment_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'equipment' },
    (payload) => {
      console.log('Equipment changed:', payload)
    }
  )
  .subscribe()
```

## Conclusion

This migration system provides a robust foundation for managing database changes in your Computer Equipment Asset Management System. Follow these guidelines to ensure smooth deployments and maintain data integrity across all environments.

For more information, refer to the [Supabase Documentation](https://supabase.com/docs). 