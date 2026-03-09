-- PUSH NOTIFICATION SYSTEM SETUP
-- Engineered by Infra-Shadow & Logic Core
-- Standard: TOP 1 IN THE COUNTRY

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the table for push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_name TEXT UNIQUE NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow riders to manage their own subscriptions
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions
FOR ALL
USING (rider_name = (SELECT name FROM public.riders WHERE id = auth.uid()));
