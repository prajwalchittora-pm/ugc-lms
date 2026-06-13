'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, GraduationCap, Users, UserCheck, BookOpen, ClipboardCheck, FileCheck, CalendarDays, BarChart3, Megaphone, MessageSquare, LogOut, HelpCircle, Check, PanelLeftClose, UserCog } from 'lucide-react';
import { COORDINATOR } from '@/lib/coordinatorData';

const BG = '#0D0A3D';
const BG_IDENTITY = 'rgba(255,255,255,0.065)';
const ORANGE = '#FF6A00';
const SEP = 'rgba(255,255,255,0.11)';
const TEXT = 'rgba(255,255,255,0.68)';
const TEXT_ACTIVE = '#FFFFFF';
const ICON = 'rgba(255,255,255,0.48)';
const W_FULL = 272;
const W_COLLAPSED = 56;

const TABS = [
  { key: 'home', label: 'Home', icon: Home, href: '/coordinator' },
  { key: 'courses', label: 'Programmes', icon: GraduationCap, href: '/coordinator/courses' },
  { key: 'students', label: 'Students', icon: UserCheck, href: '/coordinator/students' },
  { key: 'faculty', label: 'Faculty', icon: UserCog, href: '/coordinator/faculty' },
  { key: 'grading', label: 'Grading', icon: ClipboardCheck, href: '/coordinator/grading' },
  { key: 'gradebook', label: 'Gradebook', icon: BookOpen, href: '/coordinator/gradebook' },
  { key: 'attendance', label: 'Attendance', icon: Users, href: '/coordinator/attendance' },
  { key: 'exams', label: 'Exams', icon: FileCheck, href: '/coordinator/exams' },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/coordinator/schedule' },
  { key: 'reports', label: 'Reports', icon: BarChart3, href: '/coordinator/reports' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, href: '/coordinator/announcements' },
  { key: 'forums', label: 'Forums', icon: MessageSquare, href: '/coordinator/forums' },
] as const;

export default function CoordinatorSideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('support@findmycollege.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside style={{
      width: collapsed ? W_COLLAPSED : W_FULL,
      flexShrink: 0,
      height: '100%',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      position: 'relative',
      zIndex: 10,
      transition: 'width 0.3s ease',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 20px',
        borderBottom: `1px solid ${SEP}`,
        flexShrink: 0,
        minHeight: 78,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img src="/logos/UniversityLMS_DarkBG.svg" alt="University LMS" style={{ height: 30, width: 30, display: 'block', objectFit: 'none', objectPosition: 'left center' }} />
          </button>
        ) : (
          <>
            <img src="/logos/UniversityLMS_DarkBG.svg" alt="University LMS" style={{ height: 38, width: 'auto', display: 'block', maxWidth: 200, flex: 1, minWidth: 0 }} />
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.30)', flexShrink: 0, marginLeft: 8, transition: 'color 0.12s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.30)'; }}
            >
              <PanelLeftClose size={16} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <nav style={{ padding: collapsed ? '12px 0 4px' : '14px 10px 4px', flex: 1, overflow: 'hidden' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.href === '/coordinator'
            ? pathname === '/coordinator'
            : pathname?.startsWith(tab.href);
          return collapsed ? (
            <Link
              key={tab.key}
              href={tab.href}
              title={tab.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: 44, marginBottom: 2, borderRadius: 6,
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.10)' : 'transparent'; }}
            >
              <Icon size={19} strokeWidth={1.5} color={isActive ? TEXT_ACTIVE : ICON} />
            </Link>
          ) : (
            <Link
              key={tab.key}
              href={tab.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                height: 44, paddingLeft: 16, paddingRight: 14, marginBottom: 2,
                borderRadius: 6,
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                color: isActive ? TEXT_ACTIVE : TEXT,
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.12s ease',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.10)' : 'transparent'; }}
            >
              <Icon size={19} strokeWidth={1.5} style={{ color: isActive ? TEXT_ACTIVE : ICON, flexShrink: 0 }} />
              <span style={{ letterSpacing: '-0.01em' }}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${SEP}`, padding: collapsed ? '14px 0 18px' : '14px 10px 18px', flexShrink: 0 }}>
        {/* Profile */}
        {collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 10px' }}>
            <div style={{ width: 30, height: 30, background: '#072FB5', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
              {COORDINATOR.initials}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, background: '#072FB5', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {COORDINATOR.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT_ACTIVE, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {COORDINATOR.fullName}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: 'rgba(255,255,255,0.40)', marginTop: 1 }}>
                {COORDINATOR.designation}
              </div>
            </div>
          </div>
        )}

        {/* Utility buttons */}
        {collapsed ? (
          <>
            <button onClick={copyEmail} title="Need help?" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: W_COLLAPSED, height: 42, background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {copied ? <Check size={16} strokeWidth={2.5} style={{ color: 'rgba(74,222,128,0.85)' }} /> : <HelpCircle size={16} strokeWidth={1.8} style={{ color: 'rgba(255,255,255,0.60)' }} />}
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: W_COLLAPSED, height: 42, background: 'transparent', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.07)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={16} strokeWidth={1.8} style={{ color: 'rgba(239,68,68,0.75)' }} />
            </Link>
          </>
        ) : (
          <>
            <button onClick={copyEmail} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', width: '100%', fontSize: 13, fontWeight: 500, color: copied ? 'rgba(74,222,128,0.85)' : TEXT, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: '2px solid transparent', fontFamily: 'var(--font-sans)', transition: 'background 0.1s ease' }}
              onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; } }}
              onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT; } }}
            >
              {copied ? <Check size={14} strokeWidth={2.5} style={{ color: 'rgba(74,222,128,0.85)', flexShrink: 0 }} /> : <HelpCircle size={14} strokeWidth={1.8} style={{ color: ICON, flexShrink: 0 }} />}
              {copied ? 'Email copied!' : 'Need help?'}
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', width: '100%', fontSize: 13, fontWeight: 600, color: 'rgba(220,38,38,0.65)', background: 'transparent', border: 'none', textDecoration: 'none', borderLeft: '2px solid transparent', fontFamily: 'var(--font-sans)', transition: 'background 0.1s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.07)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(220,38,38,0.65)'; }}
            >
              <LogOut size={14} strokeWidth={1.8} style={{ color: 'currentColor', flexShrink: 0 }} />
              Switch to Learner
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
