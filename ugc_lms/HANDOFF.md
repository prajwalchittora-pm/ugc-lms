# UGC LMS — Developer Handoff Document

> **Last updated:** 13 June 2026 (Programmes edit/delete, Faculty page, Gradebook accordion, Students UX)
> **Status:** Production frontend prototype — all UI complete, mock data throughout
> **Your job:** Replace mock data with API calls. The UI is final.

---

## Quick Start

```bash
npm install
npm run dev        # runs on port 3004
npm run build      # 36 static routes, zero errors
```

**Stack:** Next.js 16.2.7, React 18, TypeScript 5.5, inline styles (no CSS modules), Lucide icons, Bricolage Grotesque + Inter fonts.

---

## 1. Architecture Overview

### Four roles, one codebase

| Role | Base Route | Sidenav | Tabs |
|------|-----------|---------|------|
| **Learner** | `/` | `SideNav.tsx` | Dashboard, Learn, Calendar, E-Library, Exam, Forum, Grades, Announcements, Tickets |
| **Coordinator** | `/coordinator` | `CoordinatorSideNav.tsx` | Home, Programmes, Students, **Faculty**, Grading, Gradebook, Attendance, Exams, Schedule, Reports, Announcements, Forums |
| **Faculty** | `/faculty` | `FacultySideNav.tsx` | Home, My Programmes, Students, Grading, Gradebook, Attendance, Exams, Schedule, Reports, Announcements, Forums |
| **Mentor** | `/mentor` | `MentorSideNav.tsx` | Home, My Mentees, Counselling, Escalations, Announcements, Forums |

### Faculty = Coordinator (scoped)

Faculty and Coordinator share **identical UI**. The only differences:
- Sidenav label: "Programmes" (coordinator) vs "My Programmes" (faculty)
- Data scope: coordinator sees all programmes, faculty sees only enrolled ones

**10 faculty pages directly import coordinator components:**

| Faculty Page | Imports From |
|---|---|
| `/faculty/courses` | `CoursesView` |
| `/faculty/students` | `StudentsView` |
| `/faculty/grading` | `GradingView` |
| `/faculty/gradebook` | `GradebookView` |
| `/faculty/attendance` | `AttendanceView` |
| `/faculty/exams` | `ExamsView` |
| `/faculty/schedule` | `ScheduleView` |
| `/faculty/reports` | `ReportsView` |
| `/faculty/announcements` | `AnnouncementsView` |
| `/faculty/forums` | `ForumsView` |

**When wiring APIs:** Add a `role` prop to these shared components. Use it to:
- Filter data (faculty sees only their courses/programmes)
- Hide coordinator-only actions (create programme, delete student, configure grade scale, manage eligibility overrides)
- Change labels where needed

### Mentor is unique

Mentor has 3 components not shared with any other role:
- `MenteesView` — assigned students with engagement tracking
- `CounsellingView` — session scheduling, notes, action items
- `EscalationsView` — raise concerns to coordinator

Mentor reuses `AnnouncementsView` and `ForumsView` from coordinator (scoped to mentees only when APIs are wired).

---

## 2. Route Map (36 routes)

### Learner (9 routes)
```
/                    → HomeScreen
/learn               → CourseList + CourseView
/calendar            → CalendarView
/elibrary            → ComingSoon
/exam                → ExamView
/forum               → ForumView
/grades              → GradesView
/announcements       → AnnouncementsView (learner)
/tickets             → ComingSoon
```

### Coordinator (14 routes)
```
/coordinator              → Dashboard (userName="Dr. Sharma")
/coordinator/courses      → CoursesView (3-level: Programme List → Detail → CourseEditor)
/coordinator/students     → StudentsView (list + Student 360 view)
/coordinator/faculty      → FacultyView (faculty + mentor management, 4-status system)
/coordinator/grading      → GradingView (submissions + plagiarism + feedback)
/coordinator/gradebook    → GradebookView (grade scale + SGPA/CGPA + analytics)
/coordinator/attendance   → AttendanceView (auto-marked + overrides)
/coordinator/exams        → ExamsView (schedule + eligibility + results)
/coordinator/schedule     → ScheduleView (unified timeline)
/coordinator/reports      → ReportsView (engagement + exam summary)
/coordinator/announcements → AnnouncementsView
/coordinator/forums       → ForumsView
```

### Faculty (11 routes)
```
/faculty                  → Dashboard (userName="Prof. Raghav Iyer")
/faculty/courses          → CoursesView (same component, scoped data)
/faculty/students         → StudentsView
/faculty/grading          → GradingView
/faculty/gradebook        → GradebookView
/faculty/attendance       → AttendanceView
/faculty/exams            → ExamsView
/faculty/schedule         → ScheduleView
/faculty/reports          → ReportsView
/faculty/announcements    → AnnouncementsView
/faculty/forums           → ForumsView
```

### Mentor (6 routes)
```
/mentor                   → MentorDashboard
/mentor/mentees           → MenteesView
/mentor/counselling       → CounsellingView
/mentor/escalations       → EscalationsView
/mentor/announcements     → AnnouncementsView
/mentor/forums            → ForumsView
```

---

## 3. Design System

### Fonts
- **Display:** `Bricolage Grotesque` (var(--font-display)) — headings, titles, card headers
- **Body:** `Inter` (var(--font-sans)) — all body text, labels, buttons
- **Mono:** `ui-monospace` (var(--font-mono)) — numbers, codes, roll numbers, dates

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--blue-700` | `#072FB5` | Primary action, links, active states |
| `--fmc-orange` | `#FF6A00` | Brand accent (learner only) |
| `--text-primary` | `#343434` | Main text |
| `--text-secondary` | `#4A4A4A` | Supporting text |
| `--text-tertiary` | `#747474` | Muted text, labels |
| `--border-subtle` | Defined in CSS | All borders |
| `--bg-section` | `#F8F5F1` | Section backgrounds |
| `--bg-page` | Warm beige | Page background |

### Status Colors (used consistently everywhere)
| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#059669` | Present, Eligible, Passed, On Track, Published |
| Amber | `#D97706` | At Risk, Pending, Exemption Requested, Overdue |
| Red | `#DC2626` | Critical, Failed, Absent, Debarred, Ineligible |
| Blue | `#072FB5` | New, Active, Primary actions |
| Purple | `#7C3AED` | Quiz type |
| Brown | `#8F3B00` | Assignment type |

### Radius
```
--radius-xs: 4px   (badges, small pills)
--radius-sm: 8px   (buttons, inputs, cards)
--radius-md: 12px  (main cards, tables)
```

### Select Dropdown Styling
All `<select>` elements use custom arrow styling:
```tsx
appearance: 'none',
WebkitAppearance: 'none',
backgroundImage: `url("data:image/svg+xml,...")`,  // SVG chevron
backgroundRepeat: 'no-repeat',
backgroundPosition: 'right 10px center',
paddingRight: '28px',
```

---

## 4. Business Logic by Feature

### 4.1 Programmes (CoursesView.tsx)

**3-level drill-down:**
1. **Programme List** — table of all programmes (MBA-26, BCA-26, etc.) with type, status, timeline, semesters, student count
2. **Programme Detail** — 3 section tabs:
   - **Courses:** semester sub-tabs, 3-column course card grid with quadrant counts, hide/show, lock/unlock with 6 condition types, multi-select bulk actions, drag-to-reorder
   - **Students:** enrolled student table, add students (search existing + CSV bulk upload)
   - **Faculty & Mentors:** faculty assignment with course pills, mentor list with UGC 1:250 ratio
3. **Course Editor** — WYSIWYG editor with unit/quadrant/activity hierarchy, edit mode toggle, select mode for bulk actions

**Lock conditions (6 types):**
1. Manual lock/unlock
2. Previous course completion required
3. All previous courses complete
4. Start date unlock
5. End date lock
6. 75% engagement threshold

**API integration points:**
- `GET /programmes` — programme list
- `GET /programmes/:id/courses` — courses per semester
- `POST /programmes` — create programme
- `PUT /programmes/:id` — edit programme (name, code, type, semesters, credits, dates)
- `DELETE /programmes/:id` — delete programme
- `PUT /courses/:id/visibility` — hide/show
- `PUT /courses/:id/lock` — lock with conditions
- `POST /programmes/:id/students` — enroll students
- `POST /programmes/:id/students/bulk` — CSV upload

### 4.2 Students (StudentsView.tsx)

**Student List:**
- 14 mock students (2 with `rollNo: null` → shown as "Not Enrolled" amber badge — roll number is assigned at enrolment)
- Search by name, email, or roll number (null-safe: `s.rollNo ?? ''`)
- Status filter only (no programme filter dropdown — removed)
- Multi-select with checkboxes for bulk delete
- Create Student modal with UGC fields: username, name, email, phone, password, roll number, DEB ID, Aadhaar
- **Bulk Upload modal** — 4-stage state machine:
  1. `idle` — CSV drop zone with drag-over highlight, format reference, Download Template link
  2. `file_selected` — green border, file name shown, "Upload & Create" button enabled
  3. `processing` — spinner animation (1800ms simulated delay)
  4. `results` — summary pills (Created / Failed / Total), filter tabs (All / Created / Failed), scrollable results table with per-row status icon and error reason

**Student 360 View (StudentDetail):**
- **Left sidebar (260px, sticky):** Avatar + name (horizontal), last login (ago + date), last active (ago + date), gender, email + copy, phone + copy, programme card with credits, verification status (Aadhaar/Photo/DEB ID/Govt ID), suspend/delete actions
- **6 tabs:**
  1. **Snapshot:** CGPA dark card (constant) + semester card (SGPA, Engagement, Eligibility + override), exam performance table
  2. **Activity Feed:** 9 event types with dark badges, type filter dropdown, time range segmented control, custom DateRangePicker, comment blocks for forum/feedback
  3. **Assignments:** table with status/grades
  4. **Quizzes:** table with scores/time
  5. **Live Sessions:** table with attendance/duration
  6. **Tickets:** timeline with status

**Profile extras data** is in `STUDENT_PROFILE_EXTRAS` map (gender, lastLoginAgo, lastActiveDate per student).

**API integration points:**
- `GET /students` — student list
- `GET /students/:id` — full student profile
- `GET /students/:id/activity` — activity feed
- `POST /students` — create student
- `DELETE /students/:id` — delete student
- `PUT /students/:id/status` — suspend/activate

### 4.3 Grading (GradingView.tsx)

**Submission queue with 4 statuses:** New, Pending, Overdue, Graded

**List view:**
- 4 clickable status count cards (filter on click)
- Programme + course dropdowns, search
- Table: student, submission title + type, course, submitted time, plagiarism %, status, grade

**Detail view (click any submission):**
- Left panel: submission header, document preview area, existing feedback
- Right sidebar:
  - **Plagiarism check:** circular score (green <=15%, amber 16-30%, red >30%), "View Full Report" link to external plagiarism service
  - **Grade form:** marks input (out of maxMarks), feedback textarea, "Submit Grade" + "Request Resubmission" buttons

**Business rules:**
- Plagiarism <=15% = "Low similarity, within acceptable range"
- Plagiarism 16-30% = "Moderate similarity, review recommended"
- Plagiarism >30% = "High similarity, requires investigation"
- Quizzes show "N/A" for plagiarism (auto-graded)

**API integration points:**
- `GET /submissions?status=new&programme=MBA-26` — filtered list
- `GET /submissions/:id` — submission detail + file
- `GET /submissions/:id/plagiarism` — plagiarism report
- `PUT /submissions/:id/grade` — submit grade + feedback
- `PUT /submissions/:id/resubmit` — request resubmission

### 4.4 Gradebook (GradebookView.tsx)

**3 tabs:**

**Student Grades (default):**
- Programme selector, semester pills
- Table: students x courses with grade badges (color-coded O/A+/A/B+/B/C/F) + total marks
- Hover tooltip: internal/external breakdown
- SGPA/CGPA columns (green >=8, red <6)
- Failed rows highlighted red
- Grade release toggle (Published/Not Published)
- Export button

**Configuration:**
- **Grade Scale Editor:** UGC CBCS 10-point scale, editable (min%, max%, points), "Reset to UGC Default"
- **Assessment Weightage:** slider for Internal/External split (default 25/75), visual bar
- **Credit Structure:** per-course credit listing
- **SGPA Formula:** mathematical notation card

**Analytics:**
- 4 summary cards (Total Students, Pass Rate, Avg SGPA, Topper)
- Grade distribution horizontal bars
- Course performance table (avg score, pass rate, fails)
- Anomaly flags (courses with <60% pass rate)

**UGC Grade Scale:**
| Grade | Descriptor | Min% | Max% | Points |
|-------|-----------|------|------|--------|
| O | Outstanding | 85 | 100 | 10 |
| A+ | Excellent | 75 | 84 | 9 |
| A | Very Good | 65 | 74 | 8 |
| B+ | Good | 55 | 64 | 7 |
| B | Above Average | 45 | 54 | 6 |
| C | Average | 40 | 44 | 5 |
| F | Fail | 0 | 39 | 0 |

**SGPA Formula:** Sum(Credit_i x GradePoint_i) / Sum(Credit_i)
**CGPA Formula:** Sum(SGPA_j x SemCredits_j) / Sum(AllCredits)

**API integration points:**
- `GET /gradebook/:programmeId/scale` — grade scale config
- `PUT /gradebook/:programmeId/scale` — update scale
- `GET /gradebook/:programmeId/grades?semester=1` — student grades matrix
- `PUT /gradebook/:programmeId/release` — toggle grade visibility
- Moodle API: `core_grades_get_grades`, `gradereport_user_get_grades_table`

### 4.5 Attendance (AttendanceView.tsx)

**Auto-marking logic:**
- Each live session has 3 durations: **Scheduled** (planned), **Total Duration** (actual), **Cut-off** (75% of scheduled)
- If student attended >= cut-off duration → auto-marked **Present**
- If student attended < cut-off → auto-marked **Absent**
- Faculty/coordinator can **override** individual records with a mandatory reason

**UI structure:**
- Left: session list with programme filter, course badge, attendance count
- Right: session header with 3 duration cards, student table with time attended (progress bar), auto status, final status, override actions

**Override flow:**
1. Click "Override" → reason input appears
2. Enter reason → "Mark Present" or "Mark Absent"
3. Status shows "Overridden" label
4. "Revert" button to remove override

**API integration points:**
- `GET /sessions?programme=MBA-26` — session list
- `GET /sessions/:id/attendance` — student attendance for session
- `PUT /sessions/:id/attendance/:studentId/override` — apply override with reason
- `DELETE /sessions/:id/attendance/:studentId/override` — revert override

### 4.6 Exams (ExamsView.tsx)

**3 tabs:**

**Schedule:**
- Exam type filter pills: All / Mid Sem / End Sem / Supplementary
- Status filter: All / Scheduled / Completed
- Table: date, course, type badge, time + venue, mode, max marks, status, appeared count
- "Create Exam" modal: course, type, date, time, mode, max marks, venue
- Proctoring: external link to Proctoring Portal (not built in LMS)

**Eligibility:**
- Exam selector dropdown
- 4 summary cards: Eligible, Exemption Requested, Medical Pending, Debarred
- UGC attendance rules banner:
  - 75%+ → Eligible
  - 65-74% → Exemption with documented reason
  - 50-64% → Medical certificate from govt hospital
  - <50% → Debarred, must repeat semester
- Student table with attendance %, status, reason, "Grant" override button
- Debarred students: "Cannot override"

**Results:**
- Completed exam selector
- Publish/unpublish toggle
- Results table: student, marks/max, percentage, status (Passed/Failed/Absent)
- Supplementary tracker: students with arrears, course badges, attempt count, 5-year clearance deadline

**Exam types:** `midsem` | `endsem` | `supplementary` | `improvement`

**API integration points:**
- `GET /exams?programme=MBA-26&type=endsem` — exam list
- `POST /exams` — create exam
- `GET /exams/:id/eligibility` — student eligibility list
- `PUT /exams/:id/eligibility/:studentId/override` — grant exemption
- `GET /exams/:id/results` — exam results
- `PUT /exams/:id/results/publish` — publish results

### 4.7 Schedule (ScheduleView.tsx)

**Unified timeline of all upcoming events across programmes.**

**Toolbar (single bar):** Time filter (Upcoming/Past/All) | Type filter with counts (Exam/Assignment/Quiz) | Programme dropdown | Search

**Events grouped by proximity:** Tomorrow, This Week, Next Week, This Month, Later

**Each event card:** colored left border by type, date block, type badge with icon, title, course badge, time, duration, marks, venue, submission count

**API integration points:**
- `GET /schedule?programme=all&type=all&time=upcoming` — aggregated from exams + assignments + quizzes

### 4.8 Reports (ReportsView.tsx)

**2 tabs:**

**Engagement & Eligibility:**
- 3 summary cards: Total Students, Eligible (75%+), Below Threshold
- UGC compliance note citing Regulation 13.e and 15.1.c.iii
- Sort by: Engagement % / Attendance
- Table: student, engagement % (with progress bar), attendance %, fortnightly hours, 4-quadrant breakdown (Live/Tutorial/Content/Forum), eligibility badge

**Exam Summary:**
- Type filter: All / Mid Sem / End Sem
- 4 summary cards: Total Exams, Pass Rate, Appeared, Failed
- Table: date, course, type, eligible/appeared/absent/passed/failed, pass rate badge, avg score
- "Attention Required" section: auto-flags exams with <70% pass rate

### 4.9 Announcements (AnnouncementsView.tsx)

- Pinned announcements float to top (blue left border)
- Search + programme filter
- Each card: title, full body, meta (time, programme badge, audience count)
- Pin/unpin, delete actions
- "New Announcement" modal: title, message, programme selector, pin checkbox
- Actually creates and prepends to the list (client-side state)

### 4.10 Forums (ForumsView.tsx)

**3 statuses:** Unanswered (needs response), Answered, Flagged (moderation needed)

**List view:**
- Status summary banners (X unanswered, Y flagged)
- Filter pills + programme dropdown + search
- Thread list with avatar, course badge, status badge, title, preview, author, time, reply count

**Thread detail view (click any thread):**
- Full post content
- "Reply as Coordinator" textarea + post button

### 4.11 Counselling — Mentor only (CounsellingView.tsx)

- Session list with status filter (Scheduled/Completed)
- Session cards: mentee, type, programme, date/time, status
- "Schedule Session" modal: mentee dropdown, session type, date/time, notes
- **Session detail:** mentee info, date/time/duration, session notes (text), action items (checklist)

**Session types:** Progress Review, Academic Guidance, Re-engagement Plan, Attendance Review, Career Counselling

### 4.12 Escalations — Mentor only (EscalationsView.tsx)

**3 statuses:** Open, In Review, Resolved
**3 priority levels:** High, Medium, Low

- Status summary badges
- Escalation cards with colored left border by status
- **Detail view:** full description, coordinator response (if any), resolution date
- "New Escalation" modal: student, title, priority, description

**Flow:** Mentor creates → Coordinator reviews → Coordinator responds → Resolved

### 4.13 Mentees — Mentor only (MenteesView.tsx)

- 12 mentees across MBA and BCA
- Filter by status (On Track/At Risk/Critical) + programme + search
- Table: student, programme, engagement %, attendance %, CGPA, last active, forum posts, status, last counselling date

**Status logic:**
- On Track: engagement >= 75%
- At Risk: engagement 50-74%
- Critical: engagement < 50%

---

## 5. Mock Data Files

### `/lib/mockData.ts` (Learner data)
- `LEARNER` — current user profile
- `COURSES` — 7 enrolled courses with activity counts
- `VIDEO_ACTIVITIES`, `PAGE_ACTIVITIES` — content items
- `LEARNING_PATH` — ordered activity sequence
- `NOTIFICATIONS` — user notifications

### `/lib/coordinatorData.ts` (Coordinator data)
- `COORDINATOR` — coordinator profile
- `FACULTY` — 5 faculty members
- `COORDINATOR_COURSES` — courses with quadrant status
- `STUDENTS` — 10 student overview records
- `ALERTS` — dashboard alerts
- `PROGRAMME_BATCHES` — 5 batches with full semester/course hierarchy

### Component-level mock data
Each view component (GradebookView, ExamsView, GradingView, etc.) contains its own mock data at the top of the file. When replacing with APIs:
1. Remove the mock arrays/objects
2. Replace with `useEffect` + API calls or React Query
3. Keep the interfaces — they define your API response shapes

---

## 6. Moodle Integration Notes

This frontend is designed to work with **Moodle as a headless LMS backend**. Key Moodle Web Services APIs to integrate:

| Feature | Moodle API |
|---------|-----------|
| Courses | `core_course_get_courses`, `core_course_get_contents` |
| Users/Students | `core_user_get_users`, `core_user_create_users` |
| Grades | `core_grades_get_grades`, `gradereport_user_get_grades_table` |
| Quizzes | `mod_quiz_get_quizzes_by_courses`, `mod_quiz_get_user_attempts` |
| Assignments | `mod_assign_get_assignments`, `mod_assign_get_submissions` |
| Forums | `mod_forum_get_forums_by_courses`, `mod_forum_get_forum_discussions` |
| Attendance | `mod_attendance_get_sessions` (plugin) |
| Calendar | `core_calendar_get_calendar_events` |

**What Moodle does NOT provide (build custom):**
- SGPA/CGPA computation (programme-level, not course-level)
- UGC eligibility rules (75% threshold with tiered exemptions)
- Plagiarism scoring (integrate with Turnitin/Urkund)
- Proctoring (integrate with Mercer Mettl/Elumina)
- Counselling sessions (custom table)
- Escalations (custom table)
- Announcement broadcasting across programmes

---

## 7. UGC Compliance Rules in the UI

These rules are embedded in the UI logic and must be preserved:

1. **75% engagement threshold** for exam eligibility (Reports, Exams eligibility tab)
2. **Attendance exemption tiers:** 65-74% with reason, 50-64% with medical certificate, <50% debarred
3. **10-point CBCS grade scale** (O through F) — configurable per programme
4. **25/75 internal/external assessment split** (configurable)
5. **1:250 mentor-to-student ratio** (shown in Faculty & Mentors tab)
6. **4-quadrant content model:** Live Session, E-Tutorial, E-Content, Discussion Forum, Assessment
7. **5-year clearance window** for supplementary exams
8. **DEB ID and Aadhaar** as mandatory student fields
9. **Attendance auto-marking** based on 75% session duration cut-off

---

## 8. Component File Map

```
components/
├── coordinator/
│   ├── CoordinatorSideNav.tsx    # Sidenav (12 tabs)
│   ├── Dashboard.tsx             # Home — shared with faculty via userName prop
│   ├── CoursesView.tsx           # 3-level programme management + Edit/Delete per row
│   ├── CourseEditor.tsx          # WYSIWYG course content editor
│   ├── AddActivityModal.tsx      # Activity creation (7 types)
│   ├── StudentsView.tsx          # Student list + 360 view + Not Enrolled state + Bulk Upload
│   ├── FacultyView.tsx           # Faculty + Mentor management, 4-status system, RowActionsMenu
│   ├── GradingView.tsx           # Submission grading + plagiarism
│   ├── GradebookView.tsx         # Grade scale + SGPA/CGPA + semester credit accordion
│   ├── AttendanceView.tsx        → imported from faculty/AttendanceView.tsx
│   ├── ExamsView.tsx             # Exam schedule + eligibility + results
│   ├── ScheduleView.tsx          # Unified event timeline
│   ├── ReportsView.tsx           # Engagement + exam reports
│   ├── AnnouncementsView.tsx     # Announcement management
│   ├── ForumsView.tsx            # Forum moderation
│   └── DateRangePicker.tsx       # Custom calendar date picker
├── faculty/
│   ├── FacultySideNav.tsx        # Sidenav (11 tabs, "My Programmes")
│   └── AttendanceView.tsx        # Auto-marked attendance with overrides
├── mentor/
│   ├── MentorSideNav.tsx         # Sidenav (6 tabs)
│   ├── MentorDashboard.tsx       # Mentee overview + at-risk alerts
│   ├── MenteesView.tsx           # Assigned students list
│   ├── CounsellingView.tsx       # Session scheduling + notes
│   └── EscalationsView.tsx       # Raise concerns to coordinator
├── home/                         # Learner dashboard widgets (10 files)
├── learn/                        # Course viewer + activities (7 files)
├── SideNav.tsx                   # Learner sidenav
└── ComingSoon.tsx                # Placeholder (used for E-Library, Tickets)
```

---

## 9. Known Limitations & TODOs

1. **No authentication** — role switching is via URL (`/coordinator`, `/faculty`, `/mentor`). Build auth + role-based routing.
2. **No real-time updates** — forums, announcements are static. Add WebSocket/polling for live updates.
3. **Drag-and-drop** uses HTML5 DnD — replace with `@dnd-kit/core` for touch support.
4. **Date picker** is custom-built (`DateRangePicker.tsx`) — works but consider `react-day-picker` for edge cases.
5. **E-Library and Tickets** pages are still `ComingSoon` placeholders.
6. **Focus Mode** for learner (plan exists at `.claude/plans/`) — not yet implemented.
7. **Onboarding flow** (`OnboardingFlow.tsx`) exists but is not connected to any route.
8. **No pagination** — all tables render full datasets. Add pagination/virtual scrolling for 250+ students.
9. **No form validation** — modals accept any input. Add validation before API calls.
10. **No error states** — add loading spinners, error boundaries, empty states for API failures.
