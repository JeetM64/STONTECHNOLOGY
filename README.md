# Campus Interview Tracking & Result Management System

A robust MERN stack placement automation and analytics platform designed to replace legacy spreadsheets with a centralized recruitment pipeline state machine.

---

## Technical Stack
- **Database**: MongoDB (with Mongoose ODM)
- **Backend**: Node.js & Express.js (REST API, JWT security, error-handling middleware)
- **Frontend**: React.js (Vite, React Router DOM, Axios interceptors)
- **Styling**: Tailwind CSS v3 (Custom color theme & design system)

---

## Database Configuration Instructions

The system is configured to work with either a local MongoDB database or a MongoDB Atlas cloud cluster. Follow these steps to configure a MongoDB Atlas cluster:

1. **Sign Up/Log In**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log into your account.
2. **Create a Database**: Click "Build a Database" and select the Free Shared Tier (M0). Choose your preferred cloud provider and region.
3. **Configure Database User**: Under the **Database Access** tab, create a new database user. Choose "Password" authentication and assign the user "Read and write to any database" privileges.
4. **Configure Network Access**: Under the **Network Access** tab, click "Add IP Address". Choose "Allow Access From Anywhere" (IP `0.0.0.0/0`) for development.
5. **Get Connection String**:
   - Go to the **Database** dashboard tab and click **Connect** next to your cluster.
   - Choose **Connect your application**.
   - Copy the connection string. It will look like:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_placement?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with the credentials of the user created in Step 3.

---

## Setup and Run Instructions

### Prerequisites
- Node.js installed (v18.0.0 or higher recommended)
- MongoDB running locally or an Atlas connection URI

### Installation & Configuration

1. **Configure Environment Variables**:
   Navigate to the `backend/` directory, create a `.env` file, and input the following configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/campus_placement
   JWT_SECRET=supersecretplacementkey123
   ```
   *(Replace `MONGO_URI` with your MongoDB Atlas connection string if running in the cloud).*

2. **Backend Setup**:
   Install all dependencies and start the backend REST API:
   ```bash
   cd backend
   npm install
   npm run dev  # or: node server.js
   ```

3. **Frontend Setup**:
   Open a separate terminal window, navigate to the `frontend/` directory, install packages, and launch the Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Verify Application**:
   Open your browser and navigate to `http://localhost:5173`. If unauthenticated, you will be redirected to the `/login` portal. Create or register an administrator credential in the backend to start tracking placement operations.
