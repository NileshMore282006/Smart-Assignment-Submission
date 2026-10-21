# Smart Assignment Portal — Full-Stack Integration (Phase 4) 🚀

> **Connected React + Vite Frontend & Python Flask REST API with SQLite Persistence**

---

## 📋 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [Windows PowerShell Setup Instructions](#3-windows-powershell-setup-instructions)
4. [Environment Configuration (.env)](#4-environment-configuration-env)
5. [Database Initialization & Seeding](#5-database-initialization--seeding)
6. [Starting the Application (Full Stack)](#6-starting-the-application-full-stack)
7. [Running Automated Tests](#7-running-automated-tests)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Example API Requests & Responses](#9-example-api-requests--responses)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Future AWS Cloud Integration Blueprint](#11-future-aws-cloud-integration-blueprint)

---

## 1. Overview & Architecture

The **Phase 3 Flask Backend** provides the secure API layer, database models, and role-based access controls for the Smart Assignment Portal.

### Key Capabilities:
- **JWT Token Authentication**: Signed `HS256` tokens with configurable expiration, safe claims, and zero sensitive leakage.
- **Strict Role-Based Access Control (RBAC)**: Enforces `student` and `teacher` boundaries via `@token_required` and `@role_required` decorators.
- **Resource Ownership Enforcement**: Teachers can only edit/delete their own coursework; students can only view their own submissions.
- **Public Registration Guard**: Public registration is locked strictly to students; faculty accounts must be created via administrative seeding.
- **Database Engine**: SQLAlchemy ORM with SQLite for development and seamless migration path to PostgreSQL/Aurora.
- **CORS Protection**: Restricted to trusted frontend development origins (`http://localhost:5173`).
- **AWS S3 & Textract Placeholder**: Clean ingestion contracts prepared for future cloud OCR without false claims.

---

## 2. Prerequisites

- **Windows 10 / 11**
- **Python 3.12** (or compatible 3.10+)
- **Windows PowerShell** (or PowerShell Core)

---

## 3. Windows PowerShell Setup Instructions

Open Windows PowerShell and run the following exact commands from the project root:

### Step 1: Navigate to the Backend Directory
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project\backend"
```

### Step 2: Create a Python Virtual Environment
```powershell
python -m venv venv
```

### Step 3: Set Execution Policy & Activate Virtual Environment
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

*(You will observe `(venv)` prefixed on your terminal prompt.)*

### Step 4: Upgrade pip & Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4. Environment Configuration (.env)

Copy the provided `.env.example` to create your local `.env`:

```powershell
Copy-Item .env.example .env
```

The default values inside `backend/.env` are pre-configured for local development:
```ini
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=smart-assignment-portal-insecure-dev-key-phase3
DATABASE_URL=sqlite:///smart_assignment.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_EXPIRATION_HOURS=24
```

---

## 5. Database Initialization & Seeding

Run the following command to create the SQLite schema and seed the initial demonstration accounts:

```powershell
python -c "from app import create_app, seed_database; from extensions import db; app = create_app('development'); app.app_context().push(); db.create_all(); seed_database(); print('Database schema and initial accounts created successfully!')"
```

### Seeded Development Credentials:
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Faculty (Teacher)** | `teacher@demo.com` | `Teacher123!` | Dr. Alan Vance (Faculty Chair) |
| **Student** | `student@demo.com` | `Student123!` | Alex Johnson (6th Sem CSE) |
| **Student** | `priya.s@demo.com` | `Student123!` | Priya Sharma (Database Major) |

---

## 6. Starting the Application (Full Stack)

To run the complete system, use two terminal windows:

### Terminal 1: Backend Server (Port 5000)
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project\backend"
.\venv\Scripts\Activate.ps1
python app.py
```
*Backend will be active at: **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`)*

### Terminal 2: Frontend Server (Port 5173)
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project"
npm run dev
```
*Frontend will be active at: **`http://localhost:5173`***

---

## 7. Running Automated Tests

The backend includes a comprehensive pytest suite (22 automated test cases) utilizing an isolated in-memory SQLite database (`sqlite:///:memory:`):

```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project\backend"
.\venv\Scripts\Activate.ps1
pytest tests -v
```

### Verified Test Coverage:
- `test_health_endpoint`: Verifies HTTP 200 and healthy JSON status.
- `test_student_registration_success`: Confirms user creation, password hashing, and JWT return.
- `test_registration_rejects_duplicate_email`: Confirms duplicate prevention (HTTP 409).
- `test_registration_rejects_teacher_role`: Verifies that public registration cannot self-grant teacher role (HTTP 403).
- `test_registration_rejects_invalid_email`: Enforces email regex format (HTTP 400).
- `test_registration_rejects_short_password`: Enforces minimum 6 characters (HTTP 400).
- `test_login_success` & `test_login_invalid_password`: Confirms password hash verification.
- `test_get_me_authenticated` & `test_unauthenticated_request_rejected`: Confirms token auth guard.
- `test_student_cannot_create_assignment`: Enforces teacher-only assignment creation (HTTP 403).
- `test_teacher_can_create_assignment`: Verifies server-side teacher attribution.
- `test_student_sees_published_assignments_only`: Verifies drafts are hidden from students.
- `test_teacher_cannot_modify_other_teacher_assignment`: Enforces ownership security (HTTP 403).
- `test_teacher_cannot_delete_other_teacher_assignment`: Prevents unauthorized deletion (HTTP 403).
- `test_student_cannot_access_other_student_submission`: Enforces student privacy isolation (HTTP 403).
- `test_submission_rejects_disallowed_extension`: Enforces MIME/extension validation (HTTP 400).

---

## 8. API Endpoints Reference

### Health & Monitoring
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check and status telemetry |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Student only) | Registers a new student account |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token |
| `POST` | `/api/auth/logout` | Authenticated | Clears client session |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated profile |
| `POST` | `/api/auth/forgot-password` | Public | Dispatches simulated password recovery |

### Coursework Assignments (`/api/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Authenticated | List assignments with search, filter, and pagination |
| `GET` | `/api/assignments/<id>` | Authenticated | Retrieve assignment details |
| `POST` | `/api/assignments` | Teacher Only | Create and publish/draft new coursework |
| `PUT` | `/api/assignments/<id>` | Teacher (Owner) | Modify assignment specifications |
| `DELETE`| `/api/assignments/<id>` | Teacher (Owner) | Delete assignment |
| `POST` | `/api/assignments/<id>/duplicate`| Teacher Only | Duplicate an assignment as draft |

### Submissions & Reviews (`/api/submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/submissions` | Authenticated | Scoped submissions list (Student own, Teacher coursework) |
| `GET` | `/api/submissions/<id>` | Authenticated | Retrieve submission details (Strict ownership enforced) |
| `POST` | `/api/submissions/assignments/<id>/submit` | Student Only | Submit coursework record |
| `PUT` | `/api/submissions/<id>/review` | Teacher (Owner) | Update review status and instructor notes |

### Similarity Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | Authenticated | Scoped similarity reports list |
| `GET` | `/api/reports/<id>` | Authenticated | Full similarity report with matched excerpts |
| `GET` | `/api/reports/submission/<id>` | Authenticated | Retrieve report by submission ID |

### Profile & Account (`/api/profile`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Authenticated | Profile details enriched with academic statistics |
| `PUT` | `/api/profile` | Authenticated | Update display name and bio |
| `PUT` | `/api/profile/password` | Authenticated | Change account password |

---

## 9. Example API Requests & Responses

### 1. Register a Student (`POST /api/auth/register`)
**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "Maya Patel",
  "email": "maya.p@university.edu",
  "password": "SecureStudent123!",
  "student_id": "CS-2026-1044",
  "department": "Computer Science & Engineering"
}
```
**Response (201 Created):**
```json
{
  "message": "Student registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "full_name": "Maya Patel",
    "email": "maya.p@university.edu",
    "role": "student",
    "student_id": "CS-2026-1044",
    "department": "Computer Science & Engineering",
    "created_at": "2026-10-21T18:20:00.000000"
  }
}
```

### 2. Login (`POST /api/auth/login`)
**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@demo.com",
  "password": "Teacher123!"
}
```
**Response (200 OK):**
```json
{
  "message": "Welcome back, Dr. Alan Vance",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Dr. Alan Vance",
    "email": "teacher@demo.com",
    "role": "teacher",
    "department": "Department of Computer Science"
  }
}
```

### 3. Create Assignment (`POST /api/assignments`)
**Request:**
```http
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Distributed Consensus & Raft Compaction",
  "subject": "Operating Systems",
  "course_code": "CS-506",
  "description": "Formal evaluation of Raft leader election and snapshot memory layouts.",
  "due_date": "2026-11-25T23:59:00Z",
  "max_marks": 100,
  "allowed_file_types": ["PDF", "DOCX"],
  "max_file_size_mb": 10,
  "status": "published"
}
```
**Response (201 Created):**
```json
{
  "message": "Assignment created successfully",
  "assignment": {
    "id": 4,
    "title": "Distributed Consensus & Raft Compaction",
    "subject": "Operating Systems",
    "course_code": "CS-506",
    "teacher_id": 1,
    "teacher_name": "Dr. Alan Vance",
    "due_date": "2026-11-25T23:59:00",
    "status": "published",
    "submission_count": 0
  }
}
```

---

## 10. Troubleshooting Guide

### 1. PowerShell Script Execution Policy Error:
- **Symptom:** `Activate.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Solution:** Execute:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

### 2. Python PATH or Not Recognized:
- **Symptom:** `The term 'python' is not recognized as the name of a cmdlet.`
- **Solution:** Explicitly invoke the installed Python executable:
  ```powershell
  & "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" -m venv venv
  ```

### 3. Port 5000 Already in Use:
- **Symptom:** `Address already in use` or connection conflicts on port 5000.
- **Solution:** Specify an alternate port when running:
  ```powershell
  $env:PORT=5001; python app.py
  ```
  *(Update `VITE_API_BASE_URL=http://localhost:5001/api` in frontend `.env` accordingly).*

### 4. CORS Errors in Browser Console:
- **Symptom:** `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource.`
- **Solution:** Verify `CORS_ORIGINS` in `backend/.env` includes your exact Vite development server origin:
  ```ini
  CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```

---

## 11. Future AWS Cloud Integration Blueprint

In **Phase 4**, the submission pipeline will be enhanced with Amazon Web Services:
1. **Amazon S3**: Submissions will upload to private S3 buckets (`s3://smart-assignment-portal-submissions/`) using server-side encryption (`aws:kms`).
2. **Amazon Textract**: Asynchronous `StartDocumentTextDetection` jobs will parse PDF pages, tables, and scanned handwritten papers.
3. **Vector Embeddings**: Extracted text chunks will pass to cosine similarity engines to produce detailed document matching reports.
4. **Zero AWS Keys in Frontend**: All AWS credentials remain strictly confidential on the Flask server; client requests authenticate exclusively via JWT.
