-- 🛡️ MASTER NOTIFICATIONS TABLE SYNC
-- Engineered by Titan Prime & Logic Core
-- Standard: TOP 1 IN THE COUNTRY

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receiver_name TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'post', -- 'post', 'story', 'comment', 'reaction', 'follow', 'friend_request', 'message'
    target_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Real-time (Essential for UI Pulse)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 3. Security: RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow riders to read and update only their own notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications
FOR ALL
USING (receiver_name = (SELECT name FROM public.riders WHERE id = auth.uid()));

-- Allow anyone to insert (so they can trigger alerts for others)
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" 
ON public.notifications
FOR INSERT
WITH CHECK (true);
