-- Create meals table
CREATE TABLE meals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  servings INTEGER NOT NULL,
  nutrition JSONB NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON meals
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON meals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.email() = 'matthew.c.sutton@gmail.com');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON meals
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.email() = 'matthew.c.sutton@gmail.com');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete" ON meals
  FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.email() = 'matthew.c.sutton@gmail.com');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 