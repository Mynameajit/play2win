-- SQL Schema script to initialize PostgreSQL / Supabase tables for Play2Earn

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'admin', 'superadmin'
    bgmi_uid VARCHAR(50) DEFAULT '',
    bgmi_ign VARCHAR(50) DEFAULT '',
    freefire_uid VARCHAR(50) DEFAULT '',
    freefire_ign VARCHAR(50) DEFAULT '',
    deposit_balance NUMERIC(12, 2) DEFAULT 0.00,
    winning_balance NUMERIC(12, 2) DEFAULT 0.00,
    total_kills INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    rank_title VARCHAR(50) DEFAULT 'Bronze Tier I',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));

-- 2. Create OTP verification table
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otps_email_otp ON otps(LOWER(email), otp);

-- 3. Seed initial demo accounts (passwords stored plain or as simple text for compatibility with standard 123456)
INSERT INTO users (username, email, password, phone, role, bgmi_uid, bgmi_ign, freefire_uid, freefire_ign, deposit_balance, winning_balance, total_kills, matches_played, rank_title)
VALUES 
('mortal_sniper', 'user@gmail.com', '123456', '+91 98765 43210', 'user', '5519820491', 'Soul_Mortal99', '9812739401', 'TotalGaming_Pro', 450.00, 12850.00, 142, 38, 'Conqueror Tier I')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (username, email, password, phone, role, bgmi_uid, bgmi_ign, freefire_uid, freefire_ign, deposit_balance, winning_balance, total_kills, matches_played, rank_title)
VALUES 
('bgmi_admin', 'admin@gmail.com', '123456', '+91 99999 88888', 'admin', '111111111', 'Admin_Vikram', '', '', 0.00, 0.00, 0, 0, 'Server Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (username, email, password, phone, role, bgmi_uid, bgmi_ign, freefire_uid, freefire_ign, deposit_balance, winning_balance, total_kills, matches_played, rank_title)
VALUES 
('super_admin', 'superadmin@gmail.com', '123456', '+91 99999 99999', 'superadmin', '222222222', 'SuperAdmin_Enterprise', '', '', 100000.00, 100000.00, 0, 0, 'Platform Director')
ON CONFLICT (email) DO NOTHING;
