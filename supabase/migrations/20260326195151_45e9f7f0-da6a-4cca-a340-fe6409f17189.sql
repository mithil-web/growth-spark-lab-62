CREATE TABLE public.workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  current_step INTEGER DEFAULT 0,
  onboarding_data JSONB,
  profile_data JSONB,
  icp_data JSONB,
  value_prop_data JSONB,
  website_data JSONB,
  gtm_data JSONB,
  outreach_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.workshop_sessions DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_workshop_session_id ON public.workshop_sessions(session_id);