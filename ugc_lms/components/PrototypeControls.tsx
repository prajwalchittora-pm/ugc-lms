'use client';
import { useState } from 'react';
import { usePrototype, Scenario } from '@/context/PrototypeContext';

const SCENARIOS: { id: Scenario; label: string; desc: string }[] = [
  { id: 'first_visit', label: 'First Visit', desc: 'Onboarding screen' },
  { id: 'in_progress', label: 'In Progress', desc: 'Active learner' },
  { id: 'completed',   label: 'Completed',   desc: 'All courses done' },
];

export default function PrototypeControls() {
  const [open, setOpen] = useState(false);
  const { scenario, setScenario } = usePrototype();

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 400 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 44, right: 0,
          width: 218,
          background: '#0c0b0a',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.70), 0 0 0 0.5px rgba(255,255,255,0.04)',
          fontFamily: 'ui-monospace, "SFMono-Regular", monospace',
        }}>
          {/* Header */}
          <div style={{
            padding: '9px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
              background: '#4ade80', boxShadow: '0 0 5px #4ade80',
            }}/>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)' }}>
              Prototype Controls
            </span>
          </div>

          {/* Scenarios */}
          <div style={{ padding: '6px' }}>
            <div style={{ fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.20)', padding: '4px 8px 6px', fontWeight: 600 }}>
              Scenario
            </div>
            {SCENARIOS.map(s => {
              const active = scenario === s.id;
              return (
                <button key={s.id} onClick={() => { setScenario(s.id); if (s.id !== 'first_visit') setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    borderLeft: active ? '2px solid rgba(74,222,128,0.6)' : '2px solid transparent',
                    fontFamily: 'ui-monospace, monospace',
                    textAlign: 'left', transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                    background: active ? '#4ade80' : 'rgba(255,255,255,0.15)',
                    boxShadow: active ? '0 0 5px #4ade80' : 'none',
                    transition: 'all 0.15s ease',
                  }}/>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: active ? '#fff' : 'rgba(255,255,255,0.45)', lineHeight: 1.2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.20)', marginTop: 2 }}>
                      {s.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>


          {/* FTUE reset */}
          <div style={{ padding: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.20)', padding: '4px 8px 6px', fontWeight: 600 }}>
              Actions
            </div>
            <button
              onClick={() => { window.dispatchEvent(new CustomEvent('restart-ftue')); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', border: 'none', cursor: 'pointer',
                background: 'transparent', borderLeft: '2px solid transparent',
                fontFamily: 'ui-monospace, monospace', textAlign: 'left',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,200,80,0.7)' }}/>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.2 }}>Restart FTUE</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.20)', marginTop: 2 }}>Reset to login screen</div>
              </div>
            </button>
            <button
              onClick={() => { localStorage.removeItem('coord_visited'); localStorage.setItem('coord_empty', 'true'); window.dispatchEvent(new CustomEvent('trigger-coord-ftue')); window.dispatchEvent(new CustomEvent('coord-empty-toggle')); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', border: 'none', cursor: 'pointer',
                background: 'transparent', borderLeft: '2px solid transparent',
                fontFamily: 'ui-monospace, monospace', textAlign: 'left',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: 'rgba(96,165,250,0.7)' }}/>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.2 }}>First PM (Empty)</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.20)', marginTop: 2 }}>Empty system + FTUE</div>
              </div>
            </button>
            <button
              onClick={() => { localStorage.removeItem('coord_empty'); localStorage.removeItem('coord_visited'); window.dispatchEvent(new CustomEvent('coord-empty-toggle')); window.dispatchEvent(new CustomEvent('trigger-coord-ftue')); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', border: 'none', cursor: 'pointer',
                background: 'transparent', borderLeft: '2px solid transparent',
                fontFamily: 'ui-monospace, monospace', textAlign: 'left',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: 'rgba(74,222,128,0.7)' }}/>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.2 }}>Populated PM + FTUE</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.20)', marginTop: 2 }}>With data + onboarding</div>
              </div>
            </button>
          </div>

          {/* Hint */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.16)', lineHeight: 1.5, fontFamily: 'ui-monospace, monospace' }}>
              Prototype · FMC LMS<br/>
              For presentation only
            </div>
          </div>
        </div>
      )}

      {/* Trigger pill */}
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', height: 30,
        background: open ? 'rgba(255,255,255,0.08)' : '#0c0b0a',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'rgba(255,255,255,0.45)',
        cursor: 'pointer',
        fontFamily: 'ui-monospace, "SFMono-Regular", monospace',
        fontSize: 9.5, fontWeight: 600,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        transition: 'all 0.15s ease',
        boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: '#4ade80', boxShadow: '0 0 6px #4ade80',
          animation: 'protoPulse 2.5s ease-in-out infinite',
        }}/>
        Prototype
      </button>
    </div>
  );
}
