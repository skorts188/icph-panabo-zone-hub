-- 🛡️ ICPH MASTER AUTOMATION SYSTEM (V37.2)
-- Engineered by Titan Prime & Logic Core
-- Standard: TOP 1 IN THE COUNTRY

-- 1. 🤖 CHAT ROBOT (Private & Group Messages)
CREATE OR REPLACE FUNCTION notify_on_new_chat()
RETURNS TRIGGER AS $$
BEGIN
    -- Ayaw i-notify ang kaugalingon
    IF NEW.sender_name != NEW.receiver_name THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (NEW.receiver_name, NEW.sender_name, NEW.message, 'message', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_chat_notification ON public.chats;
CREATE TRIGGER on_new_chat_notification
AFTER INSERT ON public.chats
FOR EACH ROW EXECUTE FUNCTION notify_on_new_chat();


-- 2. 🤖 POST COMMENT ROBOT
CREATE OR REPLACE FUNCTION notify_on_new_post_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner TEXT;
BEGIN
    -- Pangitaon ang tag-iya sa post
    SELECT rider_name INTO post_owner FROM public.posts WHERE id = NEW.post_id;
    
    -- Notify lang kung dili ang tag-iya ang ni-comment
    IF post_owner != NEW.rider_name THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (post_owner, NEW.rider_name, '💬: ' || NEW.text, 'comment', NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment_notification ON public.post_comments;
CREATE TRIGGER on_post_comment_notification
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_new_post_comment();


-- 3. 🤖 STORY COMMENT ROBOT
CREATE OR REPLACE FUNCTION notify_on_new_story_comment()
RETURNS TRIGGER AS $$
DECLARE
    story_owner TEXT;
BEGIN
    -- Pangitaon ang tag-iya sa story
    SELECT rider_name INTO story_owner FROM public.stories WHERE id = NEW.story_id;
    
    IF story_owner != NEW.rider_name THEN
        INSERT INTO public.notifications (receiver_name, sender_name, message, type, target_id)
        VALUES (story_owner, NEW.rider_name, '🔥 Story Reply: ' || NEW.text, 'story', NEW.story_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_story_comment_notification ON public.story_comments;
CREATE TRIGGER on_story_comment_notification
AFTER INSERT ON public.story_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_new_story_comment();


-- 4. 🤖 FRIEND REQUEST ROBOT
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