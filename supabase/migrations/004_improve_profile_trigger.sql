-- Improve the profile creation trigger to handle errors better
-- This ensures the trigger always succeeds even if there are edge cases

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
	-- Try to insert the profile
	-- Use ON CONFLICT to handle race conditions gracefully
	INSERT INTO public.profiles (id, username)
	VALUES (
		NEW.id,
		COALESCE(
			NEW.raw_user_meta_data->>'username',
			NEW.raw_user_meta_data->>'display_name',
			SPLIT_PART(NEW.email, '@', 1),
			NEW.email
		)
	)
	ON CONFLICT (id) DO UPDATE
	SET username = COALESCE(
		EXCLUDED.username,
		profiles.username,
		NEW.raw_user_meta_data->>'username',
		NEW.raw_user_meta_data->>'display_name',
		SPLIT_PART(NEW.email, '@', 1)
	);

	RETURN NEW;
EXCEPTION
	WHEN OTHERS THEN
		-- Log the error but don't fail the user creation
		-- The application will handle profile creation as fallback
		RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
		RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

