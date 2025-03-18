# Fleet Track Server

This is the backend server for the Fleet Track application, built with Express, TypeScript, and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example` and fill in the required values.

3. Setup Supabase:
   - Create a Supabase project
   - Create a 'users' table with the following columns:
     - id (UUID, primary key)
     - name (text)
     - lastName (text, nullable)
     - username (text, unique)
     - role (text, enum: 'admin', 'driver')
     - status (text, enum: 'active', 'inactive')
   - Create a 'vehicles' table:
     - id (UUID, primary key)
     - brand (text)
     - model (text)
     - plate (text, unique)
     - status (text, enum: 'available', 'assigned')
     - driverId (UUID, foreign key to users.id, nullable)

## Development

Start development server:

```bash
npm run dev
```

## Building

Build for production:

```bash
npm run build
```

## Available Endpoints

### Authentication

- `POST /api/auth/login`: Login with username and password
- `POST /api/auth/logout`: Logout current user
- `GET /api/auth/me`: Get current authenticated user

### Vehicles

- `GET /api/vehicles`: Get all vehicles
- `GET /api/vehicles/:id`: Get a specific vehicle
- `POST /api/vehicles`: Create a new vehicle (admin only)
- `PUT /api/vehicles/:id`: Update a vehicle (admin only)
- `DELETE /api/vehicles/:id`: Delete a vehicle (admin only)

## Technologies

- Express.js
- TypeScript
- Supabase
- JWT Authentication 
