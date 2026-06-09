'use client';
import { Video, Calendar, Clock, Timer, Users, CheckCircle2, User, Loader2, Play, ExternalLink } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type SessionStatus = 'upcoming' | 'recording_processing' | 'recording_available';

interface LiveSessionProps {
  title: string;
  date: string;
  time: string;
  duration: string;
  faculty: string;
  status: SessionStatus;
  daysUntil?: number;
  attendees?: number;
  totalStudents?: number;
  recordingDuration?: string;
  learnerAttendance?: { present: boolean; joinedAt?: string };
  isCoordinator?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function LiveSessionActivity({
  title,
  date,
  time,
  duration,
  faculty,
  status,
  daysUntil = 6,
  attendees = 18,
  totalStudents = 20,
  recordingDuration = '1:28:00',
  learnerAttendance = { present: true, joinedAt: '9:58 AM' },
  isCoordinator = true,
}: LiveSessionProps) {

  const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    upcoming: { label: 'Scheduled', color: '#072FB5', bg: 'rgba(7,47,181,0.06)' },
    recording_processing: { label: 'Recording Processing', color: '#D97706', bg: 'rgba(217,119,6,0.06)' },
    recording_available: { label: 'Recording Available', color: '#059669', bg: 'rgba(5,150,105,0.06)' },
  };

  const sc = statusConfig[status];

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 700 }}>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color, boxShadow: status === 'upcoming' ? `0 0 8px ${sc.color}40` : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Session</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: sc.color, background: sc.bg, padding: '3px 10px', borderRadius: 5 }}>{sc.label}</span>
        </div>

        {/* Title */}
        <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
          {title}
        </h1>

        {/* ═══ State: Recording Available ═══ */}
        {status === 'recording_available' && (
          <div style={{
            marginBottom: 24, borderRadius: 14, overflow: 'hidden',
            border: '2px solid rgba(15,15,15,0.45)',
            background: '#000',
          }}>
            {/* Mock video player */}
            <div style={{
              position: 'relative', paddingTop: '56.25%', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            }}>
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                    display: 'grid', placeItems: 'center', margin: '0 auto 12px',
                    cursor: 'pointer', transition: 'transform 0.15s, background 0.15s',
                  }}>
                    <Play size={28} fill="white" color="white" style={{ marginLeft: 3 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Session Recording</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{recordingDuration}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ State: Recording Processing ═══ */}
        {status === 'recording_processing' && (
          <div style={{
            marginBottom: 24, padding: '48px 32px', borderRadius: 14, textAlign: 'center',
            border: '2px solid rgba(15,15,15,0.45)',
            background: 'linear-gradient(135deg, #FFFBF5 0%, #FFF8ED 100%)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(217,119,6,0.08)', display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <Loader2 size={26} strokeWidth={2} style={{ color: '#D97706', animation: 'spin 2s linear infinite' }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 6 }}>Recording is being processed</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>Usually takes 30–60 minutes. You'll be notified when it's ready.</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ═══ State: Upcoming — Join/Host button ═══ */}
        {status === 'upcoming' && (
          <div style={{
            marginBottom: 24, padding: '32px', borderRadius: 14, textAlign: 'center',
            border: '2px solid rgba(15,15,15,0.45)',
            background: 'linear-gradient(135deg, #EDF2FF 0%, #D4E2FF 100%)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#072FB5', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              {daysUntil === 0 ? 'Session starts soon' : daysUntil === 1 ? 'Session is tomorrow' : `Session in ${daysUntil} days`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              {daysUntil === 0 ? 'Join button activates 10 minutes before start' : `Scheduled for ${date}, ${time}`}
            </div>
            <button disabled={daysUntil > 0} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 32px', fontSize: 15, fontWeight: 700,
              color: daysUntil === 0 ? '#fff' : 'rgba(7,47,181,0.35)',
              background: daysUntil === 0 ? '#072FB5' : 'rgba(7,47,181,0.08)',
              border: daysUntil === 0 ? 'none' : '1.5px solid rgba(7,47,181,0.15)',
              borderRadius: 10, cursor: daysUntil === 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-sans)',
              boxShadow: daysUntil === 0 ? '0 4px 16px rgba(7,47,181,0.3)' : 'none',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}>
              <Video size={18} strokeWidth={2} />
              {isCoordinator ? 'Host Session' : 'Join Session'}
              {daysUntil === 0 && <ExternalLink size={14} />}
            </button>
            {daysUntil > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 10 }}>Available 10 minutes before the session starts</div>
            )}
          </div>
        )}

        {/* ═══ Session Details Card ═══ */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid rgba(15,15,15,0.08)',
          padding: '22px 26px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Session Details</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(7,47,181,0.05)', display: 'grid', placeItems: 'center' }}>
                <Calendar size={16} strokeWidth={2} style={{ color: '#072FB5' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>Date</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{date}</div>
              </div>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(7,47,181,0.05)', display: 'grid', placeItems: 'center' }}>
                <Clock size={16} strokeWidth={2} style={{ color: '#072FB5' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>Time</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{time}</div>
              </div>
            </div>

            {/* Duration */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(7,47,181,0.05)', display: 'grid', placeItems: 'center' }}>
                <Timer size={16} strokeWidth={2} style={{ color: '#072FB5' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 2 }}>Duration</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{duration}</div>
              </div>
            </div>
          </div>

          {/* Faculty */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-section)', border: '1.5px solid var(--border-subtle)', display: 'grid', placeItems: 'center' }}>
              <User size={16} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 1 }}>Faculty</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{faculty}</div>
            </div>
          </div>
        </div>

        {/* ═══ Attendance (only for completed sessions) ═══ */}
        {status !== 'upcoming' && (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid rgba(15,15,15,0.08)',
            padding: '18px 26px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Attendance</div>

            {isCoordinator ? (
              /* Coordinator view: summary */
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>{attendees}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>/ {totalStudents} students attended</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  {Math.round((attendees / totalStudents) * 100)}% attendance
                </span>
              </div>
            ) : (
              /* Learner view: personal attendance */
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {learnerAttendance.present ? (
                  <>
                    <CheckCircle2 size={18} style={{ color: '#059669' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>Present</span>
                    {learnerAttendance.joinedAt && (
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Joined at {learnerAttendance.joinedAt}</span>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #DC2626', display: 'grid', placeItems: 'center' }}>
                      <div style={{ width: 8, height: 2, background: '#DC2626', borderRadius: 1 }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>Absent</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
