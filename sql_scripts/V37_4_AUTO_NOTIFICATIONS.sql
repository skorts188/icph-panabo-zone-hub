-- 🛡️ ICPH MASTER AUTOMATION SYSTEM (V37.2)
-- Engineered by Titan Prime & Logic Core
-- Standard: TOP 1 IN THE COUNTRY
-- This script updates the database to V37.2, adding Push Notifications and Automated Triggers.

-- ==========================================
-- 1. 🔔 PUSH NOTIFICATIONS TABLE SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_name TEXT UNIQUE NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions
FOR ALL
USING (rider_name = (SELECT name FROM public.riders WHERE id = auth.uid()));

-- ==========================================
-- 2. 🤖 CHAT ROBOT (Private & Group Messages)
-- ==========================================
CREATE OR REPLACE FUNCTION notify_on_new_chat()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.group_id IS NOT NULL THEN
        -- Group Chat Notification (Notify all members except sender)
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        SELECT rider_name, NEW.sender_name, 'Group Message: ' || substring(NEW.message from 1 for 30), 'group_message', NEW.group_id
        FROM public.group_members
        WHERE group_id = NEW.group_id AND rider_name != NEW.sender_name;
    ELSE
        -- Private Chat Notification
        IF NEW.sender_name != NEW.receiver_name THEN
            INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
            VALUES (NEW.receiver_name, NEW.sender_name, substring(NEW.message from 1 for 50), 'message', NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_chat_notification ON public.chats;
CREATE TRIGGER on_new_chat_notification
AFTER INSERT ON public.chats
FOR EACH ROW EXECUTE FUNCTION notify_on_new_chat();

-- ==========================================
-- 3. 🤖 POST COMMENT ROBOT
-- ==========================================
CREATE OR REPLACE FUNCTION notify_on_new_post_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner TEXT;
BEGIN
    SELECT rider_name INTO post_owner FROM public.posts WHERE id = NEW.post_id;
    
    IF post_owner != NEW.rider_name THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (post_owner, NEW.rider_name, '💬 Commented: ' || substring(NEW.text from 1 for 30), 'comment', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment_notification ON public.post_comments;
CREATE TRIGGER on_post_comment_notification
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_new_post_comment();

-- ==========================================
-- 4. 🤖 STORY COMMENT ROBOT
-- ==========================================
CREATE OR REPLACE FUNCTION notify_on_new_story_comment()
RETURNS TRIGGER AS $$
DECLARE
    story_owner TEXT;
BEGIN
    SELECT rider_name INTO story_owner FROM public.stories WHERE id = NEW.story_id;
    
    IF story_owner != NEW.rider_name THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (story_owner, NEW.rider_name, '🔥 Story Reply: ' || substring(NEW.text from 1 for 30), 'story', NEW.story_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_story_comment_notification ON public.story_comments;
CREATE TRIGGER on_story_comment_notification
AFTER INSERT ON public.story_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_new_story_comment();

-- ==========================================
-- 5. 🤖 FRIEND REQUEST ROBOT
-- ==========================================
CREATE OR REPLACE FUNCTION notify_on_friendship_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (NEW.receiver_name, NEW.sender_name, 'sent you a friend request! 🤝', 'friend_request', NEW.sender_id);
    ELSIF NEW.status = 'accepted' THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (NEW.sender_name, NEW.receiver_name, 'accepted your friend request! 🏍️', 'friend_accept', NEW.receiver_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_friendship_notification ON public.friendships;
CREATE TRIGGER on_friendship_notification
AFTER INSERT OR UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION notify_on_friendship_update();
