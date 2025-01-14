-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  birth_date text,
  birth_time text,
  birth_location text,
  birth_lat decimal,
  birth_lng decimal
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write their own profile
CREATE POLICY "Users can read/write their own profile" ON profiles
FOR ALL USING (auth.uid() = id);
