-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
	id UUID REFERENCES auth.users(id) PRIMARY KEY,
	username TEXT UNIQUE,
	avatar_url TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
	title TEXT,
	image_url TEXT NOT NULL,
	is_public BOOLEAN DEFAULT FALSE NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create meme_texts table
CREATE TABLE IF NOT EXISTS meme_texts (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	meme_id UUID REFERENCES memes(id) ON DELETE CASCADE NOT NULL,
	content TEXT NOT NULL,
	x FLOAT NOT NULL,
	y FLOAT NOT NULL,
	width FLOAT NOT NULL,
	height FLOAT NOT NULL,
	font_size INTEGER NOT NULL,
	font_family TEXT DEFAULT 'Impact' NOT NULL,
	color TEXT DEFAULT '#ffffff' NOT NULL,
	"order" INTEGER NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_texts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
	ON profiles FOR SELECT
	USING (true);

CREATE POLICY "Users can update own profile"
	ON profiles FOR UPDATE
	USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
	ON profiles FOR INSERT
	WITH CHECK (auth.uid() = id);

-- Memes policies
CREATE POLICY "Users can read own memes"
	ON memes FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can read public memes"
	ON memes FOR SELECT
	USING (is_public = true);

CREATE POLICY "Users can create own memes"
	ON memes FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memes"
	ON memes FOR UPDATE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memes"
	ON memes FOR DELETE
	USING (auth.uid() = user_id);

-- Meme texts policies
CREATE POLICY "Users can read texts for accessible memes"
	ON meme_texts FOR SELECT
	USING (
		EXISTS (
			SELECT 1 FROM memes
			WHERE memes.id = meme_texts.meme_id
			AND (memes.user_id = auth.uid() OR memes.is_public = true)
		)
	);

CREATE POLICY "Users can create texts for own memes"
	ON meme_texts FOR INSERT
	WITH CHECK (
		EXISTS (
			SELECT 1 FROM memes
			WHERE memes.id = meme_texts.meme_id
			AND memes.user_id = auth.uid()
		)
	);

CREATE POLICY "Users can update texts for own memes"
	ON meme_texts FOR UPDATE
	USING (
		EXISTS (
			SELECT 1 FROM memes
			WHERE memes.id = meme_texts.meme_id
			AND memes.user_id = auth.uid()
		)
	);

CREATE POLICY "Users can delete texts for own memes"
	ON meme_texts FOR DELETE
	USING (
		EXISTS (
			SELECT 1 FROM memes
			WHERE memes.id = meme_texts.meme_id
			AND memes.user_id = auth.uid()
		)
	);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = TIMEZONE('utc'::text, NOW());
	RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memes_updated_at BEFORE UPDATE ON memes
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memes_user_id ON memes(user_id);
CREATE INDEX IF NOT EXISTS idx_memes_is_public ON memes(is_public);
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meme_texts_meme_id ON meme_texts(meme_id);

