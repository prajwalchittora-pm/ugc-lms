# UGC LMS — Product Documentation

> This document explains every screen, every feature, and every business rule in the UGC LMS frontend. It is organized by role and screen. Use this alongside the code and the `HANDOFF.md` (which covers technical architecture).

---

## Table of Contents

1. [Roles & Access Model](#1-roles--access-model)
2. [Coordinator / Faculty Role](#2-coordinator--faculty-role)
   - 2.1 [Home Dashboard](#21-home-dashboard)
   - 2.2 [Programmes](#22-programmes)
   - 2.3 [Students](#23-students)
   - 2.4 [Grading](#24-grading)
   - 2.5 [Gradebook](#25-gradebook)
   - 2.6 [Attendance](#26-attendance)
   - 2.7 [Exams](#27-exams)
   - 2.8 [Schedule](#28-schedule)
   - 2.9 [Reports](#29-reports)
   - 2.10 [Announcements](#210-announcements)
   - 2.11 [Forums](#211-forums)
3. [Mentor Role](#3-mentor-role)
   - 3.1 [Home Dashboard](#31-home-dashboard)
   - 3.2 [My Mentees](#32-my-mentees)
   - 3.3 [Counselling](#33-counselling)
   - 3.4 [Escalations](#34-escalations)
4. [Learner Role](#4-learner-role)
5. [UGC Compliance Rules](#5-ugc-compliance-rules)
6. [Cross-Role Shared Features](#6-cross-role-shared-features)

---

## 1. Roles & Access Model

| Role | Who | What They Do | Data Scope |
|------|-----|-------------|------------|
| **Programme Coordinator** | Academic head of programme(s) | Full programme management — courses, students, grades, exams, faculty | All programmes |
| **Faculty** | Course instructor | Same UI as coordinator | Only enrolled programmes/courses |
| **Mentor** | Student counsellor (UGC-mandated, 1:250 ratio) | Track mentee engagement, conduct counselling, escalate concerns | Only assigned mentees |
| **Learner** | Student | Consume content, take exams, view grades | Own data only |

**Key architectural decision:** Faculty and Coordinator share the exact same UI components. The only difference is data scope:
- Coordinator sees "Programmes" → all programmes
- Faculty sees "My Programmes" → only their assigned programmes

When connecting APIs, add a `role` prop to shared components to:
- Filter API queries by the logged-in user's assignments
- Hide coordinator-only actions (create programme, delete student, configure grade scale, override eligibility)

---

## 2. Coordinator / Faculty Role

**Sidenav tabs (11):** Home, Programmes, Students, Grading, Gradebook, Attendance, Exams, Schedule, Reports, Announcements, Forums

---

### 2.1 Home Dashboard

**File:** `components/coordinator/Dashboard.tsx`
**Route:** `/coordinator` (coordinator) or `/faculty` (faculty)
**Purpose:** At-a-glance overview of what needs attention today.

**Prop:** `userName` (string) — displayed in greeting. Defaults to "Dr. Sharma" for coordinator, passed as "Prof. Raghav Iyer" for faculty.

#### FTUE (First Time User Experience)

The dashboard includes a 3-part onboarding system triggered on first visit (tracked via `localStorage`):

**A. Welcome Modal** — full-screen overlay on first login:
- Dark gradient header with personalized greeting
- 5 feature highlights: Manage Programmes, Grade Submissions, Track Engagement, Communicate, Gradingbook
- "Take a Quick Tour" button (starts feature tour) + "Skip for now" link
- Dismissing sets `localStorage.coord_visited = true`

**B. Feature Tour** — spotlight/tooltip walkthrough (5 steps):
1. Upcoming section: "Your upcoming exams, assignment deadlines, and quizzes"
2. Grading Queue: "New student submissions that need your review"
3. Forum Activity: "Monitor and respond to student discussions"
4. Announcements: "Your recent broadcasts to students"
5. Sidenav: "Use the sidebar to navigate between all features"
- Each step: SVG mask overlay with cutout around target element, spotlight ring, tooltip with title + description + step dots + Back/Next/Skip
- Target elements identified via `data-tour` attributes
- Dismissable at any step

**C. Setup Banner** — shown when no programmes exist:
- Compact banner at top of dashboard with setup checklist:
  - Create your first programme → /coordinator/courses
  - Add courses to the programme → /coordinator/courses
  - Configure grade scale → /coordinator/gradebook
  - Enroll students → /coordinator/courses
  - Post a welcome announcement → /coordinator/announcements
- Each item is a clickable link-button with circle checkbox
- "X" button to dismiss

#### Sections

**1. Greeting Header**
- Date shown as uppercase label above the greeting (e.g., "MONDAY, 9 JUNE 2026")
- Time-aware greeting: "Good morning/afternoon/evening," with the user's name in the brand orange accent color
- No stats or decorative elements — clean typography only

---

**2. Upcoming (full width, 5 cards)**

Shows the **next 5 chronological events** as a horizontal row of cards.

**What appears here:** Any scheduled event across all programmes the coordinator manages — exams, assignment deadlines, quiz deadlines, and live counselling sessions.

**Card anatomy:**
| Element | Purpose |
|---------|---------|
| **Date** (large display number + month) | Visual anchor — coordinator scans dates first |
| **Urgency badge** ("Today" / "Tomorrow") | Only shown for events within 24–48 hours. Creates immediate call to action. Events 3+ days out show no badge — no need to create false urgency |
| **Title** (2-line max) | What the event is. Truncated with ellipsis if too long |
| **Context line** | The one piece of actionable information the coordinator needs to decide whether to intervene (see table below) |
| **Type tag** (icon + label) | Distinguishes event type at a glance. Each type has a unique icon and color |
| **Time** (with clock icon) | When exactly it happens |

**Context line per event type — what it shows and why:**

| Type | Context shown | Example | Why the coordinator cares | What they might do |
|------|--------------|---------|--------------------------|-------------------|
| Assignment | Submission progress | "4/20 submitted" | Due date has passed and grade-by date is approaching — coordinator needs to check submissions and grade or delegate to faculty | Grade submissions, remind faculty to grade, extend deadline if needed |
| Quiz | Publication status | "Published" or "Draft" | A draft quiz approaching its open date needs to be published or students can't take it | Review and publish the quiz |
| Exam | Eligibility count | "106/124 eligible" | Per UGC regulations, students below 75% engagement are ineligible. Coordinator needs to know how many can sit for the exam | Review at-risk students, process exemption requests |
| Live Session | Assigned faculty | "Dr. Anita Desai" | Confirms the session has a faculty member assigned and is ready to proceed | Verify setup, join session |

**Click behavior — deep-link navigation per event type:**

| Type | Navigates to | What the coordinator sees | What they can do |
|------|-------------|--------------------------|-----------------|
| **Assignment** | `/coordinator/grading` | Grading page with submissions | See who submitted, grade, extend deadline, send reminders |
| **Live Session** | `/coordinator/courses?course={code}&activity={id}` | LiveSessionActivity view with session details | See countdown, "Host Session" button (greyed until 10 min before), settings gear |
| **Quiz** | `/coordinator/courses?course={code}&activity={id}` | QuizEditor (edit mode) or quiz preview | Configure questions, timing, publish status via settings gear |
| **Exam** | `/coordinator/exams` | Exams page with eligibility management | Override eligibility, view exam schedule, manage exemptions |

**Deep-link implementation:**
- Route uses query params: `?course={courseCode}&activity={activityId}`
- `CoursesView` reads `useSearchParams()` on mount → auto-finds the matching programme and course → sets them as selected → passes `deepLinkedActivity` to `CourseEditor`
- `CourseEditor` accepts `initialActivityId` prop → uses it as the starting `selectedActivityId` if the activity exists in the data
- The sidebar auto-expands the relevant unit and quadrant to show the target activity

**Type tag design:**

| Type | Icon | Color | Gradient (card top) |
|------|------|-------|-------------------|
| Exam | `BookOpen` | `#1B7A4A` (sage green) | Soft mint gradient |
| Assignment | `FileEdit` | `#0E7490` (teal) | Soft cyan gradient |
| Quiz | `HelpCircle` | `#7C3AED` (purple) | Soft lavender gradient |
| Live Session | `Video` | `#072FB5` (blue) | Soft blue gradient |

**Why these colors?** The page background is warm beige (`#FDF8F2`). All card gradients use cool tones (green, teal, purple, blue) to create clear contrast. No warm/amber tones (would blend with background). No red (exam ≠ danger — it's a milestone).

**Business logic:**
- Source: unified query across `exams`, `assignment.grade_by_date`, `quiz.open_date`, and `live_session.scheduled_at` for all programmes the user manages
- Filter: only future events (date ≥ today), with one exception:
  - **Assignments appear when the due date has passed but the grade-by date is approaching or not yet passed.** The coordinator doesn't need to see an assignment before it's due (that's the student's concern). They need to see it when submissions have come in and grading needs to happen. The card shows submission progress (e.g., "4/20 submitted") so the coordinator knows whether to wait for more submissions, extend the deadline, or start grading.
- Sort: ascending by date, then by time
- Limit: **5 cards** — enough to show this week's horizon without overwhelming. "Full schedule" link provides the complete view
- No holidays, milestones, or informational items — **only events that require coordinator awareness or student action**
- This is a fully online programme — no physical venue/hall information

**Card styling:**
- Bold dark border (`2px solid rgba(15,15,15,0.45)`) — the upcoming section is the visual hero of the dashboard
- Type-specific pastel gradient on the top section for visual identity
- Hover lifts the card with shadow + translateY

---

**3. Grading Queue (full width, table format)**

Shows **all pending submissions** that need grading, displayed as a compact table.

**Why a table?** Grading is a task queue — the coordinator needs to scan multiple items quickly, compare deadlines, and prioritize. A table is denser and more scannable than cards for this purpose.

**Table columns:**

| Column | What it shows | Why |
|--------|--------------|-----|
| **Student** | Avatar (initials) + full name | Who submitted |
| **Submission** | Assignment/quiz title | What was submitted |
| **Course** | Course code (e.g., MBA-104) | Which course it belongs to |
| **Submitted** | Relative time (e.g., "2h ago", "5d ago") | How long it's been waiting |
| **Grade by** | Deadline date (e.g., "15 Jun") | When grading must be completed. This is the grading deadline, not the student's submission deadline |

**Sort order:** Overdue items always appear at the top. Within each group (overdue / pending), sorted by submission time (oldest first — longest-waiting gets attention first).

**Overdue highlighting:**
- Red left border (`3px solid #DC2626`) on the row
- Subtle red background tint (`rgba(220,38,38,0.03)`)
- Red alert icon (⚠) next to the grade-by date
- Grade-by date shown in red bold text

**Submission statuses:**
- **Pending** — submitted, grading deadline has not passed. No special treatment.
- **Overdue** — grading deadline has passed. Highlighted as described above.
- There is no "new" status. Every ungraded submission is pending until its deadline passes, then it becomes overdue. The "submitted at" time tells the coordinator how fresh it is.

**Business logic:**
- Source: all submissions with `status = submitted` (not yet graded) across all courses in the coordinator's programmes
- Limit on home page: **5 items** — enough to surface urgent work. "View all" links to the full Grading page which shows everything with filtering
- Why 5: the coordinator checks the dashboard for a pulse, not to do all grading here. 5 rows show whether there's a problem (overdue items) without requiring scroll
- Header badge: shows overdue count in red pill (e.g., "2 overdue") — visible even before reading the table
- Grading deadline (`gradeBy`): set per assignment/quiz by the coordinator when creating the activity. Typically 7 days after the student submission deadline

---

**4. Two-column: Recent Forum Posts + Announcements**

**Recent Forum Posts (left column):**

Shows the **5 most recent forum posts** across all courses, sorted by recency.

**Each row shows:**
| Element | Purpose |
|---------|---------|
| Author avatar + name | Who posted |
| Time | How recent (e.g., "2h ago") |
| Reply count | Engagement level — 0 replies means no one has responded yet |
| Post title | What the discussion is about |
| Course name | Which course context |

**Business logic:**
- Source: latest forum posts across all courses in the coordinator's programmes, sorted by `created_at` descending
- Limit: **5 posts** — the forum section is a monitoring feed, not a work queue. The coordinator glances at it to stay aware of student activity and jumps in if something needs their attention
- Why no status badges (unanswered/flagged): There is no "flag" feature in the product. "Unanswered" is ambiguous — answered by whom? A post with 0 replies is visually obvious from the reply count. The coordinator can decide for themselves what needs their response
- "View all" links to the full Forums page
- Subtle border (`1px solid rgba(15,15,15,0.12)`) on the container — secondary visual weight compared to upcoming cards

**Recent Announcements (right column):**

Shows the **last 3 announcements** posted by the coordinator, sorted by recency.

**Each card shows:**
| Element | Purpose |
|---------|---------|
| Programme badge | Which programme/audience (e.g., "MBA - Batch 2026" or "All Programmes") |
| Pinned indicator | "Pinned" label with pin icon if the announcement is pinned |
| Time | How recent |
| Title | Announcement headline |
| Body preview | First 2 lines of the announcement body |

**Business logic:**
- Source: announcements created by the logged-in coordinator, sorted by `created_at` descending
- Limit: **3 announcements** — announcements are not a work queue. The coordinator checks this to verify what they've communicated and whether students have seen it. 3 is enough to confirm recent communications
- Pinned announcements sort to the top regardless of creation date
- "Create new" shortcut in the section header links directly to the announcement creation flow
- Each card is clickable → navigates to the full Announcements page
- Bold dark border (`2px solid rgba(15,15,15,0.45)`) on each card — announcements are important communications, they deserve visual weight

---

### 2.2 Programmes

**File:** `components/coordinator/CoursesView.tsx`
**Route:** `/coordinator/courses` or `/faculty/courses`
**Purpose:** Manage programmes, semesters, courses, and course content.

#### Three-level drill-down

**Level 1: Programme List**

A table showing all programmes the user manages.

| Column | Description |
|--------|------------|
| Programme | Name + code (e.g., "MBA - Batch 2026", MBA-26) |
| Timeline | Start date → End date |
| Status | Active / Draft / Archived / Completed |
| Duration | In years (e.g., "2 years") |
| Semesters | Total count (e.g., "4 semesters") |
| Students | Enrolled count |

**Filters:**
- Programme Type dropdown: All / UG / PG / Diploma / Certificate
- Status dropdown: All / Active / Draft / Archived

**Actions:**
- Search bar
- "Create Programme" button → modal

**Create Programme Modal fields:**
- Programme Name (text)
- Programme Code (text, auto-generated suggestion)
- Batch Year (number)
- Type (UG / PG / Diploma / Certificate)
- Total Semesters (number)
- Total Credits (number)
- Live preview of how the programme will appear

---

**Level 2: Programme Detail**

Accessed by clicking a programme row. Shows 3 section tabs:

**Tab: Courses**
- Semester sub-tabs (Sem 1, Sem 2, etc.)
- Course cards in a 3-column grid
- "Add Course" button → modal (code, name, credits)
- "Add Semester" button to add a new semester
- Drag-to-reorder toggle for course ordering

**Each course card shows:**
- Course code (13px mono, programme color) + credits
- Course title (19px / 800 weight, display font — dominant element)
- Start/end dates
- Order number (for sequencing)
- 5 quadrant stat tiles (compact: icon on top, count, label below, `var(--bg-section)` background): Live, E-Tutorial, E-Content, Discussion, Assessment
- Checkbox for multi-select

**Card actions (per course):**
- Hide/Show toggle — hides the course from students
- Lock/Unlock with conditions popover

**Lock conditions (6 types):**

| Condition | What It Does |
|-----------|-------------|
| Manual | Coordinator manually locks/unlocks |
| Previous course complete | Student must complete the preceding course |
| All previous courses complete | Student must complete all courses before this one |
| Start date unlock | Course auto-unlocks on a specific date |
| End date lock | Course auto-locks after a specific date |
| 75% engagement | Course unlocks only if student engagement >= 75% |

**Multi-select bulk actions:**
When courses are selected via checkboxes, a bulk action bar appears with: Hide All, Show All, Lock All, Unlock All

**Tab: Students**
- Student table with search
- "Add Students" button → AddPeopleModal with 2 tabs:
  - Search & Add: search existing students by name/email/roll number
  - Bulk Upload: CSV drop zone with template download
- CSV template columns: username, first_name, last_name, email, phone, password, roll_number, deb_id, aadhaar, programme_code

**Tab: Faculty & Mentors**
- Faculty list with name, designation, assigned course pills
- Mentor list with assigned student count and UGC 1:250 ratio compliance indicator
- "Add Faculty" and "Add Mentor" buttons → AddPeopleModal

---

**Level 3: Course Editor**

Accessed by clicking a course card. A WYSIWYG editor that shows the course content as the learner would see it, with edit overlays.

**Structure:** Unit → Quadrant → Activity

**Unit Accordion:**
- Expandable units (e.g., "Unit 1: Introduction to Economics")
- Each unit contains 4 quadrants: E-Tutorial, E-Content, Discussion Forum, Assessment
- Each quadrant lists activities

**Edit actions:**
- **Edit mode toggle** — switches between view mode and edit mode
- **Rename unit** — click pencil icon → inline text input → Enter to save
- **Add Unit** — creates a new empty unit with all quadrants
- **Hide/Show** on units and individual activities
- **Lock/Unlock** on units and individual activities

**Select mode:**
- Toggle "Select" button → all units/quadrants expand, checkboxes appear on every activity
- Bulk action bar: Hide Selected, Show Selected, Lock Selected, Unlock Selected

**Add Activity Flow** (triggered from any quadrant):
- Step 1: Choose activity type (filtered by quadrant context). If the quadrant has only one type (e.g., Live Session), skips directly to step 2.
- Step 2: Opens the **Activity Settings Modal** — a full settings form for that activity type.

| Activity Type | Available In | Quadrant |
|--------------|-------------|----------|
| Video | E-Tutorial | `e_tutorial` |
| Page | E-Content | `e_content` |
| PDF | E-Content | `e_content` |
| SCORM Package | E-Content | `e_content` |
| Quiz | Assessment | `assessment` |
| Assignment | Assessment | `assessment` |
| Discussion Topic | Discussion | `discussion` |
| Live Session | Live Sessions | `live_session` |

**Activity Settings Modal** (`ActivitySettingsModal.tsx`)

A 640px modal used for both **creating** and **editing** activity settings. Opens from:
- The "+" button on any quadrant (create mode)
- The gear icon on any existing activity (edit mode)

**Modal anatomy:**
- **Header**: Dark gradient banner (`#030B22 → #213594`) with white activity type icon, title, and a hero name input field
- **Body**: Scrollable sections with fields — each section has a colored icon, uppercase label, and a horizontal rule. All sections are always visible (no accordion collapse)
- **Footer**: Cancel + primary CTA button (colored per activity type). Edit mode shows "Delete Activity" on the left. CTA is disabled until all required fields are filled.

**Validation rule:** The CTA button ("Add {Type}" or "Save Changes") is disabled until ALL required fields have a value. The coordinator cannot create an activity with missing required fields.

**Field types supported:**
- `text` — standard text input with accent focus ring
- `textarea` — multi-line text
- `number` — numeric input
- `select` — dropdown with custom chevron
- `dateonly` — custom 3-segment date picker (DD / MM / YYYY) — no browser default
- `timeonly` — custom time picker (Hour / Minute / AM|PM toggle) — no browser default
- `toggle` — pill-style switch with accent glow
- `radio` — card-style radio group with title + description per option
- `file` — drag-and-drop upload zone

---

**Live Session Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Session title shown to students |
| | Show to students | toggle | No | Enabled | Controls visibility in the course |
| **Schedule** | Date | dateonly | Yes | — | When the session takes place |
| | Time | timeonly | Yes | — | Start time (with AM/PM) |
| | Duration (hours) | select | No | 1 hr | 0, 1, 2, or 3 hours |
| | Duration (minutes) | select | No | 0 min | 0, 15, 30, or 45 minutes |
| **Faculty & Invites** | Assign Faculty | select | Yes | — | Faculty member conducting the session. Populated from programme faculty list |
| | Invite Emails | textarea | No | — | Comma-separated emails for external guests |
| **Completion** | Completion criteria | radio | No | Attendance | Two options: "Learner must be present" (auto-tracked) or "Manual" (learner marks completion) |

**Business logic:**
- Faculty dropdown is populated from `FACULTY` data — shows name + specialization
- Duration is split into hours + minutes selects (not a single field) for precision
- Completion defaults to attendance-based (auto-tracked when learner joins)
- All fields except Invite Emails and fields with defaults are required
- The same modal and fields are used for both creating a new live session and editing an existing one via the settings gear

**Live Session Activity View** (`LiveSessionActivity.tsx`)

When a live session activity is selected in the course editor, the main panel shows a dedicated live session view instead of the video player. This component has **3 states**:

**State 1: Upcoming (session hasn't happened yet)**
- Status badge: blue "Scheduled" pill with pulsing dot
- Session title as large heading
- Countdown card with blue gradient background: "Session in X days" / "Session is tomorrow" / "Session starts soon"
- **"Host Session" button** (coordinator) / **"Join Session" button** (learner) — greyed out and disabled until the session is imminent
- Button activates 10 minutes before the scheduled start time
- "Available 10 minutes before the session starts" hint text
- Session details card: date, time, duration (with icons in tinted boxes), faculty with avatar

**State 2: Completed — Recording Available**
- Status badge: green "Recording Available" pill
- Video player area with play button, recording duration
- Session details card (same as upcoming but past-tense context)
- Attendance section:
  - Coordinator sees: "18/20 students attended · 90% attendance"
  - Learner sees: "Present — Joined at 9:58 AM" or "Absent"

**State 3: Completed — Recording Processing**
- Status badge: amber "Recording Processing" pill
- Processing placeholder card with amber gradient: spinning loader icon, "Recording is being processed", "Usually takes 30–60 minutes"
- Session details + attendance (same as state 2)

**Business logic:**
- Clicking a live session upcoming card on the coordinator dashboard navigates to the course editor with this activity selected
- The component detects which state to show based on `activity.done` and recording availability
- Coordinator sees "Host Session" button + attendance summary; learner sees "Join Session" + personal attendance
- Activities in the `live_session` quadrant render this component; other video-type activities in `e_tutorial` render the standard video player

---

**Video Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Video title shown to students |
| | Show to students | toggle | No | Enabled | Controls visibility in the course |
| **Video Source** | Source | radio | Yes | Upload | Three options: "Upload" (direct file), "Vimeo" (paste URL), "YouTube" (paste URL) |
| | Upload Video | file | No | — | MP4 or WebM file upload (max 500MB). **Only shown when Source = Upload** |
| | Video URL | text | Yes* | — | Full video URL. **Only shown when Source = Vimeo or YouTube** |
| **Details** | Description | textarea | No | — | Optional description shown to students |
| **Completion** | Watch percentage | select | Yes | 60% | Minimum % of video the learner must watch for auto-completion. Options: 25%, 50%, 60%, 75%, 90%, 100% |

*Video URL is required only when visible (Source = Vimeo/YouTube). Hidden required fields don't block submission.

**Business logic:**
- The Video Source radio controls which upload field appears (conditional rendering via `showWhen`):
  - Upload selected → file upload zone shown, URL hidden
  - Vimeo/YouTube selected → URL text input shown, file upload hidden
- Completion is percentage-based — the LMS auto-tracks watch progress and marks the activity complete when the learner reaches the threshold
- Default completion threshold is 60% — this is the most common setting across online programmes
- The same modal and fields are used for both creating and editing via the settings gear

---

**Assignment Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Assignment title shown to students |
| | Type | radio | Yes | Graded | "Graded" (counts towards final grade) or "Practice" (learning only) |
| | Show to students | toggle | No | Enabled | Controls visibility in the course |
| **Content** | Description | textarea | No | — | Brief overview of the assignment |
| | Instructions | textarea | No | — | Detailed instructions for students |
| | Attached Files | file | No | — | Reference documents, rubrics, templates (PDF, DOCX, PPTX) |
| **Availability** | Allow submissions from | dateonly | No | — | Students can submit after this date |
| | Due date | dateonly | Yes | — | Submissions after this are marked late |
| | Cut-off date | dateonly | No | — | No submissions accepted after this |
| | Remind to grade by | dateonly | No | — | Coordinator reminder if ungraded by this date |
| | Submission types | radio | Yes | File | "File submissions", "Online text", or "Both" |
| **Grade** | Maximum grade | number | Yes* | 100 | Max grade points. **Only shown when Type = Graded** |
| | Grade to pass | number | No | — | Minimum passing mark. **Only shown when Type = Graded** |
| **Completion** | Completion criteria | radio | Yes | Submit | "Make a submission" (auto-complete on submit) or "Receive a grade" (complete when graded) |

*Maximum grade is required only when visible (Type = Graded).

**Business logic:**
- **Graded vs Practice**: When "Practice" is selected, the Grade section fields (max grade, grade to pass) are hidden via `showWhen` — practice assignments have no grades
- **Due date vs Cut-off date**: Due date marks when submissions become "late". Cut-off date is the hard deadline after which no submissions are accepted. Cut-off must be ≥ due date
- **Remind to grade by**: Sets a grading deadline for the coordinator. Submissions ungraded past this date appear as "overdue" in the Grading Queue on the home dashboard
- **Submission types**: Controls what the student sees — file upload zone, rich text editor, or both
- **Completion**: "Make a submission" = instant completion on submit. "Receive a grade" = completion only after coordinator/faculty grades it — useful for graded assignments where feedback matters

---

**Page Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Page title |
| | Show to students | toggle | No | Enabled | Visibility |
| **Content** | Page content | textarea | Yes | — | The learning material (rich text) |
| **Completion** | Criteria | radio | No | View | "View the page" (auto-complete on open) or "Manual" (learner marks) |

**Business logic:** Simplest activity type — just content to read. No dates, no grades. Completion defaults to "view" because opening a page = consuming it.

---

**PDF / Document Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Document title |
| | Show to students | toggle | No | Enabled | Visibility |
| **Document** | Upload document | file | Yes | — | PDF, DOCX, or PPTX (max 50MB) |
| | Description | textarea | No | — | Optional context about the document |
| **Completion** | Criteria | radio | No | View | "View the document" or "Manual" |

**Business logic:** Same simplicity as Page, but file-based. The uploaded file is rendered in the LMS document viewer.

---

**SCORM Package Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Module title |
| | Show to students | toggle | No | Enabled | Visibility |
| **SCORM Package** | Upload package | file | Yes | — | .zip file (SCORM 1.2 or 2004) |
| | Description | textarea | No | — | Optional module description |
| **Attempts** | Attempts allowed | select | No | Unlimited | 1, 2, 3, or Unlimited |
| **Grade** | Maximum grade | number | No | 100 | Grade reported by the SCORM package |
| | Grade to pass | number | No | — | Minimum passing mark |
| **Completion** | Criteria | radio | No | SCORM reports | "SCORM reports complete" (package signals LMS), "Receive a passing grade", or "Manual" |

**Business logic:**
- SCORM packages self-report completion and grades to the LMS — the default completion trusts the package's own signal
- Attempts control how many times the learner can launch the module
- Grade fields are always visible (unlike assignment/quiz where they hide for practice) because SCORM modules inherently report scores

---

**Quiz Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Quiz title |
| | Type | radio | Yes | Graded | "Graded" (counts towards grade) or "Practice" (self-assessment only) |
| | Show to students | toggle | No | Enabled | Visibility |
| **Timing** | Time limit (minutes) | number | No | — | Leave empty for untimed |
| | Opens on | dateonly | No | — | Students can attempt after this date |
| | Closes on | dateonly | No | — | No attempts after this date |
| **Attempts** | Attempts allowed | select | No | 1 | 1, 2, 3, or Unlimited |
| **Grade** | Maximum grade | number | Yes* | 100 | **Only shown when Type = Graded** |
| | Grade to pass | number | No | — | **Only shown when Type = Graded** |
| **Completion** | Criteria | radio | No | Attempt | "Complete an attempt", "Receive a grade", or "Receive a passing grade" |

**Business logic:**
- **Graded vs Practice**: Practice quizzes hide the Grade section — students can self-test without grade pressure
- **Time limit**: Empty = untimed. Timer starts when the learner opens the quiz
- **Opens/Closes**: Optional scheduling. If not set, quiz is available whenever the course unit is accessible
- **Attempts**: Default is 1 for graded quizzes. Practice quizzes typically allow unlimited attempts
- **Completion options**: "Attempt" = instant on finish. "Grade" = after auto-grading. "Passing grade" = only if they pass — useful for gating subsequent content
- Questions are managed separately in the Quiz Editor (not part of this settings modal) — see below

---

**Quiz Editor** (`QuizEditor.tsx`)

When a quiz activity is selected in the course editor with **edit mode on**, the main panel shows the Quiz Editor instead of the learner preview.

**Header:**
- Quiz title
- Question count + total points (mono font, large numbers)
- Config pills showing quiz metadata: type (Graded/Practice), time limit, attempts, open/close dates

**Question List:**
- Each row shows: drag handle, question number (colored by type), type icon, question text (truncated), type label, points, duplicate/delete actions
- Click a question to edit it in the Question Editor modal
- Empty state with "Add Question" CTA

**Adding Questions — dropdown with two paths:**

| Path | What it does |
|------|-------------|
| **New Question** | Opens type picker → then question editor modal to create from scratch |
| **From Question Bank** | Opens the Question Bank modal to pick existing questions or add random ones |

**Question Type Picker** — 2-column card grid in a dark-header modal, 8 types:

| Type | Icon | Auto-graded? | Editor UI |
|------|------|-------------|-----------|
| **Multiple Choice** | `CircleDot` | Yes | Options list with radio buttons to mark single correct answer. Add/remove (2-8). Letter labels (A, B, C...) |
| **Multiple Select** | `CheckCircle2` | Yes | Options list with checkboxes for multiple correct answers |
| **True / False** | `ToggleLeft` | Yes | Two large toggle buttons (True / False) |
| **Short Answer** | `Type` | Yes | List of accepted answers with add/remove. Case sensitivity toggle |
| **Fill in the Blank** | `AlignLeft` | Yes | Question text with `{blank}` syntax. Auto-detects blanks and shows answer inputs per blank |
| **Matching** | `GitBranch` | Yes | Two-column pair editor (Item → Match). Add/remove pairs. Min 2 |
| **Numerical** | `Hash` | Yes | Correct answer input + tolerance (±). Shows computed accepted range |
| **Essay** | `FileText` | No — manual | Grading instructions textarea, word limit. "Manually graded" notice |

**Question Editor Modal:**
- Dark gradient header with type icon + label
- Question text field (required, rich text area)
- Points input (number, inline)
- Type-specific editor (see table above)
- Validation: question text required before save

**Question Bank Modal** — two tabs:

**Tab 1: Pick Questions**
- Step 1: Search + select a question bank (category). Searchable list of banks with name + question count
- Step 2: Browse questions in that bank. Each shows type icon, text, points. Checkbox to select multiple. "All question banks" back link
- CTA: "Add X Questions"

**Tab 2: Random Questions**
- Step 1: Search + select a question bank (same searchable list)
- Step 2: Set count (number input, capped to bank size). Summary text: "X random questions will be randomly selected from {Bank}. Each student may get a different set."
- CTA: "Add Random Questions"

**Business logic:**
- Question banks are organized by course/subject category
- Questions picked from the bank are copied into the quiz (not linked)
- Random questions are shuffled at selection time — in production, the randomization would happen per-student at quiz attempt time
- All question types except Essay are auto-graded
- Essay questions appear in the coordinator's grading queue when submitted
- The quiz editor is only visible in edit mode — toggling edit mode off shows the learner preview

---

**Discussion Topic Settings (fully defined):**

| Section | Field | Type | Required | Default | Purpose |
|---------|-------|------|----------|---------|---------|
| **General** | Name | text | Yes | — | Discussion title |
| | Show to students | toggle | No | Enabled | Visibility |
| **Discussion** | Discussion prompt | textarea | Yes | — | Context and question for students to discuss |
| | Type | radio | No | Open | "Open discussion" (everyone sees all posts) or "Q&A" (must post before seeing others' replies) |
| **Completion** | Criteria | radio | No | Post | "Post a reply" (auto-complete when learner participates) or "Manual" |

**Business logic:**
- **Q&A mode**: Forces independent thinking — students must submit their own answer before they can read peers' responses. Useful for case study discussions where you want original analysis
- **Completion**: Defaults to "Post a reply" because discussion value comes from participation, not passive viewing
- The discussion thread itself is managed in the Forums page — this settings modal configures the activity's properties

---

**Sidebar header** shows quadrant breakdown counts (e.g., "E-Tutorial: 6, E-Content: 8, Forum: 3, Assessment: 4") instead of a progress bar.

---

### 2.3 Students

**File:** `components/coordinator/StudentsView.tsx`
**Route:** `/coordinator/students` or `/faculty/students`

#### Student List View

**Table columns:**
- Checkbox (for multi-select)
- Name + avatar
- Roll Number
- Programme
- Status (Active/Suspended/Inactive)
- Last Active (relative time)
- Avg Grade
- Engagement Score

**Filters:**
- Search (name, email, roll number)
- Programme dropdown
- Status dropdown

**Actions:**
- "Create Student" button → modal
- "Bulk Upload" button → CSV modal
- Delete selected (with confirmation dialog)

**Create Student Modal — UGC-required fields:**
- Username, First Name, Last Name
- Email, Phone Number
- Password
- Roll Number, DEB ID, Aadhaar Number
- Programme (dropdown)
- UGC compliance note: "As per UGC 2020 Regulations, Aadhaar or Govt. ID verification is required for enrollment, assessment participation, and examinations. DEB ID is mandatory for regulatory reporting."

#### Student 360 View (StudentDetail)

Accessed by clicking a student row. Two-panel layout:

**Left Sidebar (260px, sticky):**
- Avatar (grey bg, dark initials) + name (horizontal layout)
- Divider
- Last login: "{relative time} · {absolute date}" (e.g., "Today · 7 Jun 2026, 10:30 AM")
- Last Active on: same format
- Gender
- Email + copy-to-clipboard button
- Phone + copy-to-clipboard button
- Programme card: graduation cap icon, programme name, credits (earned/total)
- Verification status: Aadhaar (verified/pending/not uploaded), Photo, DEB ID, Govt. ID — with counts (e.g., "2/4")
- Action buttons: Suspend/Activate + Delete

**Right Content — 6 tabs:**

**Tab 1: Snapshot**
- Semester selector dropdown (top-right, affects metrics below)
- CGPA dark card — constant across semesters, shows cumulative GPA
- Semester metrics card: SGPA, Engagement %, Eligibility badge (Eligible/Ineligible) + Override link
- Exam performance table: per-course Internal marks (/40), End Sem (/60), Total (/100), Grade

**Business logic:**
- CGPA is independent of semester selection (it's cumulative)
- SGPA changes per semester
- Eligibility is based on 75% engagement threshold
- "Override" allows coordinator to grant exam eligibility despite low engagement

**Tab 2: Activity Feed**
- Timeline with date group headers (e.g., "7 JUN 2026")
- 9 event types with dark badges: live_session, exam, forum, assignment, quiz, video, feedback, pdf, scorm
- Each event: time, type badge (dark bg + white text), title, status dot, detail pills
- Forum/feedback events show comment blocks (greyscale blockquote with left border)

**Filters:**
- Activity type dropdown with checkboxes (select/deselect individual types, "All activity types" toggle)
- Time range segmented control: All time / 24h / 7 days / 30 days / Custom
- Custom → DateRangePicker component (custom-built calendar)

**Tab 3: Assignments** — table with name, released date, due date, status (graded/pending), grade/total
**Tab 4: Quizzes** — table with name, window, status (submitted/not attempted), score/total, time taken
**Tab 5: Live Sessions** — table with name, date, attendance (present/absent), duration
**Tab 6: Tickets** — timeline with ticket number, date, status (open/resolved), title, category

---

### 2.4 Grading

**File:** `components/coordinator/GradingView.tsx`
**Route:** `/coordinator/grading` or `/faculty/grading`
**Purpose:** Review student submissions, check plagiarism, provide grades and feedback.

#### List View

**4 clickable status count cards:** New, Pending, Overdue, Graded — clicking a card filters the table

**Filters:**
- Programme dropdown
- Course dropdown
- Status clear button
- Search

**Table columns:**
- Student (avatar + name + roll number)
- Submission (title + type: assignment/quiz)
- Course (code)
- Submitted (relative time)
- Plagiarism (percentage, color-coded)
- Status (badge)
- Grade (marks/total or "—")

**Business rules:**
- Overdue rows have red tint
- Plagiarism N/A for quizzes (auto-graded)

#### Detail View (click any submission)

**Left panel:**
- Submission header: course badge, status badge, type badge, title, course name
- Student info: avatar, name, roll number, submitted date, due date
- Document preview area (placeholder for PDF viewer/rich text)
- Existing feedback card (if already graded)

**Right sidebar:**
- **Plagiarism Check:**
  - Circular score indicator with color: green (<=15%), amber (16-30%), red (>30%)
  - Severity labels: "Low similarity — Within acceptable range", "Moderate similarity — Review recommended", "High similarity — Requires investigation"
  - "View Full Report" button → opens external plagiarism service (Turnitin/Urkund)

- **Grade Form** (shown only if not yet graded):
  - Marks input (number, out of maxMarks) — centered, large font
  - Feedback textarea
  - "Submit Grade" button (primary)
  - "Request Resubmission" button (secondary, amber)

#### Assessment Analytics Tab

**File:** `components/coordinator/AssessmentAnalytics.tsx`
**Purpose:** View quiz results, assignment submissions, and review individual learner attempts. Separate tab alongside the Grading Queue on the Grading page.

**Tab bar** at the top of the Grading page: "Grading Queue" (existing) | "Assessment Analytics" (new)

**Level 1 — Assessment List:**
- All assessments (quizzes + assignments) across courses
- Search bar + type filter pills (All / Quiz / Assignment)
- Each card shows: type badge, course, title, submission count (X/Y), average score %, progress bar
- Click → drills into results

**Level 2 — Assessment Results:**
- Back link to assessment list
- Assessment header: type badge, course, title
- 4 stat cards: Average Score, Pass Rate, Attempted count, Failed count
- Results table:

| Column (Quiz) | Column (Assignment) | Purpose |
|---|---|---|
| Student (avatar + name + roll) | Student (avatar + name + roll) | Who |
| Score (X/Y) | Submitted (date) | Result / timing |
| Status (Passed/Failed/Not attempted) | Grade (X/Y or —) | Outcome |
| Time taken | Status | Additional context |
| Attempts | — | Retry info |
| Review button | Review button | Drill into attempt |

**Level 3 — Attempt Review (quiz):**
- Dark gradient header with student avatar, name, roll number, total score, time taken
- Question-by-question breakdown:
  - Each question in a bordered card
  - Color-coded: green border (correct), red (incorrect), amber (pending — essay)
  - Shows: question number, question text, question type badge, points earned/max
  - Student's answer + correct answer (shown only for incorrect)
  - Essay questions show the student's text with pending grade indicator

**Business logic:**
- Pass/Fail determined by the "grade to pass" threshold set in quiz settings
- "Not attempted" = student hasn't taken the quiz/submitted the assignment
- "Pending grade" = submitted but contains essay questions awaiting manual grading
- Essay questions within a quiz appear here for inline review — the coordinator can see the student's response in context of the full attempt
- Average score and pass rate are computed from all attempts, not just the latest

---

### 2.5 Gradebook

**File:** `components/coordinator/GradebookView.tsx`
**Route:** `/coordinator/gradebook` or `/faculty/gradebook`
**Purpose:** Configure grading logic (grade scale, weightage) and view computed SGPA/CGPA.

**Programme selector** in header — dropdown to switch between programmes.

#### 3 tabs

**Tab 1: Student Grades (default)**
- Semester pill selector
- Search, Grade Release toggle (Published/Not Published), Export button
- Table: students x courses

| Column | Description |
|--------|------------|
| # | Row number |
| Student | Avatar + name |
| Roll No | Monospace |
| Per-course columns | Grade badge (color-coded) + total marks. Header shows course number + credits |
| SGPA | Computed, green >=8, red <6 |
| CGPA | Computed, same coloring |

**Grade badges color scheme:**
| Grade | Color | Background |
|-------|-------|-----------|
| O (Outstanding) | Green #059669 | Light green |
| A+ (Excellent) | Blue #072FB5 | Light blue |
| A (Very Good) | Blue #1D4ED8 | Light blue |
| B+ (Good) | Amber #D97706 | Light amber |
| B (Above Average) | Brown #B45309 | Light brown |
| C (Average) | Orange #EA580C | Light orange |
| F (Fail) | Red #DC2626 | Light red |

**Hover tooltip** on any grade cell shows: course name, internal marks/25, external marks/75, total/100, grade, points

**Business logic:**
- Rows with any F grade are highlighted with red tint
- SGPA = Sum(Credit_i × GradePoint_i) / Sum(Credit_i) for the semester
- CGPA = weighted average of SGPA across all completed semesters
- Grade Release toggle controls whether students can see their grades

**Tab 2: Configuration**
Two-column layout: grade scale (left, wider) + settings (right)

**Grade Scale Editor:**
- Table: Grade, Descriptor, Min%, Max%, Points
- "Edit Scale" button → cells become editable input fields
- "Save" / "Cancel" buttons appear during edit
- "Reset to UGC Default" restores the standard CBCS scale
- UGC CBCS default: O=85-100/10pts, A+=75-84/9pts, A=65-74/8pts, B+=55-64/7pts, B=45-54/6pts, C=40-44/5pts, F=0-39/0pts

**Assessment Weightage:**
- Slider: Internal (Continuous) vs External (End-Semester)
- Default: 25% / 75% (UGC standard)
- Range: 10-50% internal
- Visual progress bar showing the split

**Credit Structure:**
- Per-course credit listing for the selected semester
- Total credits at bottom

**SGPA Formula Card:**
- Mathematical notation: SGPA = Σ(Ci × GPi) / ΣCi
- Explanation text

**Tab 3: Analytics**
- 4 summary cards: Total Students, Pass Rate, Average SGPA, Semester Topper
- Grade Distribution: horizontal bar chart showing count per grade (O through F)
- Course Performance table: per-course avg score, pass rate, fail count
- Anomaly flags: auto-detects courses with <60% pass rate or 3+ failures, shows amber warning box

---

### 2.6 Attendance

**File:** `components/faculty/AttendanceView.tsx`
**Route:** `/coordinator/attendance` or `/faculty/attendance`
**Purpose:** View auto-marked attendance and override individual records.

**Programme filter** in header.

#### Layout: Session list (left, 300px) + Attendance detail (right)

**Session List:**
- Label: "LIVE SESSIONS"
- Each session card: Video icon, session title, course badge + course name, date + time + scheduled duration
- Completed sessions show attendance fraction (e.g., "8/10")
- Upcoming sessions show "Upcoming" badge
- Programme filter controls which sessions appear

**Session Detail (right panel):**

**Header card:**
- Session title with Video icon
- Course badge + course name + date + time
- Present/absent count (e.g., ✓8 ✗2 /10)

**3 duration cards in a row:**
| Duration | Description | Styling |
|----------|-------------|---------|
| Scheduled | What was planned (e.g., "2h") | Neutral background |
| Total Duration | Actual session length (e.g., "2h 15m") | Neutral background |
| Cut-off (75%) | Minimum for present marking (e.g., "1h 30m") | Amber-tinted with border |

Override count indicator: "X manual override(s) applied"

**Info banner:** "Students who attended >= {cutoff} (75% of scheduled) are auto-marked Present. Below cut-off is marked Absent. You can override individual records."

**Attendance Table:**
| Column | Description |
|--------|------------|
| # | Row number |
| Student | Avatar + name |
| Roll No | Monospace |
| Time Attended | Progress bar + time value (green if >= cutoff, red if below) |
| Auto Status | Computed from time vs cutoff: Present or Absent |
| Final Status | After override: Present/Absent badge + "Overridden" label if changed |
| Override | "Override" button → reason input + "Mark Present/Absent", or "Revert" for existing overrides |

**Auto-marking business logic:**
```
IF student.timeMinutes >= session.cutoffMinutes THEN autoStatus = "present"
ELSE autoStatus = "absent"

cutoffMinutes = scheduledMinutes × 0.75
finalStatus = overrideStatus ?? autoStatus
```

**Override flow:**
1. Click "Override" on any student row
2. Reason input field appears (mandatory)
3. Button shows opposite of auto status: if auto=absent → "Mark Present", if auto=present → "Mark Absent"
4. After applying: shows "Overridden" label under final status
5. "Revert" button appears to remove override and restore auto-computed status

---

### 2.7 Exams

**File:** `components/coordinator/ExamsView.tsx`
**Route:** `/coordinator/exams` or `/faculty/exams`

#### 3 tabs

**Tab 1: Schedule**

**Filters:** Type pills (All / Mid Sem / End Sem / Supplementary) + Status (All / Scheduled / Completed) + Search
**"Create Exam" button**

**Table columns:**
| Column | Description |
|--------|------------|
| Date | Exam date |
| Course | Name + code |
| Type | Badge: Mid Sem (blue) / End Sem (dark) / Supplementary (amber) |
| Time | Start – End + duration + venue |
| Mode | Online / In-person |
| Max Marks | Number |
| Status | Scheduled (blue) / Completed (green) |
| Appeared | X/Y for completed, just eligible count for scheduled |
| Actions | "Eligibility" link (→ tab 2), "Results" link for completed (→ tab 3) |

**Create Exam Modal:**
- Course (dropdown)
- Exam Type: Mid Sem / End Sem / Supplementary / Improvement — selecting type auto-sets max marks (Mid Sem=25, End Sem/Supp/Impr=75)
- Date, Start Time, End Time
- Mode: Online / In-person toggle
- Max Marks (editable)
- Venue (shown only for in-person)
- Proctoring note: "Configure proctoring in the Proctoring Portal after creating the exam" with link

**Tab 2: Eligibility**

**Purpose:** Manage which students can sit for each exam based on UGC attendance rules.

**Exam selector dropdown** — choose any exam to see its eligibility list

**4 summary cards:** Eligible, Exemption Requested, Medical Pending, Debarred

**UGC attendance rules banner:**
| Attendance | Status | Action |
|-----------|--------|--------|
| 75%+ | Eligible | Automatic |
| 65-74% | Exemption possible | Student submits documented reason, coordinator reviews |
| 50-64% | Medical certificate required | From government hospital only |
| <50% | Debarred | Must repeat semester, cannot override |

**Student table:**
| Column | Description |
|--------|------------|
| Student | Avatar + name |
| Roll No | Monospace |
| Attendance | Percentage, color-coded (green >=75, amber 65-74, orange 50-64, red <50) |
| Status | Badge: Eligible / Exemption Requested / Medical Pending / Debarred / Override Granted |
| Reason / Notes | Text explaining the exemption request |
| Action | "Grant" button for exemption/medical → changes status to "Override Granted". Debarred shows "Cannot override" |

**Business logic:**
- "Grant" button only appears for `exemption_requested` and `medical_pending` statuses
- Debarred students (<50%) cannot be overridden — this is a hard UGC rule
- Granting an override is logged with the coordinator's action

**Tab 3: Results**

**Exam selector** — only completed exams shown
**Publish/Unpublish toggle** — controls whether students can see these results

**Results table:**
| Column | Description |
|--------|------------|
| Student | Avatar + name |
| Roll No | Monospace |
| Marks | Score/MaxMarks |
| Percentage | Calculated, color-coded |
| Status | Passed (green) / Failed (red) / Absent (grey) / Withheld (amber) |

Footer: passed/failed/absent counts + average marks

**Supplementary & Improvement Tracker:**
- Students with arrears (F grades) across any exam
- Table: Student, Roll No, Arrear Courses (red badges), Attempts, Clearance Deadline
- UGC allows 5 years to clear all papers
- "Schedule Re-exam" action button per student

---

### 2.8 Schedule

**File:** `components/coordinator/ScheduleView.tsx`
**Route:** `/coordinator/schedule` or `/faculty/schedule`
**Purpose:** Unified chronological view of all upcoming assignments, quizzes, and exams.

**Single toolbar bar** containing all controls:
- Time filter: Upcoming / Past / All
- Type filter with counts: All / Exam (N) / Assignment (N) / Quiz (N)
- Programme dropdown
- Search

**Events grouped by proximity:**
- Tomorrow
- This Week
- Next Week
- This Month
- Later
- Past (if "Past" or "All" time filter)

**Each event card:**
- Colored left border by type (red=exam, brown=assignment, purple=quiz)
- Date block: day number, month abbreviation, weekday
- Type badge with icon
- Course badge (monospace)
- Event title
- Course name + programme
- Time, duration, max marks, venue, submission count (for assignments)
- Past events shown at 60% opacity

---

### 2.9 Reports

**File:** `components/coordinator/ReportsView.tsx`
**Route:** `/coordinator/reports` or `/faculty/reports`

**Horizontal tabs** (same pattern as other pages): Engagement & Eligibility | Exam Summary

**Programme selector** in header.

#### Tab 1: Engagement & Eligibility

**Purpose:** Track student engagement against UGC 75% threshold for exam eligibility.

**3 summary cards:** Total Students, Eligible (75%+), Below Threshold

**UGC compliance note:** Cites Regulation 13.e (2h fortnightly activity) and 15.1.c.iii (75% threshold)

**Sort controls:** Engagement % / Attendance

**Student table:**
| Column | Description |
|--------|------------|
| Student | Avatar + name + roll number |
| Engagement | Progress bar + percentage (green >=75, amber 50-74, red <50) |
| Attendance | Percentage, color-coded |
| Fortnight Hrs | Hours of activity per fortnight (red if <2h — UGC minimum) |
| Live | Live session participation % |
| Tutorial | E-Tutorial completion % |
| Content | E-Content consumption % |
| Forum | Forum participation % |
| Eligibility | Badge: Eligible (green) / Ineligible (red) |

**Business logic:**
- A student is "Eligible" if engagement >= 75%
- The 4 quadrant columns show per-quadrant engagement (UGC requires engagement across ALL quadrants)
- Fortnight hours below 2h is flagged red (UGC Reg 13.e)
- At-risk rows (50-74%) have amber tint, critical rows (<50%) have red tint

**Export CSV** button for regulatory submissions.

#### Tab 2: Exam Summary

**Purpose:** Aggregate pass/fail rates across all exams in the semester.

**Type filter:** All Exams / Mid Sem / End Sem
**4 summary cards:** Total Exams, Pass Rate, Total Appeared, Failed

**Exam table:**
| Column | Description |
|--------|------------|
| Date | Exam date |
| Course | Name + code |
| Type | Mid Sem / End Sem badge |
| Eligible | Count |
| Appeared | Count |
| Absent | Count (red if >0) |
| Passed | Count (green) |
| Failed | Count (red if >0) |
| Pass Rate | Percentage badge (green >=80, amber 60-79, red <60) |
| Avg Score | Score/MaxMarks |

**Attention Required** section: auto-flags exams with <70% pass rate, listing course code, type, date, pass rate, failures, and absences.

---

### 2.10 Announcements

**File:** `components/coordinator/AnnouncementsView.tsx`
**Route:** `/coordinator/announcements`, `/faculty/announcements`, `/mentor/announcements`

**Purpose:** Broadcast notices to students across programmes.

**Filters:** Search + Programme dropdown
**Count:** "X announcements" shown

**Announcement list:**
- Pinned announcements float to top (sorted by pin status, then recency)
- Pinned items have blue left border + pin icon
- Each card: title, full body text, meta row (time ago, absolute date, programme badge, audience count)
- Pin/Unpin toggle button
- Delete button

**Create modal ("New Announcement"):**
- Title (text)
- Message (textarea, multi-line)
- Programme (dropdown: All Programmes / specific programme)
- Pin to top (checkbox)
- "Publish" button — prepends to list immediately (client-side)

**Business logic:**
- Programme "All" reaches all students across all managed programmes
- Audience count reflects the total student count in the selected programme(s)

---

### 2.11 Forums

**File:** `components/coordinator/ForumsView.tsx`
**Route:** `/coordinator/forums`, `/faculty/forums`, `/mentor/forums`

**Purpose:** Monitor and respond to student discussions across all course forums.

**Status summary banners:** "X unanswered threads need your attention" + "Y flagged for moderation"

**Filters:** Status pills (All / Needs Response / Flagged / Answered) + Programme dropdown + Search

**Thread list:**
- Each thread: student avatar, course badge, status badge (Needs Response amber / Answered green / Flagged red), title, body preview (truncated), author + time, reply count + views
- Flagged threads have red-tinted background
- Unanswered threads have faint amber background

**Thread detail view (click any thread):**
- Full post: course badge, status badge, title, full body text, author info, time, views + reply count
- "Reply as Coordinator" section: textarea + "Post Reply" button

**Thread statuses:**
| Status | Meaning | Visual |
|--------|---------|--------|
| Unanswered / Needs Response | No faculty/coordinator has replied yet | Amber dot, amber badge |
| Answered | Faculty or coordinator has replied | Green dot, green badge |
| Flagged | System detected inappropriate content or was manually flagged | Red dot, red badge, red background |

---

## 3. Mentor Role

**Sidenav tabs (6):** Home, My Mentees, Counselling, Escalations, Announcements, Forums

**Avatar color:** Green (#059669) — distinct from blue (coordinator/faculty)

---

### 3.1 Home Dashboard

**File:** `components/mentor/MentorDashboard.tsx`
**Route:** `/mentor`

**4 summary cards:** Total Mentees, On Track, At Risk, Critical

**"Needs Attention" section:**
- Lists at-risk and critical mentees
- Each row: avatar, name, issue description, engagement %, last active time
- Sorted by engagement (lowest first)

**Two-column bottom:**

**Upcoming Counselling Sessions:**
- Next 3 scheduled sessions
- Each: mentee avatar, name, session type, date, time
- "Schedule new session" footer link

**Mentee Forum Activity:**
- Recent forum posts by mentees (or lack thereof)
- Active mentees: show what they posted + course + time
- Inactive mentees: red background, "No forum activity in X days" warning
- Inactivity is a key early warning indicator for the mentor

---

### 3.2 My Mentees

**File:** `components/mentor/MenteesView.tsx`
**Route:** `/mentor/mentees`
**Purpose:** Complete list of assigned mentees with engagement tracking.

**UGC context:** "X students assigned · UGC 1:250 mentor ratio"

**Filters:** Status pills with counts (All / On Track / At Risk / Critical) + Programme dropdown + Search

**Mentee table:**
| Column | Description |
|--------|------------|
| Student | Avatar + name + roll number |
| Programme | Programme name + semester |
| Engagement | Percentage, color-coded |
| Attendance | Percentage, color-coded |
| CGPA | Computed GPA (green >=8, normal >=5, red <5) |
| Last Active | Relative time |
| Forum | Post count (red if 0) |
| Status | On Track (green) / At Risk (amber) / Critical (red) |
| Last Counselling | Date of most recent counselling session |

**Status logic:**
```
IF engagement >= 75% → On Track (green)
IF engagement >= 50% AND < 75% → At Risk (amber)
IF engagement < 50% → Critical (red)
```

**Business logic:**
- Critical rows have red tint, at-risk rows have faint amber tint
- Forum post count of 0 is flagged red — indicates complete disengagement from discussions
- "Last Counselling" helps mentor track when they last checked in with each student

---

### 3.3 Counselling

**File:** `components/mentor/CounsellingView.tsx`
**Route:** `/mentor/counselling`
**Purpose:** Schedule, conduct, and log counselling sessions with students.

**Filters:** Status (All / Scheduled / Completed)
**"Schedule Session" button**

**Session list:**
- Each card: mentee avatar, name, session type, programme badge, date/time/duration, status badge
- Click any session → detail view

**Session types:**
- Progress Review
- Academic Guidance
- Re-engagement Plan
- Attendance Review
- Career Counselling

**Session detail view:**
- Status + type badges
- Mentee info: large avatar, name, roll number, programme
- Date, time, duration
- **Session Notes** (text block) — mentor's record of what was discussed
- **Action Items** (checklist) — agreed-upon next steps for the student

**Schedule Session Modal:**
- Mentee (dropdown of assigned students)
- Session Type (dropdown)
- Date + Time
- Notes (optional pre-session agenda)
- "Schedule" button

**Business logic:**
- Counselling sessions are the UGC-mandated mentoring touchpoint
- Notes and action items create an audit trail for NAAC/AQAR submissions
- Session data should be stored separately from the student profile but linked via student ID

---

### 3.4 Escalations

**File:** `components/mentor/EscalationsView.tsx`
**Route:** `/mentor/escalations`
**Purpose:** Raise concerns about at-risk students to the programme coordinator.

**Status summary:** "X open" (red) + "Y in review" (amber)

**Filters:** All / Open / In Review / Resolved

**Escalation list:**
- Each card: colored left border (red=open, amber=in review, green=resolved), mentee avatar, title, 2-line description preview, mentee name + programme + time, status + priority badges
- Click any → detail view

**Detail view:**
- Status + priority badges + date
- Full title + mentee info
- Complete description text
- **Coordinator Response** section (if any): response text + resolution date
- Resolved escalations show green left border

**New Escalation Modal:**
- Student (dropdown)
- Title (brief description)
- Priority: High / Medium / Low (toggle buttons)
- Description (textarea — "Provide details about the issue, what you've tried, and what action you're requesting from the coordinator")
- "Submit Escalation" button

**Escalation flow:**
```
1. Mentor creates escalation (status: Open)
2. Coordinator reviews (status: In Review)
3. Coordinator responds with action taken (status: Resolved)
```

**Priority levels:**
| Priority | When to Use | Examples |
|----------|-------------|---------|
| High | Immediate intervention needed | Student inactive 12+ days, potential dropout, all courses failing |
| Medium | Action needed but not urgent | Attendance exemption request, tutorial support needed |
| Low | FYI / minor concern | Study group recommendation, deadline clarification |

---

## 4. Learner Role

### 4.1 Home Dashboard

**File:** `components/home/HomeScreen.tsx`
**Route:** `/` (after login + onboarding)
**Page background:** `#FDF8F2` — lighter warm beige

**Layout:**

```
[Greeting Hero]
[Semester Selector]
[Continue Learning (70%) | Engagement Score (30%)]
[Upcoming Activities (50%) | divider | Recent Announcements (50%)]
[Continue Watching — horizontal scroll]
[Continue Reading — horizontal scroll]
[Active Discussions]
```

#### Sections

**1. Greeting Hero** — Date line + "Welcome, {name}" with name in blue accent

**2. Semester Selector** — "You're in" + dropdown to switch semesters

**3. Continue Learning Card + Engagement Score (side by side, 70/30)**

**Continue Learning Card** (`ContinueLearningCard.tsx`):
- Gradient background: `#C8DAFF → #EDDCC0` (saturated blue-to-gold)
- Bold dark border: `2px solid rgba(15,15,15,0.45)`
- Content: label ("Continue learning" / "Start learning"), course title, activity stat tiles, progress bar + percentage, CTA button
- Activity stats are compact frosted tiles (`rgba(255,255,255,0.55)` background, `maxWidth: 420px`) showing all 5 quadrants: Live (Video icon), E-Tutorial, E-Content, Discussion, Assessment. Each tile: icon on top, done/total number, label below
- Matches the coordinator's course card quadrant tile treatment for visual consistency across roles

**Engagement Score Card** (`EngagementScoreCard.tsx`):
- Dark navy gradient background
- Large score number with segmented progress bar
- 75% threshold marker
- Eligibility status chip (green = eligible, red = not eligible)

**4. Upcoming Activities + Recent Announcements (side by side, 50/50)**

Separated by a thin 1px vertical divider line.

**Upcoming Activities** (`UpcomingActivities.tsx`):
- Timeline layout with vertical line and colored dots per event type
- Timeline dots: 26px circles with 2.5px colored border and 12px icon inside
- Each event card has: bold dark border (`2px solid rgba(15,15,15,0.45)`), rounded corners (10px), type badge, urgency badge ("Tomorrow"), title, course + date/time, duration (if applicable)
- Events sorted by proximity (soonest first)
- "View calendar" link in header

**Recent Announcements** (`RecentAnnouncements.tsx`):
- 3 most recent announcements
- Each card: bold dark border (`2px solid rgba(15,15,15,0.45)`), programme badge, pinned indicator, time, title (display font), 2-line body preview
- Hover highlights border blue
- "View all" link in header

**5. Continue Watching** — horizontal scroll of unwatched video cards with SVG thumbnails

**6. Continue Reading** — horizontal scroll of unread page cards

**7. Active Discussions** — recent forum threads with author, reply count, course

### 4.2 Other Learner Pages

- **Learn:** Course list with semester filter, course viewer with unit/activity structure, video player, page viewer, PDF viewer, quiz interface
- **Calendar:** Monthly grid with event types (live session, assignment, quiz, exam, holiday)
- **Grades:** Grade table per semester
- **Exam:** Exam information view
- **Forum:** Discussion threads
- **Announcements:** View-only announcement feed
- **Certificate:** Dynamic certificate with learner name, programme, completion date, LinkedIn share

---

## 5. UGC Compliance Rules

These regulations are embedded in the UI and must be preserved:

| Rule | UGC Reference | Where It Appears |
|------|---------------|-----------------|
| 75% engagement threshold for exam eligibility | Reg 15.1.c.iii | Exams → Eligibility, Reports → Engagement |
| Minimum 2 hours activity per fortnight | Reg 13.e | Reports → Engagement (Fortnight Hrs column) |
| 4-quadrant content model (Live, Tutorial, Content, Forum) | Reg 4.1 | Programmes → Course cards, Reports → Engagement |
| 25%/75% internal/external assessment split | CBCS Guidelines | Gradebook → Configuration |
| 10-point CBCS grade scale (O through F) | UGC CBCS | Gradebook → Configuration |
| 1:250 mentor-to-student ratio | Annexure-VI | Programmes → Faculty & Mentors tab |
| Attendance exemption tiers (75/65-74/50-64/<50) | UGC Guidelines | Exams → Eligibility, Attendance |
| DEB ID mandatory for regulatory reporting | Reg 2020 | Students → Create Student modal |
| Aadhaar/Govt ID for identity verification | Reg 2020 | Students → Create Student modal, Student 360 verification |
| 5-year window to clear arrear papers | CBCS Guidelines | Exams → Supplementary Tracker |
| 75% session duration cut-off for attendance | Derived from Reg 13.e | Attendance → auto-marking logic |

---

## 6. Cross-Role Shared Features

### Select Dropdowns
All `<select>` elements use consistent custom styling:
- `appearance: none` to remove native browser arrow
- Custom SVG chevron via `backgroundImage`
- `paddingRight: 28px` for arrow space

### Programme Selector
Many pages (Gradebook, Exams, Schedule, Reports, Attendance) include a programme selector dropdown in the header. In production:
- Coordinator: shows all programmes
- Faculty: shows only enrolled programmes
- Pre-select the user's primary programme

### Status Color System
Consistent across all roles:
- Green (#059669): positive states (present, eligible, passed, on track, published, answered)
- Amber (#D97706): warning states (at risk, pending, exemption requested, overdue, unanswered)
- Red (#DC2626): critical states (absent, debarred, failed, critical, flagged, ineligible)
- Blue (#072FB5): neutral/active states (new, scheduled, primary actions)

### Table Pattern
All tables follow the same structure:
- Uppercase 10px headers with letter-spacing
- 12px body text
- Subtle row borders (rgba 3%)
- Tinted rows for warning/error states
- Footer with counts/summary
- Monospace font for numbers/codes
