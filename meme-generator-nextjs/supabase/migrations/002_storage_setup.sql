-- Create storage bucket for meme images
INSERT INTO storage.buckets (id, name, public)
VALUES ('meme-images', 'meme-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'meme-images');

-- Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meme-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'meme-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'meme-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

