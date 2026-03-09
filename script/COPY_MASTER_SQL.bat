@echo off
title ICPH: COPY MASTER SQL
color 0C
cls
echo.
echo    ICPH MASTER AUTOMATION SQL (V37.2)
echo    ----------------------------------
echo.
echo    [SYSTEM]: Copying Master SQL to Clipboard...
echo.

(
echo -- 🛡️ ICPH MASTER AUTOMATION SYSTEM (V37.2^)
echo -- Engineered by Titan Prime ^& Logic Core
echo -- Standard: TOP 1 IN THE COUNTRY
echo.
echo -- 1. 🤖 CHAT ROBOT (Private ^& Group Messages^)
echo CREATE OR REPLACE FUNCTION notify_on_new_chat(^)
echo RETURNS TRIGGER AS $$
echo BEGIN
echo     -- Ayaw i-notify ang kaugalingon
echo     IF NEW.sender_name != NEW.receiver_name THEN
echo         INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id^)
echo         VALUES (NEW.receiver_name, NEW.sender_name, NEW.message, 'message', NEW.id^);
echo     END IF;
echo     RETURN NEW;
echo END;
echo $$ LANGUAGE plpgsql SECURITY DEFINER;
echo.
echo DROP TRIGGER IF EXISTS on_new_chat_notification ON public.chats;
echo CREATE TRIGGER on_new_chat_notification
echo AFTER INSERT ON public.chats
echo FOR EACH ROW EXECUTE FUNCTION notify_on_new_chat(^);
echo.
echo -- 2. 🤖 POST COMMENT ROBOT
echo CREATE OR REPLACE FUNCTION notify_on_new_post_comment(^)
echo RETURNS TRIGGER AS $$
echo DECLARE
echo     post_owner TEXT;
echo BEGIN
echo     SELECT rider_name INTO post_owner FROM public.posts WHERE id = NEW.post_id;
echo     IF post_owner != NEW.rider_name THEN
echo         INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id^)
echo         VALUES (post_owner, NEW.rider_name, '💬: ' ^|^| NEW.text, 'comment', NEW.post_id^);
echo     END IF;
echo     RETURN NEW;
echo END;
echo $$ LANGUAGE plpgsql SECURITY DEFINER;
echo.
echo DROP TRIGGER IF EXISTS on_post_comment_notification ON public.post_comments;
echo CREATE TRIGGER on_post_comment_notification
echo AFTER INSERT ON public.post_comments
echo FOR EACH ROW EXECUTE FUNCTION notify_on_new_post_comment(^);
echo.
echo -- 3. 🤖 STORY COMMENT ROBOT
echo CREATE OR REPLACE FUNCTION notify_on_new_story_comment(^)
echo RETURNS TRIGGER AS $$
echo DECLARE
echo     story_owner TEXT;
echo BEGIN
echo     SELECT rider_name INTO story_owner FROM public.stories WHERE id = NEW.story_id;
echo     IF story_owner != NEW.rider_name THEN
echo         INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id^)
echo         VALUES (story_owner, NEW.rider_name, '🔥 Story Reply: ' ^|^| NEW.text, 'story', NEW.story_id^);
echo     END IF;
echo     RETURN NEW;
echo END;
echo $$ LANGUAGE plpgsql SECURITY DEFINER;
echo.
echo DROP TRIGGER IF EXISTS on_story_comment_notification ON public.story_comments;
echo CREATE TRIGGER on_story_comment_notification
echo AFTER INSERT ON public.story_comments
echo FOR EACH ROW EXECUTE FUNCTION notify_on_new_story_comment(^);
echo.
echo -- 4. 🤖 FRIEND REQUEST ROBOT
echo CREATE OR REPLACE FUNCTION notify_on_friendship_update(^)
echo RETURNS TRIGGER AS $$
echo BEGIN
echo     IF NEW.status = 'pending' THEN
echo         INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id^)
echo         VALUES (NEW.receiver_name, NEW.sender_name, 'sent you a friend request! 🤝', 'friend_request', NEW.sender_id^);
echo     ELSIF NEW.status = 'accepted' THEN
echo         INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id^)
echo         VALUES (NEW.sender_name, NEW.receiver_name, 'accepted your friend request! 🏍️', 'friend_accept', NEW.receiver_id^);
echo     END IF;
echo     RETURN NEW;
echo END;
echo $$ LANGUAGE plpgsql SECURITY DEFINER;
echo.
echo DROP TRIGGER IF EXISTS on_friendship_notification ON public.friendships;
echo CREATE TRIGGER on_friendship_notification
echo AFTER INSERT OR UPDATE ON public.friendships
echo FOR EACH ROW EXECUTE FUNCTION notify_on_friendship_update(^);
) | clip

echo    [SUCCESS]: MASTER SQL IS NOW ON YOUR CLIPBOARD!
echo               Just PASTE (Ctrl+V) into Supabase SQL Editor.
echo.
pause