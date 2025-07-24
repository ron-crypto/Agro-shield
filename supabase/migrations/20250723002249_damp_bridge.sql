/*
  # Initial Schema for Agro-Shield AI

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `phone` (text, unique)
      - `name` (text)
      - `location` (text)
      - `farm_size` (numeric)
      - `main_crops` (text array)
      - `soil_type` (text, optional)
      - `preferred_language` (text, default 'English')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `weather_data`
      - `id` (uuid, primary key)
      - `location` (text)
      - `date` (date)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `rainfall_probability` (numeric)
      - `wind_speed` (numeric)
      - `condition` (text)
      - `created_at` (timestamp)

    - `diagnoses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `image_url` (text)
      - `disease` (text)
      - `confidence` (numeric)
      - `description` (text)
      - `symptoms` (text array)
      - `treatments` (jsonb)
      - `severity` (text)
      - `created_at` (timestamp)

    - `market_prices`
      - `id` (uuid, primary key)
      - `crop` (text)
      - `market` (text)
      - `price` (numeric)
      - `unit` (text)
      - `date` (date)
      - `created_at` (timestamp)

    - `farm_journal`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity` (text)
      - `crop` (text)
      - `notes` (text)
      - `category` (text)
      - `quantity` (text, optional)
      - `cost` (numeric, optional)
      - `date` (date)
      - `created_at` (timestamp)

    - `advisories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `crop` (text)
      - `variety` (text)
      - `planting_window` (text)
      - `recommendations` (jsonb)
      - `confidence` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  farm_size numeric NOT NULL DEFAULT 0,
  main_crops text[] NOT NULL DEFAULT '{}',
  soil_type text,
  preferred_language text NOT NULL DEFAULT 'English',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  date date NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  rainfall_probability numeric NOT NULL,
  wind_speed numeric NOT NULL,
  condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  disease text NOT NULL,
  confidence numeric NOT NULL,
  description text NOT NULL,
  symptoms text[] NOT NULL DEFAULT '{}',
  treatments jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL,
  market text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create farm_journal table
CREATE TABLE IF NOT EXISTS farm_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity text NOT NULL,
  crop text NOT NULL,
  notes text NOT NULL DEFAULT '',
  category text NOT NULL,
  quantity text,
  cost numeric,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create advisories table
CREATE TABLE IF NOT EXISTS advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  crop text NOT NULL,
  variety text NOT NULL,
  planting_window text NOT NULL,
  recommendations jsonb NOT NULL DEFAULT '[]',
  confidence numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for weather_data (public read access)
CREATE POLICY "Anyone can read weather data"
  ON weather_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for diagnoses
CREATE POLICY "Users can read own diagnoses"
  ON diagnoses
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own diagnoses"
  ON diagnoses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create policies for market_prices (public read access)
CREATE POLICY "Anyone can read market prices"
  ON market_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for farm_journal
CREATE POLICY "Users can manage own journal entries"
  ON farm_journal
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create policies for advisories
CREATE POLICY "Users can read own advisories"
  ON advisories
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own advisories"
  ON advisories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_weather_location_date ON weather_data(location, date);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date ON market_prices(crop, date);
CREATE INDEX IF NOT EXISTS idx_farm_journal_user_id ON farm_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON advisories(user_id);

-- Insert sample weather data
INSERT INTO weather_data (location, date, temperature, humidity, rainfall_probability, wind_speed, condition) VALUES
('Nairobi', CURRENT_DATE, 28, 65, 20, 12, 'Partly Cloudy'),
('Nairobi', CURRENT_DATE + INTERVAL '1 day', 26, 70, 75, 15, 'Light Rain'),
('Nairobi', CURRENT_DATE + INTERVAL '2 days', 30, 60, 5, 10, 'Sunny'),
('Nairobi', CURRENT_DATE + INTERVAL '3 days', 29, 68, 15, 8, 'Partly Cloudy'),
('Nairobi', CURRENT_DATE + INTERVAL '4 days', 27, 75, 90, 18, 'Heavy Rain'),
('Nairobi', CURRENT_DATE + INTERVAL '5 days', 25, 80, 60, 20, 'Light Rain'),
('Nairobi', CURRENT_DATE + INTERVAL '6 days', 31, 55, 0, 5, 'Sunny');

-- Insert sample market prices
INSERT INTO market_prices (crop, market, price, unit, date) VALUES
('Maize', 'Wakulima Market', 3200, 'per 90kg bag', CURRENT_DATE),
('Maize', 'Kangemi Market', 3100, 'per 90kg bag', CURRENT_DATE),
('Beans', 'Wakulima Market', 8500, 'per 90kg bag', CURRENT_DATE),
('Tomatoes', 'Wakulima Market', 45, 'per kg', CURRENT_DATE),
('Sukuma Wiki', 'Kangemi Market', 25, 'per bunch', CURRENT_DATE),
('Potatoes', 'Githurai Market', 55, 'per kg', CURRENT_DATE);