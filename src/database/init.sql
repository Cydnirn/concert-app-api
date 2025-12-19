-- Database Initialization Script
-- This script creates the initial schema and seeds default data

-- Create Users table if not exists (TypeORM will handle this, but included for reference)
-- CREATE TABLE IF NOT EXISTS "user" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR NOT NULL,
--     email VARCHAR UNIQUE NOT NULL,
--     password VARCHAR NOT NULL,
--     role VARCHAR NOT NULL CHECK (role IN ('user', 'admin'))
-- );

-- Create Sessions table if not exists
-- CREATE TABLE IF NOT EXISTS "session" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     token VARCHAR NOT NULL,
--     "userId" UUID NOT NULL,
--     "expiresAt" TIMESTAMP NOT NULL,
--     "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
-- );

-- Create Concert table if not exists
-- CREATE TABLE IF NOT EXISTS "concert" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR NOT NULL,
--     organizer VARCHAR NOT NULL,
--     details VARCHAR NOT NULL,
--     image VARCHAR,
--     price INTEGER NOT NULL,
--     venue VARCHAR NOT NULL,
--     artist VARCHAR NOT NULL,
--     date TIMESTAMP NOT NULL,
--     "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert default admin user (only if not exists)
INSERT INTO "user" (id, name, email, password, role)
SELECT
    gen_random_uuid(),
    'Admin User',
    'admin@example.com',
    'admin123',
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM "user" WHERE email = 'admin@example.com'
);

-- Insert default concert with 10 tickets (only if no concerts exist)
DO $$
DECLARE
    concert_count INTEGER;
    i INTEGER;
BEGIN
    SELECT COUNT(*) INTO concert_count FROM "concert";

    IF concert_count = 0 THEN
        FOR i IN 1..10 LOOP
            INSERT INTO "concert" (id, name, organizer, artist, venue, details, price, date, image, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid(),
                'New Year''s Eve Concert',
                'Music Events Inc',
                'The Amazing Band',
                'Grand Stadium',
                'Join us for an unforgettable New Year''s Eve celebration with live music, amazing performances, and a spectacular countdown to midnight. This is a placeholder description for the concert event featuring top artists and entertainment.',
                10,
                '2024-12-31 20:00:00'::TIMESTAMP,
                'placeholder-concert-image.jpg',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
        END LOOP;

        RAISE NOTICE 'Created concert with 10 tickets at $10 each';
    ELSE
        RAISE NOTICE 'Concerts already exist, skipping seed';
    END IF;
END $$;

-- Verify admin user creation
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM "user" WHERE email = 'admin@example.com') INTO admin_exists;

    IF admin_exists THEN
        RAISE NOTICE 'Admin user verified: admin@example.com / admin123';
    END IF;
END $$;
