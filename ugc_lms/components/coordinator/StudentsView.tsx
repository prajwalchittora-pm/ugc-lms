'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Upload, X, Check, Users, Mail, Phone, Calendar, Clock, LogIn, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Video, ClipboardCheck, MessageSquare, BookOpenText, MonitorPlay, Ticket, UserPlus, Trash2, Ban, MoreHorizontal, FileCheck, ExternalLink, ChevronDown, Filter, LayoutGrid, Copy, GraduationCap, User } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface Student {
  id: string; name: string; initials: string; rollNo: string | null; email: string; phone: string;
  programme: string; programmeCode: string; semester: number;
  status: 'active' | 'suspended' | 'new'; lastActive: string; lastLogin: string;
  avgGrade: number; avgAttendance: number; engagementScore: number;
  assignmentsSubmitted: number; assignmentsTotal: number;
  quizzesAttempted: number; quizzesTotal: number;
}

const STUDENTS: Student[] = [
  { id: 's1', name: 'Arjun Mehta', initials: 'AM', rollNo: 'MBA-2026-001', email: 'arjun.mehta@university.edu', phone: '9876543210', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'active', lastActive: '2 hours ago', lastLogin: '7 Jun 2026, 10:30 AM', avgGrade: 78, avgAttendance: 88, engagementScore: 72, assignmentsSubmitted: 3, assignmentsTotal: 4, quizzesAttempted: 2, quizzesTotal: 3 },
  { id: 's2', name: 'Priya Sharma', initials: 'PS', rollNo: 'MBA-2026-002', email: 'priya.sharma@university.edu', phone: '9876543211', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'active', lastActive: '30 min ago', lastLogin: '7 Jun 2026, 2:15 PM', avgGrade: 92, avgAttendance: 96, engagementScore: 91, assignmentsSubmitted: 4, assignmentsTotal: 4, quizzesAttempted: 3, quizzesTotal: 3 },
  { id: 's3', name: 'Rahul Verma', initials: 'RV', rollNo: 'MBA-2026-003', email: 'rahul.verma@university.edu', phone: '9876543212', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'suspended', lastActive: '5 days ago', lastLogin: '2 Jun 2026, 9:00 AM', avgGrade: 45, avgAttendance: 52, engagementScore: 38, assignmentsSubmitted: 1, assignmentsTotal: 4, quizzesAttempted: 1, quizzesTotal: 3 },
  { id: 's4', name: 'Ananya Iyer', initials: 'AI', rollNo: 'BCA-2026-001', email: 'ananya.iyer@university.edu', phone: '9876543213', programme: 'BCA - Batch 2026', programmeCode: 'BCA-26', semester: 2, status: 'active', lastActive: '1 hour ago', lastLogin: '7 Jun 2026, 1:00 PM', avgGrade: 85, avgAttendance: 90, engagementScore: 78, assignmentsSubmitted: 3, assignmentsTotal: 3, quizzesAttempted: 2, quizzesTotal: 2 },
  { id: 's5', name: 'Karthik Nair', initials: 'KN', rollNo: 'BCA-2026-002', email: 'karthik.nair@university.edu', phone: '9876543214', programme: 'BCA - Batch 2026', programmeCode: 'BCA-26', semester: 2, status: 'active', lastActive: '3 hours ago', lastLogin: '7 Jun 2026, 11:45 AM', avgGrade: 81, avgAttendance: 92, engagementScore: 82, assignmentsSubmitted: 3, assignmentsTotal: 3, quizzesAttempted: 2, quizzesTotal: 2 },
  { id: 's6', name: 'Neha Patel', initials: 'NP', rollNo: 'MBA-2026-006', email: 'neha.patel@university.edu', phone: '9876543215', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'new', lastActive: '12 days ago', lastLogin: '26 May 2026, 4:20 PM', avgGrade: 32, avgAttendance: 40, engagementScore: 28, assignmentsSubmitted: 0, assignmentsTotal: 4, quizzesAttempted: 0, quizzesTotal: 3 },
  { id: 's7', name: 'Vikash Kumar', initials: 'VK', rollNo: 'CSE-2026-001', email: 'vikash.kumar@university.edu', phone: '9876543216', programme: 'B.Tech CSE - Batch 2026', programmeCode: 'B.Tech CSE-26', semester: 2, status: 'active', lastActive: '6 hours ago', lastLogin: '7 Jun 2026, 8:30 AM', avgGrade: 74, avgAttendance: 80, engagementScore: 65, assignmentsSubmitted: 2, assignmentsTotal: 3, quizzesAttempted: 2, quizzesTotal: 3 },
  { id: 's8', name: 'Sneha Reddy', initials: 'SR', rollNo: 'MBA-2026-008', email: 'sneha.reddy@university.edu', phone: '9876543217', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'active', lastActive: '15 min ago', lastLogin: '7 Jun 2026, 2:45 PM', avgGrade: 95, avgAttendance: 98, engagementScore: 95, assignmentsSubmitted: 4, assignmentsTotal: 4, quizzesAttempted: 3, quizzesTotal: 3 },
  { id: 's9', name: 'Amit Singh', initials: 'AS', rollNo: 'CSE-2026-002', email: 'amit.singh@university.edu', phone: '9876543218', programme: 'B.Tech CSE - Batch 2026', programmeCode: 'B.Tech CSE-26', semester: 2, status: 'active', lastActive: '2 days ago', lastLogin: '5 Jun 2026, 7:00 PM', avgGrade: 68, avgAttendance: 76, engagementScore: 51, assignmentsSubmitted: 2, assignmentsTotal: 3, quizzesAttempted: 1, quizzesTotal: 3 },
  { id: 's10', name: 'Divya Joshi', initials: 'DJ', rollNo: 'BCA-2026-003', email: 'divya.joshi@university.edu', phone: '9876543219', programme: 'BCA - Batch 2026', programmeCode: 'BCA-26', semester: 2, status: 'active', lastActive: '4 hours ago', lastLogin: '7 Jun 2026, 10:00 AM', avgGrade: 77, avgAttendance: 86, engagementScore: 74, assignmentsSubmitted: 2, assignmentsTotal: 3, quizzesAttempted: 2, quizzesTotal: 2 },
  { id: 's11', name: 'Rohan Gupta', initials: 'RG', rollNo: 'MBA-2026-011', email: 'rohan.gupta@university.edu', phone: '9876543220', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'active', lastActive: '1 day ago', lastLogin: '6 Jun 2026, 3:30 PM', avgGrade: 71, avgAttendance: 82, engagementScore: 67, assignmentsSubmitted: 3, assignmentsTotal: 4, quizzesAttempted: 2, quizzesTotal: 3 },
  { id: 's12', name: 'Meera Krishnan', initials: 'MK', rollNo: 'CSE-2026-003', email: 'meera.k@university.edu', phone: '9876543221', programme: 'B.Tech CSE - Batch 2026', programmeCode: 'B.Tech CSE-26', semester: 2, status: 'active', lastActive: '8 hours ago', lastLogin: '7 Jun 2026, 6:15 AM', avgGrade: 88, avgAttendance: 94, engagementScore: 85, assignmentsSubmitted: 3, assignmentsTotal: 3, quizzesAttempted: 3, quizzesTotal: 3 },
  { id: 's13', name: 'Tanvi Desai', initials: 'TD', rollNo: null, email: 'tanvi.desai@university.edu', phone: '9876543222', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', semester: 1, status: 'new', lastActive: 'Never', lastLogin: 'Never', avgGrade: 0, avgAttendance: 0, engagementScore: 0, assignmentsSubmitted: 0, assignmentsTotal: 0, quizzesAttempted: 0, quizzesTotal: 0 },
  { id: 's14', name: 'Harish Pillai', initials: 'HP', rollNo: null, email: 'harish.pillai@university.edu', phone: '9876543223', programme: 'BCA - Batch 2026', programmeCode: 'BCA-26', semester: 1, status: 'new', lastActive: 'Never', lastLogin: 'Never', avgGrade: 0, avgAttendance: 0, engagementScore: 0, assignmentsSubmitted: 0, assignmentsTotal: 0, quizzesAttempted: 0, quizzesTotal: 0 },
];

const STUDENT_PROFILE_EXTRAS: Record<string, { gender: string; lastLoginAgo: string; lastActiveDate: string }> = {
  's1': { gender: 'Male', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 12:30 PM' },
  's2': { gender: 'Female', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 2:15 PM' },
  's3': { gender: 'Male', lastLoginAgo: '5 days ago', lastActiveDate: '2 Jun 2026, 3:45 PM' },
  's4': { gender: 'Female', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 1:30 PM' },
  's5': { gender: 'Male', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 11:00 AM' },
  's6': { gender: 'Female', lastLoginAgo: '12 days ago', lastActiveDate: '26 May 2026, 5:10 PM' },
  's7': { gender: 'Male', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 8:45 AM' },
  's8': { gender: 'Female', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 2:50 PM' },
  's9': { gender: 'Male', lastLoginAgo: '2 days ago', lastActiveDate: '5 Jun 2026, 8:30 PM' },
  's10': { gender: 'Female', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 10:15 AM' },
  's11': { gender: 'Male', lastLoginAgo: '1 day ago', lastActiveDate: '6 Jun 2026, 4:00 PM' },
  's12': { gender: 'Female', lastLoginAgo: 'Today', lastActiveDate: '7 Jun 2026, 6:30 AM' },
};

// 360 view mock data
const MOCK_ASSIGNMENTS = [
  { id: 'a1', name: 'Case Study: Market Entry Strategy', released: '10 Mar 2026', due: '24 Mar 2026', status: 'graded' as const, grade: 42, total: 50 },
  { id: 'a2', name: 'Financial Statement Analysis Report', released: '1 Apr 2026', due: '15 Apr 2026', status: 'graded' as const, grade: 38, total: 50 },
  { id: 'a3', name: 'Organizational Behaviour Reflection', released: '20 Apr 2026', due: '5 May 2026', status: 'graded' as const, grade: 45, total: 50 },
  { id: 'a4', name: 'Business Statistics Project', released: '15 May 2026', due: '30 Jun 2026', status: 'pending' as const, grade: 0, total: 50 },
];

const MOCK_QUIZZES = [
  { id: 'q1', name: 'Managerial Economics Mid-Term', window: '15 Feb - 28 Feb 2026', status: 'submitted' as const, score: 38, total: 50, timeTaken: '42 min' },
  { id: 'q2', name: 'Business Communication Assessment', window: '1 Mar - 15 Mar 2026', status: 'submitted' as const, score: 44, total: 50, timeTaken: '35 min' },
  { id: 'q3', name: 'Financial Accounting Quiz 2', window: '1 Jun - 15 Jun 2026', status: 'not_attempted' as const, score: 0, total: 50, timeTaken: '-' },
];

const MOCK_SESSIONS = [
  { id: 'ls1', name: 'MBA-101: Demand & Supply Analysis', date: '7 Jun 2026', attendance: 'present' as const, duration: '2h 15m' },
  { id: 'ls2', name: 'MBA-102: Business Writing Workshop', date: '5 Jun 2026', attendance: 'present' as const, duration: '1h 45m' },
  { id: 'ls3', name: 'MBA-103: Balance Sheet Deep Dive', date: '3 Jun 2026', attendance: 'present' as const, duration: '2h 30m' },
  { id: 'ls4', name: 'MBA-104: Team Dynamics Seminar', date: '1 Jun 2026', attendance: 'absent' as const, duration: '-' },
  { id: 'ls5', name: 'MBA-101: Market Structures', date: '28 May 2026', attendance: 'present' as const, duration: '2h 10m' },
  { id: 'ls6', name: 'MBA-105: Probability Workshop', date: '25 May 2026', attendance: 'present' as const, duration: '1h 55m' },
  { id: 'ls7', name: 'MBA-106: Contract Law Basics', date: '22 May 2026', attendance: 'absent' as const, duration: '-' },
  { id: 'ls8', name: 'MBA-102: Presentation Skills Lab', date: '20 May 2026', attendance: 'present' as const, duration: '2h 5m' },
];

const MOCK_ACTIVITY_FEED = [
  { id: 'af1', date: '7 JUN 2026', items: [
    { time: '10:30 AM', type: 'live_session' as const, title: 'MBA-101: Demand & Supply Analysis', status: 'Present', detail: '2h 15m / 2h 30m' },
    { time: '09:15 AM', type: 'forum' as const, title: 'Replied to "Market Equilibrium Discussion"', status: '', detail: 'MBA-101 Forum', comment: 'The concept of market equilibrium makes more sense when applied to real-world scenarios like the Indian agriculture market. The MSP system creates an artificial floor price which distorts natural equilibrium.' },
    { time: '08:40 AM', type: 'video' as const, title: 'Watched: Voice Modulation & Tone Control', status: '', detail: '14:20 completed' },
  ]},
  { id: 'af2', date: '5 JUN 2026', items: [
    { time: '02:45 PM', type: 'assignment' as const, title: 'Submitted: Organizational Behaviour Reflection', status: 'Graded', detail: '45/50 by Prof. Arjun Das' },
    { time: '11:00 AM', type: 'live_session' as const, title: 'MBA-102: Business Writing Workshop', status: 'Present', detail: '1h 45m / 2h' },
    { time: '09:30 AM', type: 'pdf' as const, title: 'Downloaded: Body Language Cheat Sheet', status: '', detail: '4 pages' },
  ]},
  { id: 'af3', date: '3 JUN 2026', items: [
    { time: '04:30 PM', type: 'quiz' as const, title: 'Attempted: Business Communication Assessment', status: 'Submitted', detail: '44/50 in 35 min' },
    { time: '02:00 PM', type: 'feedback' as const, title: 'Submitted feedback for MBA-101 Session', status: '', detail: 'Rating: 5/5', comment: 'The session was very interactive. The case study approach helped understand the practical applications of demand-supply theory.' },
    { time: '10:00 AM', type: 'live_session' as const, title: 'MBA-103: Balance Sheet Deep Dive', status: 'Present', detail: '2h 30m / 2h 30m' },
  ]},
  { id: 'af4', date: '1 JUN 2026', items: [
    { time: '06:00 PM', type: 'exam' as const, title: 'MBA-105: Business Statistics Mid-Term', status: 'Submitted', detail: '38/50 in 42 min' },
    { time: '11:30 AM', type: 'video' as const, title: 'Watched: Structuring Compelling Presentations', status: '', detail: '28:30 completed' },
    { time: '09:00 AM', type: 'live_session' as const, title: 'MBA-104: Team Dynamics Seminar', status: 'Absent', detail: '' },
  ]},
  { id: 'af5', date: '28 MAY 2026', items: [
    { time: '03:15 PM', type: 'scorm' as const, title: 'Completed: SCORM Module — Business Ethics', status: '', detail: 'Score: 88%' },
    { time: '10:00 AM', type: 'forum' as const, title: 'Started thread: "Case Study Discussion — Tata Motors"', status: '', detail: 'MBA-101 Forum', comment: 'Analyzing Tata Motors\' acquisition of Jaguar Land Rover — was the premium paid justified given the brand value and market access it provided?' },
  ]},
];

const MOCK_TICKETS = [
  { id: 't1', date: '5 JUN 2026', time: '03:20 PM', status: 'open' as const, title: 'Cannot access MBA-105 quiz', category: 'Technical', ticketNo: '#12045' },
  { id: 't2', date: '28 MAY 2026', time: '11:15 AM', status: 'resolved' as const, title: 'Assignment submission error', category: 'Academic', ticketNo: '#11892' },
  { id: 't3', date: '15 MAY 2026', time: '09:30 AM', status: 'resolved' as const, title: 'Video lectures not loading', category: 'Technical', ticketNo: '#11654' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { active: '#059669', suspended: '#D97706', new: '#072FB5', present: '#059669', absent: '#DC2626', open: '#D97706', resolved: '#059669', graded: '#059669', pending: '#D97706', submitted: '#059669', not_attempted: '#747474' };
  const labels: Record<string, string> = { active: 'Active', suspended: 'Suspended', new: 'New', present: 'Present', absent: 'Absent', open: 'Open', resolved: 'Resolved', graded: 'Submitted & Graded', pending: 'Not Submitted', submitted: 'Submitted', not_attempted: 'Not Attempted' };
  const c = colors[status] || '#747474';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
      {labels[status] || status}
    </span>
  );
}

const EVENT_TYPES: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  live_session: { color: '#072FB5', bg: '#072FB515', label: 'Live Session', icon: Video },
  exam: { color: '#7C3AED', bg: '#7C3AED15', label: 'Exam', icon: FileCheck },
  forum: { color: '#0DA88F', bg: '#0DA88F15', label: 'Forum', icon: MessageSquare },
  assignment: { color: '#D97706', bg: '#D9770615', label: 'Assignment', icon: ClipboardCheck },
  quiz: { color: '#DC2626', bg: '#DC262615', label: 'Quiz', icon: ClipboardCheck },
  video: { color: '#059669', bg: '#05966915', label: 'Video', icon: MonitorPlay },
  feedback: { color: '#BE185D', bg: '#BE185D15', label: 'Feedback', icon: MessageSquare },
  pdf: { color: '#8F3B00', bg: '#8F3B0015', label: 'PDF', icon: BookOpenText },
  scorm: { color: '#4338CA', bg: '#4338CA15', label: 'SCORM', icon: BookOpenText },
  session: { color: '#072FB5', bg: '#072FB515', label: 'Session', icon: Video },
};

function TypeBadge({ type }: { type: string }) {
  const t = EVENT_TYPES[type] || { color: '#747474', bg: '#74747415', label: type, icon: BookOpenText };
  const Icon = t.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--text-primary)', padding: '4px 10px 4px 7px', borderRadius: 'var(--radius-xs)', flexShrink: 0 }}>
      <Icon size={13} strokeWidth={1.7} style={{ color: 'rgba(255,255,255,0.7)' }} />
      {t.label}
    </span>
  );
}

function engColor(v: number) { return v >= 75 ? '#059669' : v >= 60 ? '#D97706' : '#DC2626'; }

// ─── Student 360 View ───────────────────────────────────────────────────────

type DetailTab = 'snapshot' | 'activity' | 'assignments' | 'quizzes' | 'sessions' | 'tickets';

function StudentDetail({ student, onBack }: { student: Student; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>('snapshot');
  const [activityTimeRange, setActivityTimeRange] = useState('all');
  const [snapshotSem, setSnapshotSem] = useState(1);
  const [activityTypeFilters, setActivityTypeFilters] = useState<Set<string>>(new Set(Object.keys(EVENT_TYPES).filter(k => k !== 'session')));
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  const eligible = student.engagementScore >= 75;
  const presentCount = MOCK_SESSIONS.filter(s => s.attendance === 'present').length;
  const absentCount = MOCK_SESSIONS.filter(s => s.attendance === 'absent').length;

  // Per-semester mock data
  const semesterData: Record<number, { sgpa: number; engagement: number; attendance: number; eligible: boolean; courses: { name: string; code: string; internal: number; endSem: number; total: number; grade: string }[] }> = {
    1: { sgpa: 8.2, engagement: student.engagementScore, attendance: student.avgAttendance, eligible, courses: [
      { name: 'Managerial Economics', code: 'MBA-101', internal: 32, endSem: 52, total: 84, grade: 'A' },
      { name: 'Managerial Communication', code: 'MBA-102', internal: 28, endSem: 41, total: 69, grade: 'B+' },
      { name: 'Financial Accounting', code: 'MBA-103', internal: 35, endSem: 54, total: 89, grade: 'A+' },
      { name: 'Organizational Behaviour', code: 'MBA-104', internal: 22, endSem: 0, total: 22, grade: '-' },
      { name: 'Business Statistics', code: 'MBA-105', internal: 30, endSem: 45, total: 75, grade: 'B+' },
      { name: 'Business Law & Ethics', code: 'MBA-106', internal: 26, endSem: 38, total: 64, grade: 'B' },
    ]},
  };
  const currentSemData = semesterData[snapshotSem] || semesterData[1];
  const cgpa = 8.0;
  const profileExtra = STUDENT_PROFILE_EXTRAS[student.id] || { gender: '-', lastLoginAgo: '-', lastActiveDate: '-' };

  // Verification mock
  const verification = {
    aadhaar: { status: 'verified' as const, number: 'XXXX XXXX 4521', docUrl: '#' },
    photo: { status: 'verified' as const, docUrl: '#' },
    debId: { status: 'pending' as const, number: '', docUrl: '' },
    govtId: { status: 'not_uploaded' as const, docUrl: '' },
  };
  const verifiedCount = Object.values(verification).filter(v => v.status === 'verified').length;
  const totalDocs = Object.keys(verification).length;

  const TABS: { key: DetailTab; label: string; count?: number }[] = [
    { key: 'snapshot', label: 'Snapshot' },
    { key: 'activity', label: 'Activity Feed', count: MOCK_ACTIVITY_FEED.reduce((s, d) => s + d.items.length, 0) },
    { key: 'assignments', label: 'Assignments', count: student.assignmentsTotal },
    { key: 'quizzes', label: 'Quizzes', count: student.quizzesTotal },
    { key: 'sessions', label: 'Live Sessions', count: MOCK_SESSIONS.length },
    { key: 'tickets', label: 'Tickets', count: MOCK_TICKETS.length },
  ];

  const thStyle = { fontSize: 10, fontWeight: 600 as const, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontFamily: 'var(--font-sans)', padding: '10px 16px', textAlign: 'left' as const, borderBottom: '1px solid var(--border-subtle)' };
  const tdStyle = { fontSize: 12.5, fontWeight: 500 as const, color: 'var(--text-primary)', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.03)' };

  return (
    <div style={{ padding: '28px 40px' }}>
      {/* Back */}
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--blue-700)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)', marginBottom: 20 }}
        onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
        onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
      ><ChevronLeft size={14} /> Back to Students</button>

      <div style={{ display: 'flex', gap: 28 }}>
        {/* Left sidebar */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '24px 20px', position: 'sticky', top: 28 }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-section)', border: '2px solid var(--border-subtle)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800, color: 'var(--text-secondary)', flexShrink: 0, letterSpacing: '0.02em' }}>{student.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{student.name}</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 18 }} />

            {/* Info list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Last Login */}
              <div style={{ display: 'flex', gap: 10 }}>
                <LogIn size={15} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>Last login</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                    <span style={{ fontWeight: 700 }}>{profileExtra.lastLoginAgo}</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}> &middot; {student.lastLogin}</span>
                  </div>
                </div>
              </div>

              {/* Last Active */}
              <div style={{ display: 'flex', gap: 10 }}>
                <Clock size={15} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>Last Active on</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                    <span style={{ fontWeight: 700 }}>{student.lastActive}</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}> &middot; {profileExtra.lastActiveDate}</span>
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={15} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{profileExtra.gender}</span>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1, wordBreak: 'break-all' }}>{student.email}</span>
                <button onClick={() => navigator.clipboard.writeText(student.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2, display: 'flex', opacity: 0.5 }} title="Copy email"><Copy size={13} /></button>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={15} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1 }}>{student.phone}</span>
                <button onClick={() => navigator.clipboard.writeText(student.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2, display: 'flex', opacity: 0.5 }} title="Copy phone"><Copy size={13} /></button>
              </div>
            </div>

            {/* Programme card */}
            <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(7,47,181,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(7,47,181,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <GraduationCap size={16} strokeWidth={1.5} style={{ color: 'var(--blue-700)', flexShrink: 0, marginTop: 1, opacity: 0.7 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{student.programme}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>Credits: 18<span style={{ fontWeight: 400 }}>/80</span></div>
                </div>
              </div>
            </div>

            {/* Verification status */}
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Verification</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: verifiedCount === totalDocs ? '#059669' : '#D97706' }}>{verifiedCount}/{totalDocs}</span>
              </div>
              {[
                { label: 'Aadhaar Card', ...verification.aadhaar },
                { label: 'Photograph', ...verification.photo },
                { label: 'DEB ID', ...verification.debId },
                { label: 'Govt. ID', ...verification.govtId },
              ].map(doc => (
                <div key={doc.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 11 }}>
                  {doc.status === 'verified' ? <CheckCircle2 size={12} style={{ color: '#059669', flexShrink: 0 }} /> :
                   doc.status === 'pending' ? <Clock size={12} style={{ color: '#D97706', flexShrink: 0 }} /> :
                   <XCircle size={12} style={{ color: 'var(--text-tertiary)', opacity: 0.4, flexShrink: 0 }} />}
                  <span style={{ flex: 1, fontWeight: 500, color: doc.status === 'not_uploaded' ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}>{doc.label}</span>
                  {doc.status === 'verified' && doc.docUrl && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-700)', padding: 0, display: 'flex', opacity: 0.6 }} title="View document"><ExternalLink size={10} /></button>
                  )}
                  {doc.status === 'pending' && <span style={{ fontSize: 9, fontWeight: 600, color: '#D97706' }}>Pending</span>}
                  {doc.status === 'not_uploaded' && <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)' }}>Not uploaded</span>}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px', fontSize: 10.5, fontWeight: 600, color: '#D97706', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <Ban size={11} strokeWidth={2} /> {student.status === 'suspended' ? 'Activate' : 'Suspend'}
              </button>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px', fontSize: 10.5, fontWeight: 600, color: '#DC2626', background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <Trash2 size={11} strokeWidth={2} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--border-subtle)', marginBottom: 24 }}>
            {TABS.map(t => {
              const isActive = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '10px 18px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: 'transparent', border: 'none',
                  borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                  marginBottom: '-1.5px', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  {t.label}
                  {t.count !== undefined && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-section)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>{t.count}</span>}
                </button>
              );
            })}
          </div>

          {/* ── Snapshot ──────────────────────────── */}
          {tab === 'snapshot' && (
            <div>
              {/* Semester selector — page level */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                <select value={snapshotSem} onChange={e => setSnapshotSem(parseInt(e.target.value))} style={{
                  padding: '6px 28px 6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                  background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', outline: 'none',
                  appearance: 'none', WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                }}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              </div>

              {/* Stats row: CGPA dark card + semester metrics */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                {/* CGPA — dark anchored card */}
                <div style={{
                  width: 140, flexShrink: 0, padding: '20px 22px',
                  background: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>CGPA</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {cgpa.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: 6 }}>Cumulative</div>
                </div>

                {/* Semester metrics */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'stretch', gap: 0,
                  background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                  padding: '20px 0',
                }}>
                {/* SGPA */}
                <div style={{ flex: 1, padding: '0 28px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>SGPA</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: engColor(currentSemData.sgpa * 10), fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {currentSemData.sgpa.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 6 }}>Semester {snapshotSem}</div>
                </div>

                {/* Engagement */}
                <div style={{ flex: 1, padding: '0 28px', borderLeft: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Engagement</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: engColor(currentSemData.engagement), fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.03em' }}>{currentSemData.engagement}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: engColor(currentSemData.engagement) }}>%</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 6 }}>of 75% required</div>
                </div>

                {/* Eligibility */}
                <div style={{ flex: 1, padding: '0 28px', borderLeft: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Exam Eligibility</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '5px 10px', borderRadius: 'var(--radius-pill)',
                      background: currentSemData.eligible ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
                    }}>
                      {currentSemData.eligible ? <CheckCircle2 size={13} style={{ color: '#059669' }} /> : <XCircle size={13} style={{ color: '#DC2626' }} />}
                      <span style={{ fontSize: 12, fontWeight: 700, color: currentSemData.eligible ? '#059669' : '#DC2626' }}>
                        {currentSemData.eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                  </div>
                  <button style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    textDecoration: 'underline', textUnderlineOffset: 2, padding: 0,
                    opacity: 0.5,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--blue-700)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  >Override eligibility</button>
                </div>
                </div>
              </div>

              {/* Course-wise exam performance */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>Exam Performance — Semester {snapshotSem}</div>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Course', 'Internal (40)', 'End-Sem (60)', 'Total (100)', 'Grade'].map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {currentSemData.courses.map(c => (
                      <tr key={c.code}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{c.code}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>{c.internal}<span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>/40</span></td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: c.endSem === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>{c.endSem === 0 ? '—' : <>{c.endSem}<span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>/60</span></>}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: c.total >= 75 ? '#059669' : c.total >= 50 ? 'var(--text-primary)' : '#DC2626', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>{c.endSem === 0 ? <span style={{ fontWeight: 500, color: 'var(--text-tertiary)' }}>Pending</span> : c.total}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: c.grade === '-' ? 'var(--text-tertiary)' : 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>{c.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Activity Feed ─────────────────────── */}
          {tab === 'activity' && (() => {
            const allTypes = Object.keys(EVENT_TYPES).filter(k => k !== 'session');
            const allSelected = activityTypeFilters.size === allTypes.length;
            const toggleType = (t: string) => setActivityTypeFilters(prev => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });
            const toggleAll = () => { if (allSelected) setActivityTypeFilters(new Set()); else setActivityTypeFilters(new Set(allTypes)); };

            // Filter items
            const filteredFeed = MOCK_ACTIVITY_FEED.map(day => ({
              ...day,
              items: day.items.filter(item => activityTypeFilters.has(item.type)),
            })).filter(day => day.items.length > 0);
            const totalFiltered = filteredFeed.reduce((s, d) => s + d.items.length, 0);
            // Build filter label
            const selectedTypes = allTypes.filter(t => activityTypeFilters.has(t));
            const singleSelected = selectedTypes.length === 1 ? EVENT_TYPES[selectedTypes[0]] : null;
            const isFiltered = !allSelected;

            return (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                {/* Type filter — pill style */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowTypeDropdown(!showTypeDropdown)} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      color: 'var(--text-primary)',
                      background: '#fff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      transition: 'border-color 0.12s',
                    }}>
                      <Filter size={13} strokeWidth={1.8} style={{ color: 'var(--text-tertiary)' }} />
                      {allSelected ? 'All activity types' : singleSelected ? singleSelected.label : `${selectedTypes.length} types`}
                      {isFiltered && !allSelected && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--blue-700)', width: 18, height: 18, borderRadius: '50%', display: 'grid', placeItems: 'center', lineHeight: 1 }}>{selectedTypes.length}</span>
                      )}
                      <ChevronDown size={12} style={{ color: 'var(--text-tertiary)', transform: showTypeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                    </button>

                    {showTypeDropdown && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
                        width: 240, background: '#fff', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)', boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                        overflow: 'hidden', padding: '6px 0',
                      }}>
                        {/* All types row */}
                        <button onClick={toggleAll} style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '10px 16px', fontSize: 13, fontWeight: allSelected ? 600 : 400,
                          color: 'var(--text-primary)', background: 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                        }}>
                          <div style={{ width: 18, height: 18, borderRadius: 'var(--radius-xs)', border: allSelected ? 'none' : '1.5px solid rgba(0,0,0,0.15)', background: allSelected ? 'var(--blue-700)' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            {allSelected && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
                          </div>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-section)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <LayoutGrid size={13} strokeWidth={1.6} style={{ color: 'var(--text-tertiary)' }} />
                          </div>
                          All activity types
                        </button>

                        {allTypes.map(type => {
                          const checked = activityTypeFilters.has(type);
                          const et = EVENT_TYPES[type];
                          const Icon = et.icon;
                          return (
                            <button key={type} onClick={() => toggleType(type)} style={{
                              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                              padding: '10px 16px', fontSize: 13, fontWeight: checked ? 600 : 400,
                              color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
                              background: checked ? 'rgba(7,47,181,0.04)' : 'transparent',
                              border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                              transition: 'background 0.1s',
                            }}
                              onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'var(--bg-section)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = checked ? 'rgba(7,47,181,0.04)' : 'transparent'; }}
                            >
                              <div style={{ width: 18, height: 18, borderRadius: 'var(--radius-xs)', border: checked ? 'none' : '1.5px solid rgba(0,0,0,0.15)', background: checked ? 'var(--blue-700)' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                {checked && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
                              </div>
                              <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-xs)', background: 'var(--bg-section)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <Icon size={13} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
                              </div>
                              {et.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Clear button */}
                  {isFiltered && (
                    <button onClick={() => setActivityTypeFilters(new Set(allTypes))} style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      fontSize: 12, fontWeight: 600, color: '#DC2626',
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0,
                    }}>
                      <X size={12} strokeWidth={2} /> Clear
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {/* Time range pills — segmented control */}
                  <div style={{ display: 'flex', gap: 1, padding: '2px', background: 'var(--bg-section)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    {[{ key: 'all', label: 'All time' }, { key: '24h', label: '24h' }, { key: '7d', label: '7 days' }, { key: '30d', label: '30 days' }, { key: 'custom', label: 'Custom' }].map(r => (
                      <button key={r.key} onClick={() => setActivityTimeRange(r.key)} style={{
                        padding: '4px 11px', fontSize: 11.5, fontWeight: activityTimeRange === r.key ? 700 : 500,
                        color: activityTimeRange === r.key ? 'var(--blue-700)' : 'var(--text-tertiary)',
                        background: activityTimeRange === r.key ? '#fff' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        boxShadow: activityTimeRange === r.key ? 'var(--shadow-xs)' : 'none',
                      }}>{r.label}</button>
                    ))}
                  </div>

                  {/* Custom date range */}
                  {activityTimeRange === 'custom' && (
                    <div style={{ marginLeft: 8 }}>
                      <DateRangePicker startDate={customDateStart} endDate={customDateEnd} onStartChange={setCustomDateStart} onEndChange={setCustomDateEnd} />
                    </div>
                  )}

                  <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontWeight: 500, marginLeft: 10 }}>{totalFiltered} events</span>
                </div>
              </div>

              {/* Timeline */}
              {filteredFeed.length > 0 ? filteredFeed.map(day => (
                <div key={day.id} style={{ marginBottom: 4 }}>
                  {/* Date header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, marginTop: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--blue-700)', letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>{day.date}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(7,47,181,0.12)' }} />
                  </div>

                  {day.items.map((item, i) => {
                    const hasStatus = item.status && item.status !== '';
                    const eventType = EVENT_TYPES[item.type];
                    const hasComment = (item as any).comment;
                    return (
                      <div key={i} style={{
                        padding: '10px 0',
                        borderBottom: i < day.items.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                          {/* Time */}
                          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', width: 72, flexShrink: 0, paddingTop: 2 }}>{item.time}</span>

                          {/* Type + Status stacked */}
                          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, marginRight: 14 }}>
                            <TypeBadge type={item.type} />
                            {hasStatus && <StatusDot status={item.status.toLowerCase().replace(/ /g, '_') as any} />}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>{item.title}</div>
                            {item.detail && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                {item.detail.split('  ').map((d, di) => (
                                  <span key={di} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', background: 'var(--bg-section)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>{d}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comment block */}
                        {hasComment && (
                          <div style={{ marginLeft: 177, marginTop: 8 }}>
                            <div style={{
                              borderLeft: '3px solid var(--border-subtle)',
                              padding: '8px 14px',
                              background: 'var(--bg-section)',
                              borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                            }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MessageSquare size={9} strokeWidth={2} /> Comment
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 400 }}>
                                {(item as any).comment}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  No events match the selected filters.
                </div>
              )}
            </div>
            );
          })()}

          {/* ── Assignments ───────────────────────── */}
          {tab === 'assignments' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>{student.assignmentsSubmitted}</strong> submitted &middot; <strong style={{ color: 'var(--text-secondary)' }}>{student.assignmentsTotal - student.assignmentsSubmitted}</strong> not submitted
              </div>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Assignment', 'Released', 'Due Date', 'Status', 'Grade'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {MOCK_ASSIGNMENTS.map(a => (
                      <tr key={a.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{a.name}</td>
                        <td style={{ ...tdStyle, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{a.released}</td>
                        <td style={{ ...tdStyle, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{a.due}</td>
                        <td style={tdStyle}><StatusDot status={a.status} /></td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.status === 'graded' ? <><strong>{a.grade}</strong><span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/{a.total}</span></> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Quizzes ───────────────────────────── */}
          {tab === 'quizzes' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>{student.quizzesAttempted}</strong> submitted
              </div>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Quiz', 'Window', 'Status', 'Score', 'Time Taken'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {MOCK_QUIZZES.map(q => (
                      <tr key={q.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{q.name}</td>
                        <td style={{ ...tdStyle, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{q.window}</td>
                        <td style={tdStyle}><StatusDot status={q.status} /></td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{q.status === 'submitted' ? <><strong>{q.score}</strong><span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/{q.total}</span></> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                        <td style={{ ...tdStyle, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{q.timeTaken}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Live Sessions ─────────────────────── */}
          {tab === 'sessions' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                <strong style={{ color: '#059669' }}>{presentCount}</strong> present &middot; <strong style={{ color: '#DC2626' }}>{absentCount}</strong> absent &middot; out of <strong style={{ color: 'var(--text-secondary)' }}>{MOCK_SESSIONS.length}</strong> sessions
              </div>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Session', 'Date & Time', 'Attendance', 'Duration'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {MOCK_SESSIONS.map(s => (
                      <tr key={s.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                        <td style={{ ...tdStyle, fontSize: 11.5, color: 'var(--text-tertiary)' }}>{s.date}</td>
                        <td style={tdStyle}><StatusDot status={s.attendance} /></td>
                        <td style={{ ...tdStyle, fontSize: 11.5, fontFamily: 'var(--font-mono)', color: s.duration === '-' ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}>{s.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Tickets ───────────────────────────── */}
          {tab === 'tickets' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                {MOCK_TICKETS.filter(t => t.status === 'resolved').length} resolved &middot; {MOCK_TICKETS.filter(t => t.status === 'open').length} open
              </div>
              {MOCK_TICKETS.map(ticket => (
                <div key={ticket.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', width: 65, flexShrink: 0 }}>{ticket.time}</span>
                  <StatusDot status={ticket.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.title}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{ticket.ticketNo}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{ticket.category} &middot; {ticket.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Student Modal ───────────────────────────────────────────────────

function CreateStudentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (s: Student) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [debId, setDebId] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [programme, setProgramme] = useState('MBA-26');
  const [semester, setSemester] = useState('1');

  const fullName = `${firstName} ${lastName}`.trim();
  const canCreate = firstName && lastName && username && email && password && rollNo;
  const programmes = [{ code: 'MBA-26', name: 'MBA - Batch 2026' }, { code: 'BCA-26', name: 'BCA - Batch 2026' }, { code: 'B.Tech CSE-26', name: 'B.Tech CSE - Batch 2026' }, { code: 'MCA-26', name: 'MCA - Batch 2026' }];

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 5 };
  const req = <span style={{ color: '#DC2626' }}>*</span>;
  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxHeight: '90vh', background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Dark gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                <Users size={20} strokeWidth={1.8} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Create Student Account</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Create a new LMS account and enroll in a programme</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}><X size={16} /></button>
          </div>
          {/* Hero input - First Name */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>First Name *</label>
            <input type="text" placeholder="Enter first name..." value={firstName} onChange={e => setFirstName(e.target.value)} style={{
              width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#fff',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, outline: 'none', boxSizing: 'border-box',
            }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            />
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
          {/* Account section */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: -4 }}>Account Details</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Last Name {req}</label><input type="text" placeholder="Mehta" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Username {req}</label><input type="text" placeholder="arjun.mehta" value={username} onChange={e => setUsername(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Password {req}</label><input type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Email {req}</label><input type="email" placeholder="arjun@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Phone Number</label><input type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          {/* Identity section */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6, marginBottom: -4 }}>Identity & Enrollment</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Roll Number {req}</label><input type="text" placeholder="MBA-2026-013" value={rollNo} onChange={e => setRollNo(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontWeight: 700 as const }} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>DEB ID</label><input type="text" placeholder="DEB-XXXXX" value={debId} onChange={e => setDebId(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Aadhaar Number</label><input type="text" placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={e => setAadhaar(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div>
            <label style={labelStyle}>Programme</label>
            <select value={programme} onChange={e => setProgramme(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }} onFocus={focusHandler} onBlur={blurHandler}>{programmes.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}</select>
          </div>

          {/* UGC note */}
          <div style={{ padding: '10px 12px', background: 'rgba(7,47,181,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(7,47,181,0.08)', fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ShieldCheck size={14} strokeWidth={1.6} style={{ color: 'var(--blue-700)', opacity: 0.5, flexShrink: 0, marginTop: 1 }} />
            <span>As per UGC 2020 Regulations, Aadhaar or Govt. ID verification is required for enrollment, assessment participation, and examinations. DEB ID is mandatory for regulatory reporting.</span>
          </div>
        </div>

        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={() => { if (!canCreate) return; onCreate({ id: 'new-' + Date.now(), name: fullName, initials: `${firstName[0]}${lastName[0]}`.toUpperCase(), rollNo, email, phone, programme: programmes.find(p => p.code === programme)?.name || '', programmeCode: programme, semester: parseInt(semester), status: 'new', lastActive: 'Just now', lastLogin: 'Just now', avgGrade: 0, avgAttendance: 0, engagementScore: 0, assignmentsSubmitted: 0, assignmentsTotal: 0, quizzesAttempted: 0, quizzesTotal: 0 }); onClose(); }} disabled={!canCreate} style={{
            padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
            background: canCreate ? 'var(--blue-700)' : 'var(--border-subtle)',
            border: 'none', borderRadius: 8, cursor: canCreate ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)',
            boxShadow: canCreate ? '0 2px 8px rgba(7,47,181,0.25)' : 'none',
          }}>Create & Enroll</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Upload Modal ──────────────────────────────────────────────────────

type UploadStage = 'idle' | 'file_selected' | 'processing' | 'results';

interface UploadResultRow {
  row: number; name: string; email: string;
  status: 'success' | 'error'; reason?: string;
}

const MOCK_UPLOAD_RESULTS: UploadResultRow[] = [
  { row: 2, name: 'Riya Verma', email: 'riya.v@university.edu', status: 'success' },
  { row: 3, name: 'Saurabh Patil', email: 'saurabh.p@university.edu', status: 'success' },
  { row: 4, name: 'Ayesha Ansari', email: 'ayesha.a@university.edu', status: 'success' },
  { row: 5, name: 'Deepak Rao', email: 'deepak.rao@university.edu', status: 'error', reason: 'Duplicate email — already exists' },
  { row: 6, name: 'Nisha Iyer', email: 'nisha.iyer@university.edu', status: 'success' },
  { row: 7, name: 'Tushar Mehta', email: 'tushar.m@university.edu', status: 'error', reason: 'Invalid programme code: MBA-27' },
  { row: 8, name: 'Pooja Nambiar', email: 'pooja.n@university.edu', status: 'success' },
  { row: 9, name: 'Kabir Sen', email: 'kabir.s@university.edu', status: 'error', reason: 'Missing required field: roll_number' },
  { row: 10, name: 'Lakshmi Prasad', email: 'lakshmi.p@university.edu', status: 'success' },
  { row: 11, name: 'Yash Agarwal', email: 'yash.a@university.edu', status: 'success' },
];

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const CSV_COLUMNS = ['username', 'first_name', 'last_name', 'email', 'phone', 'password', 'roll_number', 'deb_id', 'aadhaar', 'programme_code', 'semester'];
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [resultFilter, setResultFilter] = useState<'all' | 'success' | 'error'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const successCount = MOCK_UPLOAD_RESULTS.filter(r => r.status === 'success').length;
  const errorCount = MOCK_UPLOAD_RESULTS.filter(r => r.status === 'error').length;
  const filteredResults = resultFilter === 'all' ? MOCK_UPLOAD_RESULTS : MOCK_UPLOAD_RESULTS.filter(r => r.status === resultFilter);

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) return;
    setFileName(file.name);
    setStage('file_selected');
  }

  function handleUpload() {
    setStage('processing');
    setTimeout(() => setStage('results'), 1800);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                {stage === 'results'
                  ? (errorCount === 0
                    ? <CheckCircle2 size={20} strokeWidth={1.8} style={{ color: '#4ade80' }} />
                    : <AlertTriangle size={20} strokeWidth={1.8} style={{ color: '#fbbf24' }} />)
                  : <Upload size={20} strokeWidth={1.8} style={{ color: '#fff' }} />
                }
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {stage === 'results' ? 'Upload Complete' : 'Bulk Upload Students'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {stage === 'results'
                    ? `${successCount} created · ${errorCount} failed out of ${MOCK_UPLOAD_RESULTS.length} rows`
                    : 'Upload a CSV file to create multiple student accounts'}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* ── IDLE / FILE SELECTED ── */}
          {(stage === 'idle' || stage === 'file_selected') && (
            <>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                style={{
                  padding: stage === 'file_selected' ? '20px' : '36px 20px',
                  border: `2px dashed ${dragOver ? 'var(--blue-700)' : stage === 'file_selected' ? '#059669' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: stage === 'file_selected' ? 'rgba(5,150,105,0.04)' : dragOver ? 'rgba(7,47,181,0.03)' : 'var(--bg-section)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', marginBottom: 20, transition: 'all 0.12s',
                }}
              >
                {stage === 'file_selected' ? (
                  <>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(5,150,105,0.1)', display: 'grid', placeItems: 'center' }}>
                      <FileCheck size={20} strokeWidth={1.8} style={{ color: '#059669' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{fileName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload size={28} strokeWidth={1.3} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Drop CSV file here or click to browse</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Maximum 500 students per upload</span>
                  </>
                )}
              </div>

              {/* CSV format */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Required CSV Format</div>
              <div style={{ background: 'var(--bg-section)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-secondary)', lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {CSV_COLUMNS.join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Required:</strong> username, first_name, last_name, email, password, roll_number, programme_code, semester</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Optional:</strong> phone, deb_id, aadhaar</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Programme codes:</strong> MBA-26, BCA-26, B.Tech CSE-26, MCA-26</div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--blue-700)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                <Upload size={12} strokeWidth={2} /> Download CSV Template
              </button>
            </>
          )}

          {/* ── PROCESSING ── */}
          {stage === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--blue-700)', animation: 'spin 0.75s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Processing {fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Validating rows and creating accounts…</div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {stage === 'results' && (
            <>
              {/* Summary pills */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <div style={{ flex: 1, background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{successCount}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginTop: 4 }}>Created</div>
                </div>
                <div style={{ flex: 1, background: errorCount > 0 ? 'rgba(220,38,38,0.05)' : 'rgba(5,150,105,0.04)', border: `1px solid ${errorCount > 0 ? 'rgba(220,38,38,0.18)' : 'rgba(5,150,105,0.12)'}`, borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: errorCount > 0 ? '#DC2626' : '#059669', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{errorCount}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: errorCount > 0 ? '#DC2626' : '#059669', marginTop: 4 }}>Failed</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-section)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{MOCK_UPLOAD_RESULTS.length}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 4 }}>Total Rows</div>
                </div>
              </div>

              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {(['all', 'success', 'error'] as const).map(f => (
                  <button key={f} onClick={() => setResultFilter(f)} style={{
                    padding: '4px 12px', fontSize: 11.5, fontWeight: 600, borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: resultFilter === f ? (f === 'error' ? 'rgba(220,38,38,0.3)' : f === 'success' ? 'rgba(5,150,105,0.3)' : 'rgba(7,47,181,0.25)') : 'var(--border-subtle)',
                    color: resultFilter === f ? (f === 'error' ? '#DC2626' : f === 'success' ? '#059669' : 'var(--blue-700)') : 'var(--text-tertiary)',
                    background: resultFilter === f ? (f === 'error' ? 'rgba(220,38,38,0.06)' : f === 'success' ? 'rgba(5,150,105,0.06)' : 'rgba(7,47,181,0.04)') : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}>
                    {f === 'all' ? `All (${MOCK_UPLOAD_RESULTS.length})` : f === 'success' ? `Created (${successCount})` : `Failed (${errorCount})`}
                  </button>
                ))}
              </div>

              {/* Results table */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 32px', gap: 0, padding: '7px 12px', background: 'var(--bg-section)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Row</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
                  <span />
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {filteredResults.map(r => (
                    <div key={r.row} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 32px', alignItems: 'center', gap: 0, padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.03)', background: r.status === 'error' ? 'rgba(220,38,38,0.02)' : 'transparent' }}>
                      <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{r.row}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                        <div style={{ fontSize: 10.5, color: r.status === 'error' ? '#DC2626' : 'var(--text-tertiary)', fontWeight: 500, marginTop: 1 }}>
                          {r.status === 'error' ? r.reason : r.email}
                        </div>
                      </div>
                      {r.status === 'success'
                        ? <CheckCircle2 size={14} strokeWidth={2} style={{ color: '#059669' }} />
                        : <XCircle size={14} strokeWidth={2} style={{ color: '#DC2626' }} />
                      }
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {stage === 'results' ? (
            <>
              <button onClick={() => { setStage('idle'); setFileName(''); setResultFilter('all'); }} style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Upload size={13} strokeWidth={2} /> Upload Another
              </button>
              <button onClick={onClose} style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Done</button>
            </>
          ) : (
            <>
              <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
              <button onClick={handleUpload} disabled={stage !== 'file_selected'} style={{
                padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
                background: stage === 'file_selected' ? 'var(--blue-700)' : 'var(--border-subtle)',
                border: 'none', borderRadius: 8, cursor: stage === 'file_selected' ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)',
              }}>Upload & Create</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main StudentsView ──────────────────────────────────────────────────────

export default function StudentsView() {
  const [students, setStudents] = useState(STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<Set<string> | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    if (showStatusDropdown) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showStatusDropdown]);

  // Filters
  const filtered = students.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(sq) || (s.rollNo ?? '').toLowerCase().includes(sq) || s.email.toLowerCase().includes(sq);
    }
    return true;
  });

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map(s => s.id))); };

  // Student detail view
  if (selectedStudent) return <StudentDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} />;

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0 }}>Students</h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '4px 0 0', fontWeight: 500 }}>
          {students.length} accounts &middot; {students.filter(s => s.status === 'active').length} active
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 260 }}>
          <input type="text" placeholder="Search by name, roll no, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{
            width: '100%', padding: '7px 10px 7px 30px', fontSize: 12.5,
            fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)',
            background: '#fff', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box',
          }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-700)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          />
          <Search size={13} strokeWidth={2.2} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
        </div>


<div style={{ position: 'relative' }} ref={statusDropdownRef}>
          <button onClick={() => setShowStatusDropdown(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 10px', fontSize: 12, fontWeight: 600,
            color: statusFilter !== 'all' ? 'var(--blue-700)' : 'var(--text-tertiary)',
            background: statusFilter !== 'all' ? 'rgba(7,47,181,0.05)' : '#fff',
            border: `1px solid ${statusFilter !== 'all' ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>
            {statusFilter === 'all' && <Users size={12} strokeWidth={2} style={{ opacity: 0.45, flexShrink: 0 }} />}
            {statusFilter !== 'all' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusFilter === 'active' ? '#059669' : statusFilter === 'new' ? '#072FB5' : '#D97706', flexShrink: 0, display: 'inline-block' }} />}
            {statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : statusFilter === 'new' ? 'New' : 'Suspended'}
            <ChevronDown size={11} strokeWidth={2.5} style={{ opacity: 0.45, flexShrink: 0, transition: 'transform 0.15s', transform: showStatusDropdown ? 'rotate(180deg)' : 'none' }} />
          </button>
          {showStatusDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
              background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 156, overflow: 'hidden',
            }}>
              {([
                { value: 'all', label: 'All Status', color: null },
                { value: 'active', label: 'Active', color: '#059669' },
                { value: 'new', label: 'New', color: '#072FB5' },
                { value: 'suspended', label: 'Suspended', color: '#D97706' },
              ] as { value: string; label: string; color: string | null }[]).map(opt => {
                const isSelected = statusFilter === opt.value;
                return (
                  <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
                    fontSize: 12, fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--blue-700)' : 'var(--text-primary)',
                    background: isSelected ? 'rgba(7,47,181,0.04)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left',
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-section)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(7,47,181,0.04)' : 'transparent'; }}
                  >
                    {opt.color
                      ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0, display: 'inline-block' }} />
                      : <Users size={12} strokeWidth={2} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    }
                    {opt.label}
                    {isSelected && <Check size={12} strokeWidth={2.5} style={{ color: 'var(--blue-700)', marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-700)' }}>{selectedIds.size} selected</span>
            <button style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#D97706', background: 'transparent', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 3 }}><Ban size={11} /> Suspend</button>
            <button onClick={() => setDeleteConfirmIds(new Set(selectedIds))} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#DC2626', background: 'transparent', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 3 }}><Trash2 size={11} /> Delete</button>
            <button onClick={() => setSelectedIds(new Set())} style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={14} /></button>
          </>
        )}

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowCreateModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', fontSize: 12.5, fontWeight: 700,
          color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}><UserPlus size={13} strokeWidth={2} /> Create Student</button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 600,
          color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }} onClick={() => setShowBulkUpload(true)}><Upload size={12} strokeWidth={2} /> Bulk Upload</button>
      </div>

      {/* Student table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '36px 1fr 120px 200px 100px 80px 80px',
          alignItems: 'center', gap: 0, padding: '9px 18px', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div onClick={toggleAll} style={{
              width: 16, height: 16, borderRadius: 3, cursor: 'pointer',
              border: selectedIds.size === filtered.length && filtered.length > 0 ? 'none' : '1.5px solid var(--border-subtle)',
              background: selectedIds.size === filtered.length && filtered.length > 0 ? 'var(--blue-700)' : 'transparent',
              display: 'grid', placeItems: 'center',
            }}>
              {selectedIds.size === filtered.length && filtered.length > 0 && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
            </div>
          </div>
          {['Name', 'Roll No', 'Email', 'Programme', 'Status', 'Last Active'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{h}</span>
          ))}
        </div>

        {filtered.map((student, i) => {
          const isSel = selectedIds.has(student.id);
          return (
            <div key={student.id} onClick={() => { if (selectedIds.size === 0) setSelectedStudent(student); else toggleSelect(student.id); }} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 120px 200px 100px 80px 80px',
              alignItems: 'center', gap: 0, padding: '11px 18px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              background: isSel ? 'rgba(7,47,181,0.02)' : 'transparent',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(0,0,0,0.012)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(7,47,181,0.02)' : 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => { e.stopPropagation(); toggleSelect(student.id); }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3, cursor: 'pointer',
                  border: isSel ? 'none' : '1.5px solid var(--border-subtle)',
                  background: isSel ? 'var(--blue-700)' : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {isSel && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: student.status === 'suspended' ? '#D97706' + '15' : '#072FB5' + '10', display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 700, color: student.status === 'suspended' ? '#D97706' : '#072FB5', flexShrink: 0 }}>{student.initials}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</span>
              </div>
              {student.rollNo ? (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{student.rollNo}</span>
              ) : (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#D97706', background: 'rgba(217,119,6,0.08)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Not Enrolled</span>
              )}
              <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{student.programmeCode}</span>
              <StatusDot status={student.status} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{student.lastActive}</span>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Users size={28} strokeWidth={1.2} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>No students found</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Try adjusting your search or filters.</div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateStudentModal onClose={() => setShowCreateModal(false)} onCreate={s => setStudents(prev => [s, ...prev])} />
      )}
      {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )}
      {deleteConfirmIds && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setDeleteConfirmIds(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {/* Dark gradient header with warning tone */}
            <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', padding: '20px 24px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={20} strokeWidth={1.8} style={{ color: '#fff' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    Delete {deleteConfirmIds.size} student{deleteConfirmIds.size > 1 ? 's' : ''}?
                  </h3>
                </div>
                <button onClick={() => setDeleteConfirmIds(null)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}><X size={16} /></button>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This will permanently remove {deleteConfirmIds.size > 1 ? 'these accounts' : 'this account'} and all associated data including grades, submissions, and activity history. This action cannot be undone.
              </p>
            </div>
            <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setDeleteConfirmIds(null)} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
              <button onClick={() => { setStudents(prev => prev.filter(s => !deleteConfirmIds.has(s.id))); setSelectedIds(new Set()); setDeleteConfirmIds(null); }} style={{
                padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff',
                background: '#DC2626', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
              }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
