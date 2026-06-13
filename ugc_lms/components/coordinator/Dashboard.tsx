'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, MessageSquare, Pin, Calendar, Clock, ClipboardCheck, Megaphone, X, GraduationCap, BookOpen, Users, BarChart3, Sparkles, CheckCircle2, Circle, AlertTriangle, FileEdit, HelpCircle, Video } from 'lucide-react';
import Link from 'next/link';

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface UpcomingEvent { id: string; title: string; day: number; month: string; time?: string; type: 'exam' | 'assignment' | 'quiz' | 'live_session'; daysLeft: number; course?: string; courseName?: string; programme?: string; context: string; href: string; }
interface GradingItem { id: string; studentName: string; studentInitials: string; title: string; courseCode: string; submittedAt: string; gradeBy: string; overdue: boolean; }
interface ForumPost { id: string; title: string; course: string; author: string; authorInitials: string; time: string; replies: number; }
interface Announcement { id: string; title: string; body: string; programme: string; programmeLabel: string; time: string; pinned: boolean; }

const UPCOMING: UpcomingEvent[] = [
  { id: 'u1', title: 'Business Statistics Project Due', day: 8, month: 'Jun', time: '11:59 PM', type: 'assignment', daysLeft: 0, course: 'MBA-105', courseName: 'Business Statistics', programme: 'MBA - Batch 2026', context: '4/20 submitted', href: '/coordinator/grading' },
  { id: 'u2', title: 'Counselling Session — Managerial Economics', day: 9, month: 'Jun', time: '10:00 AM', type: 'live_session', daysLeft: 0, course: 'MBA-101', courseName: 'Managerial Economics', programme: 'MBA - Batch 2026', context: 'Dr. Anita Desai', href: '/coordinator/courses?course=MBA-101&activity=lp-ls2' },
  { id: 'u3', title: 'Module 3 Quiz — Business Law', day: 10, month: 'Jun', time: '9:00 AM', type: 'quiz', daysLeft: 1, course: 'MBA-106', courseName: 'Business Law & Ethics', programme: 'MBA - Batch 2026', context: 'Published', href: '/coordinator/courses?course=MBA-101&activity=lp-10' },
  { id: 'u4', title: 'End Sem — Managerial Economics', day: 15, month: 'Jun', time: '10:00 AM', type: 'exam', daysLeft: 6, course: 'MBA-101', courseName: 'Managerial Economics', programme: 'MBA - Batch 2026', context: '106/124 eligible', href: '/coordinator/exams' },
  { id: 'u5', title: 'End Sem — Managerial Communication', day: 17, month: 'Jun', time: '10:00 AM', type: 'exam', daysLeft: 8, course: 'MBA-102', courseName: 'Managerial Communication', programme: 'MBA - Batch 2026', context: '118/124 eligible', href: '/coordinator/exams' },
];

// Sorted: overdue first, then by submission time (most recent first)
const GRADING_ITEMS: GradingItem[] = [
  { id: 'g5', studentName: 'Dev Malhotra', studentInitials: 'DM', title: 'OB Reflection Paper', courseCode: 'MBA-104', submittedAt: '5d ago', gradeBy: '5 Jun', overdue: true },
  { id: 'g4', studentName: 'Rohan Gupta', studentInitials: 'RG', title: 'OB Reflection Paper', courseCode: 'MBA-104', submittedAt: '4d ago', gradeBy: '7 Jun', overdue: true },
  { id: 'g1', studentName: 'Arjun Mehta', studentInitials: 'AM', title: 'Case Study: Market Entry Strategy', courseCode: 'MBA-101', submittedAt: '2h ago', gradeBy: '15 Jun', overdue: false },
  { id: 'g2', studentName: 'Priya Sharma', studentInitials: 'PS', title: 'Financial Statement Analysis Report', courseCode: 'MBA-103', submittedAt: '4h ago', gradeBy: '15 Jun', overdue: false },
  { id: 'g3', studentName: 'Kavya Menon', studentInitials: 'KM', title: 'Case Study: Market Entry Strategy', courseCode: 'MBA-101', submittedAt: '5h ago', gradeBy: '15 Jun', overdue: false },
];

const FORUM_POSTS: ForumPost[] = [
  { id: 'f1', title: 'Doubt regarding Market Equilibrium in imperfect competition', course: 'Managerial Economics', author: 'Arjun Mehta', authorInitials: 'AM', time: '2h ago', replies: 0 },
  { id: 'f2', title: 'Assignment format — APA or Harvard referencing?', course: 'Managerial Communication', author: 'Kavya Menon', authorInitials: 'KM', time: '1d ago', replies: 3 },
  { id: 'f3', title: 'Request to reschedule OB group presentation', course: 'Organizational Behaviour', author: 'Dev Malhotra', authorInitials: 'DM', time: '2d ago', replies: 1 },
  { id: 'f4', title: 'Lab submission deadline clarification', course: 'Business Statistics', author: 'Karthik Nair', authorInitials: 'KN', time: '3d ago', replies: 5 },
  { id: 'f5', title: 'Study group for End Sem prep — Economics', course: 'Managerial Economics', author: 'Priya Sharma', authorInitials: 'PS', time: '4d ago', replies: 8 },
];

const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'End Semester Examination Schedule Released', body: 'Online proctored exams from 15 Jun to 25 Jun. Check the Exams tab for detailed timetable and proctoring instructions.', programme: 'MBA-26', programmeLabel: 'MBA - Batch 2026', time: '2h ago', pinned: true },
  { id: 'a2', title: 'Eligibility List — Final Reminder', body: 'Students below 75% engagement must submit exemption requests with documents by 6 June.', programme: 'MBA-26', programmeLabel: 'MBA - Batch 2026', time: '1d ago', pinned: true },
  { id: 'a3', title: 'Preparatory Period Notice', body: 'No new live sessions from 10 Jun to 14 Jun. Students may use this time for revision. E-library access continues.', programme: 'all', programmeLabel: 'All Programmes', time: '3d ago', pinned: false },
];

const EVENT_TYPE: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; gradient: string }> = {
  exam:         { label: 'Exam',         icon: BookOpen,   color: '#1B7A4A', bg: 'rgba(27,122,74,0.08)', gradient: 'linear-gradient(155deg, #F4FCF7 0%, #DDEFDF 100%)' },
  assignment:   { label: 'Assignment',   icon: FileEdit,   color: '#0E7490', bg: 'rgba(14,116,144,0.08)', gradient: 'linear-gradient(155deg, #F4FDFE 0%, #DCF3F8 100%)' },
  quiz:         { label: 'Quiz',         icon: HelpCircle, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', gradient: 'linear-gradient(155deg, #F8F5FF 0%, #EDE6FF 100%)' },
  live_session: { label: 'Live Session', icon: Video,      color: '#072FB5', bg: 'rgba(7,47,181,0.08)', gradient: 'linear-gradient(155deg, #F4F7FF 0%, #E2EBFF 100%)' },
};

// ─── FTUE: Welcome Modal ────────────────────────────────────────────────────

function WelcomeModal({ userName, onStartTour, onDismiss }: { userName: string; onStartTour: () => void; onDismiss: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: 'var(--bg-section)', borderRadius: 16, width: 460, maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
        {/* Dark header */}
        <div style={{ padding: '32px 36px 24px', background: '#0D0A3D', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 40, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
            Welcome, {userName}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.5 }}>
            Your programme management dashboard is ready.
          </p>
        </div>

        {/* Features list — white background */}
        <div style={{ padding: '24px 36px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>What you can do here</div>
          {[
            { icon: <GraduationCap size={16} />, title: 'Manage Programmes', desc: 'Create and organize courses, semesters, and content' },
            { icon: <ClipboardCheck size={16} />, title: 'Grade Submissions', desc: 'Review student work with plagiarism checks and feedback' },
            { icon: <BookOpen size={16} />, title: 'Grading Policy', desc: 'Create and modify the grade scale and assessment weightage per programme' },
            { icon: <BarChart3 size={16} />, title: 'Track Engagement', desc: 'Monitor the 75% UGC threshold and student eligibility' },
            { icon: <Megaphone size={16} />, title: 'Communicate', desc: 'Post announcements and respond to forum discussions' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(7,47,181,0.06)', display: 'grid', placeItems: 'center', color: '#072FB5', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onDismiss} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}>Skip for now</button>
          <button onClick={onStartTour} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#072FB5', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            <Sparkles size={14} /> Take a Quick Tour
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FTUE: Feature Tour ─────────────────────────────────────────────────────

const TOUR_STEPS = [
  { id: 'upcoming', title: 'Upcoming Events', desc: 'Your upcoming exams, assignment deadlines, and quizzes appear here — sorted by date so you always know what\'s next.', position: 'bottom' as const },
  { id: 'grading', title: 'Grading Queue', desc: 'New student submissions that need your review. You can grade, give feedback, and check plagiarism scores.', position: 'bottom' as const },
  { id: 'forums', title: 'Forum Activity', desc: 'Monitor student discussions across all your courses. Unanswered threads and flagged posts are highlighted.', position: 'top' as const },
  { id: 'announcements', title: 'Announcements', desc: 'Your recent broadcasts to students. Pin important ones, create new announcements, and manage visibility.', position: 'top' as const },
  { id: 'sidenav', title: 'Navigation', desc: 'Use the sidebar to access all features — Programmes, Students, Gradebook, Exams, Reports, and more.', position: 'right' as const },
];

function FeatureTour({ step, onNext, onBack, onDismiss }: { step: number; onNext: () => void; onBack: () => void; onDismiss: () => void }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const currentStep = TOUR_STEPS[step];

  useEffect(() => {
    const el = document.querySelector(`[data-tour="${currentStep.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Wait for scroll to settle before measuring
      const timer = setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [step, currentStep.id]);

  if (!targetRect) return null;

  const pad = 14;
  const tipW = 320;
  const tipH = 180;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  let tipTop = 0;
  let tipLeft = 0;

  if (currentStep.position === 'right') {
    tipTop = targetRect.top + targetRect.height / 2 - 60;
    tipLeft = targetRect.right + pad + 12;
  } else {
    // Try bottom first, flip to top if not enough space
    const bottomPos = targetRect.bottom + pad + 12;
    const topPos = targetRect.top - pad - tipH;
    tipTop = (bottomPos + tipH > vh && topPos > 0) ? topPos : bottomPos;
    tipLeft = targetRect.left + targetRect.width / 2 - tipW / 2;
  }

  tipLeft = Math.max(16, Math.min(tipLeft, (typeof window !== 'undefined' ? window.innerWidth : 1400) - tipW - 16));
  tipTop = Math.max(16, Math.min(tipTop, vh - tipH - 16));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* Overlay with cutout */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - pad} y={targetRect.top - pad}
              width={targetRect.width + pad * 2} height={targetRect.height + pad * 2}
              rx={10} fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#tour-mask)" style={{ pointerEvents: 'auto' }} onClick={onDismiss} />
      </svg>

      {/* Spotlight ring */}
      <div style={{
        position: 'fixed',
        left: targetRect.left - pad, top: targetRect.top - pad,
        width: targetRect.width + pad * 2, height: targetRect.height + pad * 2,
        borderRadius: 10, border: '2px solid rgba(7,47,181,0.4)',
        boxShadow: '0 0 0 4px rgba(7,47,181,0.1)',
        pointerEvents: 'none', zIndex: 301,
      }} />

      {/* Tooltip */}
      <div style={{
        position: 'fixed', top: tipTop, left: tipLeft, width: tipW, zIndex: 302,
        background: '#fff', borderRadius: 12, padding: '20px 22px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {TOUR_STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 16 : 6, height: 6, borderRadius: 3, background: i === step ? '#072FB5' : 'rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{step + 1}/{TOUR_STEPS.length}</span>
        </div>

        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{currentStep.title}</h4>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>{currentStep.desc}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onDismiss} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}>Skip tour</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {step > 0 && (
              <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <ChevronLeft size={13} /> Back
              </button>
            )}
            <button onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff', background: '#072FB5', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {step === TOUR_STEPS.length - 1 ? 'Done' : 'Next'} {step < TOUR_STEPS.length - 1 && <ChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FTUE: Setup Banner ─────────────────────────────────────────────────────

function SetupBanner({ onDismiss }: { onDismiss: () => void }) {
  const steps = [
    { label: 'Create your first programme', href: '/coordinator/courses', done: false },
    { label: 'Add courses to the programme', href: '/coordinator/courses', done: false },
    { label: 'Configure grade scale', href: '/coordinator/gradebook', done: false },
    { label: 'Enroll students', href: '/coordinator/courses', done: false },
    { label: 'Post a welcome announcement', href: '/coordinator/announcements', done: false },
  ];

  return (
    <div style={{
      marginBottom: 24, padding: '18px 24px',
      background: 'linear-gradient(135deg, rgba(7,47,181,0.04) 0%, rgba(124,58,237,0.03) 100%)',
      border: '1px solid rgba(7,47,181,0.1)', borderRadius: 12,
      display: 'flex', alignItems: 'flex-start', gap: 20,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(7,47,181,0.08)', display: 'grid', placeItems: 'center', color: '#072FB5', flexShrink: 0, marginTop: 2 }}>
        <Sparkles size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 2 }}>Get started with your dashboard</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>Complete these steps to set up your programme.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {steps.map((s, i) => (
            <Link key={i} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                fontSize: 12, fontWeight: 600, color: s.done ? '#059669' : '#072FB5',
                background: s.done ? 'rgba(5,150,105,0.06)' : '#fff',
                border: `1px solid ${s.done ? 'rgba(5,150,105,0.15)' : 'rgba(7,47,181,0.12)'}`,
                borderRadius: 6, cursor: 'pointer',
              }}>
                {s.done ? <CheckCircle2 size={12} /> : <Circle size={12} style={{ opacity: 0.4 }} />}
                {s.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, display: 'flex', flexShrink: 0, marginTop: 2 }} title="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard({ userName = 'Dr. Sharma' }: { userName?: string }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const [showSetupBanner, setShowSetupBanner] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('coord_visited');
    const empty = localStorage.getItem('coord_empty');
    if (!visited) {
      setIsFirstVisit(true);
      setShowWelcome(true);
      setShowSetupBanner(true);
    }
    if (empty === 'true') setIsEmpty(true);
    const ftueHandler = () => { setShowWelcome(true); setTourStep(-1); setShowSetupBanner(true); };
    const emptyHandler = () => { setIsEmpty(localStorage.getItem('coord_empty') === 'true'); };
    window.addEventListener('trigger-coord-ftue', ftueHandler);
    window.addEventListener('coord-empty-toggle', emptyHandler);
    return () => { window.removeEventListener('trigger-coord-ftue', ftueHandler); window.removeEventListener('coord-empty-toggle', emptyHandler); };
  }, []);

  const dismissWelcome = () => { setShowWelcome(false); localStorage.setItem('coord_visited', 'true'); };
  const startTour = () => { setShowWelcome(false); setTourStep(0); localStorage.setItem('coord_visited', 'true'); };
  const nextTourStep = () => { if (tourStep >= TOUR_STEPS.length - 1) setTourStep(-1); else setTourStep(tourStep + 1); };
  const prevTourStep = () => { if (tourStep > 0) setTourStep(tourStep - 1); };
  const dismissTour = () => setTourStep(-1);

  const upcoming = isEmpty ? [] : UPCOMING;
  const gradingItems = isEmpty ? [] : GRADING_ITEMS;
  const forumPosts = isEmpty ? [] : FORUM_POSTS;
  const announcements = isEmpty ? [] : ANNOUNCEMENTS;

  const overdueGrading = gradingItems.filter(g => g.overdue).length;

  // Time-aware greeting
  const hour = 14; // mock: 2 PM
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '32px 40px 64px', maxWidth: 1200 }}>

      {/* FTUE */}
      {showWelcome && <WelcomeModal userName={userName} onStartTour={startTour} onDismiss={dismissWelcome} />}
      {tourStep >= 0 && <FeatureTour step={tourStep} onNext={nextTourStep} onBack={prevTourStep} onDismiss={dismissTour} />}

      {/* Setup Banner */}
      {showSetupBanner && <SetupBanner onDismiss={() => setShowSetupBanner(false)} />}

      {/* ═══ GREETING ═══ */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Monday, 9 June 2026</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
          {greeting}, <span style={{ color: 'var(--text-heading-hilite)' }}>{userName}</span>
        </h1>
      </div>

      {/* ═══ UPCOMING — compact event cards ═══ */}
      <div data-tour="upcoming" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>Upcoming</h2>
          <Link href="/coordinator/schedule" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            Full schedule <ChevronRight size={13} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: '48px 24px', textAlign: 'center' }}>
            <Calendar size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.25, marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No upcoming events</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Events appear as you schedule exams and set deadlines.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(upcoming.length, 5)}, 1fr)`, gap: 12 }}>
            {upcoming.slice(0, 5).map(event => {
              const et = EVENT_TYPE[event.type];
              const TypeIcon = et.icon;
              const isUrgent = event.daysLeft <= 1;
              const isSoon = event.daysLeft <= 3;
              return (
                <Link key={event.id} href={event.href} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                  <div style={{
                    flex: 1,
                    background: '#fff',
                    border: '2px solid rgba(15,15,15,0.45)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Top section — date hero with gradient */}
                    <div style={{ padding: '18px 18px 14px', background: et.gradient }}>
                      {/* Date + urgency */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <span style={{ fontSize: 34, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>{event.day}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-tertiary)' }}>{event.month}</span>
                        </div>
                        {(isUrgent || isSoon) && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.03em',
                            color: isUrgent ? '#DC2626' : '#D97706',
                            background: isUrgent ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)',
                            padding: '3px 8px', borderRadius: 4,
                          }}>
                            {event.daysLeft === 0 ? 'Today' : 'Tomorrow'}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
                        lineHeight: 1.35, minHeight: 37,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {event.title}
                      </div>

                      {/* Programme + course breadcrumb */}
                      {(event.programme || event.course) && (
                        <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          {event.programme && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', background: 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{event.programme}</span>
                          )}
                          {event.programme && event.course && (
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', opacity: 0.5 }}>·</span>
                          )}
                          {event.course && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{event.course}</span>
                          )}
                          {event.courseName && (
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.courseName}</span>
                          )}
                        </div>
                      )}

                      {/* Context line — actionable metric */}
                      <div style={{
                        marginTop: 8, fontSize: 11.5, fontWeight: 600,
                        color: et.color, letterSpacing: '0.01em',
                      }}>
                        {event.context}
                      </div>
                    </div>

                    {/* Bottom section — type tag + time */}
                    <div style={{
                      marginTop: 'auto',
                      padding: '10px 18px 14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      {/* Type tag with icon */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px',
                        background: et.bg,
                        borderRadius: 6,
                        border: `1px solid ${et.color}15`,
                      }}>
                        <TypeIcon size={11} strokeWidth={2.2} style={{ color: et.color }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: et.color }}>{et.label}</span>
                      </div>

                      {/* Time */}
                      {event.time && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{event.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ GRADING QUEUE — table format ═══ */}
      <div data-tour="grading" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>Grading Queue</h2>
            {overdueGrading > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: 'rgba(220,38,38,0.08)', padding: '3px 10px', borderRadius: 10, fontFamily: 'var(--font-mono)' }}>{overdueGrading} overdue</span>}
          </div>
          <Link href="/coordinator/grading" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {gradingItems.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: '48px 24px', textAlign: 'center' }}>
            <ClipboardCheck size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.25, marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No submissions to grade</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Submissions appear once students start coursework.</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(15,15,15,0.12)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 0.8fr 0.7fr 0.7fr', padding: '9px 18px', background: 'var(--bg-section)', borderBottom: '1px solid var(--border-subtle)' }}>
              {['Student', 'Submission', 'Course', 'Submitted', 'Grade by'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {/* Table rows — overdue already sorted to top in data */}
            {gradingItems.map((item, idx) => {
              const isLast = idx === gradingItems.length - 1;
              return (
                <Link key={item.id} href="/coordinator/grading" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1.4fr 2fr 0.8fr 0.7fr 0.7fr',
                    padding: '10px 18px',
                    alignItems: 'center',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    background: item.overdue ? 'rgba(220,38,38,0.03)' : 'transparent',
                    borderLeft: item.overdue ? '3px solid #DC2626' : '3px solid transparent',
                    transition: 'background 0.1s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = item.overdue ? 'rgba(220,38,38,0.05)' : 'rgba(0,0,0,0.015)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = item.overdue ? 'rgba(220,38,38,0.03)' : 'transparent'; }}
                  >
                    {/* Student */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: item.overdue ? 'rgba(220,38,38,0.08)' : 'var(--bg-section)',
                        display: 'grid', placeItems: 'center',
                        fontSize: 9, fontWeight: 700, color: item.overdue ? '#DC2626' : 'var(--text-secondary)',
                      }}>
                        {item.studentInitials}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.studentName}</span>
                    </div>

                    {/* Submission */}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{item.title}</span>

                    {/* Course */}
                    <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{item.courseCode}</span>

                    {/* Submitted */}
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>{item.submittedAt}</span>

                    {/* Grade by */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {item.overdue && <AlertTriangle size={10} strokeWidth={2.5} style={{ color: '#DC2626', flexShrink: 0 }} />}
                      <span style={{ fontSize: 11, fontWeight: item.overdue ? 700 : 500, color: item.overdue ? '#DC2626' : 'var(--text-tertiary)' }}>{item.gradeBy}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ TWO COLUMN: Forums + Announcements ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Recent Forum Posts */}
        <div data-tour="forums">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>Recent Forum Posts</h3>
            <Link href="/coordinator/forums" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {forumPosts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquare size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.25, marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No forum activity yet</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Posts appear as students engage in discussions.</div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(15,15,15,0.12)', overflow: 'hidden' }}>
              {forumPosts.slice(0, 5).map((post, idx) => {
                const isLast = idx === Math.min(forumPosts.length, 5) - 1;
                return (
                  <Link key={post.id} href="/coordinator/forums" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-section)', display: 'grid', placeItems: 'center', fontSize: 7, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>{post.authorInitials}</div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{post.author}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{post.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <MessageSquare size={9} /> {post.replies}
                        </div>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 4 }}>{post.title}</div>
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)' }}>{post.course}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Announcements — bulletin style */}
        <div data-tour="announcements">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>Announcements</h3>
            <Link href="/coordinator/announcements" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Create new <ChevronRight size={13} />
            </Link>
          </div>

          {announcements.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-subtle)', padding: '48px 24px', textAlign: 'center' }}>
              <Megaphone size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.25, marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No announcements yet</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>Post your first announcement.</div>
              <Link href="/coordinator/announcements" style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-700)', textDecoration: 'none' }}>Create Announcement &rarr;</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map(ann => (
                <Link key={ann.id} href="/coordinator/announcements" style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: 10, border: '2px solid rgba(15,15,15,0.45)',
                    padding: '16px 20px',
                    cursor: 'pointer', position: 'relative',
                    transition: 'box-shadow 0.12s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(7,47,181,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    {/* Top row: pinned indicator + time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: ann.programme === 'all' ? '#059669' : '#072FB5', background: ann.programme === 'all' ? 'rgba(5,150,105,0.06)' : 'rgba(7,47,181,0.06)', padding: '2px 8px', borderRadius: 4 }}>{ann.programmeLabel}</span>
                        {ann.pinned && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <Pin size={9} style={{ transform: 'rotate(45deg)' }} /> Pinned
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500 }}>{ann.time}</span>
                    </div>

                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 4 }}>{ann.title}</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidenav tour target */}
      <div data-tour="sidenav" style={{ position: 'fixed', left: 0, top: 100, width: 272, height: 400, pointerEvents: 'none' }} />
    </div>
  );
}
