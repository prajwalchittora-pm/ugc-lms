'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Check, Users, Mail, Phone, BookOpen, GraduationCap, UserPlus, ChevronDown, ShieldCheck, AlertTriangle, Clock, CheckCircle2, MoreHorizontal, Trash2, Ban, User } from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface FacultyAccount {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  courses: string[];
  studentsAssigned: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending' | 'new';
}

interface MentorAccount {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  programme: string;
  programmeCode: string;
  studentsAllocated: number;
  maxAllocation: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

const DEPARTMENTS = ['School of Management', 'School of Technology', 'School of Science', 'School of Humanities', 'School of Law', 'School of Commerce'];

const COURSES_LIST = [
  { code: 'MBA-101', name: 'Managerial Economics' },
  { code: 'MBA-102', name: 'Managerial Communication' },
  { code: 'MBA-103', name: 'Financial Accounting & Analysis' },
  { code: 'MBA-104', name: 'Organizational Behaviour' },
  { code: 'MBA-105', name: 'Business Statistics' },
  { code: 'MBA-106', name: 'Business Law & Ethics' },
  { code: 'BCA-101', name: 'Programming Fundamentals' },
  { code: 'BCA-102', name: 'Data Structures' },
  { code: 'CSE-201', name: 'Operating Systems' },
  { code: 'CSE-202', name: 'Computer Networks' },
];

const PROGRAMMES_LIST = [
  { code: 'MBA-26', name: 'MBA - Batch 2026' },
  { code: 'BCA-26', name: 'BCA - Batch 2026' },
  { code: 'B.Tech CSE-26', name: 'B.Tech CSE - Batch 2026' },
  { code: 'MCA-26', name: 'MCA - Batch 2026' },
];

const FACULTY_ACCOUNTS: FacultyAccount[] = [
  { id: 'fa1', name: 'Prof. Kavya Menon', initials: 'KM', email: 'kavya.menon@university.edu', phone: '9876500001', department: 'School of Management', designation: 'Associate Professor', courses: ['MBA-102', 'MBA-107'], studentsAssigned: 180, lastActive: '2h ago', status: 'active' },
  { id: 'fa2', name: 'Dr. Priya Nair', initials: 'PN', email: 'priya.nair@university.edu', phone: '9876500002', department: 'School of Management', designation: 'Assistant Professor', courses: ['MBA-101', 'MBA-103'], studentsAssigned: 210, lastActive: '1h ago', status: 'active' },
  { id: 'fa3', name: 'Prof. Arjun Das', initials: 'AD', email: 'arjun.das@university.edu', phone: '9876500003', department: 'School of Management', designation: 'Professor', courses: ['MBA-104'], studentsAssigned: 95, lastActive: '3d ago', status: 'pending' },
  { id: 'fa4', name: 'Dr. Sanjay Gupta', initials: 'SG', email: 'sanjay.gupta@university.edu', phone: '9876500004', department: 'School of Science', designation: 'Assistant Professor', courses: ['MBA-105'], studentsAssigned: 95, lastActive: '4h ago', status: 'new' },
  { id: 'fa5', name: 'Prof. Meera Krishnan', initials: 'MK', email: 'meera.k@university.edu', phone: '9876500005', department: 'School of Law', designation: 'Associate Professor', courses: ['MBA-106'], studentsAssigned: 95, lastActive: '1d ago', status: 'inactive' },
];

const MENTOR_ACCOUNTS: MentorAccount[] = [
  { id: 'me1', name: 'Dr. Rahul Sharma', initials: 'RS', email: 'rahul.sharma@university.edu', phone: '9876500101', programme: 'MBA - Batch 2026', programmeCode: 'MBA-26', studentsAllocated: 48, maxAllocation: 250, lastActive: '3h ago', status: 'active' },
  { id: 'me2', name: 'Ms. Deepa Pillai', initials: 'DP', email: 'deepa.pillai@university.edu', phone: '9876500102', programme: 'BCA - Batch 2026', programmeCode: 'BCA-26', studentsAllocated: 62, maxAllocation: 250, lastActive: '30m ago', status: 'active' },
  { id: 'me3', name: 'Mr. Vikram Iyer', initials: 'VI', email: 'vikram.iyer@university.edu', phone: '9876500103', programme: 'B.Tech CSE - Batch 2026', programmeCode: 'B.Tech CSE-26', studentsAllocated: 234, maxAllocation: 250, lastActive: '2d ago', status: 'active' },
  { id: 'me4', name: 'Dr. Anita Roy', initials: 'AR', email: 'anita.roy@university.edu', phone: '9876500104', programme: 'MCA - Batch 2026', programmeCode: 'MCA-26', studentsAllocated: 15, maxAllocation: 250, lastActive: '5h ago', status: 'inactive' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  const colors: Record<string, string> = { A: '#7C3AED', B: '#DC2626', C: '#059669', D: '#D97706', E: '#072FB5', F: '#BE185D', G: '#0891B2', H: '#7C3AED', I: '#DC2626', J: '#059669', K: '#D97706', L: '#072FB5', M: '#BE185D', N: '#0891B2', O: '#7C3AED', P: '#DC2626', Q: '#059669', R: '#D97706', S: '#072FB5', T: '#BE185D', U: '#0891B2', V: '#7C3AED', W: '#DC2626', X: '#059669', Y: '#D97706', Z: '#072FB5' };
  const c = colors[initials[0].toUpperCase()] || '#747474';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${c}18`, border: `1.5px solid ${c}30`, display: 'grid', placeItems: 'center', fontSize: size * 0.36, fontWeight: 800, color: c, flexShrink: 0, letterSpacing: '0.01em', fontFamily: 'var(--font-sans)' }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'new' }) {
  const map: Record<string, { color: string; dot: string; label: string }> = {
    active:   { color: '#059669', dot: '#059669', label: 'Active' },
    inactive: { color: '#747474', dot: '#D1D5DB', label: 'Inactive' },
    pending:  { color: '#D97706', dot: '#D97706', label: 'Pending' },
    new:      { color: '#072FB5', dot: '#072FB5', label: 'New' },
  };
  const s = map[status] || map.inactive;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function RowActionsMenu({ onEdit, onSuspend, onDelete }: { onEdit: () => void; onSuspend: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', background: open ? 'var(--bg-section)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: 'var(--text-tertiary)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-section)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 60, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', minWidth: 148, overflow: 'hidden' }}>
          {[
            { label: 'Edit', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, color: 'var(--text-primary)', action: () => { onEdit(); setOpen(false); } },
            { label: 'Suspend', icon: <Ban size={13} strokeWidth={2} />, color: '#D97706', action: () => { onSuspend(); setOpen(false); } },
            { label: 'Delete', icon: <Trash2 size={13} strokeWidth={2} />, color: '#DC2626', action: () => { onDelete(); setOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, fontWeight: 500, color: item.color, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-section)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CoursePill({ code }: { code: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 7px', fontSize: 10.5, fontWeight: 700, color: 'var(--blue-700)', background: 'rgba(7,47,181,0.07)', borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.01em' }}>
      {code}
    </span>
  );
}

// ─── Create Faculty Modal ───────────────────────────────────────────────────

function CreateFacultyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (f: FacultyAccount) => void }) {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const canCreate = username && firstName && lastName && email && password;

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 5 };
  const req = <span style={{ color: '#DC2626' }}>*</span>;
  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };

  const handleCreate = () => {
    if (!canCreate) return;
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    onCreate({
      id: 'fa-' + Date.now(),
      name: `${firstName} ${lastName}`.trim(),
      initials,
      email,
      phone,
      department: '—',
      designation: 'Faculty',
      courses: [],
      studentsAssigned: 0,
      lastActive: 'Just now',
      status: 'active',
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Dark gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                <GraduationCap size={20} strokeWidth={1.8} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Create Faculty Account</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Onboard a new faculty member to the LMS</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}><X size={16} /></button>
          </div>
          {/* Hero: Username */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Username *</label>
            <input type="text" placeholder="e.g. kavya.menon" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>First Name {req}</label><input type="text" placeholder="Kavya" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Last Name {req}</label><input type="text" placeholder="Menon" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div><label style={labelStyle}>Email {req}</label><input type="email" placeholder="kavya@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>

          <div><label style={labelStyle}>Password {req}</label><input type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>

          <div><label style={labelStyle}>Phone Number</label><input type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate} style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: canCreate ? 'var(--blue-700)' : 'var(--border-subtle)', border: 'none', borderRadius: 8, cursor: canCreate ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)', boxShadow: canCreate ? '0 2px 8px rgba(7,47,181,0.25)' : 'none' }}>Create Account</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Mentor Modal ────────────────────────────────────────────────────

function CreateMentorModal({ onClose, onCreate }: { onClose: () => void; onCreate: (m: MentorAccount) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [programme, setProgramme] = useState(PROGRAMMES_LIST[0].code);
  const [studentAllocation, setStudentAllocation] = useState('');

  const canCreate = firstName && lastName && username && email && password;
  const allocNum = parseInt(studentAllocation) || 0;
  const ratioOk = !studentAllocation || allocNum <= 250;

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 5 };
  const req = <span style={{ color: '#DC2626' }}>*</span>;
  const selectBg = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' as const, WebkitAppearance: 'none' as const, backgroundImage: selectBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' };
  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };

  const handleCreate = () => {
    if (!canCreate) return;
    const prog = PROGRAMMES_LIST.find(p => p.code === programme);
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    onCreate({
      id: 'me-' + Date.now(),
      name: `${firstName} ${lastName}`.trim(),
      initials,
      email,
      phone,
      programme: prog?.name || programme,
      programmeCode: programme,
      studentsAllocated: allocNum,
      maxAllocation: 250,
      lastActive: 'Just now',
      status: 'active',
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxHeight: '90vh', background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Dark gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #1A6B4A 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                <User size={20} strokeWidth={1.8} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Create Mentor Account</h3>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Onboard a new student mentor to the LMS</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}><X size={16} /></button>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>First Name *</label>
            <input type="text" placeholder="Enter first name..." value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: -4 }}>Account Details</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Last Name {req}</label><input type="text" placeholder="Sharma" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Username {req}</label><input type="text" placeholder="rahul.sharma" value={username} onChange={e => setUsername(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>Password {req}</label><input type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Email {req}</label><input type="email" placeholder="rahul@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <input type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6, marginBottom: -4 }}>Assignment</div>

          <div>
            <label style={labelStyle}>Assigned Programme {req}</label>
            <select value={programme} onChange={e => setProgramme(e.target.value)} style={selectStyle} onFocus={focusHandler} onBlur={blurHandler}>
              {PROGRAMMES_LIST.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Student Allocation</label>
            <div style={{ position: 'relative' }}>
              <input type="number" placeholder="e.g. 50" min="1" max="250" value={studentAllocation} onChange={e => setStudentAllocation(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', borderColor: !ratioOk ? '#DC2626' : 'transparent', boxShadow: !ratioOk ? '0 0 0 3px rgba(220,38,38,0.1)' : 'none', background: !ratioOk ? 'rgba(220,38,38,0.03)' : 'var(--bg-section)' }} onFocus={focusHandler} onBlur={blurHandler} />
              {studentAllocation && (
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, color: ratioOk ? '#059669' : '#DC2626' }}>
                  {allocNum}/250
                </span>
              )}
            </div>
            {!ratioOk && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#DC2626', fontWeight: 500 }}>Exceeds UGC maximum of 250 students per mentor.</p>}
          </div>

          {/* UGC note */}
          <div style={{ padding: '10px 12px', background: 'rgba(5,150,105,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(5,150,105,0.12)', fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ShieldCheck size={14} strokeWidth={1.6} style={{ color: '#059669', opacity: 0.7, flexShrink: 0, marginTop: 1 }} />
            <span>As per UGC 2020 Regulations (ODL/Online), the mentor-to-student ratio must not exceed <strong style={{ color: 'var(--text-secondary)' }}>1:250</strong>. Each mentor is responsible for student guidance, grievance redressal, and academic support.</span>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate || !ratioOk} style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: (canCreate && ratioOk) ? '#059669' : 'var(--border-subtle)', border: 'none', borderRadius: 8, cursor: (canCreate && ratioOk) ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)', boxShadow: (canCreate && ratioOk) ? '0 2px 8px rgba(5,150,105,0.25)' : 'none' }}>Create Account</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Faculty Modal ─────────────────────────────────────────────────────

function EditFacultyModal({ faculty, onClose, onSave }: { faculty: FacultyAccount; onClose: () => void; onSave: (updated: FacultyAccount) => void }) {
  const [firstName, setFirstName] = useState(faculty.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(faculty.name.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(faculty.email);
  const [phone, setPhone] = useState(faculty.phone);

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 5 };
  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Edit Faculty</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{faculty.name}</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)' }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>First Name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Last Name</label><input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>
          <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>
        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={() => { onSave({ ...faculty, name: `${firstName} ${lastName}`.trim(), initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase(), email, phone }); onClose(); }} style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(7,47,181,0.25)' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Mentor Modal ──────────────────────────────────────────────────────

function EditMentorModal({ mentor, onClose, onSave }: { mentor: MentorAccount; onClose: () => void; onSave: (updated: MentorAccount) => void }) {
  const [firstName, setFirstName] = useState(mentor.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(mentor.name.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(mentor.email);
  const [phone, setPhone] = useState(mentor.phone);

  const inputStyle = { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block' as const, fontSize: 11, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 5 };
  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #1A6B4A 100%)', padding: '20px 24px 18px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Edit Mentor</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{mentor.name}</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.7)' }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={labelStyle}>First Name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Last Name</label><input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>
          <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>
        <div style={{ padding: '14px 24px', background: '#FAFAFA', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={() => { onSave({ ...mentor, name: `${firstName} ${lastName}`.trim(), initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase(), email, phone }); onClose(); }} style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Faculty Tab ────────────────────────────────────────────────────────────

function FacultyTab() {
  const [faculty, setFaculty] = useState<FacultyAccount[]>(FACULTY_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FacultyAccount | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = faculty.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const STATUS_OPTS = [
    { v: 'all',      label: 'All Status', color: null },
    { v: 'active',   label: 'Active',     color: '#059669' },
    { v: 'inactive', label: 'Inactive',   color: '#D1D5DB' },
    { v: 'pending',  label: 'Pending',    color: '#D97706' },
    { v: 'new',      label: 'New',        color: '#072FB5' },
  ];
  const activeOpt = STATUS_OPTS.find(o => o.v === statusFilter)!;

  const thStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.03)', verticalAlign: 'middle' };
  const dropdownBtnStyle = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: active ? 'var(--blue-700)' : 'var(--text-tertiary)', background: active ? 'rgba(7,47,181,0.05)' : '#fff', border: `1px solid ${active ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' });

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 260 }}>
          <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '7px 10px 7px 30px', fontSize: 12.5, fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-700)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          />
          <Search size={13} strokeWidth={2.2} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' }} ref={statusRef}>
          <button onClick={() => setShowStatusDropdown(v => !v)} style={dropdownBtnStyle(statusFilter !== 'all')}>
            {activeOpt.color
              ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeOpt.color, display: 'inline-block', flexShrink: 0 }} />
              : <Users size={12} strokeWidth={2} style={{ opacity: 0.5 }} />
            }
            {activeOpt.label}
            <ChevronDown size={11} strokeWidth={2.5} style={{ opacity: 0.45, transform: showStatusDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {showStatusDropdown && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 150, overflow: 'hidden' }}>
              {STATUS_OPTS.map(opt => {
                const isSelected = statusFilter === opt.v;
                return (
                  <button key={opt.v} onClick={() => { setStatusFilter(opt.v); setShowStatusDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--blue-700)' : 'var(--text-primary)', background: isSelected ? 'rgba(7,47,181,0.04)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-section)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(7,47,181,0.04)' : 'transparent'; }}
                  >
                    {opt.color ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} /> : <Users size={12} strokeWidth={2} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
                    {opt.label}
                    {isSelected && <Check size={12} strokeWidth={2.5} style={{ color: 'var(--blue-700)', marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <UserPlus size={13} strokeWidth={2} /> Create Faculty Account
        </button>
      </div>

      {/* Faculty table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-section)' }}>
              <th style={thStyle}>Faculty</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Last Active</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
                  No faculty found matching your filters.
                </td>
              </tr>
            )}
            {filtered.map(f => (
              <tr key={f.id} style={{ cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,0,0,0.015)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={f.initials} size={34} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{f.email || '—'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{f.phone || '—'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>{f.lastActive}</span>
                </td>
                <td style={tdStyle}><StatusBadge status={f.status} /></td>
                <td style={{ ...tdStyle, paddingRight: 12 }}>
                  <RowActionsMenu
                    onEdit={() => setEditTarget(f)}
                    onSuspend={() => setFaculty(prev => prev.map(x => x.id === f.id ? { ...x, status: 'inactive' as const } : x))}
                    onDelete={() => setFaculty(prev => prev.filter(x => x.id !== f.id))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateFacultyModal onClose={() => setShowCreateModal(false)} onCreate={f => setFaculty(prev => [f, ...prev])} />}
      {editTarget && <EditFacultyModal faculty={editTarget} onClose={() => setEditTarget(null)} onSave={updated => { setFaculty(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditTarget(null); }} />}
    </div>
  );
}

// ─── Mentor Tab ─────────────────────────────────────────────────────────────

function MentorTab() {
  const [mentors, setMentors] = useState<MentorAccount[]>(MENTOR_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MentorAccount | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = mentors.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const STATUS_OPTS = [
    { v: 'all',      label: 'All Status', color: null },
    { v: 'active',   label: 'Active',     color: '#059669' },
    { v: 'inactive', label: 'Inactive',   color: '#D1D5DB' },
    { v: 'pending',  label: 'Pending',    color: '#D97706' },
    { v: 'new',      label: 'New',        color: '#072FB5' },
  ];
  const activeOpt = STATUS_OPTS.find(o => o.v === statusFilter)!;

  const thStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.03)', verticalAlign: 'middle' };
  const dropdownBtnStyle = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: active ? 'var(--blue-700)' : 'var(--text-tertiary)', background: active ? 'rgba(7,47,181,0.05)' : '#fff', border: `1px solid ${active ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' });

  return (
    <div>
      {/* Info banner */}
      <div style={{ padding: '10px 14px', background: 'rgba(5,150,105,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <ShieldCheck size={15} strokeWidth={1.8} style={{ color: '#059669', flexShrink: 0 }} />
        <span><strong>UGC 2020 Regulation:</strong> Maximum 1 mentor per 250 students in ODL/Online programmes. Mentors handle student guidance, grievance redressal, and academic support.</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 260 }}>
          <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '7px 10px 7px 30px', fontSize: 12.5, fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-700)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          />
          <Search size={13} strokeWidth={2.2} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' }} ref={statusRef}>
          <button onClick={() => setShowStatusDropdown(v => !v)} style={dropdownBtnStyle(statusFilter !== 'all')}>
            {activeOpt.color
              ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeOpt.color, display: 'inline-block', flexShrink: 0 }} />
              : <Users size={12} strokeWidth={2} style={{ opacity: 0.5 }} />
            }
            {activeOpt.label}
            <ChevronDown size={11} strokeWidth={2.5} style={{ opacity: 0.45, transform: showStatusDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {showStatusDropdown && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 150, overflow: 'hidden' }}>
              {STATUS_OPTS.map(opt => {
                const isSelected = statusFilter === opt.v;
                return (
                  <button key={opt.v} onClick={() => { setStatusFilter(opt.v); setShowStatusDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--blue-700)' : 'var(--text-primary)', background: isSelected ? 'rgba(7,47,181,0.04)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-section)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(7,47,181,0.04)' : 'transparent'; }}
                  >
                    {opt.color ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} /> : <Users size={12} strokeWidth={2} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
                    {opt.label}
                    {isSelected && <Check size={12} strokeWidth={2.5} style={{ color: 'var(--blue-700)', marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#059669', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <UserPlus size={13} strokeWidth={2} /> Create Mentor Account
        </button>
      </div>

      {/* Mentor table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-section)' }}>
              <th style={thStyle}>Mentor</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Students</th>
              <th style={thStyle}>Last Active</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
                  No mentors found matching your filters.
                </td>
              </tr>
            )}
            {filtered.map(m => (
              <tr key={m.id}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,0,0,0.015)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={m.initials} size={34} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.email || '—'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{m.phone || '—'}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{m.studentsAllocated}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>{m.lastActive}</span>
                </td>
                <td style={tdStyle}><StatusBadge status={m.status} /></td>
                <td style={{ ...tdStyle, paddingRight: 12 }}>
                  <RowActionsMenu
                    onEdit={() => setEditTarget(m)}
                    onSuspend={() => setMentors(prev => prev.map(x => x.id === m.id ? { ...x, status: 'inactive' as const } : x))}
                    onDelete={() => setMentors(prev => prev.filter(x => x.id !== m.id))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateMentorModal onClose={() => setShowCreateModal(false)} onCreate={m => setMentors(prev => [m, ...prev])} />}
      {editTarget && <EditMentorModal mentor={editTarget} onClose={() => setEditTarget(null)} onSave={updated => { setMentors(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditTarget(null); }} />}
    </div>
  );
}

// ─── Main FacultyView ───────────────────────────────────────────────────────

type FacultyViewTab = 'faculty' | 'mentor';

export default function FacultyView() {
  const [activeTab, setActiveTab] = useState<FacultyViewTab>('faculty');

  const TABS: { key: FacultyViewTab; label: string; count: number }[] = [
    { key: 'faculty', label: 'Faculty', count: FACULTY_ACCOUNTS.length },
    { key: 'mentor', label: 'Mentors', count: MENTOR_ACCOUNTS.length },
  ];

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0 }}>Faculty & Mentors</h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '4px 0 0', fontWeight: 500 }}>
          Manage faculty accounts, course assignments, and student mentors.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--blue-700)' : 'var(--text-tertiary)',
              background: 'none', border: 'none', borderBottom: `2px solid ${isActive ? 'var(--blue-700)' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color 0.15s',
            }}>
              {tab.label}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: isActive ? 'rgba(7,47,181,0.1)' : 'var(--bg-section)', color: isActive ? 'var(--blue-700)' : 'var(--text-tertiary)' }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'faculty' && <FacultyTab />}
      {activeTab === 'mentor' && <MentorTab />}
    </div>
  );
}
