import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(18px,-26px); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-14px,20px); }
  }
  @keyframes cs-ringRotate {
    from { stroke-dashoffset: var(--ring-offset-start); }
    to   { stroke-dashoffset: var(--ring-offset-end); }
  }
  @keyframes cs-pulseBeat {
    0%,100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(139,92,246,0.4); }
    50%      { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(139,92,246,0); }
  }
  @keyframes cs-pulseBreak {
    0%,100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
    50%      { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(52,211,153,0); }
  }
  @keyframes cs-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes cs-savedFlash {
    0%   { opacity: 0; transform: translateY(4px); }
    20%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes cs-spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-mono    { font-family: 'Sora', 'Courier New', monospace; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  /* ── Glassmorphism card ── */
  .cs-glass {
    background: rgba(15,23,42,0.72);
    backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99,102,241,0.18);
    box-shadow: 0 20px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .cs-glass-break {
    background: rgba(15,23,42,0.72);
    backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(52,211,153,0.22);
    box-shadow: 0 20px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(52,211,153,0.06);
  }

  /* ── Orbs ── */
  .cs-orb-a {
    position: absolute; top: -90px; right: -70px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -50px; left: -50px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 68%);
    animation: cs-floatB 12s ease-in-out infinite; pointer-events: none;
  }

  /* ── Back button ── */
  .cs-back-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(165,180,252,0.85); outline: none;
    transition: background 0.18s;
  }
  .cs-back-btn:active { background: rgba(99,102,241,0.28); }

  /* ── Mode selector pill ── */
  .cs-mode-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 14px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.22s ease; outline: none; letter-spacing: 0.02em;
  }
  .cs-mode-pill-study-active {
    background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3);
    color: #c4b5fd;
  }
  .cs-mode-pill-study-inactive {
    background: transparent; border: 1px solid rgba(99,102,241,0.1);
    color: rgba(148,163,184,0.45);
  }
  .cs-mode-pill-break-active {
    background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.28);
    color: #6ee7b7;
  }
  .cs-mode-pill-break-inactive {
    background: transparent; border: 1px solid rgba(52,211,153,0.08);
    color: rgba(148,163,184,0.45);
  }

  /* ── Timer ring SVG ── */
  .cs-ring-track { fill: none; stroke: rgba(30,41,59,0.8); }
  .cs-ring-fill  { fill: none; stroke-linecap: round; transition: stroke-dashoffset 1s linear, stroke 0.6s ease; }

  /* ── Timer display ── */
  .cs-timer-display {
    font-family: 'Sora', monospace; font-size: 64px; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1;
    transition: color 0.6s ease;
  }

  /* ── Control buttons ── */
  .cs-ctrl-reset {
    width: 52px; height: 52px; border-radius: 16px;
    background: rgba(30,41,59,0.7); border: 1px solid rgba(99,102,241,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(148,163,184,0.6); outline: none;
    transition: all 0.18s;
  }
  .cs-ctrl-reset:active { background: rgba(30,41,59,0.9); transform: scale(0.94); }

  .cs-ctrl-play {
    height: 52px; padding: 0 32px; border-radius: 16px;
    border: none; color: white;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; outline: none;
    transition: transform 0.18s, box-shadow 0.18s;
    position: relative; overflow: hidden;
  }
  .cs-ctrl-play::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .cs-ctrl-play:active { transform: scale(0.96); }
  .cs-ctrl-play-study {
    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
    box-shadow: 0 6px 24px rgba(139,92,246,0.42);
  }
  .cs-ctrl-play-break {
    background: linear-gradient(135deg, #059669, #34d399);
    box-shadow: 0 6px 24px rgba(52,211,153,0.38);
  }
  .cs-ctrl-play-pause {
    background: linear-gradient(135deg, #ea580c, #f97316);
    box-shadow: 0 6px 24px rgba(249,115,22,0.38);
  }

  /* ── Timer pulse ── */
  .cs-timer-active-study { animation: cs-pulseBeat 2s ease-in-out infinite; }
  .cs-timer-active-break { animation: cs-pulseBreak 2s ease-in-out infinite; }

  /* ── Progress indicator dots ── */
  .cs-session-dot {
    width: 8px; height: 8px; border-radius: 50%;
    transition: all 0.3s ease;
  }

  /* ── Textarea ── */
  .cs-textarea {
    width: 100%; border-radius: 16px; padding: 16px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px; line-height: 1.7; color: #e2e8f0;
    background: rgba(30,41,59,0.55);
    border: 1.5px solid rgba(99,102,241,0.12);
    outline: none; resize: none;
    transition: border-color 0.22s, box-shadow 0.22s;
    box-sizing: border-box;
    min-height: 180px;
  }
  .cs-textarea::placeholder { color: rgba(148,163,184,0.3); }
  .cs-textarea:focus {
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
    background: rgba(30,41,59,0.75);
  }

  /* ── Section label ── */
  .cs-section-label {
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(148,163,184,0.38); display: block;
  }

  /* ── Saved indicator ── */
  .cs-saved {
    animation: cs-savedFlash 2s ease forwards;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
    color: #34d399; display: flex; align-items: center; gap: 4px;
  }

  /* ── Tip card ── */
  .cs-tip-card {
    background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.12);
    border-radius: 16px; padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .cs-tip-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.18);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; margin-top: 1px;
  }

  .cs-a0 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.07s both; }
  .cs-a2 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.14s both; }
  .cs-a3 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.21s both; }
`;

// ─── POMODORO TIPS ────────────────────────────────────────────────────────────
const STUDY_TIPS = [
  { icon: '🎯', text: 'Enfócate en una sola tarea durante cada sesión Pomodoro.' },
  { icon: '📵', text: 'Silencia tu teléfono y cierra las redes sociales.' },
  { icon: '💧', text: 'Mantén agua cerca para mantenerte hidratado.' },
  { icon: '✍️', text: 'Usa las notas rápidas para capturar ideas sin interrumpirte.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const STUDY_TOTAL = 25 * 60;
const BREAK_TOTAL = 5 * 60;

// ─── Ring SVG ─────────────────────────────────────────────────────────────────
interface RingProps { pct: number; isBreak: boolean; isActive: boolean; }
const TimerRing: React.FC<RingProps> = ({ pct, isBreak, isActive }) => {
  const R = 100; const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct);
  const stroke  = isBreak ? '#34d399' : '#8b5cf6';
  const glow    = isBreak ? 'rgba(52,211,153,0.4)' : 'rgba(139,92,246,0.4)';

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
      <defs>
        <filter id="cs-ring-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx="120" cy="120" r={R} className="cs-ring-track" strokeWidth="8" />
      {/* Fill */}
      <circle
        cx="120" cy="120" r={R}
        className="cs-ring-fill"
        strokeWidth="8"
        stroke={stroke}
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        filter={isActive ? 'url(#cs-ring-glow)' : undefined}
        style={{ filter: isActive ? `drop-shadow(0 0 8px ${glow})` : undefined }}
      />
    </svg>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const StudyMethods: React.FC = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useAuthStore((state: any) => state.user);

  // ── Pomodoro state ──
  const [timeLeft,   setTimeLeft]   = useState(STUDY_TOTAL);
  const [isActive,   setIsActive]   = useState(false);
  const [mode,       setMode]       = useState<'study' | 'break'>('study');
  const [sessions,   setSessions]   = useState(0); // completed study sessions
  const [tipIdx,     setTipIdx]     = useState(() => Math.floor(Math.random() * STUDY_TIPS.length));

  // ── Hardware refs ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  // ── Notes state ──
  const storageKey = `campussync_notes_${user?.id ?? 'guest'}`;
  const [notes,    setNotes]    = useState(() => localStorage.getItem(storageKey) || '');
  const [showSaved, setShowSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/assets/sounds/alarm.mp3');
  }, []);

  // WakeLock helpers
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try { wakeLockRef.current = await navigator.wakeLock.request('screen'); }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (err: any) { console.error(`WakeLock: ${err.message}`); }
    }
  };
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  useEffect(() => {
    const handleVis = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible' && isActive) await requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, [isActive]);
  useEffect(() => () => { releaseWakeLock(); }, []);

  // Timer tick
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      releaseWakeLock();
      if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 1000]);
      if (audioRef.current) audioRef.current.play().catch(() => {});
      if (mode === 'study') {
        setSessions(s => s + 1);
        setTipIdx(Math.floor(Math.random() * STUDY_TIPS.length));
        setMode('break'); setTimeLeft(BREAK_TOTAL);
      } else {
        setMode('study'); setTimeLeft(STUDY_TOTAL);
      }
      setIsActive(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = async () => {
    if (!isActive) { setIsActive(true); await requestWakeLock(); }
    else           { setIsActive(false); await releaseWakeLock(); }
  };
  const switchMode = async (m: 'study' | 'break') => {
    setMode(m); setIsActive(false); setTimeLeft(m === 'study' ? STUDY_TOTAL : BREAK_TOTAL);
    await releaseWakeLock();
  };
  const resetTimer = async () => {
    setIsActive(false); setTimeLeft(mode === 'study' ? STUDY_TOTAL : BREAK_TOTAL);
    await releaseWakeLock();
  };

  const handleNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(storageKey, val);
    setShowSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setShowSaved(true), 800);
  };

  // Ring progress
  const total    = mode === 'study' ? STUDY_TOTAL : BREAK_TOTAL;
  const ringPct  = timeLeft / total;
  const isBreak  = mode === 'break';
  const mainColor = isBreak ? '#34d399' : '#8b5cf6';

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div style={{
          minHeight: '100%',
          background: 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
          position: 'relative', paddingBottom: '48px',
        }}>

          {/* Dot grid */}
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.09) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Header ── */}
          <div style={{ position: 'relative', padding: '52px 20px 24px', overflow: 'hidden', zIndex: 1 }}>
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            <div className="cs-a0" style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
              <button className="cs-back-btn" onClick={() => history.goBack()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div>
                <h1 className="cs-font-display" style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Métodos de Estudio
                </h1>
                <p className="cs-font-body" style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.45)' }}>
                  {sessions > 0 ? `🍅 ${sessions} sesión${sessions !== 1 ? 'es' : ''} completada${sessions !== 1 ? 's' : ''}` : 'Técnica Pomodoro + Notas'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ───────────── POMODORO CARD ───────────── */}
            <div
              className={`cs-a1 ${isBreak ? 'cs-glass-break' : 'cs-glass'}`}
              style={{ borderRadius: '28px', padding: '28px 24px', textAlign: 'center' }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <span className="cs-section-label">⏱ Pomodoro</span>
                {/* Session dots */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="cs-session-dot"
                      style={{
                        background: i < sessions % 4
                          ? '#8b5cf6'
                          : 'rgba(30,41,59,0.7)',
                        border: i < sessions % 4
                          ? '1px solid rgba(139,92,246,0.4)'
                          : '1px solid rgba(99,102,241,0.1)',
                        boxShadow: i < sessions % 4 ? '0 0 6px rgba(139,92,246,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Mode selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                <button
                  className={`cs-mode-pill ${mode === 'study' ? 'cs-mode-pill-study-active' : 'cs-mode-pill-study-inactive'}`}
                  onClick={() => switchMode('study')}
                >
                  <span>🎓</span> Estudio · 25m
                </button>
                <button
                  className={`cs-mode-pill ${mode === 'break' ? 'cs-mode-pill-break-active' : 'cs-mode-pill-break-inactive'}`}
                  onClick={() => switchMode('break')}
                >
                  <span>🌿</span> Pausa · 5m
                </button>
              </div>

              {/* Ring + timer */}
              <div
                style={{
                  position: 'relative', width: '220px', height: '220px',
                  margin: '0 auto 28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {/* SVG ring */}
                <div style={{ position: 'absolute', inset: '-10px' }}>
                  <TimerRing pct={ringPct} isBreak={isBreak} isActive={isActive} />
                </div>

                {/* Inner glow disc */}
                <div
                  className={isActive ? (isBreak ? 'cs-timer-active-break' : 'cs-timer-active-study') : ''}
                  style={{
                    width: '180px', height: '180px', borderRadius: '50%',
                    background: isBreak
                      ? 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, rgba(15,23,42,0.6) 70%)'
                      : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(15,23,42,0.6) 70%)',
                    border: `1px solid ${isBreak ? 'rgba(52,211,153,0.12)' : 'rgba(139,92,246,0.12)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    className="cs-timer-display"
                    style={{ color: mainColor }}
                  >
                    {formatTime(timeLeft)}
                  </span>
                  <span className="cs-font-body" style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'rgba(148,163,184,0.4)',
                  }}>
                    {isBreak ? 'descansa' : 'enfócate'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                {/* Reset */}
                <button className="cs-ctrl-reset" onClick={resetTimer} aria-label="Reiniciar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                  </svg>
                </button>

                {/* Play / Pause */}
                <button
                  className={`cs-ctrl-play ${isActive ? 'cs-ctrl-play-pause' : isBreak ? 'cs-ctrl-play-break' : 'cs-ctrl-play-study'}`}
                  onClick={toggleTimer}
                  style={{ minWidth: '140px' }}
                >
                  {isActive ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      Pausar
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      {timeLeft === total ? 'Iniciar' : 'Continuar'}
                    </>
                  )}
                </button>
              </div>

              {/* Status message */}
              <p className="cs-font-body" style={{
                marginTop: '18px', fontSize: '12px',
                color: isActive
                  ? (isBreak ? 'rgba(52,211,153,0.6)' : 'rgba(139,92,246,0.7)')
                  : 'rgba(148,163,184,0.3)',
                fontWeight: 500, letterSpacing: '0.02em',
                minHeight: '18px',
              }}>
                {isActive
                  ? (isBreak ? '🌿 Descansa, te lo mereces' : '🎯 Estás en la zona, sigue así')
                  : (timeLeft === total ? 'Listo para comenzar' : 'Temporizador en pausa')}
              </p>
            </div>

            {/* ───────────── TIP CARD ───────────── */}
            <div className="cs-a2 cs-tip-card">
              <div className="cs-tip-icon">{STUDY_TIPS[tipIdx].icon}</div>
              <div>
                <p className="cs-section-label" style={{ marginBottom: '4px' }}>Consejo de estudio</p>
                <p className="cs-font-body" style={{ margin: 0, fontSize: '13px', color: 'rgba(203,213,225,0.7)', lineHeight: 1.6 }}>
                  {STUDY_TIPS[tipIdx].text}
                </p>
              </div>
            </div>

            {/* ───────────── NOTES CARD ───────────── */}
            <div className="cs-glass cs-a3" style={{ borderRadius: '28px', padding: '24px' }}>
              {/* Notes header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span className="cs-section-label" style={{ marginBottom: '4px' }}>📝 Notas rápidas</span>
                  <p className="cs-font-body" style={{ margin: 0, fontSize: '11px', color: 'rgba(148,163,184,0.3)' }}>
                    Solo en este dispositivo
                  </p>
                </div>
                {showSaved && (
                  <span className="cs-saved">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Guardado
                  </span>
                )}
              </div>

              <textarea
                className="cs-textarea"
                value={notes}
                onChange={handleNotes}
                placeholder="Escribe aquí ideas rápidas, apuntes durante tu Pomodoro o recordatorios…"
                rows={7}
              />

              {/* Word count */}
              <p className="cs-font-body" style={{ margin: '8px 0 0', fontSize: '10px', color: 'rgba(148,163,184,0.25)', textAlign: 'right', fontWeight: 600, letterSpacing: '0.04em' }}>
                {notes.trim().split(/\s+/).filter(Boolean).length} palabras
              </p>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudyMethods;