# Role-Based Task Management System

A modern, full-stack, role-based Task Management application built using **Spring Boot (Java)** for the backend API and **React.js + Vite** for the frontend UI. It features a complete role-based permission system allowing Administrators to manage tasks/users and Users (Employees) to view and update their assigned tasks.

---

## 🚀 Key Features

### 👤 User Role (Employee)
- **Dashboard**: View all tasks assigned directly to you.
- **Task Progression**: Transition assigned task statuses dynamically through standard workflows: `TODO` ➜ `IN_PROGRESS` ➜ `COMPLETED`.
- **Filtering & Detail View**: View details of tasks assigned to you.

### 🔑 Admin Role
- **Task Management (CRUD)**: Create, read, update, and delete tasks.
- **Task Assignment**: Assign tasks to any registered User from a dynamic dropdown selection.
- **User Management**: View all registered users and delete users if needed.
- **Admin Dashboard**: Comprehensive stats and overview of all tasks.

### 🔒 Core Capabilities
- **Authentication**: Secure JWT (JSON Web Token) authentication.
- **Auto-Logout & Interceptors**: Global Axios interceptors that automatically handle token expiration (401 response redirects to login page) while propagating actions-forbidden errors (403) so they can be handled gracefully via inline notifications.
- **Interactive REST API Docs**: Embedded Swagger / OpenAPI documentation for easy testing.
- **Modern & Responsive UI**: Curated color palette, sleek dark mode layouts, smooth micro-animations, custom status badges, and real-time toast notifications.

---

## 📁 Project Structure

- `backend/` — Spring Boot REST API utilizing Java 17, Hibernate, Spring Security, JWT, and MySQL database integration.
- `frontend/` — Single Page Application (SPA) built using React.js, Vite, Axios, React Router, and Vanilla CSS.

---

## 🛠️ Local Setup Guide

Follow these steps to set up and run both the backend and frontend services locally.

### Prerequisites
Before starting, ensure you have the following installed:
- **Java Development Kit (JDK) 17** or higher
- **Maven**
- **MySQL Server** (running locally)
- **Node.js** (v18+) and **npm**

---

### 1. Backend Setup (Spring Boot + MySQL)

#### A. Database Initialization
1. Log into your MySQL database server:
   ```sql
   mysql -u root -p
   ```
2. Create a database named `task_manager`:
   ```sql
   CREATE DATABASE task_manager;
   ```
3. Create the database user specified in the configuration, or update the config to match your credentials:
   ```sql
   CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON task_manager.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### B. Configuration
The backend looks for environment variables to connect to your database and sign JWT tokens. You can configure these in the `backend/.env` file:
```env
DB_URL=jdbc:mysql://localhost:3306/task_manager
DB_USERNAME=root
DB_PASSWORD=password
JWT_SECRET=key123
JWT_EXPIRATION=86400000
```
*(Hibernate is configured to automatically create and update database tables/schema on startup, so no manual DDL import is necessary).*

#### C. Run the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the application using the Maven wrapper:
   - **On Windows (PowerShell / Command Prompt)**:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **On macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
3. The server starts on port `8080` (context path `/api`). You can view the OpenAPI/Swagger documentation at:
   [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)

---

### 2. Frontend Setup (React.js + Vite)

#### A. Install Dependencies
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install all npm dependencies:
   ```bash
   npm install
   ```

#### B. Run the Development Server
1. Run the local dev server:
   ```bash
   npm run dev
   ```
2. The application will start and run on:
   [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing the Application Flows

To fully test the application features and role authorizations, follow this step-by-step walkthrough:

1. **Open the App**: Navigate to `http://localhost:5173`.
2. **Register an Admin User**:
   - Go to the **Create account** / Register page.
   - Enter details and select **Role: Admin**.
   - Upon successful registration, you will be redirected to the **Admin Dashboard**.
3. **Register a Regular User**:
   - Log out or open an incognito tab.
   - Create another account and select **Role: User**.
4. **Create and Assign Tasks**:
   - Log back in as the **Admin** user.
   - Click **Create New Task** on the dashboard.
   - Fill in the title, description, priority (Low/Medium/High), and select the newly registered **User** from the assignee dropdown list.
5. **Update Task Status**:
   - Log in as the **User** (Employee).
   - You will see the task assigned to you listed under "My Tasks".
   - Select the task status button to update it (e.g., transition `TODO` ➜ `IN_PROGRESS` ➜ `COMPLETED`).
   - Notice that the status updates in-place on your board immediately.
