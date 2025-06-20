# MediTrack

## Description

MediTrack is a full-stack web application designed to manage medical appointments, patient information, and other healthcare-related functionalities. It provides user authentication, patient and doctor dashboards, appointment booking, and a feedback mechanism. The application utilizes a React frontend with TypeScript and Tailwind CSS for a modern user interface, and a FastAPI backend with Python for robust API functionality and data management. Data persistence is achieved using a SQLite database.

## Features

*   User authentication (registration and login)
*   Patient and Doctor dashboards
*   Appointment booking and management
*   Feedback mechanism
*   Theming (ThemeContext)
*   API interactions
*   Data persistence using SQLite database
*   Role-based access control (implied by Patient and Doctor dashboards)

## Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/SaiPavankumar22/MediTrack.git
    cd MediTrack
    ```

2.  **Install backend dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ./
    npm install
    ```

## Usage

1.  **Run the Backend (FastAPI):**

    ```bash
    uvicorn app:app --reload
    ```
    This command starts the FastAPI backend server, typically accessible at `http://127.0.0.1:8000`.

2.  **Run the Frontend (React):**

    ```bash
    npm run dev
    ```
    This command starts the React development server, usually at `http://localhost:5173`.

3.  **Access the Application:**

    Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`). You can then register or log in to access the application's features.

## Tech Stack and Dependencies

*   **Frontend:**
    *   React
    *   TypeScript
    *   React Router DOM
    *   Lucide React (icons)
    *   Tailwind CSS
    *   Vite (build tool)
    *   ESLint, Autoprefixer

*   **Backend:**
    *   FastAPI (web framework)
    *   SQLAlchemy (ORM)
    *   uvicorn (ASGI server)
    *   Passlib (password hashing)
    *   python-jose (JWT)
    *   python-multipart
    *   email-validator

*   **Database:**
    *   SQLite (meditrack.db)

## Project Structure Overview

```
MediTrack/
├── src/
│   ├── contexts/         # Contexts for Auth and Theme
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/             # API interaction functions
│   │   └── api.ts
│   ├── components/       # React components for UI
│   │   ├── FeedbackModal.tsx
│   │   ├── AppointmentStatusModal.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── LandingPage.tsx
│   │   ├── FeedbackForm.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── AppointmentBookingForm.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── Layout.tsx
│   │   ├── LoginPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── RegisterPage.tsx
│   ├── types/             # Typescript type definitions
│   │   └── index.ts
│   ├── vite-env.d.ts
│   ├── index.css          # Global styles
│   ├── main.tsx           # React app entry point
│   └── App.tsx            # Root React component
├── app.py                 # FastAPI backend
├── index.html             # Main HTML file
├── package.json           # Frontend dependencies and scripts
├── package-lock.json
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts       # Vite configuration
├── eslint.config.js
├── requirements.txt       # Backend dependencies
├── meditrack.db           # SQLite database
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE)