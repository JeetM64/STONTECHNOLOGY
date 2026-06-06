# Deployment Steps: Campus Placement Tracking System

This guide outlines the steps to build, configure, and deploy the system in production.

---

## 1. Cloud Database Setup: MongoDB Atlas
Before deploying the application, ensure you have a live database instance:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/).
2. Create a database user with read/write access.
3. Whitelist access from anywhere (`0.0.0.0/0`) under the **Network Access** settings.
4. Copy the connection URI (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/placement?retryWrites=true&w=majority`).

---

## 2. Deploying a Unified App (Single Web Service on Render/Railway)
This is the recommended approach for free-tier services. Express hosts the API and serves the compiled React frontend static build from a single process.

### Environment Variables
Configure the following parameters in your hosting provider's dashboard:
- `PORT` = `5000` (or leave empty if automatically set by the platform)
- `NODE_ENV` = `production`
- `MONGO_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection URI)
- `JWT_SECRET` = `your_long_secure_jwt_token_secret_key`

### Deployment Configurations
- **Build Command**: 
  ```bash
  cd frontend && npm install && npm run build && cd ../backend && npm install
  ```
- **Start Command**:
  ```bash
  cd backend && node server.js
  ```
- **Root Directory**: Leave blank (root of repository).

---

## 3. Decoupled Deploy: Backend on Render/Railway & Frontend on Vercel/Netlify
This approach deploys the API server and frontend SPA separately.

### A. Backend Hosting (Render/Railway)
1. Point the service to the `backend/` folder or the root folder with a custom start command.
2. Set Environment Variables:
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `your_jwt_secret_key`
3. **Build Command**: `npm install` (run in `backend/` folder).
4. **Start Command**: `node server.js`.

### B. Frontend Hosting (Vercel/Netlify)
1. Point Vercel or Netlify to the `frontend/` subdirectory of your repository.
2. Set Environment Variables:
   - `VITE_API_URL` = `https://your-backend-service-url.onrender.com/api` (Point to your deployed backend URL).
3. **Build Command**: `npm run build`.
4. **Output Directory**: `dist`.
5. **Configure Redirect Rules** (To prevent 404 on page refreshes):
   - **For Vercel**: Create a `vercel.json` in `frontend/` directory:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - **For Netlify**: Create a `_redirects` file in `frontend/public/` directory:
     ```text
     /*  /index.html  200
     ```
