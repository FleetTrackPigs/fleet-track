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
