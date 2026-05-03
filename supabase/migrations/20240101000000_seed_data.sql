-- Seed Sports (Updated with all 7 arenas)
INSERT INTO sports (name, price_per_hour, image_url) VALUES
('Football', 1800, '/assets/sports/football.jpg'),
('Box Cricket', 1500, '/assets/sports/box_cricket.jpg'),
('Badminton', 600, '/assets/sports/badminton.jpg'),
('Paintball', 3000, '/assets/sports/paintball.jpg'),
('Tennis', 1000, '/assets/sports/tennis.jpg'),
('Bowling', 1200, '/assets/sports/bowling.jpg'),
('Drift Bikes', 2500, '/assets/sports/drift_bikes.jpg')
ON CONFLICT (id) DO NOTHING;

-- Function to seed slots for all sports for the next 7 days
DO $$
DECLARE
    sport_record RECORD;
    target_date DATE;
    i INT;
    hour INT;
BEGIN
    FOR sport_record IN SELECT id, name FROM sports LOOP
        FOR i IN 0..6 LOOP
            target_date := CURRENT_DATE + i;
            FOR hour IN 6..22 LOOP
                INSERT INTO slots (sport_id, date, start_time, end_time, is_available)
                VALUES (
                    sport_record.id, 
                    target_date, 
                    (hour || ':00:00')::TIME, 
                    ((hour + 1) || ':00:00')::TIME, 
                    TRUE
                ) ON CONFLICT ON CONSTRAINT unique_slot DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
