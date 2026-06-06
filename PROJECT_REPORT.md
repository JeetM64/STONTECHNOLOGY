# Project Report: Campus Interview Tracking & Result Management System

## Project Overview

Placement cells have historically relied on shared spreadsheets to manage student coordinates, company recruitment workflows, and interview progression. This decentralized spreadsheet approach introduces key drawbacks:
- Lack of data integrity, validation, and authorization access.
- Conflicted parallel edits during real-time placement drives.
- Out-of-sync calculations of placement statistics.

This system resolves these deficiencies by introducing a centralized, secure MERN application featuring a transactional state machine engine. Placement officers use it to register candidates, construct specific sequences of recruitment workflows, track students as they advance through rounds, and display analytics from a single database.

---

## System Design

The application utilizes a decoupled, single-page application (SPA) architecture:

```
[ Frontend: React SPA ] ---> [ API Services (Axios Interceptor) ] ---> [ Protected REST API: Express ] ---> [ Database: MongoDB Atlas ]
```

### 1. Architectural Layers
- **Client (Frontend)**: React client compiled via Vite. Implements JWT authentication context (`AuthContext`) and handles route protection (`ProtectedRoute`) inside a left-sidebar shell (`Layout`). Communicates with backend endpoints using a pre-configured Axios wrapper.
- **Server (Backend)**: Express REST API secured via JWT authentication middleware. Incorporates custom database models and handles client requests inside centralized controllers. Errors are captured and structured by centralized error-handling middleware.
- **Storage (Database)**: MongoDB Atlas cluster executing transactional queries.

### 2. Database Design Details
The database schema consists of four primary Mongoose collections:

#### User Collection (`users`)
Stores administrator credentials for placement officers:
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, bcrypt-hashed)

#### Student Collection (`students`)
Stores candidate profiles:
- `rollNumber` (String, required, unique)
- `name` (String, required)
- `email` (String, required)
- `branch` (String, required)
- `cgpa` (Number, required, range `0 <= CGPA <= 10`)
- `resumeUrl` (String, optional)

#### Company Collection (`companies`)
Defines hiring workflows:
- `name` (String, required, unique)
- `rounds` (Array of Strings, required, ordered sequence)

#### Application Collection (`applications`)
Centralizes candidate progression logs:
- `student` (ObjectId, ref: `Student`, required)
- `company` (ObjectId, ref: `Company`, required)
- `currentRoundIndex` (Number, defaults to `0`)
- `status` (String, enum: `["Pending", "Passed", "Failed", "Offered"]`, defaults to `Pending`)
- `history` (Array of nested Subdocuments):
  - `roundName` (String, required)
  - `attendanceStatus` (String, enum: `["Present", "Absent", "Pending"]`, defaults to `Pending`)
  - `roundStatus` (String, enum: `["Passed", "Failed", "Pending"]`, defaults to `Pending`)
  - `marks` (Number, optional)
  - `remarks` (String, optional)

---

## Features Implemented

1. **Student Directory**: Interactive list of student profiles. Supports real-time debounced searching by name or roll number. Incorporates modal forms to register and update student details, and inline delete buttons.
2. **Company Directory & Workflow Builder**: Interface allowing officers to input company names and build ordered recruitment round sequences dynamically (e.g. `Aptitude -> Technical 1 -> HR`). Displays registered companies and their round badges.
3. **State-Machine Pipeline Board**: Enrollment selector (Student + Company) to register candidates. Renders active candidate drive logs in a central progress tracking table with status tags. Visualizes candidate status per round via colored badge steppers.
4. **Interactive Round Updates**: A modal form enabling officers to select candidate attendance (`Present`/`Absent`), round result (`Passed`/`Failed`), marks, and remarks. Submitting updates triggers state changes on the backend.
5. **Dashboard Analytics via MongoDB `$facet`**: Queries placements metrics on page load. A single aggregate pipeline uses `$facet` to simultaneously calculate:
   - Total Placed (`status: 'Offered'`)
   - Ongoing Candidates (`status: 'Pending'`)
   - Rejections (`status: 'Failed'`)
   - Placement selection ratio
   - Company-wise placement totals (`$lookup` against `companies` collection)

---

## Assumptions & Business Rules

The backend state machine maintains strict validation checks to guarantee database consistency:

- **Rule A (Cascading Rejections)**: If a student is marked as `Absent` or their round status is updated to `Failed` in any round, the current round record is saved as `Failed`, and the parent application status is set to `Failed`. The application is transitioned to a terminal state.
- **Rule B (Advancement & Offers)**: If a student passes a round:
  - If the current round index matches the final index of the company's rounds array, the student's overall status is updated to `Offered`.
  - If additional rounds remain in the company's workflow, the `currentRoundIndex` is incremented by 1, and a new round record is appended to the application's `history` subdocument array with a `Pending` state.
- **Double Enrollment Guard**: A student cannot be enrolled in a company's recruitment drive more than once.
- **Immutable States**: Once an application reaches a terminal state (`Offered` or `Failed`), it cannot be updated.

---

## Technical Challenges Faced & Resolutions

### Windows Terminal Environment & Command Execution
- *Challenge*: Attempting to execute sequential commands using standard Linux separators (`&&`) failed in Windows PowerShell, which treats `&&` as an invalid operator. This caused installation scripts to fail during dependency setups.
- *Resolution*: We adjusted target commands to use the semicolon `;` statement separator, which is compatible with Windows PowerShell, allowing operations like package installations (`npm install ...; npm install ...`) to run smoothly in a single task execution step.

### ES Modules Scope Limits in Vite Scaffolding
- *Challenge*: Vite's modern React scaffolding defaults `"type": "module"` in `package.json`, causing the Tailwind and PostCSS configuration files to fail compilation. The common imports threw a `ReferenceError: module is not defined in ES module scope` error when running builds.
- *Resolution*: We resolved this compile issue by renaming the files to [tailwind.config.cjs](file:///c:/Users/jeetm/OneDrive/Documents/Desktop/STONTECHNOLOGY/frontend/tailwind.config.cjs) and [postcss.config.cjs](file:///c:/Users/jeetm/OneDrive/Documents/Desktop/STONTECHNOLOGY/frontend/postcss.config.cjs) and writing them using CommonJS scope standards. This allowed the Vite build process to process Tailwind utility classes correctly.
