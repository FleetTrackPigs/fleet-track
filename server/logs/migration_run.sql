-- Transaction Start
-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    license_type VARCHAR(50),
    license_expiry DATE,
    STATUS VARCHAR(20) NOT NULL DEFAULT 'active',
    vehicleId UUID REFERENCES vehicles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_drivers_userId ON drivers(userId);

CREATE INDEX IF NOT EXISTS idx_drivers_vehicleId ON drivers(vehicleId);

-- Create trigger to update the updated_at timestamp
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at BEFORE
UPDATE
    ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- First, make sure we have the right users to link to drivers
-- This assumes users already exist with 'driver' role
INSERT INTO
    drivers (
        userId,
        name,
        lastName,
        phone,
        license_type,
        STATUS
    )
SELECT
    u.id AS userId,
    u.name,
    COALESCE(u.lastName, '') AS lastName,
    '+34612345678' AS phone,
    'B' AS license_type,
    u.status
FROM
    users u
WHERE
    u.role = 'driver'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            drivers d
        WHERE
            d.userId = u.id
    )
LIMIT
    5;

-- Add some sample drivers if there are no users with driver role
INSERT INTO
    drivers (
        userId,
        name,
        lastName,
        phone,
        license_type,
        STATUS
    )
SELECT
    id AS userId,
    'Sample Driver ' || i AS name,
    'Last Name ' || i AS lastName,
    '+346' || (10000000 + i) :: text AS phone,
    CASE
        WHEN i % 3 = 0 THEN 'B'
        WHEN i % 3 = 1 THEN 'C'
        ELSE 'D'
    END AS license_type,
    CASE
        WHEN i % 4 = 0 THEN 'inactive'
        ELSE 'active'
    END AS STATUS
FROM
    (
        SELECT
            generate_series(1, 5) AS i,
            id
        FROM
            users
        WHERE
            role = 'admin'
        LIMIT
            1
    ) AS subquery
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            drivers
        LIMIT
            1
    );
-- Transaction End
