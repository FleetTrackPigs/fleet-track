# FleetTrack - Fleet Management System

## 1. Title and Overview

### 1.1 Document Title & Version

FleetTrack Product Requirements Document v1.0

### 1.2 Product Summary

FleetTrack is a comprehensive vehicle fleet management system designed to help fleet owners monitor, maintain, and optimize their vehicle fleets. The application enables real-time tracking of vehicles, management of vehicle maintenance schedules, assignment of drivers, and analysis of fleet performance metrics. FleetTrack streamlines communication between fleet managers and drivers while providing critical operational insights to optimize fleet efficiency and reduce costs.

## 2. Technology Stack

### 2.1 Backend

- **Node.js with Express**: RESTful API framework
- **Supabase**: For database, authentication, and real-time features
- **Socket.io**: For real-time communication between vehicles and the dashboard
- **JWT**: For secure authentication tokens
- **Middleware**: Authentication, logging, and error handling

### 2.2 Frontend

- **React**: For building the user interface
- **React Router**: For navigation
- **Redux/Context API**: For state management
- **MapBox/Google Maps API**: For real-time map visualization
- **Chakra UI/Material UI**: For component library and design system

### 2.3 DevOps

- **Git/GitHub**: Version control
- **Jest/React Testing Library**: For testing
- **GitHub Actions**: For CI/CD
- **Docker**: For containerization
- **Netlify/Vercel**: For frontend deployment
- **Heroku/Render**: For backend deployment

## 3. Architecture

### 3.1 System Architecture

```
┌─────────────┐     ┌────────────────┐     ┌─────────────────┐
│ Client Apps │────>│ API Gateway    │────>│ Microservices   │
│ (Web/Mobile)│<────│ (Express)      │<────│ (Auth/Fleet/Map)│
└─────────────┘     └────────────────┘     └─────────────────┘
                           │                        │
                           ▼                        ▼
                    ┌─────────────┐          ┌─────────────┐
                    │ Real-time   │<────────>│ Database    │
                    │ (Socket.io) │          │ (Supabase)  │
                    └─────────────┘          └─────────────┘
```

### 3.2 Database Schema

#### Users Table

- id (PK)
- email (unique)
- password_hash
- role (manager/driver)
- first_name
- last_name
- phone
- created_at
- updated_at

#### Vehicles Table

- id (PK)
- registration_number (unique)
- make
- model
- year
- fuel_type
- status (active/maintenance/inactive)
- current_location (geo point)
- created_at
- updated_at

#### Assignments Table

- id (PK)
- vehicle_id (FK)
- driver_id (FK)
- start_time
- end_time
- status (active/completed/canceled)
- created_at
- updated_at

#### Maintenance Records Table

- id (PK)
- vehicle_id (FK)
- maintenance_type
- description
- date_performed
- cost
- service_provider
- notes
- created_at
- updated_at

#### Inspection Checklists Table

- id (PK)
- vehicle_id (FK)
- driver_id (FK)
- checklist_template_id (FK)
- status (pending/completed)
- completion_date
- notes
- created_at
- updated_at

#### Routes Table

- id (PK)
- vehicle_id (FK)
- start_location (geo point)
- end_location (geo point)
- waypoints (geo JSON)
- estimated_duration
- actual_duration
- status (planned/in-progress/completed)
- created_at
- updated_at

## 4. API Endpoints

### Authentication

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password
- `GET /api/auth/me`: Get current user

### Users

- `GET /api/users`: Get all users (managers only)
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user

### Vehicles

- `GET /api/vehicles`: Get all vehicles
- `GET /api/vehicles/:id`: Get vehicle by ID
- `POST /api/vehicles`: Create new vehicle
- `PUT /api/vehicles/:id`: Update vehicle
- `DELETE /api/vehicles/:id`: Delete vehicle
- `GET /api/vehicles/:id/maintenance`: Get vehicle maintenance history
- `GET /api/vehicles/:id/location`: Get real-time vehicle location

### Assignments

- `GET /api/assignments`: Get all assignments
- `GET /api/assignments/:id`: Get assignment by ID
- `POST /api/assignments`: Create new assignment
- `PUT /api/assignments/:id`: Update assignment
- `DELETE /api/assignments/:id`: Delete assignment
- `GET /api/drivers/:id/assignments`: Get driver assignments

### Inspection Checklists

- `GET /api/checklists`: Get all checklists
- `GET /api/checklists/:id`: Get checklist by ID
- `POST /api/checklists`: Create new checklist
- `PUT /api/checklists/:id`: Update checklist
- `POST /api/checklists/:id/submit`: Submit completed checklist

### Routes

- `GET /api/routes`: Get all routes
- `GET /api/routes/:id`: Get route by ID
- `POST /api/routes`: Create new route
- `PUT /api/routes/:id`: Update route
- `GET /api/vehicles/:id/routes`: Get vehicle routes

## 5. Authentication Flow

### Registration Process

1. User submits registration form with email, password, name, role
2. Backend validates input data
3. System checks if email already exists
4. Password is hashed and stored
5. User account is created with 'pending' status for managers
6. Admin must approve manager accounts before activation
7. Confirmation email is sent to user
8. User verifies email to activate account

### Login Process

1. User submits login credentials
2. Backend validates credentials against database
3. If valid, JWT token is generated with user role and permissions
4. Token is returned to client and stored
5. User is redirected to role-specific dashboard

### Authorization Flow

1. Frontend sends JWT token with each API request
2. Backend middleware validates token
3. Middleware checks user permissions for requested resource
4. If authorized, request proceeds to controller
5. If unauthorized, 403 error is returned

## 6. UI Components

### Common Components

- LoginForm
- RegistrationForm
- PasswordResetForm
- Header
- Footer
- Sidebar
- NotificationCenter
- Modal
- Toast
- ErrorBoundary

### Manager Dashboard Components

- FleetMap
- VehicleList
- VehicleDetailCard
- DriverList
- DriverDetailCard
- AssignmentManager
- MaintenanceHistoryTable
- InspectionChecklistCreator
- RouteTracker
- ETADisplay
- TrafficLayer
- StatisticsPanel
- ReportGenerator

### Driver Dashboard Components

- VehicleAssignmentCard
- LocationMap
- InspectionChecklistForm
- RouteViewer
- IssueReportForm
- NotificationList

## 7. User Stories

### Authentication and User Management

US-001

- Title: User Login
- Description: As a user, I want to login with my credentials so that I can access the system securely.
- Acceptance Criteria:
  - System must allow login using username/email and password
  - System must validate credentials against the database
  - System must display appropriate error messages for invalid credentials
  - System must direct users to their role-specific dashboard after successful login

US-002

- Title: Password Recovery
- Description: As a user, I want to change my password in case I don't remember it so that I can regain access to my account.
- Acceptance Criteria:
  - System must provide a "Forgot Password" option on the login screen
  - System must validate the user's identity via email verification
  - System must allow users to create and confirm a new password
  - System must notify users of successful password changes

US-003

- Title: User Role Selection
- Description: As a user, I want to select between being registered as a manager or a driver so that I can access the appropriate system features.
- Acceptance Criteria:
  - Registration form must include role selection option
  - System must store and associate selected role with user account
  - System must direct users to role-specific onboarding process
  - Admin approval may be required before account activation

US-016

- Title: User Registration
- Description: As a new user, I want to create an account so that I can access the system.
- Acceptance Criteria:
  - Registration form collects necessary user information
  - Email verification is required to activate account
  - Password strength requirements are enforced
  - User can select their role during registration
  - System prevents duplicate accounts

US-017

- Title: User Profile Management
- Description: As a user, I want to view and edit my profile information so that I can keep my details up to date.
- Acceptance Criteria:
  - User can view all their profile information
  - User can edit personal details including name, contact info, and profile picture
  - User can change password from profile page
  - System validates all input data before saving changes
  - Notification confirms successful profile updates

### Fleet Manager Features

US-004

- Title: Real-time Fleet Map Visualization
- Description: As a manager, I want to visualize my fleet in an interactive real-time map so that I can monitor vehicle locations and status.
- Acceptance Criteria:
  - Map displays all fleet vehicles with distinct identifiers
  - Map updates vehicle positions in real-time (maximum 30-second delay)
  - Manager can click on vehicles to see basic information (driver, status, etc.)
  - Map includes zoom and filter capabilities
  - Map is optimized for both desktop and mobile viewing

US-005

- Title: Vehicle Fleet Management
- Description: As a manager, I want to add, edit or delete vehicles in my fleet so that I can maintain an accurate inventory.
- Acceptance Criteria:
  - Manager can add new vehicles with detailed specifications
  - Manager can edit existing vehicle information
  - Manager can delete vehicles no longer in the fleet
  - System maintains historical records of deleted vehicles
  - Changes are logged with timestamp and user information

US-006

- Title: Driver Assignment
- Description: As a manager, I want to assign drivers to vehicles so that I can coordinate fleet operations efficiently.
- Acceptance Criteria:
  - Manager can view list of available drivers and vehicles
  - Manager can create, modify and remove driver-vehicle assignments
  - System prevents duplicate assignments
  - System notifies drivers of new assignments
  - Assignment history is maintained for record-keeping

US-007

- Title: Vehicle Maintenance History
- Description: As a manager, I want to check any fleet vehicle's history of maintenance so that I can ensure proper vehicle upkeep.
- Acceptance Criteria:
  - Manager can view complete maintenance history for any vehicle
  - Records are sortable and filterable by date, type, and other parameters
  - System highlights overdue maintenance items
  - Manager can export maintenance reports
  - System maintains detailed records of all maintenance activities

US-008

- Title: Inspection Checklist Assignment
- Description: As a manager, I want to assign inspection checklists to vehicles so that drivers know what to inspect.
- Acceptance Criteria:
  - Manager can create standardized inspection checklists
  - Manager can assign checklists to specific vehicles or vehicle types
  - System notifies drivers of checklist assignments
  - Manager can set checklist schedules (daily, weekly, etc.)
  - Manager can modify checklists as needed

US-011

- Title: Real-time Vehicle Problem Notifications
- Description: As a manager, I want to be notified in real-time of problems with any fleet vehicles so that I can address issues promptly.
- Acceptance Criteria:
  - System delivers instant notifications for critical vehicle issues
  - Notifications appear on dashboard and via email/SMS
  - Notifications include vehicle ID, location, driver, and problem description
  - Manager can acknowledge notifications and assign follow-up actions
  - Notification history is maintained and searchable

US-012

- Title: Vehicle Route Tracking
- Description: As a manager, I want to check the planned route vehicles are following so that I can ensure efficiency and compliance.
- Acceptance Criteria:
  - System displays planned routes on the map
  - System compares actual paths with planned routes
  - Manager can view route deviation alerts
  - Manager can adjust routes in real-time when necessary
  - System maintains route history for analysis

US-013

- Title: Vehicle Arrival Time Estimation
- Description: As a manager, I want to see the estimated time left for vehicles to arrive at their destinations so that I can better coordinate operations.
- Acceptance Criteria:
  - System calculates and displays ETAs for all active vehicles
  - ETAs update automatically based on traffic and vehicle progress
  - System highlights delayed vehicles
  - Manager can share ETA information with clients or stakeholders
  - Historical ETA accuracy is tracked for system improvement

US-014

- Title: Real-time Traffic Visualization
- Description: As a manager, I want to visualize real-time traffic conditions so that I can anticipate delays and optimize routes.
- Acceptance Criteria:
  - Traffic data overlays on the fleet map
  - Traffic conditions are color-coded for easy interpretation
  - System suggests alternative routes during heavy traffic
  - Traffic data updates at least every 5 minutes
  - Historical traffic patterns can be reviewed for route planning

US-015

- Title: Fleet Statistics Dashboard
- Description: As a manager, I want to check fleet statistics so that I can monitor performance and make data-driven decisions.
- Acceptance Criteria:
  - Dashboard displays key metrics (fuel consumption, maintenance costs, etc.)
  - Statistics can be filtered by time period, vehicle type, and driver
  - System generates visual reports (charts, graphs) for easy interpretation
  - Manager can export statistics in various formats
  - Dashboard highlights performance trends and anomalies

US-018

- Title: Route Planning
- Description: As a manager, I want to create and assign routes to vehicles so that drivers know their destinations and optimal paths.
- Acceptance Criteria:
  - Manager can create new routes with multiple waypoints
  - Manager can assign routes to specific vehicles/drivers
  - System calculates optimal routes based on traffic and distance
  - Manager can set priority levels for routes
  - Routes can be saved as templates for future use

US-019

- Title: Driver Performance Metrics
- Description: As a manager, I want to view driver performance metrics so that I can identify areas for improvement.
- Acceptance Criteria:
  - System tracks metrics like fuel efficiency, on-time arrivals, and safety
  - Manager can view individual driver performance dashboards
  - System compares drivers against team averages
  - Manager can set performance targets
  - System generates performance reports for review sessions

### Driver Features

US-009

- Title: Inspection Checklist Submission
- Description: As a driver, I want to upload completed inspection checklists to the system so that managers are informed about vehicle conditions.
- Acceptance Criteria:
  - Driver can access assigned checklists on mobile device
  - Checklist includes text fields, checkboxes, and photo upload capabilities
  - Driver can submit completed checklists with a single tap
  - System confirms successful submission
  - Driver can review previously submitted checklists

US-010

- Title: Vehicle Assignment Visibility
- Description: As a driver, I want to see which vehicle has been assigned to me and its location so that I can efficiently start my work.
- Acceptance Criteria:
  - Driver dashboard clearly shows current vehicle assignment
  - System provides vehicle location on a map
  - Driver receives notifications for new assignments
  - Driver can view basic vehicle information (model, fuel level, etc.)
  - Driver can report issues with assigned vehicle

US-020

- Title: Route Navigation
- Description: As a driver, I want to view and navigate my assigned route so that I can reach my destinations efficiently.
- Acceptance Criteria:
  - Driver can view assigned route on mobile device
  - Navigation provides turn-by-turn directions
  - System updates route based on real-time traffic conditions
  - Driver receives alerts for traffic incidents along route
  - System tracks actual route taken for later analysis

US-021

- Title: Issue Reporting
- Description: As a driver, I want to report vehicle issues or route problems so that managers can address them promptly.
- Acceptance Criteria:
  - Driver can submit issue reports from mobile device
  - Report form includes issue type, description, and photo upload
  - Driver can indicate severity level of issue
  - System notifies relevant managers immediately of critical issues
  - Driver receives confirmation when issue is addressed

## 8. Technical Requirements

TR-001

- Title: Version Control Repository Setup
- Description: As a developer, I want to set up a basic project repository with version control so that we can track code changes and collaborate effectively.
- Acceptance Criteria:
  - Repository is created with appropriate structure
  - Access control and permissions are configured
  - Initial README and documentation are established
  - Branching strategy is defined and documented
  - CI/CD pipelines are configured for automated testing

TR-002

- Title: API Structure Implementation
- Description: As a developer, I want to establish a basic API structure with a chosen framework so that the frontend can communicate with the backend.
- Acceptance Criteria:
  - API framework is selected and configured
  - Basic endpoints are implemented for core functionality
  - Authentication and authorization mechanisms are established
  - API documentation is generated
  - Performance testing indicates acceptable response times

TR-003

- Title: Database System Configuration
- Description: As a database administrator, I want to select and configure a database system so that we can store and retrieve application data.
- Acceptance Criteria:
  - Database system is selected based on project requirements
  - Schema is designed and implemented
  - Backup and recovery procedures are established
  - Database performance is optimized for expected load
  - Security measures are implemented to protect data

TR-004

- Title: User Interface Layout Creation
- Description: As a developer, I want to create a basic user interface layout so that users have a starting point for interacting with the application.
- Acceptance Criteria:
  - Responsive design works across desktop and mobile devices
  - Interface follows usability best practices
  - Design system and component library are established
  - Layout accommodates all planned features
  - User feedback is incorporated into initial design

TR-005

- Title: Testing Framework Configuration
- Description: As a developer, I want to configure a testing framework so that we can begin writing tests and ensure code quality.
- Acceptance Criteria:
  - Testing framework is selected and configured
  - Unit test structure is established
  - Integration test capabilities are implemented
  - Test automation is configured in the CI/CD pipeline
  - Code coverage reporting is set up

TR-006

- Title: Authentication System Implementation
- Description: As a developer, I want to implement a secure authentication system so that users can safely access the application.
- Acceptance Criteria:
  - JWT-based authentication is implemented
  - Password hashing and security best practices are followed
  - Role-based access control is configured
  - Session management handles timeouts and renewals
  - OAuth integration is available for social logins

TR-007

- Title: Real-time Communication Setup
- Description: As a developer, I want to implement real-time communication channels so that the application can provide live updates.
- Acceptance Criteria:
  - WebSocket connections are established and managed
  - Real-time data is synchronized between server and clients
  - System handles connection disruptions gracefully
  - Broadcasting channels are configured for different data types
  - Performance is optimized for multiple concurrent connections

## 9. Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Supabase account

### Backend Setup

1. Clone the repository

   ```
   git clone https://github.com/yourusername/fleet-track.git
   cd fleet-track/backend
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up environment variables

   ```
   cp .env.example .env
   # Edit .env with your Supabase credentials and other settings
   ```

4. Start development server
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory

   ```
   cd ../frontend
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up environment variables

   ```
   cp .env.example .env
   # Edit .env with your API endpoint and Map API keys
   ```

4. Start development server
   ```
   npm run dev
   ```

## 10. Project Timeline

- Week 1-2: Setup project infrastructure and base authentication
- Week 3-4: Implement core vehicle and driver management features
- Week 5-6: Develop map visualization and real-time tracking
- Week 7-8: Create inspection checklists and maintenance tracking
- Week 9-10: Implement route planning and traffic visualization
- Week 11-12: Develop statistics dashboard and reporting
- Week 13-14: Testing, bug fixes, and optimization
- Week 15-16: Deployment and documentation
