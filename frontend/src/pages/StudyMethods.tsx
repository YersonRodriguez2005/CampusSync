import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  LuChevronLeft, 
  LuRotateCcw, 
  LuPlay, 
  LuPause,
  LuGraduationCap,
  LuCoffee,
  LuTarget,
  LuSmartphone,
  LuDroplets,
  LuPenTool,
  LuCircleCheck
} from 'react-icons/lu';
import { useAuthStore } from '../store/authStore';

// ─── POMODORO TIPS ────────────────────────────────────────────────────────────
const STUDY_TIPS = [
  { icon: <LuTarget />, text: 'Enfócate en una sola tarea durante cada sesión Pomodoro.' },
  { icon: <LuSmartphone />, text: 'Silencia tu teléfono y cierra las redes sociales.' },
  { icon: <LuDroplets />, text: 'Mantén agua cerca para mantenerte hidratado.' },
  { icon: <LuPenTool />, text: 'Usa las notas rápidas para capturar ideas sin interrumpirte.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const STUDY_TOTAL = 25 * 60;
const BREAK_TOTAL = 5 * 60;

// ─── Ring SVG Dinámico ─────────────────────────────────────────────────────────
interface RingProps { pct: number; isBreak: boolean; isActive: boolean; }
const TimerRing: React.FC<RingProps> = ({ pct, isBreak, isActive }) => {
  const R = 100; 
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct);
  
  // Clases Tailwind de color dinámico
  const strokeClass = isBreak ? 'stroke-emerald-400' : 'stroke-purple-500';
  const glowShadow = isActive 
    ? (isBreak ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]') 
    : '';

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" className="-rotate-90 absolute top-0 left-0">
      <defs>
        <filter id="cs-ring-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Pista (Fondo) */}
      <circle cx="120" cy="120" r={R} className="fill-none stroke-slate-800/80" strokeWidth="8" />
      {/* Progreso */}
      <circle
        cx="120" cy="120" r={R}
        className={`fill-none stroke-linecap-round transition-all duration-1000 ease-linear ${strokeClass} ${glowShadow}`}
        strokeWidth="8"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        filter={isActive ? 'url(#cs-ring-glow)' : undefined}
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
  const [sessions,   setSessions]   = useState(0); 
  const [tipIdx,     setTipIdx]     = useState(() => Math.floor(Math.random() * STUDY_TIPS.length));

  // ── Hardware refs ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);
  const audioRef    = useRef<HTMLAudioElement | null>(null);

  // ── Notes state ──
  const storageKey = `campussync_notes_${user?.id ?? 'guest'}`;
  const [notes,      setNotes]      = useState(() => localStorage.getItem(storageKey) || '');
  const [showSaved, setShowSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/assets/sounds/alarm.mp3');
  }, []);

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

  const total    = mode === 'study' ? STUDY_TOTAL : BREAK_TOTAL;
  const ringPct  = timeLeft / total;
  const isBreak  = mode === 'break';
  
  const mainColorClass = isBreak ? 'text-emerald-400' : 'text-purple-400';

  return (
    <IonPage>
      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div className="min-h-full bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative pb-12 overflow-hidden">

          {/* ── Orbes y Malla (GPU Accelerated) ── */}
          <div className="absolute -top-24 -right-16 w-65 h-65 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute top-[35%] -left-12 w-50 h-50 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] bg-size-[28px_28px] z-0" />

          {/* ── Header ── */}
          <div className="relative z-10 pt-14 px-6 pb-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-3.5 mb-2">
              <button 
                onClick={() => history.goBack()} 
                className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-95 transition-all"
              >
                <LuChevronLeft className="text-2xl" />
              </button>
              <div>
                <h1 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif">
                  Métodos de Estudio
                </h1>
                <p className="m-0 mt-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {sessions > 0 ? `🍅 ${sessions} sesión${sessions !== 1 ? 'es' : ''} completada${sessions !== 1 ? 's' : ''}` : 'Técnica Pomodoro + Notas'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 px-5 flex flex-col gap-4">

            {/* ───────────── POMODORO CARD (Glassmorphism) ───────────── */}
            <div className={`cs-glass-card p-7! text-center transition-colors duration-500 animate-slide-up ${isBreak ? 'border-emerald-500/30' : 'border-purple-500/30'}`} style={{ animationDelay: '100ms' }}>
              
              {/* Card header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">⏱ Temporizador</span>
                
                {/* Session dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < sessions % 4 
                          ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' 
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Controles de Modo (Pills Neumórficas) */}
              <div className="flex justify-center gap-3 mb-8">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    !isBreak 
                      ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-inner' 
                      : 'bg-transparent border border-white/5 text-slate-500 hover:text-slate-400'
                  }`}
                  onClick={() => switchMode('study')}
                >
                  <LuGraduationCap className="text-base" /> Estudio · 25m
                </button>

                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isBreak 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-inner' 
                      : 'bg-transparent border border-white/5 text-slate-500 hover:text-slate-400'
                  }`}
                  onClick={() => switchMode('break')}
                >
                  <LuCoffee className="text-base" /> Pausa · 5m
                </button>
              </div>

              {/* ── Ring Timer Central ── */}
              <div className="relative w-55 h-55 mx-auto mb-8 flex items-center justify-center">
                
                <div className="absolute -inset-2.5">
                  <TimerRing pct={ringPct} isBreak={isBreak} isActive={isActive} />
                </div>

                {/* Pulso Interno */}
                <div className={`w-45 h-45 rounded-full border flex flex-col items-center justify-center gap-1 transition-colors duration-500 ${
                  isBreak 
                    ? 'bg-[radial-gradient(circle,rgba(52,211,153,0.08)_0%,rgba(15,23,42,0.6)_70%)] border-emerald-500/15' 
                    : 'bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,rgba(15,23,42,0.6)_70%)] border-purple-500/15'
                  } ${isActive ? 'animate-pulse' : ''}`}
                >
                  <span className={`text-[64px] font-black font-mono tracking-tighter leading-none transition-colors duration-500 ${mainColorClass}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isBreak ? 'Descansa' : 'Enfócate'}
                  </span>
                </div>
              </div>

              {/* ── Controles de Reproducción ── */}
              <div className="flex justify-center items-center gap-3">
                <button 
                  className="w-13 h-13 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center text-slate-400 active:scale-90 hover:text-slate-200 transition-all" 
                  onClick={resetTimer} 
                  aria-label="Reiniciar"
                >
                  <LuRotateCcw className="text-xl" />
                </button>

                <button
                  className={`h-13 px-8 rounded-2xl font-bold text-white flex items-center gap-2 active:scale-95 transition-all shadow-lg min-w-35 justify-center ${
                    isActive 
                      ? 'bg-linear-to-br from-orange-500 to-red-500 shadow-orange-500/30' 
                      : isBreak 
                        ? 'bg-linear-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30' 
                        : 'bg-linear-to-br from-purple-500 to-indigo-600 shadow-purple-500/30'
                  }`}
                  onClick={toggleTimer}
                >
                  {isActive ? (
                    <><LuPause className="fill-current" /> Pausar</>
                  ) : (
                    <><LuPlay className="fill-current" /> {timeLeft === total ? 'Iniciar' : 'Continuar'}</>
                  )}
                </button>
              </div>

              {/* Mensaje de Estado */}
              <p className={`mt-5 text-[11px] font-bold tracking-wide transition-colors ${
                isActive 
                  ? (isBreak ? 'text-emerald-400/80' : 'text-purple-400/80') 
                  : 'text-slate-500'
              }`}>
                {isActive
                  ? (isBreak ? '🌿 Tómate un respiro, te lo mereces' : '🎯 Estás en la zona, sigue así')
                  : (timeLeft === total ? 'Listo para comenzar' : 'Temporizador en pausa')}
              </p>
            </div>

            {/* ───────────── CONSEJO CARD ───────────── */}
            <div className="bg-indigo-500/10 border border-indigo-500/15 rounded-2xl p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                {STUDY_TIPS[tipIdx].icon}
              </div>
              <div>
                <p className="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Consejo de estudio
                </p>
                <p className="m-0 text-[13px] text-slate-300 font-medium leading-relaxed">
                  {STUDY_TIPS[tipIdx].text}
                </p>
              </div>
            </div>

            {/* ───────────── NOTAS RÁPIDAS CARD (Soft Inset) ───────────── */}
            <div className="cs-glass-card p-6! animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <LuPenTool className="text-indigo-400" /> Notas Rápidas
                  </span>
                  <p className="m-0 text-[10px] text-slate-500 font-medium italic">
                    Guardado localmente en tu dispositivo.
                  </p>
                </div>
                
                {/* Indicador de Guardado */}
                <div className={`flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest transition-opacity duration-300 ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
                  <LuCircleCheck /> Guardado
                </div>
              </div>

              <textarea
                className="w-full min-h-40 p-4 rounded-[20px] bg-[#0b1120]/80 border border-white/5 text-slate-200 text-sm font-medium leading-relaxed resize-none outline-none focus:bg-[#0b1120] focus:border-indigo-500/30 transition-all shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.02),inset_2px_2px_8px_rgba(0,0,0,0.6)] placeholder:text-slate-600"
                value={notes}
                onChange={handleNotes}
                placeholder="Escribe aquí ideas, apuntes durante tu Pomodoro o recordatorios para no perder el enfoque..."
              />

              <p className="m-0 mt-3 text-[10px] text-slate-500 text-right font-bold tracking-widest uppercase">
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