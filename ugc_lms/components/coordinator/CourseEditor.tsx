'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, Video, HelpCircle, FileText, FileDown, PanelLeftOpen, Filter, Layers, MonitorPlay, BookOpenText, MessageSquare, ClipboardCheck, CheckCircle2, Search, Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Lock, Unlock, Settings, ToggleLeft, ToggleRight, Check, ListChecks, X } from 'lucide-react';
import VideoActivity from '@/components/learn/VideoActivity';
import PageActivity from '@/components/learn/PageActivity';
import QuizActivity from '@/components/learn/QuizActivity';
import QuizEditor from './QuizEditor';
import LiveSessionActivity from './LiveSessionActivity';
import PdfActivity from '@/components/learn/PdfActivity';
import AddActivityModal from './AddActivityModal';
import ActivitySettingsModal from './ActivitySettingsModal';
import { EditorActivityType } from '@/lib/coordinatorData';

// ─── Reuse the learner's data structures ─────────────────────────────────────

type QuadrantType = 'live_session' | 'e_tutorial' | 'e_content' | 'discussion' | 'assessment';

interface UnitActivity { id: string; title: string; done: boolean; current?: boolean; duration: string; type: string; }
interface Quadrant { type: QuadrantType; activities: UnitActivity[]; }
interface Unit { id: string; number: number; title: string; quadrants: Quadrant[]; }

const QUADRANT_META: Record<QuadrantType, { icon: React.ElementType; label: string; color: string }> = {
  live_session: { icon: Video, label: 'Live Session', color: '#072FB5' },
  e_tutorial: { icon: MonitorPlay, label: 'E-Tutorial', color: '#8F3B00' },
  e_content: { icon: BookOpenText, label: 'E-Content', color: '#7C3AED' },
  discussion: { icon: MessageSquare, label: 'Discussion', color: '#0DA88F' },
  assessment: { icon: ClipboardCheck, label: 'Assessment', color: '#DC2626' },
};

// Same course data as learner — coordinator sees exactly what learner sees
const INITIAL_UNITS: Unit[] = [
  { id: 'u1', number: 1, title: 'Introduction to the Subject', quadrants: [
    { type: 'live_session', activities: [{ id: 'lp-ls1', title: 'Orientation Session', done: true, duration: '1.5 hrs', type: 'video' }] },
    { type: 'e_tutorial', activities: [
      { id: 'lp-2', title: 'Voice Modulation & Tone Control', done: true, duration: '14:20', type: 'video' },
      { id: 'lp-5', title: 'Pronunciation & Accent Clarity', done: true, duration: '18:45', type: 'video' },
    ]},
    { type: 'e_content', activities: [
      { id: 'lp-1', title: 'Introduction to Professional Communication', done: true, duration: '~6 min read', type: 'page' },
      { id: 'lp-3', title: 'The Seven Principles of Effective Communication', done: true, duration: '~11 min read', type: 'page' },
    ]},
    { type: 'discussion', activities: [{ id: 'lp-d1', title: 'Introduce Yourself', done: true, duration: 'Forum', type: 'page' }] },
    { type: 'assessment', activities: [{ id: 'lp-4', title: 'Check-in: Communication Fundamentals', done: true, duration: '5 questions', type: 'quiz' }] },
  ]},
  { id: 'u2', number: 2, title: 'Core Communication Skills', quadrants: [
    { type: 'live_session', activities: [{ id: 'lp-ls2', title: 'Communication Workshop', done: false, duration: '2 hrs', type: 'video' }] },
    { type: 'e_tutorial', activities: [
      { id: 'lp-7', title: 'Mastering Clarity & Pronunciation', done: false, duration: '22:15', type: 'video' },
      { id: 'lp-9', title: 'Structuring Compelling Presentations', done: false, duration: '28:30', type: 'video' },
    ]},
    { type: 'e_content', activities: [
      { id: 'lp-6', title: 'Spoken Excellence', done: false, current: true, duration: '~12 min read', type: 'page' },
      { id: 'lp-8', title: 'Non-Verbal Communication & Body Language', done: false, duration: '~12 min read', type: 'page' },
      { id: 'lp-8b', title: 'Reference Guide: Body Language Cheat Sheet', done: false, duration: '4 pages', type: 'pdf' },
    ]},
    { type: 'discussion', activities: [{ id: 'lp-d2', title: 'Discuss: Effective Communication Styles', done: false, duration: 'Forum', type: 'page' }] },
    { type: 'assessment', activities: [{ id: 'lp-10', title: 'Module 2 Assessment', done: false, duration: '10 questions', type: 'quiz' }] },
  ]},
  { id: 'u3', number: 3, title: 'Advanced Communication & Storytelling', quadrants: [
    { type: 'e_tutorial', activities: [{ id: 'lp-11', title: 'Interview Communication Skills', done: false, duration: '24:10', type: 'video' }] },
    { type: 'e_content', activities: [
      { id: 'lp-12', title: 'Storytelling in Professional Contexts', done: false, duration: '~15 min read', type: 'page' },
      { id: 'lp-12b', title: 'Case Study: Persuasive Narratives in Business', done: false, duration: '6 pages', type: 'pdf' },
    ]},
    { type: 'discussion', activities: [{ id: 'lp-d3', title: 'Share Your Story Framework', done: false, duration: 'Forum', type: 'page' }] },
    { type: 'assessment', activities: [{ id: 'lp-13', title: 'Final Assessment', done: false, duration: '20 questions', type: 'quiz' }] },
  ]},
];

function EditableUnitAccordion({ units, editMode, searchQuery, selectedActivityId, onSelectActivity, onAddActivity, onDeleteActivity, onEditActivity, onAddUnit, onRenameUnit, selectMode, selectedActIds, hiddenActivities, lockedActivities, toggleActivityHidden, toggleActivityLocked }: {
  units: Unit[];
  editMode: boolean;
  searchQuery: string;
  selectedActivityId: string;
  onSelectActivity: (id: string) => void;
  onAddActivity: (unitId: string, quadrantType: QuadrantType) => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity: (activity: UnitActivity) => void;
  onAddUnit: () => void;
  onRenameUnit: (unitId: string, name: string) => void;
  selectMode?: boolean;
  selectedActIds?: Set<string>;
  hiddenActivities: Set<string>;
  lockedActivities: Set<string>;
  toggleActivityHidden: (id: string) => void;
  toggleActivityLocked: (id: string) => void;
}) {
  const allActivities = units.flatMap(u => u.quadrants.flatMap(q => q.activities));
  const [hiddenUnits, setHiddenUnits] = useState<Set<string>>(new Set());
  const [lockedUnits, setLockedUnits] = useState<Set<string>>(new Set());
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const toggleUnitHidden = (id: string) => setHiddenUnits(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleUnitLocked = (id: string) => setLockedUnits(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const startEditingUnit = (unit: Unit) => { setEditingUnitId(unit.id); setEditingUnitName(unit.title); };
  const saveUnitName = () => { if (editingUnitId && editingUnitName.trim()) { onRenameUnit(editingUnitId, editingUnitName.trim()); } setEditingUnitId(null); };
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(() => {
    for (const u of units) {
      for (const q of u.quadrants) {
        if (q.activities.some(a => a.current || a.id === selectedActivityId)) return new Set([u.id]);
      }
    }
    return new Set([units[0]?.id]);
  });
  const [expandedQuadrants, setExpandedQuadrants] = useState<Set<string>>(() => {
    for (const u of units) {
      for (const q of u.quadrants) {
        if (q.activities.some(a => a.current || a.id === selectedActivityId)) return new Set([u.id + '-' + q.type]);
      }
    }
    return new Set();
  });

  const toggleUnit = (id: string) => setExpandedUnits(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleQuadrant = (key: string) => setExpandedQuadrants(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  // Expand all when entering select mode
  useEffect(() => {
    if (selectMode) {
      setExpandedUnits(new Set(units.map(u => u.id)));
      setExpandedQuadrants(new Set(units.flatMap(u => u.quadrants.map(q => u.id + '-' + q.type))));
    }
  }, [selectMode]);

  const sq = searchQuery.toLowerCase();

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {units.map(unit => {
        const hasMatch = !sq || unit.quadrants.some(q => q.activities.some(a => a.title.toLowerCase().includes(sq)));
        if (sq && !hasMatch) return null;
        const isExpanded = expandedUnits.has(unit.id);
        const unitActivityCount = unit.quadrants.reduce((s, q) => s + q.activities.length, 0);
        const unitDoneCount = unit.quadrants.reduce((s, q) => s + q.activities.filter(a => a.done).length, 0);
        const unitDone = unitActivityCount > 0 && unitDoneCount === unitActivityCount;

        const isUnitHidden = hiddenUnits.has(unit.id);
        const isUnitLocked = lockedUnits.has(unit.id);
        const isEditing = editingUnitId === unit.id;

        return (
          <div key={unit.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: isUnitHidden ? 0.45 : 1 }}>
            {/* Unit header */}
            <div
              onClick={() => { if (!isEditing) toggleUnit(unit.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: isEditing ? 'default' : 'pointer', background: isExpanded ? 'var(--bg-section)' : 'transparent', transition: 'background 0.1s' }}
              onMouseEnter={e => { if (!isExpanded && !isEditing) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = isExpanded ? 'var(--bg-section)' : 'transparent'; }}
            >
              {editMode && (
                <GripVertical size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0, cursor: 'grab' }} />
              )}
              <span style={{ fontSize: 15, fontWeight: 800, color: unitDone ? 'var(--green-600)' : isUnitLocked ? '#DC2626' : 'var(--text-primary)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 24 }}>
                {isUnitLocked ? <Lock size={14} strokeWidth={2} /> : `${unit.number}.`}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingUnitName}
                    onChange={e => setEditingUnitName(e.target.value)}
                    onBlur={saveUnitName}
                    onKeyDown={e => { if (e.key === 'Enter') saveUnitName(); if (e.key === 'Escape') setEditingUnitId(null); }}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', width: '100%', padding: '4px 8px', border: '1.5px solid var(--blue-700)', borderRadius: 'var(--radius-xs)', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isUnitHidden ? 'var(--text-tertiary)' : 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.35, textDecoration: isUnitHidden ? 'line-through' : 'none', textDecorationColor: 'var(--text-tertiary)' }}>
                      {unit.title}
                    </div>
                    {(isUnitHidden || isUnitLocked) && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isUnitHidden && <span style={{ color: '#D97706', fontWeight: 600 }}>Hidden</span>}
                        {isUnitHidden && isUnitLocked && <span>·</span>}
                        {isUnitLocked && <span style={{ color: '#DC2626', fontWeight: 600 }}>Locked</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Unit actions — edit mode */}
              {editMode && !isEditing && (
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleUnitHidden(unit.id)} title={isUnitHidden ? 'Show' : 'Hide'} style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: isUnitHidden ? '#D97706' : 'var(--text-tertiary)', opacity: isUnitHidden ? 1 : 0.6 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = isUnitHidden ? '1' : '0.6'; e.currentTarget.style.background = 'transparent'; }}
                  >{isUnitHidden ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}</button>
                  <button onClick={() => toggleUnitLocked(unit.id)} title={isUnitLocked ? 'Unlock' : 'Lock'} style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: isUnitLocked ? '#DC2626' : 'var(--text-tertiary)', opacity: isUnitLocked ? 1 : 0.6 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = isUnitLocked ? '1' : '0.6'; e.currentTarget.style.background = 'transparent'; }}
                  >{isUnitLocked ? <Lock size={13} strokeWidth={2} /> : <Unlock size={13} strokeWidth={1.8} />}</button>
                  <button onClick={() => startEditingUnit(unit)} title="Rename unit" style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: 'var(--text-tertiary)', opacity: 0.6 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(7,47,181,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.background = 'transparent'; }}
                  ><Pencil size={13} strokeWidth={2} style={{ color: 'var(--blue-700)' }} /></button>
                </div>
              )}
              {!editMode && unitDone && <CheckCircle2 size={16} style={{ color: 'var(--green-600)', flexShrink: 0 }} />}
              {!isEditing && (isExpanded ? <ChevronDown size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /> : <ChevronRight size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />)}
            </div>

            {/* Quadrants */}
            {isExpanded && unit.quadrants.map(quad => {
              const qKey = unit.id + '-' + quad.type;
              const qExpanded = expandedQuadrants.has(qKey);
              const meta = QUADRANT_META[quad.type];
              const QIcon = meta.icon;
              const qDone = quad.activities.length > 0 && quad.activities.every(a => a.done);
              const matchActivities = sq ? quad.activities.filter(a => a.title.toLowerCase().includes(sq)) : quad.activities;
              if (sq && matchActivities.length === 0) return null;

              return (
                <div key={qKey}>
                  {/* Quadrant header */}
                  <div
                    onClick={() => toggleQuadrant(qKey)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px 44px', cursor: 'pointer', borderTop: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <QIcon size={17} strokeWidth={1.8} style={{ color: meta.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{meta.label}</span>
                    {qDone && <CheckCircle2 size={13} style={{ color: 'var(--green-600)', flexShrink: 0 }} />}
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{matchActivities.filter(a => a.done).length}/{matchActivities.length}</span>
                    {qExpanded ? <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronRight size={13} style={{ color: 'var(--text-tertiary)' }} />}
                  </div>

                  {/* Activities */}
                  {qExpanded && (
                    <>
                      {matchActivities.map(act => {
                        const isSelected = act.id === selectedActivityId;
                        const isCurrent = act.current;
                        const isActHidden = hiddenActivities.has(act.id);
                        const isActLocked = lockedActivities.has(act.id);
                        return (
                          <div key={act.id} style={{ position: 'relative' }}>
                            <div
                              onClick={() => onSelectActivity(act.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: editMode ? '10px 16px 10px 52px' : '10px 16px 10px 62px',
                                cursor: 'pointer',
                                background: isSelected ? 'var(--bg-pastel-beige-3)' : isCurrent ? 'var(--blue-50)' : 'transparent',
                                borderLeft: isSelected ? '2px solid var(--orange-600)' : '2px solid transparent',
                                transition: 'background 0.1s',
                                opacity: isActHidden ? 0.45 : 1,
                              }}
                              onMouseEnter={e => { if (!isSelected && !isCurrent) e.currentTarget.style.background = 'var(--bg-section)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--bg-pastel-beige-3)' : isCurrent ? 'var(--blue-50)' : 'transparent'; }}
                            >
                              {selectMode && selectedActIds && (
                                <div style={{
                                  width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginRight: 2,
                                  border: selectedActIds.has(act.id) ? 'none' : '1.5px solid var(--border-subtle)',
                                  background: selectedActIds.has(act.id) ? 'var(--blue-700)' : 'transparent',
                                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                                }}>
                                  {selectedActIds.has(act.id) && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
                                </div>
                              )}
                              {!selectMode && editMode && (
                                <GripVertical size={10} style={{ color: 'var(--text-tertiary)', flexShrink: 0, cursor: 'grab', marginRight: 2 }} />
                              )}
                              {act.done ? (
                                <CheckCircle2 size={13} style={{ color: 'var(--green-600)', flexShrink: 0 }} />
                              ) : isActLocked ? (
                                <Lock size={12} strokeWidth={2} style={{ color: '#DC2626', flexShrink: 0, opacity: 0.7 }} />
                              ) : (
                                <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid ' + (isCurrent ? 'var(--blue-700)' : 'var(--border-subtle)'), background: isCurrent ? 'var(--blue-700)' : 'transparent', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                                  {isCurrent && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--blue-700)' : act.done ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.35, textDecoration: isActHidden ? 'line-through' : 'none', textDecorationColor: 'var(--text-tertiary)' }}>
                                  {act.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  {act.duration}
                                  {isActHidden && <span style={{ color: '#D97706', fontWeight: 600 }}>Hidden</span>}
                                  {isActLocked && <span style={{ color: '#DC2626', fontWeight: 600 }}>Locked</span>}
                                </div>
                              </div>
                              {/* Edit mode actions */}
                              {editMode && (
                                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                  <button onClick={() => toggleActivityHidden(act.id)}
                                    style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: isActHidden ? '#D97706' : 'var(--text-tertiary)', opacity: isActHidden ? 1 : 0.6 }}
                                    title={isActHidden ? 'Show' : 'Hide'}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = isActHidden ? '1' : '0.6'; e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    {isActHidden ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                                  </button>
                                  <button onClick={() => toggleActivityLocked(act.id)}
                                    style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, color: isActLocked ? '#DC2626' : 'var(--text-tertiary)', opacity: isActLocked ? 1 : 0.6 }}
                                    title={isActLocked ? 'Unlock' : 'Lock'}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = isActLocked ? '1' : '0.6'; e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    {isActLocked ? <Lock size={15} strokeWidth={2} /> : <Unlock size={15} strokeWidth={1.8} />}
                                  </button>
                                  <button onClick={() => onEditActivity(act)} style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                                    title="Edit activity settings"
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(7,47,181,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <Settings size={16} strokeWidth={2} style={{ color: 'var(--blue-700)' }} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteActivity(act.id)}
                                    style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                                    title="Remove activity"
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <Trash2 size={16} strokeWidth={2} style={{ color: '#DC2626' }} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add activity button — only in edit mode */}
                      {editMode && (
                        <button
                          onClick={() => onAddActivity(unit.id, quad.type)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px 7px 62px',
                            width: '100%',
                            fontSize: 11, fontWeight: 600,
                            color: meta.color,
                            background: 'transparent',
                            border: 'none',
                            borderTop: '1px dashed rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            transition: 'background 0.1s',
                            opacity: 0.7,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
                        >
                          <Plus size={12} strokeWidth={2.5} /> Add {meta.label.toLowerCase()}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Add quadrant (if a quadrant type is missing from this unit) — edit mode only */}
            {editMode && isExpanded && (() => {
              const existingTypes = new Set(unit.quadrants.map(q => q.type));
              const missingTypes = (['live_session', 'e_tutorial', 'e_content', 'discussion', 'assessment'] as QuadrantType[]).filter(t => !existingTypes.has(t));
              if (missingTypes.length === 0) return null;
              return (
                <div style={{ padding: '6px 14px 8px 44px', borderTop: '1px dashed var(--border-subtle)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 4 }}>Add missing quadrant:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {missingTypes.map(type => {
                      const meta = QUADRANT_META[type];
                      const QIcon = meta.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => onAddActivity(unit.id, type)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px',
                            fontSize: 10, fontWeight: 600,
                            color: meta.color,
                            background: 'transparent',
                            border: `1px dashed ${meta.color}40`,
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            opacity: 0.6,
                            transition: 'opacity 0.1s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
                        >
                          <Plus size={9} strokeWidth={2.5} /> {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}

      {/* Add new unit — edit mode only */}
      {editMode && (
        <div style={{ padding: '12px 14px' }}>
          <button onClick={onAddUnit} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '10px',
            fontSize: 12, fontWeight: 700,
            color: 'var(--blue-700)',
            background: 'rgba(7,47,181,0.04)',
            border: '1px dashed rgba(7,47,181,0.25)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'background 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(7,47,181,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,47,181,0.04)'; }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Unit {units.length + 1}
          </button>
        </div>
      )}
    </div>
  );
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 380;

export default function CourseEditor({ courseTitle, courseCode, onBack, initialActivityId }: { courseTitle: string; courseCode: string; onBack: () => void; initialActivityId?: string | null }) {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [editMode, setEditMode] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedActIds, setSelectedActIds] = useState<Set<string>>(new Set());
  const [selectedActivityId, setSelectedActivityId] = useState<string>(() => {
    if (initialActivityId) {
      const exists = INITIAL_UNITS.some(u => u.quadrants.some(q => q.activities.some(a => a.id === initialActivityId)));
      if (exists) return initialActivityId;
    }
    return 'lp-6';
  });

  const [hiddenActivities, setHiddenActivities] = useState<Set<string>>(new Set());
  const [lockedActivities, setLockedActivities] = useState<Set<string>>(new Set());
  const toggleActivityHidden = (id: string) => setHiddenActivities(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleActivityLocked = (id: string) => setLockedActivities(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleSelectAct = (id: string) => setSelectedActIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const exitSelectMode = () => { setSelectMode(false); setSelectedActIds(new Set()); };
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addContext, setAddContext] = useState<{ unitId: string; quadrantType: QuadrantType } | null>(null);
  const [settingsActivity, setSettingsActivity] = useState<UnitActivity | null>(null);
  const [createActivityType, setCreateActivityType] = useState<EditorActivityType | null>(null);

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const allActivities = units.flatMap(u => u.quadrants.flatMap(q => q.activities));
  const selectedActivity = allActivities.find(a => a.id === selectedActivityId) ?? allActivities[0];

  // Check if selected activity is a live session (lives in live_session quadrant)
  const isLiveSession = units.some(u => u.quadrants.some(q => q.type === 'live_session' && q.activities.some(a => a.id === selectedActivityId)));
  const selectedIdx = allActivities.findIndex(a => a.id === selectedActivityId);

  const totalActivities = allActivities.length;
  const doneActivities = allActivities.filter(a => a.done).length;
  const progress = totalActivities > 0 ? Math.round((doneActivities / totalActivities) * 100) : 0;

  const handlePrev = () => { if (selectedIdx > 0) setSelectedActivityId(allActivities[selectedIdx - 1].id); };
  const handleNext = () => { if (selectedIdx < allActivities.length - 1) setSelectedActivityId(allActivities[selectedIdx + 1].id); };

  const handleAddActivity = (unitId: string, quadrantType: QuadrantType) => {
    setAddContext({ unitId, quadrantType });
    setShowAddModal(true);
  };

  const handleActivityCreated = (activity: { title: string; type: string; duration: string }) => {
    if (!addContext) return;
    const newActivity: UnitActivity = {
      id: 'new-' + Date.now(),
      title: activity.title,
      done: false,
      duration: activity.duration,
      type: activity.type,
    };
    setUnits(prev => prev.map(u => {
      if (u.id !== addContext.unitId) return u;
      const hasQuadrant = u.quadrants.some(q => q.type === addContext.quadrantType);
      if (hasQuadrant) {
        return { ...u, quadrants: u.quadrants.map(q => {
          if (q.type !== addContext.quadrantType) return q;
          return { ...q, activities: [...q.activities, newActivity] };
        })};
      } else {
        return { ...u, quadrants: [...u.quadrants, { type: addContext.quadrantType, activities: [newActivity] }] };
      }
    }));
    setShowAddModal(false);
    setAddContext(null);
  };

  const handleDeleteActivity = (activityId: string) => {
    setUnits(prev => prev.map(u => ({
      ...u,
      quadrants: u.quadrants.map(q => ({
        ...q,
        activities: q.activities.filter(a => a.id !== activityId),
      })).filter(q => q.activities.length > 0),
    })));
    if (selectedActivityId === activityId) {
      const remaining = allActivities.filter(a => a.id !== activityId);
      if (remaining.length > 0) setSelectedActivityId(remaining[0].id);
    }
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      setSidebarWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)));
    };
    const onUp = () => { isResizing.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const onDragStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const activityProps = { onBack, onPrev: handlePrev, onNext: handleNext, hasPrev: selectedIdx > 0, hasNext: selectedIdx < allActivities.length - 1 };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* SIDEBAR */}
      <div style={{
        width: sidebarWidth,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: '#fff',
        position: 'relative',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-section)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={onBack} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              padding: 0, fontFamily: 'var(--font-sans)',
              transition: 'color 0.12s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <ChevronLeft size={13} /> All Courses
            </button>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{courseCode}</span>
          </div>

          <div style={{
            fontSize: 19, fontWeight: 800, color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 14,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {courseTitle}
          </div>

          {/* Quadrant breakdown */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[
              { icon: Video, label: 'Live', count: units.reduce((s, u) => s + (u.quadrants.find(q => q.type === 'live_session')?.activities.length || 0), 0) },
              { icon: MonitorPlay, label: 'Tutorial', count: units.reduce((s, u) => s + (u.quadrants.find(q => q.type === 'e_tutorial')?.activities.length || 0), 0) },
              { icon: BookOpenText, label: 'Content', count: units.reduce((s, u) => s + (u.quadrants.find(q => q.type === 'e_content')?.activities.length || 0), 0) },
              { icon: MessageSquare, label: 'Forum', count: units.reduce((s, u) => s + (u.quadrants.find(q => q.type === 'discussion')?.activities.length || 0), 0) },
              { icon: ClipboardCheck, label: 'Assess', count: units.reduce((s, u) => s + (u.quadrants.find(q => q.type === 'assessment')?.activities.length || 0), 0) },
            ].map(q => (
              <div key={q.label} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: 'rgba(0,0,0,0.025)', borderRadius: 6 }}>
                <q.icon size={14} strokeWidth={1.6} style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto 3px' }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{q.count}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2 }}>{q.label}</div>
              </div>
            ))}
          </div>

          {/* Edit mode toggle + Select button */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px',
              background: editMode ? 'rgba(7,47,181,0.06)' : 'var(--bg-section)',
              border: `1px solid ${editMode ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {editMode ? <Pencil size={12} style={{ color: 'var(--blue-700)' }} /> : <Eye size={12} style={{ color: 'var(--text-tertiary)' }} />}
                <span style={{ fontSize: 11.5, fontWeight: 600, color: editMode ? 'var(--blue-700)' : 'var(--text-secondary)' }}>
                  {editMode ? 'Edit Mode' : 'Preview'}
                </span>
              </div>
              <button
                onClick={() => { setEditMode(!editMode); if (selectMode) exitSelectMode(); }}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: editMode ? 'var(--blue-700)' : 'var(--text-tertiary)' }}
              >
                {editMode ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
            </div>
            {editMode && (
              <button onClick={() => { if (selectMode) exitSelectMode(); else setSelectMode(true); }} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px',
                fontSize: 11, fontWeight: 600,
                color: selectMode ? 'var(--blue-700)' : 'var(--text-tertiary)',
                background: selectMode ? 'rgba(7,47,181,0.06)' : 'var(--bg-section)',
                border: `1px solid ${selectMode ? 'rgba(7,47,181,0.18)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0,
              }}>
                <ListChecks size={12} strokeWidth={1.8} />
                {selectMode ? 'Done' : 'Select'}
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, padding: '10px 12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px 6px 28px', fontSize: 12,
                fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)',
                background: 'var(--bg-section)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-700)'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-section)'; }}
            />
            <Search size={12} strokeWidth={2.5} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Hierarchical unit list */}
        {/* Bulk action bar — select mode */}
        {selectMode && selectedActIds.size > 0 && (
          <div style={{
            padding: '6px 12px', borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(7,47,181,0.04)', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginRight: 4 }}>{selectedActIds.size}</span>
            <button onClick={() => { selectedActIds.forEach(id => { if (!hiddenActivities.has(id)) toggleActivityHidden(id); }); exitSelectMode(); }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: '#D97706', background: 'transparent', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <EyeOff size={10} strokeWidth={2} /> Hide
            </button>
            <button onClick={() => { selectedActIds.forEach(id => { if (hiddenActivities.has(id)) toggleActivityHidden(id); }); exitSelectMode(); }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <Eye size={10} strokeWidth={2} /> Show
            </button>
            <button onClick={() => { selectedActIds.forEach(id => { if (!lockedActivities.has(id)) toggleActivityLocked(id); }); exitSelectMode(); }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: '#DC2626', background: 'transparent', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <Lock size={9} strokeWidth={2} /> Lock
            </button>
            <button onClick={() => { selectedActIds.forEach(id => { if (lockedActivities.has(id)) toggleActivityLocked(id); }); exitSelectMode(); }} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: '#059669', background: 'transparent', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <Unlock size={9} strokeWidth={2} /> Unlock
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={exitSelectMode} style={{ width: 18, height: 18, display: 'grid', placeItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 4 }}><X size={12} /></button>
          </div>
        )}

        <EditableUnitAccordion
          units={units}
          editMode={editMode}
          searchQuery={searchQuery}
          selectedActivityId={selectedActivityId}
          onSelectActivity={(id) => { if (selectMode) toggleSelectAct(id); else setSelectedActivityId(id); }}
          onAddActivity={handleAddActivity}
          onDeleteActivity={handleDeleteActivity}
          onEditActivity={act => setSettingsActivity(act)}
          onAddUnit={() => {
            const nextNum = units.length + 1;
            setUnits(prev => [...prev, { id: 'u-new-' + Date.now(), number: nextNum, title: `Unit ${nextNum}`, quadrants: [] }]);
          }}
          onRenameUnit={(unitId, name) => {
            setUnits(prev => prev.map(u => u.id === unitId ? { ...u, title: name } : u));
          }}
          selectMode={selectMode}
          selectedActIds={selectedActIds}
          hiddenActivities={hiddenActivities}
          lockedActivities={lockedActivities}
          toggleActivityHidden={toggleActivityHidden}
          toggleActivityLocked={toggleActivityLocked}
        />

        {/* Resize handle */}
        <div onMouseDown={onDragStart} style={{
          position: 'absolute', top: 0, right: 0, width: 5, height: '100%',
          cursor: 'col-resize', zIndex: 10, background: 'transparent',
          transition: 'background 0.15s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-700)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        />
      </div>

      {/* ACTIVITY CONTENT — same as learner view */}
      <div style={{ flex: 1, overflow: 'hidden', borderLeft: '1px solid #D7D7D7', display: 'flex', flexDirection: 'column' }}>
        {/* Edit mode banner */}
        {editMode && (
          <div style={{
            padding: '8px 20px',
            background: 'rgba(7,47,181,0.06)',
            borderBottom: '1px solid rgba(7,47,181,0.12)',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            <Pencil size={12} style={{ color: 'var(--blue-700)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--blue-700)' }}>
              You are viewing this as an editor. Learners will see this content without edit controls.
            </span>
            <button
              onClick={() => setEditMode(false)}
              style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                color: 'var(--blue-700)', background: '#fff',
                border: '1px solid rgba(7,47,181,0.2)', borderRadius: 'var(--radius-sm)',
                padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Eye size={11} /> Preview as Learner
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {isLiveSession && selectedActivity && (
            <LiveSessionActivity
              title={selectedActivity.title}
              date={selectedActivity.done ? '2 Jun 2026' : '15 Jun 2026'}
              time="10:00 AM"
              duration={selectedActivity.duration}
              faculty="Dr. Anita Desai"
              status={selectedActivity.done ? 'recording_available' : 'upcoming'}
              daysUntil={selectedActivity.done ? 0 : 6}
              isCoordinator={true}
            />
          )}
          {selectedActivity?.type === 'video' && !isLiveSession && <VideoActivity activity={selectedActivity as any} courseId="editor" {...activityProps} />}
          {selectedActivity?.type === 'page' && <PageActivity activity={selectedActivity as any} {...activityProps} />}
          {selectedActivity?.type === 'pdf' && <PdfActivity activity={selectedActivity as any} {...activityProps} />}
          {selectedActivity?.type === 'quiz' && (
            editMode
              ? <QuizEditor quizTitle={selectedActivity.title} />
              : <QuizActivity activity={selectedActivity as any} {...activityProps} onQuizStart={() => {}} onQuizEnd={() => {}} />
          )}
        </div>
      </div>

      {/* Add activity modal — type picker, then either old form or new settings modal */}
      {showAddModal && addContext && !createActivityType && (
        <AddActivityModal
          quadrantType={addContext.quadrantType}
          onClose={() => { setShowAddModal(false); setAddContext(null); }}
          onSubmit={handleActivityCreated}
          onTypeSelected={(type) => {
            setShowAddModal(false);
            setCreateActivityType(type);
          }}
        />
      )}

      {/* Activity settings modal — for CREATING new activities with full settings */}
      {createActivityType && addContext && (
        <ActivitySettingsModal
          activityType={createActivityType}
          mode="create"
          onClose={() => { setCreateActivityType(null); setAddContext(null); }}
          onSubmit={(values) => {
            const title = values.title || 'Untitled Activity';
            const typeMap: Record<string, string> = { live_session: 'video', assignment: 'page', forum_topic: 'page', scorm: 'page' };
            const activityType = typeMap[createActivityType] || createActivityType;
            const dur = createActivityType === 'live_session'
              ? `${parseInt(values.durationHours || '1')}${parseInt(values.durationMinutes || '0') > 0 ? `.${parseInt(values.durationMinutes) / 60 * 10}` : ''} hrs`
              : '';
            const newActivity: UnitActivity = { id: 'new-' + Date.now(), title, done: false, duration: dur || '—', type: activityType };
            setUnits(prev => prev.map(u => {
              if (u.id !== addContext.unitId) return u;
              const hasQuadrant = u.quadrants.some(q => q.type === addContext.quadrantType);
              if (hasQuadrant) {
                return { ...u, quadrants: u.quadrants.map(q => q.type !== addContext.quadrantType ? q : { ...q, activities: [...q.activities, newActivity] }) };
              }
              return { ...u, quadrants: [...u.quadrants, { type: addContext.quadrantType, activities: [newActivity] }] };
            }));
            setCreateActivityType(null);
            setAddContext(null);
          }}
        />
      )}

      {/* Activity settings modal — for EDITING existing activities */}
      {settingsActivity && (
        <ActivitySettingsModal
          activityType={settingsActivity.type as EditorActivityType}
          mode="edit"
          activityName={settingsActivity.title}
          initialValues={{ title: settingsActivity.title }}
          onClose={() => setSettingsActivity(null)}
          onSubmit={(values) => {
            if (values.title) {
              setUnits(prev => prev.map(u => ({
                ...u,
                quadrants: u.quadrants.map(q => ({
                  ...q,
                  activities: q.activities.map(a => a.id === settingsActivity.id ? { ...a, title: values.title } : a),
                })),
              })));
            }
            setSettingsActivity(null);
          }}
          onDelete={() => {
            handleDeleteActivity(settingsActivity.id);
            setSettingsActivity(null);
          }}
        />
      )}
    </div>
  );
}
