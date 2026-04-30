# 🚀 Deployment Guide: Antigravity Exam Platform (Render)

This guide will help you deploy your full-stack application to **Render**. Since your project is split into `backend` and `frontend`, you will create two separate services.

---

## 1. Deploy the Backend (Web Service)

1.  **Log in to Render**: Go to [dashboard.render.com](https://dashboard.render.com/).
2.  **New Service**: Click **New +** and select **Web Service**.
3.  **Connect Repo**: Connect your GitHub repository (`portal-exam`).
4.  **Configure Service**:
    *   **Name**: `exam-platform-backend`
    *   **Root Directory**: `backend`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Click the **Environment** tab.
    *   Add the following:
        *   `JWT_SECRET`: (Your secret key, e.g., `supersecret_antigravity_2024`)
        *   `PORT`: `10000` (Render's default)
        *   `NODE_ENV`: `production`

> [!IMPORTANT]
> **Persistence Note**: Render's free tier uses an ephemeral filesystem. This means your SQLite database will be **reset** every time the server restarts. For a permanent database, you should either:
> 1. Add a **Render Disk** (Paid feature) to the `backend` service.
> 2. Use a cloud PostgreSQL database like **Neon** or **Supabase** and update `database.js` to connect to it.

---

## 2. Deploy the Frontend (Static Site)

1.  **New Service**: Click **New +** and select **Static Site**.
2.  **Connect Repo**: Select the same GitHub repository.
3.  **Configure Service**:
    *   **Name**: `exam-platform-frontend`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
4.  **Environment Variables**:
    *   Add the following:
        *   `VITE_API_URL`: (The URL of your **Backend Web Service**, e.g., `https://exam-platform-backend.onrender.com/api`)

---

## 3. Configure CORS (Backend)

Once your frontend is deployed, you must allow it to talk to your backend.
1.  Copy your **Frontend URL** (e.g., `https://exam-platform-frontend.onrender.com`).
2.  In your `backend/server.js`, ensure `cors` is configured to allow this origin (or leave it as default to allow all during initial setup).

---

## 4. Final Verification
1.  Wait for both services to show a green **Live** status.
2.  Open your Frontend URL.
3.  Try to sign up/log in to verify the API connection.
