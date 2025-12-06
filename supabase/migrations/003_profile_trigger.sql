-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO public.profiles (id, username)
	VALUES (
		NEW.id,
		COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
	)
	ON CONFLICT (id) DO NOTHING;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

