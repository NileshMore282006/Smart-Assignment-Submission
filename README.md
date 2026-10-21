# Smart Assignment Portal 🎓

> **Submit. Compare. Learn.**  
> A modern, responsive academic SaaS platform designed for college students and faculty educators to administer coursework, submit academic papers, and evaluate document similarity reports with Amazon Textract and AWS S3 cloud readiness.

---

## 🌟 Overview & Key Capabilities

**Smart Assignment Portal** is a frontend application engineered for higher education institutions. It provides a two-sided academic portal with role-based governance:

### For Students:
- **Academic Dashboard**: Instant overview of assigned coursework, submission deadlines, pending items, and personal average similarity index.
- **Assignment Directory**: Search, filter by subject, and sort problem sets across academic courses.
- **Interactive Document Submissions**: Drag-and-drop submission interface supporting PDF, DOCX, TXT, PNG, and JPG files with client-side file size and MIME-type validation.
- **Real-Time OCR Progress**: Visual simulation of document ingestion and OCR pipeline processing.
- **Detailed Similarity Reports**: In-depth text comparison displaying side-by-side matching passages, source attribution links, Textract OCR confidence, and neutral academic evaluation disclaimers.

### For Teachers & Faculty:
- **Faculty Command Center**: Real-time throughput area charts, cohort similarity distribution graphs (via Recharts), and pending submission queues.
- **Assignment Creator & Lifecycle Manager**: Form for configuring titles, subjects, detailed rubrics, deadlines, allowed extensions, and maximum file sizes, with support for drafting, publishing, duplicating, and archiving.
- **Cohort Submissions Management**: Filter submissions across courses, audit OCR statuses, review matching scores, and leave instructor evaluation notes.
- **Similarity Adjudication**: Dedicated triage dashboard to flag documents requiring human academic integrity review.

---

## 🚀 Full-Stack Quick Start Guide (Phase 4 Integration)

The application features full end-to-end integration between the React frontend and Flask REST backend.

### Prerequisites
- **Node.js** (v18.0.0 or later) & **npm**
- **Python 3.12** (or compatible 3.10+)
- **Windows PowerShell**

---

### Step 1: Start the Flask Backend (Terminal 1)
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project\backend"

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# (Optional) Seed initial demo accounts if not already initialized
flask seed-demo

# Launch the Flask server (runs at http://127.0.0.1:5000)
python app.py
```

### Step 2: Start the React Frontend (Terminal 2)
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project"

# Launch the Vite development server (runs at http://localhost:5173)
npm run dev
```

### Step 3: Run Automated Backend Tests
```powershell
cd "c:\Users\Nilesh More\OneDrive\文档\Cloud project\backend"
.\venv\Scripts\pytest.exe -v
```

---

## 🔐 Demo Accounts & Credentials

The SQLite database and portal are seeded with academic test accounts:

| Role | Email Address | Password | Name & Designation |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@demo.com` | `Teacher123!` | Dr. Alan Vance (Faculty Chair) |
| **Student** | `student@demo.com` | `Student123!` | Alex Johnson (6th Sem CSE) |
| **Student** | `priya.s@demo.com` | `Student123!` | Priya Sharma (Junior CSE) |

> **Authentication Architecture:** Authentication is managed via cryptographically signed JWT Bearer tokens issued by `/api/auth/login`. On application reload, the session is verified with `/api/auth/me`. Public registration (`/api/auth/register`) enforces the `student` role; faculty accounts can only be provisioned by institutional administrators.

---

## 🛠 Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/) (Route guards, nested layouts, role-based navigation)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - *Primary Theme*: Royal Blue (`#2563EB`)
  - *Sidebar Theme*: Deep Navy (`#0F172A`)
  - *Background*: Soft Gray (`#F8FAFC`)
  - *Typography*: Inter (Google Fonts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/) (Area Chart, Bar Chart)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Persistence**: Browser `localStorage` with initial factory seed data and reset capability

---

## 📂 Project Structure

```
├── index.html                   # HTML entry point with Inter font & SEO tags
├── package.json                 # Project dependencies & build scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Custom color palette & design tokens
├── vite.config.js               # Vite bundler & path alias configuration
├── src/
│   ├── main.jsx                 # Application DOM mount
│   ├── App.jsx                  # React Router routes & authentication guards
│   ├── index.css                # Tailwind base styles, custom scrollbars & print layout
│   ├── context/
│   │   ├── AuthContext.jsx      # Role state, demo login/logout & 1-click role switcher
│   │   └── DataContext.jsx      # Reactive data state synchronized with localStorage
│   ├── data/
│   │   └── mockData.js          # Realistic seed data (Assignments, Submissions, Reports)
│   ├── services/
│   │   └── api.js               # Centralized API service with Flask REST hooks
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.jsx            # User initials / image with role indicator ring
│   │   │   ├── ConfirmationDialog.jsx# Accessible confirmation modal
│   │   │   ├── EmptyState.jsx        # Illustrated empty states
│   │   │   ├── ErrorState.jsx        # Error fallback with retry action
│   │   │   ├── FileUpload.jsx        # Drag-and-drop zone with progress simulation
│   │   │   ├── FilterDropdown.jsx    # Accessible dropdown filter
│   │   │   ├── LoadingSkeleton.jsx   # Card and table loading skeletons
│   │   │   ├── PageHeader.jsx        # Title, subtitle, badge & contextual buttons
│   │   │   ├── Pagination.jsx        # Multi-page data table navigation
│   │   │   ├── ProtectedRoute.jsx    # Session authentication guard
│   │   │   ├── RoleGuard.jsx         # Role-based authorization guard
│   │   │   ├── SearchInput.jsx       # Search input with clear button
│   │   │   ├── SimilarityScore.jsx   # Circular score gauge with category badge
│   │   │   └── StatusBadge.jsx       # Semantic color-coded badges
│   │   └── layout/
│   │       ├── AppLayout.jsx         # Authenticated shell (Sidebar + Topbar + Content)
│   │       ├── Sidebar.jsx           # Collapsible desktop & mobile drawer navigation
│   │       └── Topbar.jsx            # Search, unread notifications & profile menu
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.jsx         # Split-screen branded login
│       │   ├── RegisterPage.jsx      # Student registration
│       │   └── ForgotPasswordPage.jsx# Simulated password recovery
│       ├── student/
│       │   ├── StudentDashboard.jsx  # Student metrics, deadlines & quick actions
│       │   ├── StudentAssignmentsPage.jsx # Coursework list & filter system
│       │   ├── AssignmentDetailsPage.jsx  # Rubrics, download demo & submission tab
│       │   ├── AssignmentSubmissionPage.jsx# Drag-and-drop file upload
│       │   ├── MySubmissionsPage.jsx # Student submission history & details
│       │   └── StudentReportsPage.jsx# Student similarity report list
│       ├── teacher/
│       │   ├── TeacherDashboard.jsx  # Recharts activity & similarity distribution
│       │   ├── CreateAssignmentPage.jsx# Assignment creation form
│       │   ├── ManageAssignmentsPage.jsx# Assignment lifecycle management
│       │   ├── AllSubmissionsPage.jsx# Student papers review & status triage
│       │   └── TeacherReportsPage.jsx# Similarity report audit table
│       └── shared/
│           ├── SimilarityReportView.jsx# Side-by-side passage comparison & print view
│           ├── ProfileSettingsPage.jsx # Profile edit, security, & Reset Demo Data
│           └── NotFoundPage.jsx      # 404 handler
```

---

## ☁️ Future Backend & Cloud Architecture Blueprint

This frontend is organized so it can be connected to a Python Flask REST API without rewriting the UI components.

### Planned Ingestion Pipeline:
```
[Student Browser] 
      │  (POST /api/v1/submissions with multipart/form-data)
      ▼
[Python Flask REST API] ─── Server-side MIME & Size Validation
      │
      ├──▶ [Amazon S3] ────── Encrypted Document Storage (Bucket: `academic-submissions`)
      │
      └──▶ [Amazon Textract]  Asynchronous OCR (StartDocumentTextDetection)
                  │
                  ▼
         [Extracted Text Blocks & Paragraphs]
                  │
                  ▼
         [Vector Similarity Engine / PyTorch Embedding Model]
                  │
                  ▼
         [PostgreSQL Database] ── Stores matched passages, URLs, and similarity %
                  │
                  ▼
[Teacher Portal Audit] ────── Reviewed & Approved by Faculty
```

### Switching to the Flask Backend:
1. In your `.env` or `.env.local` file, specify:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
2. The service abstraction in `src/services/api.js` will automatically switch from the `localStorage` mock adapter to actual HTTP `fetch`/`axios` requests against the Flask endpoints.

---

## ⚖️ Academic Integrity Statement

> **Similarity indicates matching text, not a confirmed plagiarism finding. All matches require human review.**  
> The Smart Assignment Portal uses neutral terminology (e.g. *Low Similarity*, *Moderate Similarity*, *Flagged for Review*) to support objective academic evaluation by professors and teaching assistants.
