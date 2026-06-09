'use client';
import { COURSES } from '@/lib/mockData';
import { Video, MonitorPlay, BookOpenText, MessageSquare, ClipboardCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContinueLearningCard({ firstTime }: { firstTime?: boolean } = {}) {
  const course = COURSES.find(c => c.status === 'in_progress') ?? COURSES[0];
  const isComplete = course.progress === 100;

  return (
    <div className="enter enter-2" style={{
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-md)',
      background: 'linear-gradient(135deg, #E0EAFF 0%, #F5EDE0 100%)',
      border: '2px solid rgba(15,15,15,0.45)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.12s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
    >
      <div style={{ padding: '20px 28px', boxSizing: 'border-box' }}>

        <span className="label" style={{ color: 'var(--text-tertiary)' }}>{firstTime ? 'Start learning' : 'Continue learning'}</span>

        <h2 style={{
          margin: '8px 0 14px', fontSize: 24, fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.2,
          color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
        }}>
          {course.title}
        </h2>

        {/* Activity stats — compact tiles */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, maxWidth: 420 }}>
          {[
            { Icon: Video,           done: 1,                                    total: 2,                                    label: 'Live' },
            { Icon: MonitorPlay,     done: course.activities.videos.done,       total: course.activities.videos.total,       label: 'E-Tutorial' },
            { Icon: BookOpenText,    done: course.activities.pages.done,        total: course.activities.pages.total,        label: 'E-Content' },
            { Icon: MessageSquare,   done: course.activities.discussions.done,  total: course.activities.discussions.total,  label: 'Discussion' },
            { Icon: ClipboardCheck,  done: course.activities.quizzes.done,      total: course.activities.quizzes.total,      label: 'Assessment' },
          ].map(({ Icon, done, total, label }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center', padding: '6px 2px',
              background: 'rgba(255,255,255,0.55)', borderRadius: 6,
            }}>
              <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto 2px' }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {done}<span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)' }}>/{total}</span>
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2, whiteSpace: 'nowrap' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div
              className={isComplete ? 'progress-fill progress-fill-success' : 'progress-fill'}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: isComplete ? 'var(--green-600)' : 'var(--text-tertiary)', flexShrink: 0 }}>
            {course.progress}%
          </span>
          <Link href={`/learn?course=${course.id}`} data-tour="start-course" className="btn-primary" style={{ flexShrink: 0, padding: '11px 22px', fontSize: 15 }}>
            {isComplete ? 'Review Course' : firstTime ? 'Start Course' : 'Continue'} <ArrowRight size={13}/>
          </Link>
        </div>
      </div>
    </div>
  );
}
