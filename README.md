# ALL EXAM - Sarkari Exam Portal

A comprehensive full-stack web application for tracking and managing **Sarkari Exams, Results, Admit Cards, Syllabus, and Sarkari Yojana Schemes**. The application is built with a **React (TypeScript) + Vite** frontend and an **Express (TypeScript)** backend proxy server, using **MongoDB** for database persistence and the **Gemini API** for automated/assisted scheme and post-processing features.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Local Installation](#local-installation)
4. [Environment Variables Setup](#environment-variables-setup)
5. [MongoDB Setup](#mongodb-setup)
6. [Commands to Run the App](#commands-to-run-the-app)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

Ensure you have the following installed on your machine before setting up:
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or higher)
- **MongoDB** (A local MongoDB Community Server instance OR a free MongoDB Atlas Cloud cluster)

---

## Project Structure

This project follows a standard, clean, full-stack monorepo-style setup within a unified TypeScript codebase:

```text
├── .env.example          # Template for local environment variables
├── .gitignore            # Files/folders ignored in git tracking
├── index.html            # Main HTML entrypoint for the SPA
├── package.json          # Dependencies, scripts, and build tasks
├── server.ts             # Express server (serves API endpoints and proxies Vite in dev)
├── tsconfig.json         # TypeScript compiler configuration
├── vite.config.ts        # Vite configuration (with Tailwind CSS plugin)
├── public/               # Static assets (favicons, manifests, etc.)
│   └── manifest.json
├── uploads/              # Local server storage for uploaded PDFs and images
└── src/                  # Client-side React application
    ├── App.tsx           # Main App and client-side routing setup
    ├── constants.ts      # Global application constants (states, qualifications, etc.)
    ├── index.css         # Tailwind global styles
    ├── main.tsx          # React entrypoint
    ├── types.ts          # TypeScript shared interface types
    └── components/       # Reusable React UI views and manager panels
        ├── AdminPanel.tsx            # Full admin control board
        ├── SarkariYojanaManager.tsx  # Sarkari Yojana schemes supervisor
        ├── SarkariYojanaTemplate.tsx # Sarkari Yojana detail template renderer
        ├── Home.tsx                  # Home dashboard with tabs and categories
        ├── Navbar.tsx                # Dynamic top navigation header
        ├── Footer.tsx                # Global portal footer with quick links
        ├── PostDetail.tsx            # Main post detail visualizer
        ├── SEO.tsx                   # Search Engine Optimization helper
        ├── ... (other page templates such as Privacy, Terms, Disclaimer, Contact, About)
```

---

## Local Installation

Follow these steps to set up the project locally:

1. **Extract the Project ZIP**:
   Extract the downloaded ZIP package and open the folder in your terminal or VS Code.

2. **Install Dependencies**:
   Run the following command to download and install all the frontend and backend dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables Setup

The application uses an `.env` file to manage sensitive keys and configurations.

1. **Copy the Template**:
   ```bash
   cp .env.example .env
   ```
2. **Configure your Variables** inside `.env`:
   - `GEMINI_API_KEY`: Your Google Gemini API key (for intelligent AI features).
   - `APP_URL`: The base URL where the local app runs (e.g., `http://localhost:3000`).
   - `MONGODB_URI`: The connection string for your MongoDB database (see [MongoDB Setup](#mongodb-setup) below).
   - `JWT_SECRET`: A secure, secret key used to sign and verify administrative JWT session tokens.
   - `ADMIN_PASSWORD`: A secure password for the Admin Panel.
   - `PORT`: The local port the Express server will listen on (default is `3000`).

---

## MongoDB Setup

This application requires a running MongoDB database. You can configure it using **MongoDB Atlas (Cloud)** or a **Local MongoDB Server**:

### Option A: Using MongoDB Atlas (Recommended & Easiest)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Build a new free cluster (M0) in any cloud region.
3. Under **Database Access**, create a user (e.g., `dbUser`) with read and write permissions.
4. Under **Network Access**, add IP address `0.0.0.0/0` to allow local access from your machine.
5. In your cluster dashboard, click **Connect** -> **Drivers**, select **Node.js**, and copy the connection string.
6. Paste the connection string into your `.env` file for the `MONGODB_URI` variable:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/allexam?retryWrites=true&w=majority"
   ```

### Option B: Using a Local MongoDB Server
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community) for your operating system.
2. Start the local MongoDB service on your machine (it usually runs on `mongodb://localhost:27017`).
3. Set your connection string in the `.env` file:
   ```env
   MONGODB_URI="mongodb://localhost:27017/allexam"
   ```

---

## Commands to Run the App

All commands are defined as npm scripts inside `package.json`.

### 1. Run in Development Mode (Concurrently)
This starts both the Express server and mounts the Vite middleware on a single port (`3000`), allowing you to develop with Hot Module Replacement and live APIs synchronously:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

### 2. Build for Production
This builds the React static files inside `/dist`, and bundles/transpiles the Express backend `server.ts` into an optimized Node-executable CommonJS package at `/dist/server.cjs`:
```bash
npm run build
```

### 3. Run the Production Server
Start the compiled production bundle directly using Node.js:
```bash
npm run start
```

### 4. Code Quality and Type Checking
Run the TypeScript compiler without emitting files to check for potential type mismatches or syntax errors:
```bash
npm run lint
```

---

## Production Deployment

This project is fully container-ready and optimized for modern cloud hosting environments (such as Docker, Google Cloud Run, AWS App Runner, Heroku, or Render):
- During `npm run build`, Vite produces static assets while `esbuild` compiles a single production-ready `dist/server.cjs` server bundle.
- Ensure that you configure the environment variables on your cloud hosting panel, pointing `MONGODB_URI` to a secure production database.
