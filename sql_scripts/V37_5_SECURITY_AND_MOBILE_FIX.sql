-- 🛡️ ICPH MASTER SECURITY & UI STABILIZER (V37.5)
-- Engineered by Binary Wraith & DB Titan
-- Standard: TOP 1 IN THE COUNTRY

-- ==========================================
-- 1. 🔑 ADMIN PASSWORD OVERRIDE
-- Allows Superadmins to reset any rider's password using the Master Code.
-- ==========================================

DROP FUNCTION IF EXISTS public.update_user_password_admin(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_user_password_admin(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.update_user_password_admin(
    target_user_id UUID,
    new_password TEXT,
    master_code TEXT
)
RETURNS VOID AS $$
BEGIN
    IF master_code != 'iangwapo' THEN
        RAISE EXCEPTION 'INVALID MASTER CODE. ACCESS DENIED.';
    END IF;

    UPDATE auth.users 
    SET encrypted_password = crypt(new_password, gen_salt('bf'))
    WHERE id = target_user_id;

    UPDATE public.riders 
    SET is_banned = false 
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_user_password_admin(UUID, TEXT, TEXT) TO authenticated;

-- ==========================================
-- 2. 🗑️ ADMIN ACCOUNT WIPE
-- Allows Superadmins to permanently delete a rider and all their data.
-- ==========================================

DROP FUNCTION IF EXISTS public.delete_user_completely_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS public.delete_user_completely_admin(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.delete_user_completely_admin(
    target_user_id UUID,
    master_code TEXT
)
RETURNS VOID AS $$
BEGIN
    IF master_code != 'iangwapo' THEN
        RAISE EXCEPTION 'INVALID MASTER CODE. ACCESS DENIED.';
    END IF;

    DELETE FROM auth.users WHERE id = target_user_id;
    DELETE FROM public.riders WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_user_completely_admin(UUID, TEXT) TO authenticated;

-- ==========================================
-- 3. 🏁 FINAL ADMIN SESSION RECOVERY
-- Force reset the primary admin account to ensure access.
-- ==========================================

UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'admin@panabo.icph';

UPDATE public.riders 
SET rank = 'Superadmin', is_admin = true, is_super_admin = true, is_banned = false 
WHERE id = '923794ab-bacf-4e7f-829d-83ee2f2febc8';
