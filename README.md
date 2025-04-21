# FleetTrack - Fleet Management System 🚚💨

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen)](https://fleet-track-web.onrender.com/)

<!-- Add other badges like build status, license etc. here -->
<!-- [![Build Status](<URL_TO_BUILD_BADGE>)](<URL_TO_BUILD_PIPELINE>) -->
<!-- [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) -->

**FleetTrack** is a comprehensive vehicle fleet management system designed to help fleet owners monitor, maintain, and optimize their vehicle fleets in real-time.

---

## ✨ Key Features

- **Real-time Fleet Map:** Visualize your entire fleet on an interactive map. Track vehicle locations, status, and driver information instantly.
- **Vehicle Management:** Easily add, edit, and manage vehicle details, including specifications, status (active, maintenance, inactive), and fuel type.
- **Driver Assignment:** Assign drivers to vehicles efficiently. View available drivers and vehicles, manage assignments, and notify drivers automatically.
- **Maintenance Tracking:** Keep a detailed history of vehicle maintenance. Log maintenance type, costs, dates, and service providers. Get alerts for overdue maintenance.
- **Route Planning & Tracking:** Create, assign, and track vehicle routes. Optimize paths and monitor progress against planned routes. _(Future Implementation)_
- **Statistics & Reporting:** Monitor key fleet performance metrics like fuel consumption, maintenance costs, and driver performance via a dedicated dashboard. _(Future Implementation)_
- **Role-Based Access:** Different views and permissions for Administrators and Drivers.

---

## 📸 Screenshots

_Here's a sneak peek of FleetTrack in action!_

**Admin Dashboard:**


![Admin Dashboard](https://github.com/user-attachments/assets/24242749-2b61-4800-b6d4-ca048399cf9b)

**Vehicle Management:**

![Vehicle Management](https://github.com/user-attachments/assets/59928d6f-edf4-45eb-8a75-cfb065fb863e)

**Live Map View:**

![Live Map](https://github.com/user-attachments/assets/fd5f6e7e-d100-4758-91ae-6b7eaf7c317c)

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- Node.js (v16 or newer)
- npm (usually comes with Node.js)
- Git
- A Supabase account and project

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/FleetTrackPigs/fleet-track.git # Replace with your repo URL
    cd fleet-track
    ```

2.  **Setup Backend (`server/`):**

    ```bash
    cd server
    npm install
    cp .env.example .env
    # !!! Important: Edit the .env file with your Supabase URL, anon key, and other secrets !!!
    # Example .env content:
    # SUPABASE_URL=YOUR_SUPABASE_URL
    # SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # PORT=3001 # Or any other port you prefer
    npm run dev # Starts the backend server in development mode
    ```

3.  **Setup Frontend (`client/` or root `/`):**
    (Open a new terminal window or tab in the project root directory)
    ```bash
    # Assuming frontend is in the root directory
    npm install
    cp .env.example .env # If you have frontend-specific env vars
    # !!! Edit .env if needed, e.g., VITE_API_BASE_URL=http://localhost:3001/api !!!
    npm run dev # Starts the frontend development server (usually on port 8080)
    ```

Now you should have the backend running (e.g., on `http://localhost:3001`) and the frontend accessible (e.g., at `http://localhost:8080`).

---

## 🛠️ Building for Production

### Backend

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Run the build command:
    ```bash
    npm run build
    ```
    This will compile the TypeScript code into JavaScript in the `dist` directory.
3.  Start the production server:
    ```bash
    npm start
    ```

### Frontend

1.  Navigate to the root project directory (where the frontend `package.json` is):
    ```bash
    # If you are in the server directory:
    cd ..
    # Or just navigate to the project root
    ```
2.  Run the build command:
    ```bash
    npm run build
    ```
    This will create a `dist` folder in the root directory with the optimized static assets ready for deployment.

---

## 💻 Tech Stack

- **Backend:** Node.js, Express, Supabase (PostgreSQL), TypeScript
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn/ui, React Router, TanStack Query
- **Deployment:** Render.com (Frontend & Backend)

---

<!-- Optional Sections -->
<!--
## Contributing

Contributions are welcome! Please read the CONTRIBUTING.md file for details on our code of conduct, and the process for submitting pull requests.
-->

<!--
## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
-->
