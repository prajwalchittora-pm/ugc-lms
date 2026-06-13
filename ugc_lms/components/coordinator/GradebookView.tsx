'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Download, Pencil, Check, Eye, EyeOff, AlertTriangle, GraduationCap, RotateCcw, Info, ChevronLeft } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface GradeScale {
  grade: string; descriptor: string; minPct: number; maxPct: number; points: number;
}

interface CourseGrade {
  internal: number; external: number; total: number; grade: string; points: number;
}

interface Course {
  code: string; name: string; credits: number; semester: number;
}

interface StudentRow {
  id: string; name: string; rollNo: string; initials: string;
  grades: Record<string, CourseGrade>; sgpa: number; cgpa: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const DEFAULT_SCALE: GradeScale[] = [
  { grade: 'O', descriptor: 'Outstanding', minPct: 85, maxPct: 100, points: 10 },
  { grade: 'A+', descriptor: 'Excellent', minPct: 75, maxPct: 84, points: 9 },
  { grade: 'A', descriptor: 'Very Good', minPct: 65, maxPct: 74, points: 8 },
  { grade: 'B+', descriptor: 'Good', minPct: 55, maxPct: 64, points: 7 },
  { grade: 'B', descriptor: 'Above Average', minPct: 45, maxPct: 54, points: 6 },
  { grade: 'C', descriptor: 'Average', minPct: 40, maxPct: 44, points: 5 },
  { grade: 'F', descriptor: 'Fail', minPct: 0, maxPct: 39, points: 0 },
];

const PROGRAMMES = [
  { id: 'mba-26', name: 'MBA - Batch 2026', code: 'MBA-26', semesters: 4, currentSem: 1 },
  { id: 'bca-26', name: 'BCA - Batch 2026', code: 'BCA-26', semesters: 6, currentSem: 2 },
  { id: 'cse-26', name: 'B.Tech CSE - Batch 2026', code: 'CSE-26', semesters: 8, currentSem: 2 },
];

const COURSES: Record<string, Course[]> = {
  'mba-26': [
    // Semester 1
    { code: 'MBA-101', name: 'Managerial Economics', credits: 4, semester: 1 },
    { code: 'MBA-102', name: 'Managerial Communication', credits: 3, semester: 1 },
    { code: 'MBA-103', name: 'Financial Accounting', credits: 4, semester: 1 },
    { code: 'MBA-104', name: 'Organizational Behaviour', credits: 3, semester: 1 },
    { code: 'MBA-105', name: 'Business Statistics', credits: 4, semester: 1 },
    { code: 'MBA-106', name: 'Business Law & Ethics', credits: 2, semester: 1 },
    // Semester 2
    { code: 'MBA-201', name: 'Marketing Management', credits: 4, semester: 2 },
    { code: 'MBA-202', name: 'Financial Management', credits: 4, semester: 2 },
    { code: 'MBA-203', name: 'Operations Management', credits: 4, semester: 2 },
    { code: 'MBA-204', name: 'Human Resource Management', credits: 3, semester: 2 },
    { code: 'MBA-205', name: 'Business Research Methods', credits: 3, semester: 2 },
    { code: 'MBA-206', name: 'Management Information Systems', credits: 2, semester: 2 },
    // Semester 3
    { code: 'MBA-301', name: 'Strategic Management', credits: 4, semester: 3 },
    { code: 'MBA-302', name: 'Entrepreneurship & Innovation', credits: 3, semester: 3 },
    { code: 'MBA-303', name: 'Corporate Governance & Ethics', credits: 3, semester: 3 },
    { code: 'MBA-304', name: 'Elective I — Finance / Marketing', credits: 4, semester: 3 },
    { code: 'MBA-305', name: 'Elective II — HR / Operations', credits: 4, semester: 3 },
    { code: 'MBA-306', name: 'Industry Seminar & Live Projects', credits: 2, semester: 3 },
    // Semester 4
    { code: 'MBA-401', name: 'Business Policy & Grand Strategy', credits: 4, semester: 4 },
    { code: 'MBA-402', name: 'Project & Change Management', credits: 3, semester: 4 },
    { code: 'MBA-403', name: 'Elective III — Specialisation', credits: 4, semester: 4 },
    { code: 'MBA-404', name: 'Summer Internship Report', credits: 6, semester: 4 },
    { code: 'MBA-405', name: 'Dissertation & Viva Voce', credits: 8, semester: 4 },
  ],
  'bca-26': [
    { code: 'BCA-101', name: 'Introduction to Computers', credits: 4, semester: 1 },
    { code: 'BCA-102', name: 'Programming Fundamentals (C)', credits: 4, semester: 1 },
    { code: 'BCA-103', name: 'Mathematics I', credits: 4, semester: 1 },
    { code: 'BCA-104', name: 'Digital Electronics', credits: 3, semester: 1 },
    { code: 'BCA-105', name: 'English Communication', credits: 2, semester: 1 },
    { code: 'BCA-201', name: 'Data Structures', credits: 4, semester: 2 },
    { code: 'BCA-202', name: 'Object-Oriented Programming (Java)', credits: 4, semester: 2 },
    { code: 'BCA-203', name: 'Mathematics II — Discrete Maths', credits: 4, semester: 2 },
    { code: 'BCA-204', name: 'Database Management Systems', credits: 4, semester: 2 },
    { code: 'BCA-205', name: 'Web Technologies — HTML/CSS/JS', credits: 3, semester: 2 },
    { code: 'BCA-301', name: 'Computer Networks', credits: 4, semester: 3 },
    { code: 'BCA-302', name: 'Operating Systems', credits: 4, semester: 3 },
    { code: 'BCA-303', name: 'Software Engineering', credits: 3, semester: 3 },
    { code: 'BCA-304', name: 'Advanced Java & Frameworks', credits: 4, semester: 3 },
    { code: 'BCA-305', name: 'Linux & Shell Scripting', credits: 2, semester: 3 },
    { code: 'BCA-401', name: 'Algorithms & Complexity', credits: 4, semester: 4 },
    { code: 'BCA-402', name: 'Mobile Application Development', credits: 4, semester: 4 },
    { code: 'BCA-403', name: 'Cloud Computing Fundamentals', credits: 3, semester: 4 },
    { code: 'BCA-404', name: 'Cybersecurity Essentials', credits: 3, semester: 4 },
    { code: 'BCA-501', name: 'Artificial Intelligence', credits: 4, semester: 5 },
    { code: 'BCA-502', name: 'Machine Learning Fundamentals', credits: 4, semester: 5 },
    { code: 'BCA-503', name: 'Full Stack Web Development', credits: 4, semester: 5 },
    { code: 'BCA-504', name: 'Elective I', credits: 3, semester: 5 },
    { code: 'BCA-601', name: 'Project Work — Phase I', credits: 6, semester: 6 },
    { code: 'BCA-602', name: 'Project Work — Phase II & Viva', credits: 8, semester: 6 },
    { code: 'BCA-603', name: 'Seminar & Technical Presentation', credits: 2, semester: 6 },
  ],
  'cse-26': [
    { code: 'CSE-101', name: 'Engineering Mathematics I', credits: 4, semester: 1 },
    { code: 'CSE-102', name: 'Programming in C', credits: 4, semester: 1 },
    { code: 'CSE-103', name: 'Digital Logic Design', credits: 3, semester: 1 },
    { code: 'CSE-104', name: 'Engineering Physics', credits: 3, semester: 1 },
    { code: 'CSE-105', name: 'Communication Skills', credits: 2, semester: 1 },
    { code: 'CSE-201', name: 'Data Structures & Algorithms', credits: 4, semester: 2 },
    { code: 'CSE-202', name: 'Engineering Mathematics II', credits: 4, semester: 2 },
    { code: 'CSE-203', name: 'Computer Organization & Architecture', credits: 4, semester: 2 },
    { code: 'CSE-204', name: 'Discrete Mathematics', credits: 3, semester: 2 },
    { code: 'CSE-205', name: 'Object-Oriented Programming (C++)', credits: 4, semester: 2 },
    { code: 'CSE-301', name: 'Operating Systems', credits: 4, semester: 3 },
    { code: 'CSE-302', name: 'Database Management Systems', credits: 4, semester: 3 },
    { code: 'CSE-303', name: 'Computer Networks', credits: 4, semester: 3 },
    { code: 'CSE-304', name: 'Theory of Computation', credits: 3, semester: 3 },
    { code: 'CSE-305', name: 'Software Engineering', credits: 3, semester: 3 },
    { code: 'CSE-401', name: 'Compiler Design', credits: 4, semester: 4 },
    { code: 'CSE-402', name: 'Artificial Intelligence', credits: 4, semester: 4 },
    { code: 'CSE-403', name: 'Web Technologies & Frameworks', credits: 4, semester: 4 },
    { code: 'CSE-404', name: 'Microprocessors & Embedded Systems', credits: 3, semester: 4 },
    { code: 'CSE-405', name: 'Elective I', credits: 3, semester: 4 },
    { code: 'CSE-501', name: 'Machine Learning', credits: 4, semester: 5 },
    { code: 'CSE-502', name: 'Cloud Computing & DevOps', credits: 4, semester: 5 },
    { code: 'CSE-503', name: 'Cybersecurity & Cryptography', credits: 4, semester: 5 },
    { code: 'CSE-504', name: 'Elective II', credits: 3, semester: 5 },
    { code: 'CSE-505', name: 'Mini Project', credits: 2, semester: 5 },
    { code: 'CSE-601', name: 'Deep Learning & Neural Networks', credits: 4, semester: 6 },
    { code: 'CSE-602', name: 'Distributed Systems', credits: 4, semester: 6 },
    { code: 'CSE-603', name: 'Elective III', credits: 3, semester: 6 },
    { code: 'CSE-604', name: 'Elective IV', credits: 3, semester: 6 },
    { code: 'CSE-701', name: 'Major Project — Phase I', credits: 6, semester: 7 },
    { code: 'CSE-702', name: 'Elective V — Advanced Topics', credits: 4, semester: 7 },
    { code: 'CSE-703', name: 'Industry Internship', credits: 4, semester: 7 },
    { code: 'CSE-801', name: 'Major Project — Phase II & Defence', credits: 10, semester: 8 },
    { code: 'CSE-802', name: 'Seminar & Research Paper', credits: 3, semester: 8 },
    { code: 'CSE-803', name: 'Comprehensive Viva Voce', credits: 2, semester: 8 },
  ],
};

const MOCK_STUDENTS: StudentRow[] = [
  { id: 's8', name: 'Sneha Reddy', rollNo: 'MBA-2026-008', initials: 'SR', sgpa: 10.0, cgpa: 10.0, grades: {
    'MBA-101': { internal: 24, external: 71, total: 95, grade: 'O', points: 10 },
    'MBA-102': { internal: 23, external: 69, total: 92, grade: 'O', points: 10 },
    'MBA-103': { internal: 25, external: 73, total: 98, grade: 'O', points: 10 },
    'MBA-104': { internal: 22, external: 66, total: 88, grade: 'O', points: 10 },
    'MBA-105': { internal: 23, external: 67, total: 90, grade: 'O', points: 10 },
    'MBA-106': { internal: 22, external: 65, total: 87, grade: 'O', points: 10 },
  }},
  { id: 's2', name: 'Priya Sharma', rollNo: 'MBA-2026-002', initials: 'PS', sgpa: 9.55, cgpa: 9.55, grades: {
    'MBA-101': { internal: 23, external: 69, total: 92, grade: 'O', points: 10 },
    'MBA-102': { internal: 22, external: 62, total: 84, grade: 'A+', points: 9 },
    'MBA-103': { internal: 24, external: 71, total: 95, grade: 'O', points: 10 },
    'MBA-104': { internal: 21, external: 67, total: 88, grade: 'O', points: 10 },
    'MBA-105': { internal: 22, external: 59, total: 81, grade: 'A+', points: 9 },
    'MBA-106': { internal: 20, external: 58, total: 78, grade: 'A+', points: 9 },
  }},
  { id: 's15', name: 'Aisha Khan', rollNo: 'MBA-2026-015', initials: 'AK', sgpa: 9.20, cgpa: 9.20, grades: {
    'MBA-101': { internal: 21, external: 61, total: 82, grade: 'A+', points: 9 },
    'MBA-102': { internal: 20, external: 55, total: 75, grade: 'A+', points: 9 },
    'MBA-103': { internal: 22, external: 64, total: 86, grade: 'O', points: 10 },
    'MBA-104': { internal: 19, external: 56, total: 75, grade: 'A+', points: 9 },
    'MBA-105': { internal: 20, external: 58, total: 78, grade: 'A+', points: 9 },
    'MBA-106': { internal: 21, external: 59, total: 80, grade: 'A+', points: 9 },
  }},
  { id: 's13', name: 'Kavya Menon', rollNo: 'MBA-2026-013', initials: 'KM', sgpa: 9.50, cgpa: 9.50, grades: {
    'MBA-101': { internal: 22, external: 66, total: 88, grade: 'O', points: 10 },
    'MBA-102': { internal: 21, external: 62, total: 83, grade: 'A+', points: 9 },
    'MBA-103': { internal: 23, external: 68, total: 91, grade: 'O', points: 10 },
    'MBA-104': { internal: 20, external: 58, total: 78, grade: 'A+', points: 9 },
    'MBA-105': { internal: 21, external: 62, total: 83, grade: 'A+', points: 9 },
    'MBA-106': { internal: 22, external: 63, total: 85, grade: 'O', points: 10 },
  }},
  { id: 's1', name: 'Arjun Mehta', rollNo: 'MBA-2026-001', initials: 'AM', sgpa: 8.55, cgpa: 8.0, grades: {
    'MBA-101': { internal: 20, external: 58, total: 78, grade: 'A+', points: 9 },
    'MBA-102': { internal: 18, external: 51, total: 69, grade: 'A', points: 8 },
    'MBA-103': { internal: 22, external: 67, total: 89, grade: 'O', points: 10 },
    'MBA-104': { internal: 15, external: 42, total: 57, grade: 'B+', points: 7 },
    'MBA-105': { internal: 19, external: 56, total: 75, grade: 'A+', points: 9 },
    'MBA-106': { internal: 17, external: 47, total: 64, grade: 'B+', points: 7 },
  }},
  { id: 's11', name: 'Rohan Gupta', rollNo: 'MBA-2026-011', initials: 'RG', sgpa: 8.05, cgpa: 8.05, grades: {
    'MBA-101': { internal: 18, external: 53, total: 71, grade: 'A', points: 8 },
    'MBA-102': { internal: 16, external: 48, total: 64, grade: 'B+', points: 7 },
    'MBA-103': { internal: 20, external: 57, total: 77, grade: 'A+', points: 9 },
    'MBA-104': { internal: 17, external: 51, total: 68, grade: 'A', points: 8 },
    'MBA-105': { internal: 18, external: 47, total: 65, grade: 'A', points: 8 },
    'MBA-106': { internal: 19, external: 55, total: 74, grade: 'A', points: 8 },
  }},
  { id: 's14', name: 'Siddharth Rao', rollNo: 'MBA-2026-014', initials: 'SR2', sgpa: 7.05, cgpa: 7.05, grades: {
    'MBA-101': { internal: 15, external: 47, total: 62, grade: 'B+', points: 7 },
    'MBA-102': { internal: 14, external: 42, total: 56, grade: 'B+', points: 7 },
    'MBA-103': { internal: 16, external: 52, total: 68, grade: 'A', points: 8 },
    'MBA-104': { internal: 13, external: 39, total: 52, grade: 'B', points: 6 },
    'MBA-105': { internal: 15, external: 45, total: 60, grade: 'B+', points: 7 },
    'MBA-106': { internal: 14, external: 48, total: 62, grade: 'B+', points: 7 },
  }},
  { id: 's16', name: 'Dev Malhotra', rollNo: 'MBA-2026-016', initials: 'DM', sgpa: 6.40, cgpa: 6.40, grades: {
    'MBA-101': { internal: 14, external: 41, total: 55, grade: 'B+', points: 7 },
    'MBA-102': { internal: 12, external: 33, total: 45, grade: 'B', points: 6 },
    'MBA-103': { internal: 15, external: 43, total: 58, grade: 'B+', points: 7 },
    'MBA-104': { internal: 13, external: 35, total: 48, grade: 'B', points: 6 },
    'MBA-105': { internal: 14, external: 38, total: 52, grade: 'B', points: 6 },
    'MBA-106': { internal: 13, external: 39, total: 52, grade: 'B', points: 6 },
  }},
  { id: 's3', name: 'Rahul Verma', rollNo: 'MBA-2026-003', initials: 'RV', sgpa: 4.10, cgpa: 4.10, grades: {
    'MBA-101': { internal: 12, external: 33, total: 45, grade: 'B', points: 6 },
    'MBA-102': { internal: 10, external: 28, total: 38, grade: 'F', points: 0 },
    'MBA-103': { internal: 14, external: 38, total: 52, grade: 'B', points: 6 },
    'MBA-104': { internal: 8, external: 30, total: 38, grade: 'F', points: 0 },
    'MBA-105': { internal: 13, external: 35, total: 48, grade: 'B', points: 6 },
    'MBA-106': { internal: 11, external: 31, total: 42, grade: 'C', points: 5 },
  }},
  { id: 's6', name: 'Neha Patel', rollNo: 'MBA-2026-006', initials: 'NP', sgpa: 0.0, cgpa: 0.0, grades: {
    'MBA-101': { internal: 8, external: 22, total: 30, grade: 'F', points: 0 },
    'MBA-102': { internal: 9, external: 26, total: 35, grade: 'F', points: 0 },
    'MBA-103': { internal: 10, external: 28, total: 38, grade: 'F', points: 0 },
    'MBA-104': { internal: 7, external: 20, total: 27, grade: 'F', points: 0 },
    'MBA-105': { internal: 11, external: 24, total: 35, grade: 'F', points: 0 },
    'MBA-106': { internal: 8, external: 25, total: 33, grade: 'F', points: 0 },
  }},
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, { bg: string; color: string }> = {
  'O': { bg: 'rgba(5,150,105,0.08)', color: '#059669' },
  'A+': { bg: 'rgba(7,47,181,0.06)', color: '#072FB5' },
  'A': { bg: 'rgba(29,78,216,0.06)', color: '#1D4ED8' },
  'B+': { bg: 'rgba(217,119,6,0.06)', color: '#D97706' },
  'B': { bg: 'rgba(180,83,9,0.06)', color: '#B45309' },
  'C': { bg: 'rgba(234,88,12,0.06)', color: '#EA580C' },
  'F': { bg: 'rgba(220,38,38,0.06)', color: '#DC2626' },
};

function GradeBadge({ grade, total }: { grade: string; total: number }) {
  const c = GRADE_COLORS[grade] || { bg: '#f5f5f5', color: '#666' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, padding: '2px 8px', borderRadius: 'var(--radius-xs)', letterSpacing: '0.02em' }}>{grade}</span>
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{total}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

type Tab = 'config';

export default function GradebookView() {
  const [selectedProgramme, setSelectedProgramme] = useState('mba-26');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [tab, setTab] = useState<Tab>('config');
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(DEFAULT_SCALE);
  const [editingScale, setEditingScale] = useState(false);
  const [editScale, setEditScale] = useState<GradeScale[]>(DEFAULT_SCALE);
  const [internalWeight, setInternalWeight] = useState(25);
  const [gradeReleased, setGradeReleased] = useState(false);
  const [search, setSearch] = useState('');
  const [showProgrammeDD, setShowProgrammeDD] = useState(false);
  const [hoveredGrade, setHoveredGrade] = useState<{ studentId: string; courseCode: string } | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([1]));
  const programmeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (programmeRef.current && !programmeRef.current.contains(e.target as Node)) setShowProgrammeDD(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const p = PROGRAMMES.find(prog => prog.id === selectedProgramme) || PROGRAMMES[0];
    setExpandedSemesters(new Set([p.currentSem]));
  }, [selectedProgramme]);

  const programme = PROGRAMMES.find(p => p.id === selectedProgramme) || PROGRAMMES[0];
  const courses = COURSES[selectedProgramme] || [];
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  // Analytics computed
  const totalStudents = MOCK_STUDENTS.length;
  const passCount = MOCK_STUDENTS.filter(s => !Object.values(s.grades).some(g => g.grade === 'F')).length;
  const passRate = Math.round((passCount / totalStudents) * 100);
  const avgSgpa = +(MOCK_STUDENTS.reduce((s, st) => s + st.sgpa, 0) / totalStudents).toFixed(2);
  const topper = MOCK_STUDENTS[0]; // already sorted by SGPA desc

  // Grade distribution
  const gradeDist: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 };
  MOCK_STUDENTS.forEach(s => Object.values(s.grades).forEach(g => { gradeDist[g.grade] = (gradeDist[g.grade] || 0) + 1; }));
  const maxDist = Math.max(...Object.values(gradeDist));

  // Course performance
  const coursePerf = courses.map(c => {
    const scores = MOCK_STUDENTS.map(s => s.grades[c.code]).filter(Boolean);
    const avgScore = scores.length ? Math.round(scores.reduce((s, g) => s + g.total, 0) / scores.length) : 0;
    const coursePassRate = scores.length ? Math.round((scores.filter(g => g.grade !== 'F').length / scores.length) * 100) : 0;
    const failCount = scores.filter(g => g.grade === 'F').length;
    return { ...c, avgScore, passRate: coursePassRate, failCount };
  });

  // Anomalies: courses where >50% got same grade or fail rate > 40%
  const anomalies = coursePerf.filter(c => c.passRate < 60 || c.failCount >= 3);

  const thStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.03)' };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'config', label: 'Configuration' },
  ];

  return (
    <div style={{ padding: '28px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0 }}>Gradebook</h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>Configure grading logic, view &amp; release student grades</p>
        </div>

        {/* Programme Selector */}
        <div ref={programmeRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowProgrammeDD(!showProgrammeDD)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)', background: '#fff',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>
            <GraduationCap size={14} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }} />
            {programme.name}
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {showProgrammeDD && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50, background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 220, overflow: 'hidden' }}>
              {PROGRAMMES.map(p => (
                <button key={p.id} onClick={() => { setSelectedProgramme(p.id); setShowProgrammeDD(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                  fontSize: 12.5, fontWeight: selectedProgramme === p.id ? 700 : 500,
                  color: selectedProgramme === p.id ? 'var(--blue-700)' : 'var(--text-primary)',
                  background: selectedProgramme === p.id ? 'rgba(7,47,181,0.04)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
                  onMouseEnter={e => { if (selectedProgramme !== p.id) e.currentTarget.style.background = 'var(--bg-section)'; }}
                  onMouseLeave={e => { if (selectedProgramme !== p.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {p.name}
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 1 }}>{p.semesters} semesters &middot; Semester {p.currentSem} active</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--border-subtle)', marginBottom: 24 }}>
        {TABS.map(t => {
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 20px', fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: 'transparent', border: 'none',
              borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
              marginBottom: '-1.5px', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isActive ? 'var(--text-primary)' : 'var(--text-tertiary)'; }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══ STUDENT GRADES TAB (removed) ═══ */}
      {false && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Semester pills */}
              {Array.from({ length: programme.semesters }, (_, i) => i + 1).map(sem => (
                <button key={sem} onClick={() => setSelectedSemester(sem)} style={{
                  padding: '5px 14px', fontSize: 12, fontWeight: selectedSemester === sem ? 700 : 500,
                  color: selectedSemester === sem ? '#fff' : 'var(--text-secondary)',
                  background: selectedSemester === sem ? 'var(--blue-700)' : '#fff',
                  border: selectedSemester === sem ? '1px solid var(--blue-700)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}>
                  Sem {sem}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{
                  width: 180, padding: '6px 10px 6px 30px', fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  background: '#fff', fontFamily: 'var(--font-sans)', outline: 'none',
                  color: 'var(--text-primary)',
                }} />
              </div>

              {/* Grade Release Toggle */}
              <button onClick={() => setGradeReleased(!gradeReleased)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', fontSize: 11.5, fontWeight: 600,
                color: gradeReleased ? '#059669' : 'var(--text-tertiary)',
                background: gradeReleased ? 'rgba(5,150,105,0.06)' : '#fff',
                border: gradeReleased ? '1px solid rgba(5,150,105,0.2)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}>
                {gradeReleased ? <Eye size={13} /> : <EyeOff size={13} />}
                {gradeReleased ? 'Released' : 'Not Released'}
              </button>

              {/* Export */}
              <button style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', fontSize: 11.5, fontWeight: 600,
                color: 'var(--text-secondary)', background: '#fff',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          {/* Grades Table */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36, textAlign: 'center' }}>#</th>
                    <th style={{ ...thStyle, minWidth: 140 }}>Student</th>
                    <th style={{ ...thStyle, minWidth: 120 }}>Roll No</th>
                    {courses.map(c => (
                      <th key={c.code} style={{ ...thStyle, textAlign: 'center' }}>
                        <div>{c.code.split('-')[1]}</div>
                        <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0, marginTop: 1 }}>{c.credits} cr</div>
                      </th>
                    ))}
                    <th style={{ ...thStyle, textAlign: 'center', background: 'rgba(7,47,181,0.02)' }}>SGPA</th>
                    <th style={{ ...thStyle, textAlign: 'center', background: 'rgba(7,47,181,0.02)' }}>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const hasFailure = Object.values(student.grades).some(g => g.grade === 'F');
                    return (
                      <tr key={student.id} style={{ background: hasFailure ? 'rgba(220,38,38,0.02)' : 'transparent' }}>
                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                        <td style={{ ...tdStyle }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-section)', border: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>{student.initials}</div>
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{student.name}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{student.rollNo}</td>
                        {courses.map(c => {
                          const g = student.grades[c.code];
                          const isHovered = hoveredGrade?.studentId === student.id && hoveredGrade?.courseCode === c.code;
                          return (
                            <td key={c.code} style={{ ...tdStyle, textAlign: 'center', position: 'relative', cursor: 'default' }}
                              onMouseEnter={() => setHoveredGrade({ studentId: student.id, courseCode: c.code })}
                              onMouseLeave={() => setHoveredGrade(null)}
                            >
                              {g ? <GradeBadge grade={g.grade} total={g.total} /> : <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>-</span>}
                              {/* Tooltip */}
                              {isHovered && g && (
                                <div style={{
                                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                                  marginBottom: 6, zIndex: 40, background: '#1a1a1a', color: '#fff',
                                  borderRadius: 'var(--radius-xs)', padding: '8px 12px', fontSize: 11,
                                  whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                  pointerEvents: 'none',
                                }}>
                                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                                  <div style={{ display: 'flex', gap: 12 }}>
                                    <span>Internal: <b>{g.internal}/25</b></span>
                                    <span>External: <b>{g.external}/75</b></span>
                                  </div>
                                  <div style={{ marginTop: 3, fontWeight: 600, color: GRADE_COLORS[g.grade]?.color || '#fff' }}>
                                    Total: {g.total}/100 &middot; Grade {g.grade} &middot; {g.points} pts
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: student.sgpa >= 8 ? '#059669' : student.sgpa >= 6 ? 'var(--text-primary)' : '#DC2626', background: 'rgba(7,47,181,0.02)' }}>
                          {student.sgpa.toFixed(2)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: student.cgpa >= 8 ? '#059669' : student.cgpa >= 6 ? 'var(--text-primary)' : '#DC2626', background: 'rgba(7,47,181,0.02)' }}>
                          {student.cgpa.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{filteredStudents.length} students &middot; {courses.length} courses &middot; {totalCredits} credits</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>SGPA = &Sigma;(Credit &times; Grade Points) / &Sigma;Credits</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIGURATION TAB ═══ */}
      {tab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Grade Scale */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Grade Scale</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>UGC CBCS 10-point scale &middot; Customizable per programme</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {editingScale ? (
                  <>
                    <button onClick={() => { setEditingScale(false); setEditScale(gradeScale); }} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
                    <button onClick={() => { setGradeScale(editScale); setEditingScale(false); }} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, color: '#fff', background: 'var(--blue-700)', border: '1px solid var(--blue-700)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> Save
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setGradeScale(DEFAULT_SCALE); setEditScale(DEFAULT_SCALE); }} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw size={11} /> Reset to UGC Default
                    </button>
                    <button onClick={() => { setEditingScale(true); setEditScale([...gradeScale]); }} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, color: 'var(--blue-700)', background: 'rgba(7,47,181,0.04)', border: '1px solid rgba(7,47,181,0.15)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Pencil size={11} /> Edit Scale
                    </button>
                  </>
                )}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 60, textAlign: 'center' }}>Grade</th>
                  <th style={thStyle}>Descriptor</th>
                  <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Min %</th>
                  <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Max %</th>
                  <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {(editingScale ? editScale : gradeScale).map((row, i) => {
                  const gc = GRADE_COLORS[row.grade];
                  return (
                    <tr key={row.grade}>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: gc?.color || 'var(--text-primary)', background: gc?.bg || 'transparent', padding: '3px 10px', borderRadius: 'var(--radius-xs)' }}>{row.grade}</span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12.5, fontWeight: 500 }}>{row.descriptor}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {editingScale ? (
                          <input type="number" value={editScale[i].minPct} onChange={e => { const v = [...editScale]; v[i] = { ...v[i], minPct: +e.target.value }; setEditScale(v); }} style={{ width: 48, padding: '3px 6px', fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', outline: 'none' }} />
                        ) : (
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{row.minPct}</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {editingScale ? (
                          <input type="number" value={editScale[i].maxPct} onChange={e => { const v = [...editScale]; v[i] = { ...v[i], maxPct: +e.target.value }; setEditScale(v); }} style={{ width: 48, padding: '3px 6px', fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', outline: 'none' }} />
                        ) : (
                          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{row.maxPct}</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {editingScale ? (
                          <input type="number" value={editScale[i].points} onChange={e => { const v = [...editScale]; v[i] = { ...v[i], points: +e.target.value }; setEditScale(v); }} style={{ width: 48, padding: '3px 6px', fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', outline: 'none' }} />
                        ) : (
                          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.points}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Credit Structure — fills empty space below Grade Scale */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Credit Structure</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>{programme.name} &middot; {programme.semesters} semesters</div>
            </div>

            {/* Semester accordion list */}
            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              {Array.from({ length: programme.semesters }, (_, i) => i + 1).map(semNum => {
                const semCourses = courses.filter(c => c.semester === semNum);
                const semCredits = semCourses.reduce((s, c) => s + c.credits, 0);
                const isExpanded = expandedSemesters.has(semNum);
                const isActive = semNum === programme.currentSem;
                return (
                  <div key={semNum} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <button
                      onClick={() => {
                        const next = new Set(expandedSemesters);
                        if (next.has(semNum)) next.delete(semNum); else next.add(semNum);
                        setExpandedSemesters(next);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', width: '100%',
                        padding: '9px 14px', gap: 7,
                        background: isExpanded ? 'rgba(7,47,181,0.02)' : 'transparent',
                        border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-section)'; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <ChevronDown size={11} style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s ease', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Semester {semNum}</span>
                      {isActive && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>Active</span>
                      )}
                      <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 500, flexShrink: 0, marginLeft: 4 }}>
                        {semCourses.length} courses &middot; {semCredits} cr
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ background: 'rgba(0,0,0,0.01)' }}>
                        {semCourses.length === 0 ? (
                          <div style={{ padding: '8px 14px 8px 34px', fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No courses configured</div>
                        ) : (
                          <>
                            {semCourses.map(c => (
                              <div key={c.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px 6px 34px', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{c.name}</div>
                                  <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{c.code}</div>
                                </div>
                                <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 10 }}>
                                  {c.credits}<span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}> cr</span>
                                </span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px 14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--blue-700)', fontFamily: 'var(--font-mono)' }}>Subtotal: {semCredits} cr</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grand total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderTop: '1.5px solid var(--border-subtle)', background: 'rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Total Credits</span>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--blue-700)' }}>{totalCredits}</span>
            </div>
          </div>

          </div>{/* end left column */}

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Assessment Weightage */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Assessment Weightage</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 16 }}>UGC default: 25% Internal, 75% External</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Internal (Continuous)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{internalWeight}%</span>
                  </div>
                  <input type="range" min={10} max={50} value={internalWeight} onChange={e => setInternalWeight(+e.target.value)} style={{ width: '100%', accentColor: 'var(--blue-700)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>External (End-Semester)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{100 - internalWeight}%</span>
                  </div>
                </div>
              </div>

              {/* Visual bar */}
              <div style={{ display: 'flex', marginTop: 12, borderRadius: 'var(--radius-xs)', overflow: 'hidden', height: 8 }}>
                <div style={{ width: `${internalWeight}%`, background: 'var(--blue-700)', transition: 'width 0.2s' }} />
                <div style={{ flex: 1, background: 'rgba(7,47,181,0.15)' }} />
              </div>
            </div>

            {/* SGPA Formula */}
            <div style={{ background: 'rgba(7,47,181,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(7,47,181,0.08)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Info size={13} style={{ color: 'var(--blue-700)', opacity: 0.6 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>SGPA Formula</span>
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                SGPA = &Sigma;(C<sub>i</sub> &times; GP<sub>i</sub>) / &Sigma;C<sub>i</sub>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
                Where C<sub>i</sub> = credits for course i, GP<sub>i</sub> = grade points earned. CGPA is computed similarly across all completed semesters.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANALYTICS TAB (removed) ═══ */}
      {false && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Students', value: totalStudents.toString(), sub: `${courses.length} courses`, color: 'var(--text-primary)' },
              { label: 'Pass Rate', value: `${passRate}%`, sub: `${passCount}/${totalStudents} passed`, color: passRate >= 80 ? '#059669' : passRate >= 60 ? '#D97706' : '#DC2626' },
              { label: 'Average SGPA', value: avgSgpa.toFixed(2), sub: 'Across all students', color: avgSgpa >= 8 ? '#059669' : avgSgpa >= 6 ? 'var(--text-primary)' : '#DC2626' },
              { label: 'Semester Topper', value: topper.name, sub: `SGPA ${topper.sgpa.toFixed(2)}`, color: '#059669' },
            ].map(card => (
              <div key={card.label} style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '18px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.color, fontFamily: card.label === 'Semester Topper' ? 'var(--font-display)' : 'var(--font-mono)', letterSpacing: '-0.02em' }}>{card.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Grade Distribution */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>Grade Distribution</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 16 }}>Across all courses &middot; {totalStudents * courses.length} total grades</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(gradeDist).map(([grade, count]) => {
                  const gc = GRADE_COLORS[grade];
                  const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
                  return (
                    <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: gc?.color || '#666', textAlign: 'right' }}>{grade}</span>
                      <div style={{ flex: 1, height: 20, background: 'var(--bg-section)', borderRadius: 'var(--radius-xs)', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: gc?.color || '#ccc', opacity: 0.15, borderRadius: 'var(--radius-xs)', transition: 'width 0.3s ease' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: `${pct}%`, height: '100%', background: gc?.color || '#ccc', opacity: 0.25, borderRadius: 'var(--radius-xs)' }} />
                      </div>
                      <span style={{ width: 28, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Performance */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Course Performance</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>Average scores &amp; pass rates per course</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Course</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Avg Score</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Pass Rate</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Fails</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePerf.map(c => (
                    <tr key={c.code}>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{c.code} &middot; {c.credits} cr</div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{c.avgScore}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.passRate >= 80 ? '#059669' : c.passRate >= 60 ? '#D97706' : '#DC2626', background: c.passRate >= 80 ? 'rgba(5,150,105,0.06)' : c.passRate >= 60 ? 'rgba(217,119,6,0.06)' : 'rgba(220,38,38,0.06)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>{c.passRate}%</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: c.failCount > 0 ? '#DC2626' : 'var(--text-tertiary)' }}>{c.failCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anomaly Flags */}
          {anomalies.length > 0 && (
            <div style={{ marginTop: 20, background: 'rgba(217,119,6,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217,119,6,0.15)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={14} style={{ color: '#D97706' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>Anomalies Detected</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {anomalies.map(c => (
                  <div key={c.code} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 700 }}>{c.code}</span> &mdash; {c.name}: pass rate {c.passRate}%, {c.failCount} failures. Consider reviewing assessment difficulty or grading.
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
