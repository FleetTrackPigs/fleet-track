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
