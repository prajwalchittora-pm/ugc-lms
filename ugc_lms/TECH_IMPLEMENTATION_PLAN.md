# UGC LMS — Tech Implementation Plan

> Based on PRODUCT_DOCUMENTATION.md, HANDOFF.md, and MULTI_ROLE_PLAN.md
> Last updated: 9 June 2026

---

## Table of Contents

1. [Architecture & Stack](#1-architecture--stack)
2. [Backend: Moodle Headless + Custom Plugin](#2-backend-moodle-headless--custom-plugin)
3. [Database: Supabase (Custom Tables)](#3-database-supabase-custom-tables)
4. [API Layer: Next.js Route Handlers](#4-api-layer-nextjs-route-handlers)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Integration: Zoom (Live Sessions)](#6-integration-zoom-live-sessions)
7. [Integration: Freshdesk (Support Tickets)](#7-integration-freshdesk-support-tickets)
8. [Integration: Plagiarism Detection](#8-integration-plagiarism-detection)
9. [Integration: Elumina (Proctored Exams)](#9-integration-elumina-proctored-exams)
10. [Feature Implementation Phases](#10-feature-implementation-phases)
11. [Data Model: Key Entities](#11-data-model-key-entities)
12. [API Endpoint Map](#12-api-endpoint-map)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)

---

## 1. Architecture & Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Learner  │ │ Faculty  │ │Coordinator│ │  Mentor  │            │
│  │    /     │ │ /faculty │ │/coordinator│ │ /mentor  │           │
│  └────┬─────┘ └────┬─────┘ └────┬──────┘ └────┬─────┘           │
│       └──────┬─────┴──────┬─────┴──────────────┘                 │
│              │  API Layer (Route Handlers)       │                │
│              └──────────────┬────────────────────┘               │
└──────────────────────────────┼───────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
  │  Moodle 4.x   │   │   Supabase    │   │  External     │
  │  (Headless)   │   │   (Custom DB) │   │  Services     │
  │               │   │               │   │               │
  │ - Courses     │   │ - Engagement  │   │ - Zoom SDK    │
  │ - Users       │   │ - UGC Rules   │   │ - Freshdesk   │
  │ - Activities  │   │ - Analytics   │   │ - Elumina     │
  │ - Grades      │   │ - Sessions    │   │ - Turnitin    │
  │ - Forums      │   │ - Tickets     │   │               │
  └───────────────┘   └───────────────┘   └───────────────┘
```

**Stack:**
- **Frontend:** Next.js 16, React 19, TypeScript, inline styles, Lucide icons
- **Backend (LMS core):** Moodle 4.x as headless API server
- **Backend (custom):** Supabase for UGC-specific data that Moodle doesn't natively support
- **API Layer:** Next.js Route Handlers (server-side) proxying Moodle + Supabase
- **Auth:** Moodle token-based auth, NextAuth.js session wrapper
- **Live Sessions:** Zoom Meeting SDK (embedded)
- **Support:** Freshdesk widget + API
- **Plagiarism:** Turnitin/Urkund API
- **Proctored Exams:** Elumina integration
- **Hosting:** Vercel (frontend) + Cloud VM (Moodle) + Supabase (managed)

---

## 2. Backend: Moodle Headless + Custom Plugin

### What Moodle handles natively
| Feature | Moodle Web Service |
|---------|-------------------|
| User management | `core_user_*` |
| Course/category management | `core_course_*` |
| Enrolments | `enrol_manual_*` |
| Activities (quiz, assignment, page, SCORM, forum) | `mod_{type}_*` |
| Grade items & grades | `core_grades_*`, `gradereport_*` |
| Forum posts & discussions | `mod_forum_*` |
| Quiz attempts & questions | `mod_quiz_*` |
| Assignment submissions | `mod_assign_*` |
| Calendar events | `core_calendar_*` |
| Completion tracking | `core_completion_*` |

### Custom Moodle Plugin: `local_ugclms`
Bridges gaps between Moodle core and UGC requirements:

| Function | What it does | Why Moodle can't |
|----------|-------------|-----------------|
| `local_ugclms_get_engagement_score` | Calculates 4-quadrant engagement % per student | Moodle has completion but not weighted quadrant scoring |
| `local_ugclms_get_eligibility_status` | Returns exam eligibility per student (75% threshold) | UGC-specific rule, not native |
| `local_ugclms_override_eligibility` | Allows coordinator to override eligibility with reason | Custom workflow |
| `local_ugclms_get_programme_structure` | Returns programme → semester → course hierarchy | Moodle categories are flat |
| `local_ugclms_calculate_sgpa_cgpa` | Computes SGPA/CGPA per CBCS 10-point scale | Moodle grades don't support Indian CBCS |
| `local_ugclms_get_attendance_auto` | Returns auto-computed attendance from activity completion | Derived metric, not stored in Moodle |
| `local_ugclms_create_live_session` | Creates live session activity with Zoom meeting ID | Links Zoom to Moodle activity |
| `local_ugclms_get_grading_queue` | Returns submissions sorted by deadline proximity | Custom sort + enrichment |

### Installation
```bash
# Clone plugin into Moodle
cd /path/to/moodle/local/
git clone <plugin-repo> ugclms

# Run upgrade
php admin/cli/upgrade.php
```

---

## 3. Database: Supabase (Custom Tables)

For data that doesn't belong in Moodle:

```sql
-- Programme structure (Moodle categories are too flat)
CREATE TABLE programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('UG', 'PG', 'Diploma', 'Certificate')),
  batch_year INT,
  total_semesters INT,
  total_credits INT,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Semester → Course mapping
CREATE TABLE programme_semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID REFERENCES programmes(id),
  semester_number INT,
  moodle_category_id INT, -- links to Moodle category
  status TEXT DEFAULT 'upcoming'
);

-- Live session metadata (beyond Moodle)
CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodle_activity_id INT,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_host_url TEXT,
  faculty_user_id INT, -- Moodle user ID
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT,
  recording_url TEXT,
  recording_status TEXT DEFAULT 'none', -- none, processing, available
  attendance JSONB, -- { userId: { joined_at, left_at, duration } }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Engagement scores (computed, cached)
CREATE TABLE engagement_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT, -- Moodle user ID
  programme_id UUID REFERENCES programmes(id),
  semester_number INT,
  live_pct FLOAT DEFAULT 0,
  tutorial_pct FLOAT DEFAULT 0,
  content_pct FLOAT DEFAULT 0,
  forum_pct FLOAT DEFAULT 0,
  overall_pct FLOAT DEFAULT 0,
  eligible BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- Freshdesk ticket references
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT, -- Moodle user ID
  freshdesk_ticket_id TEXT,
  subject TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grading deadlines (not in Moodle)
CREATE TABLE grading_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodle_assign_id INT,
  grade_by DATE,
  reminded BOOLEAN DEFAULT false
);
```

---

## 4. API Layer: Next.js Route Handlers

All API calls go through `/api/*` route handlers. The frontend never calls Moodle or Supabase directly.

```
/api/auth/login              POST  → Moodle token + session
/api/auth/me                 GET   → Current user + role

/api/programmes              GET   → List programmes (Supabase)
/api/programmes              POST  → Create programme (Supabase + Moodle category)
/api/programmes/[id]         GET   → Programme detail with semesters

/api/courses/[id]            GET   → Course with activities (Moodle)
/api/courses/[id]/activities POST  → Create activity (Moodle + settings in Supabase)

/api/grading/queue           GET   → Pending submissions with deadlines
/api/grading/[id]            GET   → Submission detail
/api/grading/[id]/grade      POST  → Submit grade + feedback (Moodle)

/api/quiz/[id]/questions     GET   → Quiz questions (Moodle question bank)
/api/quiz/[id]/attempts      GET   → Student attempts (Moodle)

/api/engagement/[userId]     GET   → Engagement scores (Supabase, cached)
/api/engagement/recompute    POST  → Trigger recomputation

/api/eligibility/[progId]    GET   → Eligibility list
/api/eligibility/override    POST  → Override eligibility

/api/live-sessions           GET   → List sessions (Supabase)
/api/live-sessions           POST  → Create session (Supabase + Zoom API)
/api/live-sessions/[id]/join GET   → Get join URL
/api/live-sessions/[id]/recording GET → Get recording URL

/api/announcements           GET   → List (Moodle)
/api/announcements           POST  → Create (Moodle)

/api/forums/threads          GET   → List threads (Moodle)
/api/forums/threads/[id]     GET   → Thread detail (Moodle)
/api/forums/threads/[id]/reply POST → Reply (Moodle)

/api/tickets                 GET   → List tickets (Freshdesk → Supabase cache)
/api/tickets                 POST  → Create ticket (Freshdesk API)
/api/tickets/[id]            GET   → Ticket detail (Freshdesk API)

/api/reports/engagement      GET   → Engagement report (Supabase)
/api/reports/gradebook       GET   → SGPA/CGPA (Moodle grades + computation)
```

---

## 5. Authentication & Authorization

### Flow
1. User enters email + password on login page
2. Frontend calls `/api/auth/login` → server calls Moodle `core_auth_confirm_user` + `login/token.php`
3. Moodle returns `wstoken` + user info
4. Server creates NextAuth.js session with `{ moodleToken, userId, role, programmes }`
5. Session cookie persists; all subsequent API calls include the token

### Role detection
```typescript
// Server-side: determine role from Moodle
const roles = await moodleCall('core_role_get_users_with_capability', {
  capability: 'local/ugclms:manage_programme',
  context: courseContextId
});

// Map to app roles
if (hasCapability('local/ugclms:manage_programme')) role = 'coordinator';
else if (hasCapability('moodle/course:update')) role = 'faculty';
else if (hasCapability('local/ugclms:mentor')) role = 'mentor';
else role = 'learner';
```

### Route protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession(request);
  if (request.nextUrl.pathname.startsWith('/coordinator') && session.role !== 'coordinator') {
    return NextResponse.redirect('/');
  }
  // ... similar for /faculty, /mentor
}
```

---

## 6. Integration: Zoom (Live Sessions)

### Purpose
All live sessions (counselling, tutorials) are conducted via Zoom. The integration handles:
- Creating Zoom meetings when a live session activity is created
- Embedding the Zoom client in the LMS for join/host
- Auto-tracking attendance (who joined, when, for how long)
- Auto-uploading recording after session ends

### Implementation

**A. Meeting Creation (server-side)**
```typescript
// When coordinator creates a live session activity
// POST /api/live-sessions

import { ZoomClient } from '@zoom/server-to-server-oauth';

async function createLiveSession(data: LiveSessionInput) {
  // 1. Create Zoom meeting
  const zoom = new ZoomClient({ accountId, clientId, clientSecret });
  const meeting = await zoom.meetings.create({
    topic: data.title,
    type: 2, // scheduled
    start_time: data.scheduledAt, // ISO 8601
    duration: data.durationMinutes,
    settings: {
      join_before_host: false,
      waiting_room: true,
      auto_recording: 'cloud', // auto-record to cloud
      meeting_authentication: true,
    },
  });

  // 2. Create Moodle activity
  const moodleActivity = await moodleCall('local_ugclms_create_live_session', {
    courseid: data.courseId,
    name: data.title,
    sectionid: data.sectionId,
  });

  // 3. Store session metadata in Supabase
  await supabase.from('live_sessions').insert({
    moodle_activity_id: moodleActivity.id,
    zoom_meeting_id: meeting.id,
    zoom_join_url: meeting.join_url,
    zoom_host_url: meeting.start_url,
    faculty_user_id: data.facultyId,
    scheduled_at: data.scheduledAt,
    duration_minutes: data.durationMinutes,
  });

  return { meetingId: meeting.id, joinUrl: meeting.join_url };
}
```

**B. Join Session (client-side embedded)**
```typescript
// Using Zoom Meeting SDK (Web)
// Embedded in LiveSessionActivity component when "Join Session" is clicked

import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

const client = ZoomMtgEmbedded.createClient();

await client.init({
  zoomAppRoot: document.getElementById('zoom-root'),
  language: 'en-US',
  customize: {
    video: { isResizable: true, viewSizes: { default: { width: 1000, height: 600 } } },
  },
});

await client.join({
  sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY,
  signature: await fetch('/api/zoom/signature', { method: 'POST', body: JSON.stringify({ meetingNumber, role }) }).then(r => r.json()),
  meetingNumber: session.zoom_meeting_id,
  userName: currentUser.name,
  userEmail: currentUser.email,
});
```

**C. Attendance Tracking (webhook)**
```typescript
// Zoom sends webhooks for participant join/leave
// POST /api/webhooks/zoom

async function handleZoomWebhook(event: ZoomWebhookEvent) {
  if (event.event === 'meeting.participant_joined') {
    await supabase.from('live_sessions')
      .update({
        attendance: supabase.raw(`
          jsonb_set(attendance, '{${event.payload.participant.user_id}}',
          '{"joined_at": "${event.payload.join_time}"}'::jsonb)
        `)
      })
      .eq('zoom_meeting_id', event.payload.meeting_id);
  }

  if (event.event === 'meeting.participant_left') {
    // Update duration
  }

  if (event.event === 'recording.completed') {
    // Update recording URL
    await supabase.from('live_sessions')
      .update({
        recording_url: event.payload.recording_files[0].download_url,
        recording_status: 'available',
      })
      .eq('zoom_meeting_id', event.payload.meeting_id);
  }
}
```

**D. Recording States**
| State | Trigger | What the UI shows |
|-------|---------|------------------|
| `none` | Session not yet conducted | "Upcoming" state with Join button |
| `processing` | Zoom webhook: `recording.started` or session ended | "Recording Processing" state with spinner |
| `available` | Zoom webhook: `recording.completed` | "Recording Available" state with video player |

**E. Attendance → Completion**
After session ends, a cron job checks attendance:
- If learner's total time in session ≥ 75% of session duration → mark Moodle activity as complete
- Stored in `engagement_scores` → live session quadrant

---

## 7. Integration: Freshdesk (Support Tickets)

### Purpose
The learner's "Tickets" tab (currently showing "Coming Soon") will connect to Freshdesk for:
- Creating support tickets (technical issues, academic queries, account problems)
- Tracking ticket status
- Faculty/coordinator can view escalated tickets

### Implementation

**A. Freshdesk Widget (client-side)**
```typescript
// Embed Freshdesk widget on the Tickets page
// Option 1: Freshdesk Web Widget (simplest)

useEffect(() => {
  window.FreshworksWidget('boot', {
    token: process.env.NEXT_PUBLIC_FRESHDESK_WIDGET_TOKEN,
    host: 'https://yourdomain.freshdesk.com',
    config: {
      contact: {
        name: currentUser.name,
        email: currentUser.email,
        custom_fields: {
          cf_roll_number: currentUser.rollNo,
          cf_programme: currentUser.programme,
          cf_role: currentUser.role,
        },
      },
    },
  });
}, []);
```

**B. Tickets API (server-side)**
```typescript
// POST /api/tickets — Create ticket
async function createTicket(data: TicketInput) {
  const response = await fetch('https://yourdomain.freshdesk.com/api/v2/tickets', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(FRESHDESK_API_KEY + ':X').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: data.subject,
      description: data.description,
      email: data.userEmail,
      priority: data.priority, // 1=Low, 2=Med, 3=High, 4=Urgent
      status: 2, // Open
      type: data.category, // 'Technical', 'Academic', 'Account'
      custom_fields: {
        cf_programme: data.programme,
        cf_roll_number: data.rollNo,
        cf_course: data.courseCode,
      },
    }),
  });

  const ticket = await response.json();

  // Cache in Supabase for quick listing
  await supabase.from('support_tickets').insert({
    user_id: data.userId,
    freshdesk_ticket_id: String(ticket.id),
    subject: data.subject,
    status: 'open',
    priority: data.priority,
  });

  return ticket;
}

// GET /api/tickets — List tickets for user
async function listTickets(userId: number) {
  // Fetch from Supabase cache (fast) + sync from Freshdesk (background)
  const cached = await supabase.from('support_tickets')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false });

  // Background sync: update statuses from Freshdesk
  syncTicketStatuses(cached.data.map(t => t.freshdesk_ticket_id));

  return cached.data;
}
```

**C. Ticket Categories**
| Category | Description | Auto-assign to |
|----------|------------|---------------|
| Technical | Login issues, video not playing, submission errors | IT Support group |
| Academic | Grade queries, eligibility questions, syllabus clarifications | Programme Coordinator |
| Account | Profile updates, password reset, enrolment issues | Admin group |
| Exam | Proctoring issues, rescheduling requests | Exam Cell group |

**D. Escalation from Mentor**
Mentors can escalate concerns about their mentees:
```typescript
// POST /api/tickets (from mentor role)
{
  subject: 'Mentee engagement concern — Arjun Mehta',
  description: 'Student has dropped below 50% engagement...',
  type: 'Academic',
  priority: 3, // High
  custom_fields: {
    cf_escalated_by: 'mentor',
    cf_mentee_id: studentId,
  }
}
```

---

## 8. Integration: Plagiarism Detection

### Service: Turnitin (via Moodle plugin)
Moodle has native Turnitin integration via `plagiarism_turnitin` plugin.

**Setup:**
1. Install `plagiarism_turnitin` plugin in Moodle
2. Configure Turnitin API credentials in Moodle admin
3. Enable plagiarism checking per assignment activity

**Flow:**
1. Student submits assignment → Moodle sends to Turnitin
2. Turnitin processes and returns similarity score
3. Our API reads the score: `mod_assign_get_submission_status` → includes plagiarism data
4. Frontend shows: circular score indicator + "View Full Report" link → opens Turnitin viewer

---

## 9. Integration: Elumina (Proctored Exams)

### Purpose
End Semester exams require UGC-approved proctoring. Elumina provides:
- Webcam + screen monitoring
- AI-based cheating detection
- Recording retention (5 years per UGC)
- Aadhaar-based identity verification

### Flow
1. Coordinator creates exam in Exams tab → triggers Elumina exam creation via API
2. Eligible students see "Start Exam" on their Exam page → redirects to Elumina exam portal
3. Elumina handles the entire exam session (questions, timing, proctoring)
4. After exam: scores sync back via Elumina webhook → stored in Moodle gradebook
5. Proctoring recordings stored in Elumina cloud (5-year retention)

### API Integration
```typescript
// POST /api/exams/create → also creates Elumina exam
const eluminaExam = await fetch('https://api.elumina.com/v1/exams', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${ELUMINA_API_KEY}` },
  body: JSON.stringify({
    name: examData.title,
    course_code: examData.courseCode,
    start_time: examData.scheduledAt,
    duration_minutes: examData.duration,
    eligible_students: eligibleStudentEmails,
    proctoring_level: 'standard', // standard | enhanced
    identity_verification: 'aadhaar',
  }),
});
```

---

## 10. Feature Implementation Phases

### Phase 1: Core Foundation (Weeks 1-4)
| Task | Depends on | Priority |
|------|-----------|----------|
| Moodle 4.x server setup + `local_ugclms` plugin scaffold | — | P0 |
| Supabase project + schema migration | — | P0 |
| Next.js API layer + Moodle token auth | Moodle | P0 |
| NextAuth.js session + role-based middleware | Auth | P0 |
| Replace mock data in Learner Home, Learn page | API layer | P0 |
| Replace mock data in Course List, Course Viewer | API layer | P0 |

### Phase 2: Coordinator & Faculty (Weeks 5-8)
| Task | Depends on | Priority |
|------|-----------|----------|
| Programme management API (CRUD) | Supabase | P0 |
| Course Editor → Moodle activity CRUD | Moodle API | P0 |
| Activity Settings → persist to Moodle + Supabase | Moodle API | P0 |
| Quiz Editor → Moodle question bank API | Moodle API | P0 |
| Grading queue + submission review + grade POST | Moodle API | P0 |
| Engagement score computation + caching | Plugin + Supabase | P1 |
| Eligibility logic + override API | Plugin | P1 |

### Phase 3: Live Sessions & Integrations (Weeks 9-12)
| Task | Depends on | Priority |
|------|-----------|----------|
| Zoom Server-to-Server OAuth setup | — | P0 |
| Live session creation → Zoom meeting API | Zoom + Supabase | P0 |
| Zoom Meeting SDK embed (join/host) | Zoom SDK | P0 |
| Zoom webhooks (attendance, recording) | Zoom | P1 |
| Recording status states in UI | Webhooks | P1 |
| Freshdesk widget embed | Freshdesk account | P1 |
| Freshdesk ticket API (create, list, detail) | Freshdesk API | P1 |
| Turnitin plugin setup in Moodle | Moodle | P1 |

### Phase 4: Exams & Compliance (Weeks 13-16)
| Task | Depends on | Priority |
|------|-----------|----------|
| Elumina integration (exam creation, SSO) | Elumina API | P0 |
| Gradebook SGPA/CGPA computation | Plugin | P1 |
| Reports: engagement + eligibility (live data) | Engagement scores | P1 |
| Attendance auto-marking from completion data | Plugin | P1 |
| UGC compliance audit checklist | All above | P1 |
| Mentor role: counselling sessions, escalations | Supabase | P2 |

### Phase 5: Polish & Launch (Weeks 17-20)
| Task | Depends on | Priority |
|------|-----------|----------|
| End-to-end testing all 4 roles | All phases | P0 |
| Certificate generation (PDF + LinkedIn share) | Grades | P1 |
| Announcements: push notifications | — | P2 |
| Calendar: sync with Moodle events | Moodle API | P2 |
| Performance optimization (caching, pagination) | — | P1 |
| Mobile responsive fixes | — | P1 |
| UAT with real coordinator + students | — | P0 |

---

## 11. Data Model: Key Entities

```
Programme (Supabase)
├── Semesters (Supabase)
│   └── Courses (Moodle categories + Supabase mapping)
│       ├── Units (Moodle sections)
│       │   ├── Live Sessions (Moodle activity + Supabase + Zoom)
│       │   ├── E-Tutorials / Videos (Moodle mod_resource)
│       │   ├── E-Content / Pages (Moodle mod_page)
│       │   ├── PDFs (Moodle mod_resource)
│       │   ├── SCORM Packages (Moodle mod_scorm)
│       │   ├── Discussion Topics (Moodle mod_forum)
│       │   ├── Quizzes (Moodle mod_quiz)
│       │   └── Assignments (Moodle mod_assign)
│       └── Enrolled Students (Moodle enrolments)
│
├── Faculty (Moodle users + role assignments)
├── Mentors (Moodle users + Supabase mentee mapping)
└── Engagement Scores (Supabase, computed)
```

**Moodle is the source of truth for:** Users, courses, activities, grades, completions, forums
**Supabase is the source of truth for:** Programmes, semesters, live session metadata, engagement scores, grading deadlines, support tickets, UGC-specific overrides

---

## 12. API Endpoint Map

### Moodle Web Services Used

| Service | Function | Used for |
|---------|----------|---------|
| `core_user_get_users_by_field` | Get user by ID/email | Auth, profile |
| `core_course_get_courses` | List courses | Course list |
| `core_course_get_contents` | Course sections + activities | Course viewer |
| `mod_assign_get_assignments` | List assignments | Grading queue |
| `mod_assign_get_submissions` | Get submissions for assignment | Grading detail |
| `mod_assign_save_grade` | Submit grade + feedback | Grading action |
| `mod_quiz_get_quizzes_by_courses` | List quizzes | Quiz list |
| `mod_quiz_get_user_attempts` | Student quiz attempts | Quiz review |
| `mod_quiz_get_attempt_review` | Question-by-question review | Attempt detail |
| `core_question_get_random_question_set` | Random questions from bank | Quiz editor |
| `mod_forum_get_forum_discussions` | Forum threads | Forums page |
| `mod_forum_add_discussion_post` | Reply to thread | Forum reply |
| `core_completion_get_activities_completion_status` | Activity completion | Engagement calc |
| `core_calendar_get_calendar_events` | Calendar events | Calendar page |
| `gradereport_user_get_grade_items` | Grade items for user | Grades page |

---

## 13. Deployment & Infrastructure

### Environments
| Environment | Frontend | Moodle | Supabase | Zoom |
|------------|---------|--------|----------|------|
| Development | `localhost:3004` | Docker (local) | Supabase local | Sandbox |
| Staging | Vercel Preview | AWS EC2 (staging) | Supabase staging project | Sandbox |
| Production | Vercel Prod | AWS EC2 (prod) | Supabase prod project | Production |

### Moodle Server Requirements
- PHP 8.1+, MariaDB 10.6+
- 4 vCPU, 8GB RAM (for ~500 concurrent users)
- 100GB storage (for uploaded content + SCORM packages)
- SSL certificate
- Redis for session caching

### CI/CD
```yaml
# .github/workflows/deploy.yml
- Frontend: Vercel auto-deploy on push to main
- Moodle plugin: SSH deploy to EC2 on plugin repo push
- Database: Supabase migrations via supabase cli
```

### Monitoring
- **Frontend:** Vercel Analytics + Sentry error tracking
- **Moodle:** Server health monitoring (CPU, memory, DB connections)
- **Supabase:** Built-in dashboard + pg_stat alerts
- **Zoom:** Webhook delivery monitoring
- **Freshdesk:** Ticket SLA monitoring via Freshdesk dashboard
