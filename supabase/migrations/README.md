# Supabase Migrations

## Applying Migrations

### Option 1: Supabase Dashboard (SQL Editor)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of the migration file
4. Execute the SQL

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
```

## Migration Files

- `20251027_create_strokes_table.sql` - Creates the strokes table for efficient real-time stroke synchronization
