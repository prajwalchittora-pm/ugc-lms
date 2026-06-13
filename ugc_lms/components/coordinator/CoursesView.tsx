'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronRight, ChevronDown, MonitorPlay, BookOpenText, MessageSquare, ClipboardCheck, Video, CheckCircle2, AlertTriangle, Plus, GraduationCap, Users, BookOpen, X, Clock, CalendarRange, Filter, Upload, UserPlus, ShieldCheck, Mail, Check, GripVertical, Eye, EyeOff, Lock, Unlock, Settings } from 'lucide-react';
import { PROGRAMME_BATCHES, ProgrammeBatch, CoordinatorCourse, ProgrammeType, getProgrammeTypeColor } from '@/lib/coordinatorData';
import CourseEditor from './CourseEditor';

// ─── Helpers ────────────────────────────────────────────────────────────────

type QuadrantKey = 'live_session' | 'e_tutorial' | 'e_content' | 'discussion' | 'assessment';
const Q_ICONS: Record<QuadrantKey, React.ElementType> = { live_session: Video, e_tutorial: MonitorPlay, e_content: BookOpenText, discussion: MessageSquare, assessment: ClipboardCheck };
const Q_COLORS: Record<QuadrantKey, string> = { live_session: '#072FB5', e_tutorial: '#8F3B00', e_content: '#7C3AED', discussion: '#0DA88F', assessment: '#DC2626' };
const Q_LABELS: Record<QuadrantKey, string> = { live_session: 'Live', e_tutorial: 'Tutorial', e_content: 'Content', discussion: 'Forum', assessment: 'Assess' };

function engColor(v: number) { return v >= 75 ? '#059669' : v >= 60 ? '#D97706' : '#DC2626'; }
function readyColor(v: number) { return v >= 90 ? '#059669' : v >= 70 ? '#D97706' : '#DC2626'; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    active: { bg: 'rgba(5,150,105,0.06)', color: '#059669', dot: '#059669', label: 'Active' },
    upcoming: { bg: 'rgba(7,47,181,0.05)', color: '#072FB5', dot: '#072FB5', label: 'Upcoming' },
    completed: { bg: 'rgba(5,150,105,0.06)', color: '#059669', dot: '#059669', label: 'Completed' },
  };
  const s = map[status] || map.active;
  return (
    <span style={{ fontSize: 10.5, fontWeight: 600, color: s.color, background: s.bg, padding: '2px 8px 2px 6px', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function TypeBadge({ type }: { type: ProgrammeType }) {
  const color = getProgrammeTypeColor(type);
  return <span style={{ fontSize: 9.5, fontWeight: 700, color, background: color + '10', border: `1px solid ${color}20`, padding: '1px 7px', borderRadius: 'var(--radius-pill)' }}>{type}</span>;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ width: '100%', height: 3, background: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
    </div>
  );
}

function QuadrantDots({ course }: { course: CoordinatorCourse }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {(['live_session', 'e_tutorial', 'e_content', 'discussion', 'assessment'] as QuadrantKey[]).map(qType => {
        const qs = course.quadrantStatus[qType];
        const done = (qs as any).uploaded ?? (qs as any).conducted ?? (qs as any).active ?? (qs as any).published ?? 0;
        const pct = qs.total > 0 ? Math.round((done / qs.total) * 100) : 0;
        const Icon = Q_ICONS[qType];
        return (
          <div key={qType} title={`${Q_LABELS[qType]}: ${done}/${qs.total}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon size={10} strokeWidth={1.8} style={{ color: Q_COLORS[qType], opacity: 0.6 }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: pct >= 90 ? '#059669' : pct >= 60 ? '#D97706' : pct > 0 ? '#DC2626' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {done}<span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: 9 }}>/{qs.total}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dropdown Filter ────────────────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);
  const isFiltered = value !== 'all';

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 10px', fontSize: 12, fontWeight: 600,
        color: isFiltered ? 'var(--blue-700)' : 'var(--text-tertiary)',
        background: isFiltered ? 'rgba(7,47,181,0.06)' : 'transparent',
        border: `1px solid ${isFiltered ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: 11 }}>{label}:</span>
        <span>{selected?.label || value}</span>
        <ChevronDown size={11} strokeWidth={2} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4, minWidth: 160,
          background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', zIndex: 40,
        }}>
          {options.map(opt => {
            const active = value === opt.value;
            return (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '8px 12px', fontSize: 12, fontWeight: active ? 700 : 500,
                color: active ? 'var(--blue-700)' : 'var(--text-primary)',
                background: active ? 'rgba(7,47,181,0.05)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-section)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(7,47,181,0.05)' : 'transparent'; }}
              >
                {opt.color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {active && <CheckCircle2 size={12} style={{ color: 'var(--blue-700)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />}
          {item.onClick ? (
            <button onClick={item.onClick} style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-700)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >{item.label}</button>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Segmented Date Input ────────────────────────────────────────────────────

function SegmentedDateInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setYear(y || ''); setMonth(m || ''); setDay(d || '');
    } else {
      setDay(''); setMonth(''); setYear('');
    }
  }, [value]);

  const emit = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) onChange(`${y}-${m}-${d}`);
    else if (!d && !m && !y) onChange('');
  };

  const handleDay = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 2);
    setDay(n); emit(n, month, year);
    if (n.length === 2) monthRef.current?.focus();
  };
  const handleMonth = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 2);
    setMonth(n); emit(day, n, year);
    if (n.length === 2) yearRef.current?.focus();
  };
  const handleYear = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 4);
    setYear(n); emit(day, month, n);
  };

  const segBase: React.CSSProperties = {
    padding: '9px 0', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)', background: 'var(--bg-section)',
    border: '1.5px solid transparent', borderRadius: 8, outline: 'none',
    textAlign: 'center', transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#072FB5';
    e.currentTarget.style.background = '#fff';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.background = 'var(--bg-section)';
    e.currentTarget.style.boxShadow = 'none';
  };
  const segLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5,
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={segLabel}>Day</span>
          <input value={day} onChange={e => handleDay(e.target.value)} placeholder="DD"
            inputMode="numeric" style={{ ...segBase, width: 48 }} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-tertiary)', padding: '0 5px', paddingBottom: 10 }}>/</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={segLabel}>Month</span>
          <input ref={monthRef} value={month} onChange={e => handleMonth(e.target.value)} placeholder="MM"
            inputMode="numeric" style={{ ...segBase, width: 48 }} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-tertiary)', padding: '0 5px', paddingBottom: 10 }}>/</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={segLabel}>Year</span>
          <input ref={yearRef} value={year} onChange={e => handleYear(e.target.value)} placeholder="YYYY"
            inputMode="numeric" style={{ ...segBase, width: 68 }} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>
    </div>
  );
}

// ─── Create Programme Modal ─────────────────────────────────────────────────

function CreateProgrammeModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: ProgrammeBatch) => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [batchYear, setBatchYear] = useState('2026');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<ProgrammeType>('PG');
  const [semesters, setSemesters] = useState('4');
  const [credits, setCredits] = useState('80');

  const shortLabel = code ? `${code}-${batchYear.slice(-2)}` : '';
  const canCreate = name && code;

  const handleCreate = () => {
    if (!canCreate) return;
    const numSems = parseInt(semesters) || 4;
    const totalCreds = parseInt(credits) || 80;
    const newProg: ProgrammeBatch = {
      id: 'new-' + Date.now(), name, code,
      batchYear: parseInt(batchYear) || 2026, shortLabel,
      type, status: 'upcoming',
      totalSemesters: numSems, currentSemester: 0, totalCredits: totalCreds,
      students: 0, avgEngagement: 0, avgGrade: 0, contentReadiness: 0, faculty: 0,
      color: getProgrammeTypeColor(type), startDate: startDate || 'TBD', endDate: endDate || 'TBD',
      semesters: Array.from({ length: numSems }, (_, i) => ({
        id: `new-s${i + 1}-${Date.now()}`, number: i + 1, label: `Semester ${i + 1}`,
        credits: Math.round(totalCreds / numSems), courses: [], status: 'upcoming' as const,
      })),
    };
    onCreate(newProg);
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 13.5,
    fontFamily: 'var(--font-sans)', fontWeight: 500 as const, color: 'var(--text-primary)',
    background: '#fff', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { display: 'block' as const, fontSize: 12, fontWeight: 700 as const, color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 540, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)' }}>
        {/* Dark gradient header */}
        <div style={{ padding: '24px 28px 22px', background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                <GraduationCap size={22} strokeWidth={1.8} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Create Programme</h3>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
          </div>
          {/* Hero name input */}
          <div style={{ marginTop: 18 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Programme Name</label>
            <input type="text" placeholder="e.g. Master of Business Administration" value={name} onChange={e => setName(e.target.value)} style={{
              width: '100%', padding: '12px 16px', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#fff',
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.55)', borderRadius: 10, outline: 'none', boxSizing: 'border-box',
              letterSpacing: '-0.01em', transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
            }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Programme Code <span style={{ color: '#072FB5' }}>*</span></label>
              <input type="text" placeholder="e.g. MBA" value={code} onChange={e => setCode(e.target.value)} style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Batch Year</label>
              <input type="number" value={batchYear} onChange={e => setBatchYear(e.target.value)} style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SegmentedDateInput label="Start Date" value={startDate} onChange={setStartDate} />
            <SegmentedDateInput label="End Date" value={endDate} onChange={setEndDate} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value as ProgrammeType)} style={{
                width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', fontFamily: 'var(--font-sans)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px',
              }}>
                <option value="UG">UG</option><option value="PG">PG</option><option value="Diploma">Diploma</option><option value="Certificate">Certificate</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Semesters</label>
              <input type="number" value={semesters} onChange={e => setSemesters(e.target.value)} style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Total Credits</label>
              <input type="number" value={credits} onChange={e => setCredits(e.target.value)} style={{
                width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1.5px solid transparent', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
              }}
                onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
              />
            </div>
          </div>
          {code && (
            <div style={{ padding: '14px 16px', background: 'var(--bg-section)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: getProgrammeTypeColor(type), fontFamily: 'var(--font-mono)' }}>{shortLabel}</span>
                <TypeBadge type={type} />
                <StatusBadge status="upcoming" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>{name || 'Programme Name'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
                {semesters} semesters &middot; {credits} credits &middot; ~{Math.round((parseInt(credits) || 80) / (parseInt(semesters) || 4))} cr/sem
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#FAFAFA' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate} style={{
            padding: '9px 24px', fontSize: 13, fontWeight: 700, color: '#fff',
            background: canCreate ? '#072FB5' : 'var(--neutral-200)',
            border: 'none', borderRadius: 8,
            cursor: canCreate ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)',
            boxShadow: canCreate ? '0 2px 8px rgba(7,47,181,0.3)' : 'none',
          }}>Create Programme</button>
        </div>
      </div>
    </div>
  );
}

// ─── Level 1: Programme List ────────────────────────────────────────────────

function ProgrammeList({ programmes, searchQuery, onSearchChange, onSelect, onCreate }: {
  programmes: ProgrammeBatch[]; searchQuery: string; onSearchChange: (v: string) => void;
  onSelect: (p: ProgrammeBatch) => void; onCreate: () => void;
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = programmes.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(sq) || p.shortLabel.toLowerCase().includes(sq) || p.code.toLowerCase().includes(sq) ||
        p.semesters.some(s => s.courses.some(c => c.title.toLowerCase().includes(sq) || c.code.toLowerCase().includes(sq)));
    }
    return true;
  });

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 240 }}>
          <input type="text" placeholder="Search programmes or courses..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} style={{
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

        <FilterDropdown label="Type" value={typeFilter} onChange={setTypeFilter} options={[
          { value: 'all', label: 'All Types' },
          { value: 'PG', label: 'Postgraduate', color: getProgrammeTypeColor('PG') },
          { value: 'UG', label: 'Undergraduate', color: getProgrammeTypeColor('UG') },
          { value: 'Diploma', label: 'Diploma', color: getProgrammeTypeColor('Diploma') },
          { value: 'Certificate', label: 'Certificate', color: getProgrammeTypeColor('Certificate') },
        ]} />

        <FilterDropdown label="Status" value={statusFilter} onChange={setStatusFilter} options={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active', color: '#059669' },
          { value: 'upcoming', label: 'Upcoming', color: '#072FB5' },
        ]} />

        <div style={{ flex: 1 }} />

        <button onClick={onCreate} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', fontSize: 12.5, fontWeight: 700,
          color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'opacity 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        ><Plus size={13} strokeWidth={2.5} /> New Programme</button>
      </div>

      {/* Programme table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 90px 72px 56px 24px',
          alignItems: 'center', gap: 0, padding: '9px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {['Programme', 'Timeline', 'Status', 'Duration', 'Sem', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((prog, i) => {
          const totalCourses = prog.semesters.reduce((s, sem) => s + sem.courses.length, 0);
          const isUpcoming = prog.status === 'upcoming';
          const durationYears = prog.totalSemesters <= 2 ? '1 year' : Math.ceil(prog.totalSemesters / 2) + ' years';

          return (
            <div
              key={prog.id}
              onClick={() => onSelect(prog)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 90px 72px 56px 24px',
                alignItems: 'center', gap: 0, padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Programme */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {prog.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, color: prog.color,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 7px', borderRadius: 4,
                    background: prog.color + '0B',
                    lineHeight: 1,
                  }}>
                    {prog.shortLabel}
                  </span>
                  <TypeBadge type={prog.type} />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    {prog.totalCredits} credits
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--text-secondary)' }}>{prog.startDate}</div>
                <div style={{ color: 'var(--text-tertiary)' }}>{prog.endDate}</div>
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={prog.status} />
              </div>

              {/* Duration */}
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{durationYears}</span>

              {/* Semesters */}
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{prog.totalSemesters}</span>

              {/* Arrow */}
              <ChevronRight size={14} strokeWidth={1.8} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '52px 20px' }}>
            <GraduationCap size={32} strokeWidth={1.2} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>No programmes found</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Try adjusting your filters or search.</div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Level 2: Programme Detail ──────────────────────────────────────────────

// ─── Mock data for Students / Faculty / Mentors ─────────────────────────────

const MOCK_STUDENTS = [
  { id: 's1', name: 'Arjun Mehta', rollNo: 'MBA-2026-001', email: 'arjun.mehta@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 12, 2025' },
  { id: 's2', name: 'Priya Sharma', rollNo: 'MBA-2026-002', email: 'priya.sharma@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 12, 2025' },
  { id: 's3', name: 'Rahul Verma', rollNo: 'MBA-2026-003', email: 'rahul.verma@university.edu', semester: 1, status: 'inactive' as const, enrolledDate: 'Aug 12, 2025' },
  { id: 's4', name: 'Ananya Iyer', rollNo: 'MBA-2026-004', email: 'ananya.iyer@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 14, 2025' },
  { id: 's5', name: 'Karthik Nair', rollNo: 'MBA-2026-005', email: 'karthik.nair@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 14, 2025' },
  { id: 's6', name: 'Neha Patel', rollNo: 'MBA-2026-006', email: 'neha.patel@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 15, 2025' },
  { id: 's7', name: 'Vikash Kumar', rollNo: 'MBA-2026-007', email: 'vikash.kumar@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 15, 2025' },
  { id: 's8', name: 'Sneha Reddy', rollNo: 'MBA-2026-008', email: 'sneha.reddy@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 16, 2025' },
  { id: 's9', name: 'Amit Singh', rollNo: 'MBA-2026-009', email: 'amit.singh@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 16, 2025' },
  { id: 's10', name: 'Divya Joshi', rollNo: 'MBA-2026-010', email: 'divya.joshi@university.edu', semester: 1, status: 'active' as const, enrolledDate: 'Aug 18, 2025' },
];

const MOCK_FACULTY = [
  { id: 'f1', name: 'Prof. Kavya Menon', initials: 'KM', designation: 'Associate Professor', courses: ['MBA-102'], status: 'active' as const },
  { id: 'f2', name: 'Dr. Priya Nair', initials: 'PN', designation: 'Assistant Professor', courses: ['MBA-101', 'MBA-103'], status: 'active' as const },
  { id: 'f3', name: 'Prof. Arjun Das', initials: 'AD', designation: 'Professor', courses: ['MBA-104'], status: 'active' as const },
  { id: 'f4', name: 'Dr. Sanjay Gupta', initials: 'SG', designation: 'Assistant Professor', courses: ['MBA-105'], status: 'active' as const },
  { id: 'f5', name: 'Prof. Meera Krishnan', initials: 'MK', designation: 'Associate Professor', courses: ['MBA-106'], status: 'on_leave' as const },
];

const MOCK_MENTORS = [
  { id: 'm1', name: 'Dr. Rohit Kapoor', initials: 'RK', studentsAssigned: 48, lastActive: '2h ago' },
  { id: 'm2', name: 'Prof. Sunita Rao', initials: 'SR', studentsAssigned: 47, lastActive: '1d ago' },
];

const MOCK_USER_POOL = [
  { id: 'u1', name: 'Aditya Banerjee', email: 'aditya.b@university.edu', rollNo: 'MBA-2026-096' },
  { id: 'u2', name: 'Kavitha Suresh', email: 'kavitha.s@university.edu', rollNo: 'MBA-2026-097' },
  { id: 'u3', name: 'Manish Tiwari', email: 'manish.t@university.edu', rollNo: 'MBA-2026-098' },
  { id: 'u4', name: 'Roshni Agarwal', email: 'roshni.a@university.edu', rollNo: 'MBA-2026-099' },
  { id: 'u5', name: 'Siddharth Malhotra', email: 'siddharth.m@university.edu', rollNo: 'MBA-2026-100' },
];

// ─── Add People Modal ───────────────────────────────────────────────────────

function AddPeopleModal({ title, onClose, pool, onAdd }: {
  title: string; onClose: () => void;
  pool: { id: string; name: string; email: string; rollNo?: string }[];
  onAdd: (ids: string[]) => void;
}) {
  const [tab, setTab] = useState<'search' | 'csv'>('search');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = pool.filter(u =>
    !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: '80vh', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2, display: 'flex' }}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {[{ key: 'search', label: 'Search & Select', icon: Search }, { key: 'csv', label: 'Upload CSV', icon: Upload }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              flex: 1, padding: '10px', fontSize: 12.5, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? 'var(--blue-700)' : 'var(--text-tertiary)',
              background: 'transparent', border: 'none', borderBottom: tab === t.key ? '2px solid var(--blue-700)' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              <t.icon size={13} strokeWidth={1.8} /> {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {tab === 'search' ? (
            <>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type="text" placeholder="Search by name or email..." value={query} onChange={e => setQuery(e.target.value)} style={{
                  width: '100%', padding: '9px 12px 9px 32px', fontSize: 13,
                  fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)',
                  background: 'var(--bg-section)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box',
                }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-700)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                />
                <Search size={13} strokeWidth={2.2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
              {selected.size > 0 && (
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)', marginBottom: 10 }}>{selected.size} selected</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filtered.map(user => {
                  const isSel = selected.has(user.id);
                  return (
                    <div key={user.id} onClick={() => toggle(user.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: isSel ? 'rgba(7,47,181,0.05)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-section)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(7,47,181,0.05)' : 'transparent'; }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: isSel ? 'none' : '1.5px solid var(--border-subtle)',
                        background: isSel ? 'var(--blue-700)' : 'transparent',
                        display: 'grid', placeItems: 'center',
                      }}>
                        {isSel && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-section)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                        {user.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{user.email}</div>
                      </div>
                      {user.rollNo && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{user.rollNo}</span>}
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', fontSize: 12, color: 'var(--text-tertiary)' }}>No users found</div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
              <div style={{
                width: '100%', padding: '32px 20px', border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-section)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
              }}>
                <Upload size={24} strokeWidth={1.4} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Drop a CSV file here or click to browse</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Columns: Name, Email, Roll Number</span>
              </div>
              <button style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-700)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Download CSV Template
              </button>
            </div>
          )}
        </div>

        {tab === 'search' && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
            <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
            <button onClick={() => { onAdd(Array.from(selected)); onClose(); }} disabled={selected.size === 0} style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#fff',
              background: selected.size > 0 ? 'var(--blue-700)' : 'var(--border-subtle)',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)',
            }}>Add {selected.size > 0 ? `(${selected.size})` : ''}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Level 2: Programme Detail (Tabbed Workspace) ───────────────────────────

type SectionTab = 'courses' | 'students' | 'faculty';

function ProgrammeDetail({ programme, searchQuery, onSelectCourse }: {
  programme: ProgrammeBatch; searchQuery: string;
  onSelectCourse: (course: CoordinatorCourse) => void;
}) {
  const [sectionTab, setSectionTab] = useState<SectionTab>('courses');
  const [activeSemId, setActiveSemId] = useState<string>(() => {
    const active = programme.semesters.find(s => s.status === 'active');
    return active?.id || programme.semesters[0]?.id || '';
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState<'students' | 'faculty' | 'mentors' | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [courseOrder, setCourseOrder] = useState<Record<string, string[]>>({});
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('4');
  const [newCourseStartDate, setNewCourseStartDate] = useState('');
  const [newCourseEndDate, setNewCourseEndDate] = useState('');
  const [settingsCourse, setSettingsCourse] = useState<CoordinatorCourse | null>(null);
  const [courseSettingsMap, setCourseSettingsMap] = useState<Record<string, { startDate: string; endDate: string; name: string; credits: string; status: string }>>({});
  const [hiddenCourses, setHiddenCourses] = useState<Set<string>>(new Set());
  const [lockedCourses, setLockedCourses] = useState<Set<string>>(new Set());
  const [lockConditions, setLockConditions] = useState<Record<string, { type: string; label: string }>>({});
  const [showLockPopover, setShowLockPopover] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
  const [showBulkLock, setShowBulkLock] = useState(false);

  const toggleCourseSelect = (id: string) => setSelectedCourseIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selectAllCourses = () => {
    if (selectedCourseIds.size === filteredCourses.length) setSelectedCourseIds(new Set());
    else setSelectedCourseIds(new Set(filteredCourses.map(c => c.id)));
  };
  const bulkHide = () => { setHiddenCourses(prev => { const n = new Set(prev); selectedCourseIds.forEach(id => n.add(id)); return n; }); setSelectedCourseIds(new Set()); };
  const bulkShow = () => { setHiddenCourses(prev => { const n = new Set(prev); selectedCourseIds.forEach(id => n.delete(id)); return n; }); setSelectedCourseIds(new Set()); };
  const bulkUnlock = () => { setLockedCourses(prev => { const n = new Set(prev); selectedCourseIds.forEach(id => { n.delete(id); }); return n; }); setLockConditions(prev => { const c = { ...prev }; selectedCourseIds.forEach(id => delete c[id]); return c; }); setSelectedCourseIds(new Set()); };
  const bulkLockWithCondition = (type: string, label: string) => {
    selectedCourseIds.forEach(id => { setLockCondition(id, type, label); });
    setShowBulkLock(false); setSelectedCourseIds(new Set());
  };

  // Mock course dates
  const courseDates: Record<string, { start: string; end: string }> = {
    'c1': { start: 'Aug 18', end: 'Nov 30' }, 'c2': { start: 'Aug 18', end: 'Nov 30' },
    'c3': { start: 'Aug 18', end: 'Nov 30' }, 'c4': { start: 'Sep 1', end: 'Dec 15' },
    'c5': { start: 'Sep 1', end: 'Dec 15' }, 'c6': { start: 'Sep 15', end: 'Dec 15' },
  };
  const getCourseDates = (id: string) => courseDates[id] || { start: 'TBD', end: 'TBD' };

  const toggleHidden = (id: string) => setHiddenCourses(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleLocked = (id: string) => {
    setLockedCourses(prev => { const n = new Set(prev); if (n.has(id)) { n.delete(id); setLockConditions(p => { const c = { ...p }; delete c[id]; return c; }); } else n.add(id); return n; });
  };
  const setLockCondition = (courseId: string, type: string, label: string) => {
    setLockedCourses(prev => new Set(prev).add(courseId));
    setLockConditions(prev => ({ ...prev, [courseId]: { type, label } }));
    setShowLockPopover(null);
  };

  const handleAddCourse = () => {
    if (!newCourseName || !newCourseCode) return;
    const newCourse: CoordinatorCourse = {
      id: 'new-c-' + Date.now(), code: newCourseCode, title: newCourseName,
      credits: parseInt(newCourseCredits) || 4, semester: activeSem?.number || 1,
      faculty: '', facultyId: '', enrolled: 0, avgEngagement: 0, avgGrade: 0, contentReadiness: 0, status: 'upcoming',
      quadrantStatus: {
        live_session: { total: 0, conducted: 0 }, e_tutorial: { total: 0, uploaded: 0 },
        e_content: { total: 0, uploaded: 0 }, discussion: { total: 0, active: 0 }, assessment: { total: 0, published: 0 },
      },
    };
    if (activeSem) activeSem.courses.push(newCourse);
    setShowAddCourse(false);
    setNewCourseName(''); setNewCourseCode(''); setNewCourseCredits('4');
    setNewCourseStartDate(''); setNewCourseEndDate('');
  };

  const activeSem = programme.semesters.find(s => s.id === activeSemId);
  const sq = searchQuery.toLowerCase();
  const semCourses = activeSem?.courses || [];

  // Apply custom order if set, otherwise use default
  const orderedCourses = (() => {
    const order = courseOrder[activeSemId];
    if (!order) return semCourses;
    const mapped = order.map(id => semCourses.find(c => c.id === id)).filter(Boolean) as CoordinatorCourse[];
    const remaining = semCourses.filter(c => !order.includes(c.id));
    return [...mapped, ...remaining];
  })();

  const filteredCourses = orderedCourses.filter(c =>
    !sq || c.title.toLowerCase().includes(sq) || c.code.toLowerCase().includes(sq)
  );

  const handleDragStart = (idx: number) => { setDragIdx(idx); };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const newOrder = [...filteredCourses.map(c => c.id)];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    setCourseOrder(prev => ({ ...prev, [activeSemId]: newOrder }));
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  const totalCourses = programme.semesters.reduce((s, sem) => s + sem.courses.length, 0);
  const mentorsRequired = Math.max(1, Math.ceil(programme.students / 250));
  const mentorsAssigned = MOCK_MENTORS.length;
  const mentorCompliant = mentorsAssigned >= mentorsRequired;

  const SECTION_TABS: { key: SectionTab; label: string; count?: number }[] = [
    { key: 'courses', label: 'Courses', count: totalCourses },
    { key: 'students', label: 'Students', count: programme.students },
    { key: 'faculty', label: 'Faculty & Mentors', count: MOCK_FACULTY.length + MOCK_MENTORS.length },
  ];

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleStudent = (id: string) => setSelectedStudents(prev => {
    const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n;
  });
  const toggleAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) setSelectedStudents(new Set());
    else setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
  };

  return (
    <>
      {/* Programme heading */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
          {programme.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>
          <TypeBadge type={programme.type} />
          <span>{programme.totalCredits} credits</span>
          <span style={{ margin: '0 2px' }}>&middot;</span>
          <StatusBadge status={programme.status} />
          <span style={{ margin: '0 2px' }}>&middot;</span>
          <span>{programme.startDate} &ndash; {programme.endDate}</span>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--border-subtle)', marginBottom: 28 }}>
        {SECTION_TABS.map(tab => {
          const isActive = sectionTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setSectionTab(tab.key)} style={{
              padding: '12px 22px', fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: 'transparent', border: 'none',
              borderBottom: isActive ? `2px solid var(--text-primary)` : '2px solid transparent',
              marginBottom: '-1.5px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color 0.12s',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-section)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Courses Tab ────────────────────────────────────────────────── */}
      {sectionTab === 'courses' && (
        <>
          {/* Semester tabs + reorder toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
            {programme.semesters.map(sem => {
              const isActive = sem.id === activeSemId;
              const isDone = sem.status === 'completed';
              return (
                <button key={sem.id} onClick={() => setActiveSemId(sem.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 16px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? programme.color : isDone ? '#059669' : 'var(--text-secondary)',
                  background: isActive ? programme.color + '0A' : 'transparent',
                  border: isActive ? `1.5px solid ${programme.color}25` : '1.5px solid transparent',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0,
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-section)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? programme.color + '0A' : 'transparent'; }}
                >
                  {isDone && <CheckCircle2 size={10} style={{ color: '#059669' }} />}
                  <span>{sem.label}</span>
                </button>
              );
            })}

            <button onClick={() => {
              const nextNum = programme.semesters.length + 1;
              programme.semesters.push({ id: `${programme.id}-s${nextNum}`, number: nextNum, label: `Semester ${nextNum}`, credits: 20, courses: [], status: 'upcoming' });
              setActiveSemId(`${programme.id}-s${nextNum}`);
            }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', background: 'transparent', border: '1.5px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0, opacity: 0.5, transition: 'opacity 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
            ><Plus size={10} strokeWidth={2.5} /> Add</button>

            {filteredCourses.length > 1 && (
              <>
                <div style={{ flex: 1 }} />
                <button onClick={() => setReorderMode(r => !r)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', fontSize: 11.5, fontWeight: 600,
                  color: reorderMode ? 'var(--blue-700)' : 'var(--text-tertiary)',
                  background: reorderMode ? 'rgba(7,47,181,0.06)' : 'transparent',
                  border: `1px solid ${reorderMode ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'all 0.12s', flexShrink: 0,
                }}>
                  <GripVertical size={12} strokeWidth={2} />
                  {reorderMode ? 'Done' : 'Reorder'}
                </button>
              </>
            )}
          </div>

          {/* Bulk action bar */}
          {selectedCourseIds.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', marginBottom: 10,
              background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(7,47,181,0.18)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div onClick={selectAllCourses} style={{
                width: 16, height: 16, borderRadius: 3, cursor: 'pointer',
                border: selectedCourseIds.size === filteredCourses.length ? 'none' : '1.5px solid var(--border-subtle)',
                background: selectedCourseIds.size === filteredCourses.length ? 'var(--blue-700)' : 'transparent',
                display: 'grid', placeItems: 'center',
              }}>
                {selectedCourseIds.size === filteredCourses.length && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-700)' }}>{selectedCourseIds.size} selected</span>
              <div style={{ flex: 1 }} />
              <button onClick={bulkShow} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <Eye size={12} strokeWidth={1.8} /> Show
              </button>
              <button onClick={bulkHide} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#D97706', background: 'transparent', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <EyeOff size={12} strokeWidth={1.8} /> Hide
              </button>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowBulkLock(!showBulkLock)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#DC2626', background: 'transparent', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  <Lock size={11} strokeWidth={2} /> Lock <ChevronDown size={10} />
                </button>
                {showBulkLock && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
                    width: 260, background: '#fff', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Apply to {selectedCourseIds.size} courses</div>
                    {[
                      { type: 'start_date', label: 'Unlock on start date', icon: CalendarRange },
                      { type: 'end_date', label: 'Lock after end date', icon: CalendarRange },
                      { type: 'prev_complete', label: 'Require previous course', icon: CheckCircle2 },
                      { type: 'engagement', label: 'Min 75% engagement', icon: ShieldCheck },
                    ].map(opt => (
                      <button key={opt.type} onClick={() => bulkLockWithCondition(opt.type, opt.label)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '9px 12px', fontSize: 12, fontWeight: 500,
                        color: 'var(--text-primary)', background: 'transparent',
                        border: 'none', borderTop: '1px solid rgba(0,0,0,0.03)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-section)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <opt.icon size={13} strokeWidth={1.8} style={{ color: 'var(--text-tertiary)' }} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={bulkUnlock} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#059669', background: 'transparent', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <Unlock size={11} strokeWidth={2} /> Unlock
              </button>
              <button onClick={() => setSelectedCourseIds(new Set())} style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 4 }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Course grid */}
          {filteredCourses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {filteredCourses.map((course, idx) => {
                const quadrants = [
                  { label: 'Live', icon: Video, count: course.quadrantStatus.live_session.total },
                  { label: 'E-Tutorial', icon: MonitorPlay, count: course.quadrantStatus.e_tutorial.total },
                  { label: 'E-Content', icon: BookOpenText, count: course.quadrantStatus.e_content.total },
                  { label: 'Discussion', icon: MessageSquare, count: course.quadrantStatus.discussion.total },
                  { label: 'Assessment', icon: ClipboardCheck, count: course.quadrantStatus.assessment.total },
                ];
                const isDragging = dragIdx === idx;
                const isDragOver = dragOverIdx === idx && dragIdx !== idx;
                const isHidden = hiddenCourses.has(course.id);
                const isLocked = lockedCourses.has(course.id);
                const lockCond = lockConditions[course.id];
                const dates = getCourseDates(course.id);
                const prevCourse = idx > 0 ? filteredCourses[idx - 1] : null;

                return (
                  <div
                    key={course.id}
                    draggable={reorderMode}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (!reorderMode && showLockPopover !== course.id) onSelectCourse(course); }}
                    style={{
                      background: isHidden ? 'rgba(0,0,0,0.02)' : '#fff',
                      borderRadius: 'var(--radius-md)',
                      border: isDragOver ? `2px dashed ${programme.color}` : '1px solid var(--border-subtle)',
                      padding: isDragOver ? '13px 15px' : '14px 16px',
                      cursor: reorderMode ? 'grab' : 'pointer',
                      transition: 'border-color 0.12s, box-shadow 0.12s, opacity 0.15s, transform 0.15s',
                      position: 'relative',
                      opacity: isDragging ? 0.4 : isHidden ? 0.5 : 1,
                      transform: isDragOver ? 'scale(1.02)' : 'none',
                    }}
                    onMouseEnter={e => { if (!reorderMode && !isDragging) { e.currentTarget.style.borderColor = programme.color + '35'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; const cb = e.currentTarget.querySelector('[data-card-actions] > div:first-child') as HTMLElement; if (cb) cb.style.opacity = '1'; } }}
                    onMouseLeave={e => { if (!isDragOver) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; if (!selectedCourseIds.has(course.id) && selectedCourseIds.size === 0) { const cb = e.currentTarget.querySelector('[data-card-actions] > div:first-child') as HTMLElement; if (cb) cb.style.opacity = '0'; } } }}
                  >
                    {/* Top-right: action icons + order */}
                    <div data-card-actions style={{ position: 'absolute', top: 8, right: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {/* Select checkbox — visible on hover or when any selected */}
                      {!reorderMode && (
                        <div onClick={e => { e.stopPropagation(); toggleCourseSelect(course.id); }} style={{
                          width: 18, height: 18, borderRadius: 4, cursor: 'pointer',
                          border: selectedCourseIds.has(course.id) ? 'none' : '1.5px solid var(--border-subtle)',
                          background: selectedCourseIds.has(course.id) ? 'var(--blue-700)' : 'transparent',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                          opacity: selectedCourseIds.has(course.id) || selectedCourseIds.size > 0 ? 1 : 0,
                          transition: 'opacity 0.15s',
                        }}>
                          {selectedCourseIds.has(course.id) && <Check size={11} strokeWidth={3} style={{ color: '#fff' }} />}
                        </div>
                      )}
                      {/* Hide/Show */}
                      <button onClick={e => { e.stopPropagation(); toggleHidden(course.id); }} title={isHidden ? 'Show to learners' : 'Hide from learners'} style={{
                        width: 26, height: 26, display: 'grid', placeItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 5,
                        color: isHidden ? '#D97706' : 'var(--text-secondary)', opacity: isHidden ? 1 : 0.65,
                        transition: 'opacity 0.12s, background 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = isHidden ? '1' : '0.65'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isHidden ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                      </button>
                      {/* Lock/Unlock */}
                      <button onClick={e => { e.stopPropagation(); setShowLockPopover(showLockPopover === course.id ? null : course.id); }} title={isLocked ? 'Locked' : 'Unlocked'} style={{
                        width: 26, height: 26, display: 'grid', placeItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 5,
                        color: isLocked ? '#DC2626' : 'var(--text-secondary)', opacity: isLocked ? 1 : 0.65,
                        transition: 'opacity 0.12s, background 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = isLocked ? '1' : '0.65'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isLocked ? <Lock size={14} strokeWidth={2} /> : <Unlock size={14} strokeWidth={1.8} />}
                      </button>
                      {/* Settings */}
                      <button onClick={e => { e.stopPropagation(); setSettingsCourse(course); }} title="Course settings" style={{
                        width: 26, height: 26, display: 'grid', placeItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 5,
                        color: 'var(--text-secondary)', opacity: 0.65,
                        transition: 'opacity 0.12s, background 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Settings size={14} strokeWidth={1.8} />
                      </button>
                      {/* Order */}
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-tertiary)', opacity: 0.35, fontFamily: 'var(--font-display)', lineHeight: 1, width: 20, textAlign: 'right' }}>{idx + 1}</span>
                    </div>

                    {/* Lock popover */}
                    {showLockPopover === course.id && (() => {
                      const allPrevCourses = filteredCourses.slice(0, idx);
                      const lockOptions: { type: string; label: string; icon: React.ElementType; desc?: string }[] = [
                        { type: 'none', label: isLocked ? 'Unlock course' : 'Lock manually', icon: isLocked ? Unlock : Lock, desc: isLocked ? 'Remove all lock conditions' : 'Manually lock this course' },
                      ];
                      if (prevCourse) {
                        lockOptions.push({ type: 'prev_complete', label: `Complete ${prevCourse.code} first`, icon: CheckCircle2, desc: `Learners must complete ${prevCourse.title} before accessing this course` });
                      }
                      if (allPrevCourses.length > 1) {
                        lockOptions.push({ type: 'all_prev_complete', label: 'Complete all previous courses', icon: CheckCircle2, desc: `Learners must complete all ${allPrevCourses.length} preceding courses` });
                      }
                      lockOptions.push(
                        { type: 'start_date', label: `Unlock on start date (${dates.start})`, icon: CalendarRange, desc: 'Course becomes available on its start date' },
                        { type: 'end_date', label: `Lock after end date (${dates.end})`, icon: CalendarRange, desc: 'Course becomes inaccessible after its end date' },
                        { type: 'engagement', label: 'Min 75% engagement in previous', icon: ShieldCheck, desc: 'Learners need 75% engagement score to unlock' },
                      );
                      return (
                        <div onClick={e => e.stopPropagation()} style={{
                          position: 'absolute', top: 34, right: 8, zIndex: 50,
                          width: 280, background: '#fff', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)', boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
                          overflow: 'hidden',
                        }}>
                          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Access Conditions</span>
                            <button onClick={() => setShowLockPopover(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 0 }}><X size={14} /></button>
                          </div>
                          {lockOptions.map((opt, oi) => {
                            const isSelected = lockCond?.type === opt.type;
                            const isNone = opt.type === 'none';
                            return (
                              <button key={opt.type} onClick={() => {
                                if (isNone) { toggleLocked(course.id); setShowLockPopover(null); }
                                else setLockCondition(course.id, opt.type, opt.label);
                              }} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%',
                                padding: '10px 14px', fontSize: 12, fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? 'var(--blue-700)' : 'var(--text-primary)',
                                background: isSelected ? 'rgba(7,47,181,0.04)' : 'transparent',
                                border: 'none', borderTop: oi > 0 ? '1px solid rgba(0,0,0,0.03)' : 'none',
                                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                                transition: 'background 0.1s',
                              }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-section)'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(7,47,181,0.04)' : 'transparent'; }}
                              >
                                <opt.icon size={13} strokeWidth={1.8} style={{ color: isSelected ? 'var(--blue-700)' : 'var(--text-tertiary)', marginTop: 1, flexShrink: 0 }} />
                                <div>
                                  <div style={{ lineHeight: 1.3 }}>{opt.label}</div>
                                  {opt.desc && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400, marginTop: 2, lineHeight: 1.3 }}>{opt.desc}</div>}
                                </div>
                                {isSelected && <CheckCircle2 size={12} strokeWidth={2} style={{ color: 'var(--blue-700)', marginLeft: 'auto', flexShrink: 0, marginTop: 1 }} />}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Drag handle or checkbox */}
                    {reorderMode ? (
                      <div style={{ position: 'absolute', top: 8, left: 10, color: programme.color, opacity: 0.5 }}>
                        <GripVertical size={14} strokeWidth={2} />
                      </div>
                    ) : null}

                    {/* Code + credits */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: reorderMode ? 18 : 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: programme.color, fontFamily: 'var(--font-mono)' }}>{course.code}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>{course.credits} credits</span>
                    </div>

                    {/* Title */}
                    <div style={{
                      fontSize: 19, fontWeight: 800, color: isHidden ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-display)', letterSpacing: '-0.03em',
                      lineHeight: 1.25, marginBottom: 10,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      paddingLeft: reorderMode ? 18 : 0,
                    }}>
                      {course.title}
                    </div>

                    {/* Dates + lock condition */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      <CalendarRange size={12} strokeWidth={1.6} />
                      <span>{dates.start} &ndash; {dates.end}</span>
                      {lockCond && (
                        <>
                          <span style={{ margin: '0 2px' }}>&middot;</span>
                          <Lock size={10} strokeWidth={2} style={{ color: '#DC2626' }} />
                          <span style={{ color: '#DC2626', fontWeight: 600 }}>{lockCond.label}</span>
                        </>
                      )}
                      {isHidden && !lockCond && (
                        <>
                          <span style={{ margin: '0 2px' }}>&middot;</span>
                          <span style={{ color: '#D97706', fontWeight: 600 }}>Hidden</span>
                        </>
                      )}
                    </div>

                    {/* Quadrant stats tiles */}
                    <div style={{ display: 'flex', gap: 5 }}>
                      {quadrants.map(q => (
                        <div key={q.label} style={{
                          flex: 1, textAlign: 'center', padding: '7px 4px',
                          background: 'var(--bg-section)', borderRadius: 6,
                        }}>
                          <q.icon size={13} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto 3px' }} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{q.count}</div>
                          <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2, whiteSpace: 'nowrap' }}>{q.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add course card */}
              {!reorderMode && (
                <button onClick={() => setShowAddCourse(true)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '24px 16px', minHeight: 130,
                  fontSize: 12.5, fontWeight: 700, color: programme.color,
                  background: programme.color + '03',
                  border: `1.5px dashed ${programme.color}20`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-display)',
                  transition: 'background 0.12s, border-color 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = programme.color + '08'; e.currentTarget.style.borderColor = programme.color + '35'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = programme.color + '03'; e.currentTarget.style.borderColor = programme.color + '20'; }}
                >
                  <Plus size={18} strokeWidth={2} style={{ opacity: 0.6 }} />
                  Add Course
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '52px 20px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <BookOpen size={24} strokeWidth={1.2} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', marginBottom: 3 }}>{sq ? 'No matching courses' : 'No courses yet'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 14 }}>{sq ? 'Try a different search.' : 'Add your first course to this semester.'}</div>
              {!sq && <button onClick={() => setShowAddCourse(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#fff', background: programme.color, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Plus size={11} strokeWidth={2.5} /> Add Course</button>}
            </div>
          )}
        </>
      )}

      {/* ── Students Tab ───────────────────────────────────────────────── */}
      {sectionTab === 'students' && (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 260 }}>
              <input type="text" placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{
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

            {selectedStudents.size > 0 && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)' }}>{selectedStudents.size} selected</span>
            )}

            <div style={{ flex: 1 }} />

            <button onClick={() => setShowAddModal('students')} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', fontSize: 12, fontWeight: 700,
              color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}><UserPlus size={13} strokeWidth={2} /> Add Students</button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}><Upload size={12} strokeWidth={2} /> CSV Upload</button>
          </div>

          {/* Student table */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 130px 200px 56px 80px',
              alignItems: 'center', gap: 0, padding: '9px 18px', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div onClick={toggleAllStudents} style={{
                  width: 16, height: 16, borderRadius: 3, cursor: 'pointer', flexShrink: 0,
                  border: selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 'none' : '1.5px solid var(--border-subtle)',
                  background: selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 'var(--blue-700)' : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
                </div>
              </div>
              {['Name', 'Roll No', 'Email', 'Sem', 'Status'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{h}</span>
              ))}
            </div>

            {filteredStudents.map((student, i) => {
              const isSel = selectedStudents.has(student.id);
              return (
                <div key={student.id} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 130px 200px 56px 80px',
                  alignItems: 'center', gap: 0, padding: '11px 18px',
                  borderBottom: i < filteredStudents.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  background: isSel ? 'rgba(7,47,181,0.02)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div onClick={() => toggleStudent(student.id)} style={{
                      width: 16, height: 16, borderRadius: 3, cursor: 'pointer',
                      border: isSel ? 'none' : '1.5px solid var(--border-subtle)',
                      background: isSel ? 'var(--blue-700)' : 'transparent',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {isSel && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-section)', display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {student.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</span>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{student.rollNo}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>{student.email}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{student.semester}</span>
                  <StatusBadge status={student.status} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Faculty & Mentors Tab ──────────────────────────────────────── */}
      {sectionTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Faculty section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Faculty</h3>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{MOCK_FACULTY.length} assigned</span>
              </div>
              <button onClick={() => setShowAddModal('faculty')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}><Plus size={12} strokeWidth={2.5} /> Add Faculty</button>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              {MOCK_FACULTY.map((fac, i) => (
                <div key={fac.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  borderBottom: i < MOCK_FACULTY.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: fac.status === 'on_leave' ? 'var(--bg-section)' : programme.color + '10', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: fac.status === 'on_leave' ? 'var(--text-tertiary)' : programme.color, flexShrink: 0 }}>
                    {fac.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{fac.name}</span>
                      {fac.status === 'on_leave' && <span style={{ fontSize: 9, fontWeight: 600, color: '#D97706', background: 'rgba(217,119,6,0.08)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>ON LEAVE</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{fac.designation}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {fac.courses.map(code => (
                      <span key={code} style={{ fontSize: 10, fontWeight: 600, color: programme.color, background: programme.color + '0A', padding: '2px 7px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)' }}>{code}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentors section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Mentors</h3>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{mentorsAssigned} assigned</span>
              </div>
              <button onClick={() => setShowAddModal('mentors')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                color: '#fff', background: 'var(--blue-700)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}><Plus size={12} strokeWidth={2.5} /> Add Mentor</button>
            </div>

            {/* UGC compliance card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 12,
              background: mentorCompliant ? 'rgba(5,150,105,0.04)' : 'rgba(220,38,38,0.04)',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${mentorCompliant ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}`,
            }}>
              <ShieldCheck size={16} strokeWidth={1.8} style={{ color: mentorCompliant ? '#059669' : '#DC2626', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: mentorCompliant ? '#059669' : '#DC2626' }}>
                  UGC Guideline: 1 mentor per 250 students
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {programme.students} students &rarr; {mentorsRequired} mentor{mentorsRequired > 1 ? 's' : ''} required &middot; {mentorsAssigned} assigned &middot; Ratio 1:{programme.students > 0 ? Math.round(programme.students / mentorsAssigned) : 0}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                color: mentorCompliant ? '#059669' : '#DC2626',
                background: mentorCompliant ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {mentorCompliant ? 'Compliant' : 'Action Needed'}
              </span>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              {MOCK_MENTORS.map((mentor, i) => (
                <div key={mentor.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  borderBottom: i < MOCK_MENTORS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669' + '12', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#059669', flexShrink: 0 }}>
                    {mentor.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mentor.name}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Last active {mentor.lastActive}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{mentor.studentsAssigned}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Add people modal */}
      {showAddModal && (
        <AddPeopleModal
          title={showAddModal === 'students' ? 'Add Students' : showAddModal === 'faculty' ? 'Add Faculty' : 'Add Mentors'}
          onClose={() => setShowAddModal(null)}
          pool={MOCK_USER_POOL}
          onAdd={() => {}}
        />
      )}

      {/* Add course modal */}
      {showAddCourse && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setShowAddCourse(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)' }}>
            {/* Dark gradient header */}
            <div style={{ padding: '24px 28px 22px', background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                    <BookOpen size={22} strokeWidth={1.8} style={{ color: '#fff' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>Add Course</h3>
                </div>
                <button onClick={() => setShowAddCourse(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
              </div>
              {/* Hero name input */}
              <div style={{ marginTop: 18 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Course Name</label>
                <input type="text" placeholder="e.g. Managerial Economics" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} style={{
                  width: '100%', padding: '12px 16px', fontSize: 15, fontWeight: 600,
                  fontFamily: 'var(--font-display)', color: '#fff',
                  background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.55)',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                  letterSpacing: '-0.01em', transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.08)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Course Code <span style={{ color: '#072FB5' }}>*</span></label>
                <input type="text" placeholder="e.g. MBA-107" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                  background: 'var(--bg-section)', border: '1.5px solid transparent',
                  borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Credits</label>
                <input type="number" value={newCourseCredits} onChange={e => setNewCourseCredits(e.target.value)} style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)',
                  background: 'var(--bg-section)', border: '1.5px solid transparent',
                  borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; }}
                />
              </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <SegmentedDateInput label="Start Date" value={newCourseStartDate} onChange={setNewCourseStartDate} />
                <SegmentedDateInput label="End Date" value={newCourseEndDate} onChange={setNewCourseEndDate} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#FAFAFA' }}>
              <button onClick={() => setShowAddCourse(false)} style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
              <button onClick={handleAddCourse} disabled={!newCourseName || !newCourseCode} style={{
                padding: '9px 24px', fontSize: 13, fontWeight: 700, color: '#fff',
                background: newCourseName && newCourseCode ? '#072FB5' : 'var(--neutral-200)',
                border: 'none', borderRadius: 8,
                cursor: newCourseName && newCourseCode ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)',
                boxShadow: newCourseName && newCourseCode ? '0 2px 8px rgba(7,47,181,0.3)' : 'none',
              }}>Add Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Settings Modal */}
      {settingsCourse && (() => {
        const s = courseSettingsMap[settingsCourse.id] ?? { name: settingsCourse.title, credits: String(settingsCourse.credits), status: settingsCourse.status, startDate: '', endDate: '' };
        const setField = (field: string, v: string) => setCourseSettingsMap(p => ({ ...p, [settingsCourse!.id]: { ...s, [field]: v } }));
        const inputStyle: React.CSSProperties = {
          width: '100%', padding: '10px 14px', fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500,
          color: 'var(--text-primary)', background: 'var(--bg-section)', border: '1.5px solid transparent',
          borderRadius: 8, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        };
        const onFocusI = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#072FB5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(7,47,181,0.12)'; e.currentTarget.style.background = '#fff'; };
        const onBlurI = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-section)'; };
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setSettingsCourse(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: 480, background: '#fff', borderRadius: 16, boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px 18px', background: 'linear-gradient(135deg, #030B22 0%, #06102E 50%, #213594 100%)', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center' }}>
                    <Settings size={18} strokeWidth={1.8} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Course Settings</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{settingsCourse.code}</div>
                  </div>
                </div>
                <button onClick={() => setSettingsCourse(null)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
              </div>
              {/* Body */}
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Course Name</label>
                  <input value={s.name} onChange={e => setField('name', e.target.value)} style={inputStyle} onFocus={onFocusI} onBlur={onBlurI} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Credits</label>
                    <input type="number" value={s.credits} onChange={e => setField('credits', e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontWeight: 700 }} onFocus={onFocusI} onBlur={onBlurI} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Status</label>
                    <select value={s.status} onChange={e => setField('status', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 }} onFocus={onFocusI} onBlur={onBlurI}>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <SegmentedDateInput label="Start Date" value={s.startDate} onChange={v => setField('startDate', v)} />
                  <SegmentedDateInput label="End Date" value={s.endDate} onChange={v => setField('endDate', v)} />
                </div>
              </div>
              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: '#FAFAFA', borderRadius: '0 0 16px 16px' }}>
                <button onClick={() => setSettingsCourse(null)} style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancel</button>
                <button onClick={() => setSettingsCourse(null)} style={{ padding: '9px 24px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#072FB5', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)', boxShadow: '0 2px 8px rgba(7,47,181,0.3)' }}>Save Changes</button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

// ─── Main CoursesView ───────────────────────────────────────────────────────

export default function CoursesView() {
  const searchParams = useSearchParams();
  const [programmes, setProgrammes] = useState(PROGRAMME_BATCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeBatch | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CoordinatorCourse | null>(null);
  const [deepLinkedActivity, setDeepLinkedActivity] = useState<string | null>(null);

  // Deep-link: auto-navigate to a specific course/activity via URL params
  // e.g. /coordinator/courses?course=MBA-101&activity=lp-ls2
  useEffect(() => {
    const courseParam = searchParams.get('course');
    const activityParam = searchParams.get('activity');
    if (courseParam && !selectedCourse) {
      // Find the programme and course
      for (const prog of PROGRAMME_BATCHES) {
        for (const sem of prog.semesters) {
          const course = sem.courses.find(c => c.code === courseParam);
          if (course) {
            setSelectedProgramme(prog);
            setSelectedCourse(course);
            if (activityParam) setDeepLinkedActivity(activityParam);
            return;
          }
        }
      }
    }
  }, [searchParams]);

  if (selectedCourse && selectedProgramme) {
    return (
      <div style={{ height: '100%' }}>
        <div style={{ padding: '16px 40px 0' }}>
          <Breadcrumb items={[
            { label: 'Programmes', onClick: () => { setSelectedProgramme(null); setSelectedCourse(null); } },
            { label: selectedProgramme.shortLabel, onClick: () => setSelectedCourse(null) },
            { label: selectedCourse.code + ' ' + selectedCourse.title },
          ]} />
        </div>
        <div style={{ height: 'calc(100% - 48px)' }}>
          <CourseEditor courseTitle={selectedCourse.title} courseCode={selectedCourse.code} onBack={() => setSelectedCourse(null)} initialActivityId={deepLinkedActivity} />
        </div>
      </div>
    );
  }

  const breadcrumbItems: { label: string; onClick?: () => void }[] = [];
  if (selectedProgramme) {
    breadcrumbItems.push({ label: 'Programmes', onClick: () => { setSelectedProgramme(null); setSearchQuery(''); } });
    breadcrumbItems.push({ label: `${selectedProgramme.shortLabel} - ${selectedProgramme.name}` });
  } else {
    breadcrumbItems.push({ label: 'Programmes' });
  }

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1200 }}>
      <Breadcrumb items={breadcrumbItems} />
      {!selectedProgramme && (
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
            Programmes & Batches
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: '6px 0 0', fontWeight: 500 }}>
            {programmes.length} programmes &middot; {programmes.filter(p => p.status === 'active').length} active
          </p>
        </div>
      )}

      {selectedProgramme ? (
        <ProgrammeDetail programme={selectedProgramme} searchQuery={searchQuery} onSelectCourse={setSelectedCourse} />
      ) : (
        <ProgrammeList programmes={programmes} searchQuery={searchQuery} onSearchChange={setSearchQuery}
          onSelect={p => { setSelectedProgramme(p); setSearchQuery(''); }} onCreate={() => setShowCreateModal(true)} />
      )}

      {showCreateModal && (
        <CreateProgrammeModal onClose={() => setShowCreateModal(false)} onCreate={p => setProgrammes(prev => [...prev, p])} />
      )}
    </div>
  );
}
