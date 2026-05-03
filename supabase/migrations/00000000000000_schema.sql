-- Create Users Table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Create Sports Table
CREATE TABLE sports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_hour NUMERIC NOT NULL,
  image_url TEXT NOT NULL
);

-- Create Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  sport_id UUID REFERENCES sports(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  players_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Slots Table
CREATE TABLE slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sport_id UUID REFERENCES sports(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_slot UNIQUE(sport_id, date, start_time)
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Sports are readable by everyone
CREATE POLICY "Sports are publicly readable" ON sports FOR SELECT USING (true);

-- Bookings are readable/insertable by the owner
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Slots are readable by everyone, but only system/triggers can update them
CREATE POLICY "Slots are publicly readable" ON slots FOR SELECT USING (true);

-- Function to handle booking and slot availability updates
CREATE OR REPLACE FUNCTION handle_new_booking() 
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the corresponding slot as unavailable
  UPDATE slots 
  SET is_available = FALSE 
  WHERE sport_id = NEW.sport_id 
    AND date = NEW.date 
    AND start_time = NEW.start_time;

  -- (Edge functions can be triggered via webhook to send emails, or use supabase database webhooks)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_confirmed
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_booking();
