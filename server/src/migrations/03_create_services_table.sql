-- Create services table for tracking transport tasks with start/end locations
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    driver_id UUID REFERENCES drivers(id) ON DELETE
    SET
        NULL,
        vehicle_id UUID REFERENCES vehicles(id) ON DELETE
    SET
        NULL,
        start_address VARCHAR(255) NOT NULL,
        end_address VARCHAR(255) NOT NULL,
        start_lat DECIMAL(10, 7) NOT NULL,
        start_lng DECIMAL(10, 7) NOT NULL,
        end_lat DECIMAL(10, 7) NOT NULL,
        end_lng DECIMAL(10, 7) NOT NULL,
        scheduled_date TIMESTAMP WITH TIME ZONE,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        STATUS VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup by status
CREATE INDEX IF NOT EXISTS idx_services_status ON services(STATUS);

-- Index for faster lookup by driver
CREATE INDEX IF NOT EXISTS idx_services_driver_id ON services(driver_id);

-- Index for faster lookup by vehicle
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);

-- Trigger to update updated_at on services record change
CREATE TRIGGER update_services_updated_at BEFORE
UPDATE
    ON services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Initial sample data
INSERT INTO
    services (
        name,
        description,
        start_address,
        end_address,
        start_lat,
        start_lng,
        end_lat,
        end_lng,
        scheduled_date,
        STATUS
    )
VALUES
    (
        'Entrega de mercancía a Supermercado Central',
        'Transporte de productos alimenticios refrigerados',
        'Calle Industria 123, Madrid',
        'Avenida Comercial 456, Barcelona',
        40.4168,
        -3.7038,
        41.3851,
        2.1734,
        NOW() + INTERVAL '1 day',
        'pending'
    ),
    (
        'Transporte material construcción',
        'Carga de cemento y materiales de obra',
        'Polígono Industrial Norte, Valencia',
        'Obra Residencial Sol, Alicante',
        39.4699,
        -0.3763,
        38.3452,
        -0.4815,
        NOW() + INTERVAL '2 days',
        'pending'
    ),
    (
        'Traslado equipos médicos',
        'Equipos sensibles que requieren manejo cuidadoso',
        'Hospital Central, Sevilla',
        'Clínica Nueva, Málaga',
        37.3891,
        -5.9845,
        36.7213,
        -4.4213,
        NOW() + INTERVAL '3 days',
        'pending'
    );
