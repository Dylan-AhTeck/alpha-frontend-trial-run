# SQL Commands Used for Authentication Implementation

## Phase 1: Foundation Setup

### 1.2.1 Create beta_emails table

```sql
-- Create beta_emails table for managing beta access control
CREATE TABLE IF NOT EXISTS public.beta_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_beta_emails_email ON public.beta_emails(email);

-- Enable Row Level Security
ALTER TABLE public.beta_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to restrict access (only service role can read/write)
CREATE POLICY "Service role only access" ON public.beta_emails
    USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.beta_emails TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
```

### 1.2.2 Create beta_requests table

```sql
-- Create beta_requests table for collecting emails from non-beta users
CREATE TABLE IF NOT EXISTS public.beta_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_agent TEXT,
    ip_address TEXT
);

-- Create index for email lookups (allowing duplicates for tracking purposes)
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON public.beta_requests(email);
CREATE INDEX IF NOT EXISTS idx_beta_requests_created_at ON public.beta_requests(created_at);

-- Enable Row Level Security
ALTER TABLE public.beta_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to restrict access (only service role can read/write)
CREATE POLICY "Service role only access" ON public.beta_requests
    USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.beta_requests TO service_role;
```

### 1.2.5 Populate initial beta emails with test data

```sql
-- Insert some test beta emails
INSERT INTO public.beta_emails (email) VALUES
    ('test@example.com'),
    ('beta@test.com'),
    ('admin@alpha.com')
ON CONFLICT (email) DO NOTHING;
```

## Phase 2: Backend Authentication Infrastructure

_Note: Phase 2 focuses on backend code implementation (no additional SQL commands required)_

### 2.1 Core Security Infrastructure

- ✅ Created `app/core/security.py` - JWT token verification
- ✅ Created `app/core/dependencies.py` - Authentication dependencies

### 2.2 Supabase Service Layer

- 🔄 In Progress: `app/services/supabase_client.py`
- 🔄 In Progress: `app/services/auth_service.py`

### 2.3 Authentication Models

- ⏳ Pending: `app/models/auth.py`

### 2.4 Authentication API Routes

- ⏳ Pending: `app/api/auth.py`

### 2.5 Protected LangGraph Routes

- ⏳ Pending: Update existing routes

## Database Schema Verification

To verify tables were created correctly:

```sql
-- Check if tables exist and view structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('beta_emails', 'beta_requests')
ORDER BY table_name, ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('beta_emails', 'beta_requests');
```

## Future SQL Commands

This section will be updated as we progress through the implementation phases.
