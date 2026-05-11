/**
 * Calendar.tsx — CampusSync
 * Requiere en public/index.html:
 * <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
 */

import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { calendarService } from '../services/calendarService';
import toast from 'react-hot-toast';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(16px,-22px); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-12px,18px); }
  }
  @keyframes cs-slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-slideSheet {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes cs-scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cs-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  /* ── Glassmorphism ── */
  .cs-glass {
    background: rgba(15,23,42,0.72);
    backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99,102,241,0.18);
    box-shadow: 0 20px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* ── Orbs ── */
  .cs-orb-a {
    position: absolute; top: -80px; right: -60px;
    width: 240px; height: 240px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -40px; left: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 68%);
    animation: cs-floatB 12s ease-in-out infinite; pointer-events: none;
  }

  /* ── Back button ── */
  .cs-back-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(165,180,252,0.85); outline: none;
    transition: background 0.18s; flex-shrink: 0;
  }
  .cs-back-btn:active { background: rgba(99,102,241,0.28); }

  /* ── Month nav button ── */
  .cs-nav-btn {
    width: 36px; height: 36px; border-radius: 12px;
    background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.16);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(165,180,252,0.8); outline: none;
    transition: background 0.18s, transform 0.14s;
  }
  .cs-nav-btn:active { background: rgba(99,102,241,0.25); transform: scale(0.92); }

  /* ── Calendar grid ── */
  .cs-cal-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }
  .cs-cal-header-cell {
    text-align: center; padding: 8px 0 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
    color: rgba(148,163,184,0.4);
  }

  /* ── Day cell ── */
  .cs-day-cell {
    position: relative; padding: 6px 4px 5px;
    min-height: 64px;
    background: rgba(15,23,42,0.4);
    border: 1px solid rgba(99,102,241,0.07);
    cursor: pointer;
    transition: background 0.15s;
    display: flex; flex-direction: column; align-items: center;
    gap: 3px;
  }
  .cs-day-cell:active { background: rgba(99,102,241,0.12); }
  .cs-day-cell.cs-day-today { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.22); }
  .cs-day-cell.cs-day-selected { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.35); }
  .cs-day-cell.cs-day-other   { opacity: 0.3; cursor: default; }
  .cs-day-cell.cs-day-other:active { background: rgba(15,23,42,0.4); }

  /* ── Day number ── */
  .cs-day-num {
    font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700;
    color: rgba(241,245,249,0.75); line-height: 1;
    width: 22px; height: 22px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cs-day-num.today-num {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; box-shadow: 0 2px 10px rgba(99,102,241,0.45);
  }
  .cs-day-num.selected-num {
    background: rgba(99,102,241,0.3); color: #a5b4fc;
  }

  /* ── Event pill inside cell ── */
  .cs-event-pill {
    width: 100%; border-radius: 5px; padding: 2px 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 8.5px; font-weight: 700; line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 2px;
  }

  /* +N more badge */
  .cs-more-badge {
    font-family: 'DM Sans', sans-serif; font-size: 8px; font-weight: 700;
    color: rgba(148,163,184,0.55); text-align: center; width: 100%;
    letter-spacing: 0.02em;
  }

  /* ── Skeleton ── */
  .cs-skeleton {
    border-radius: 16px; overflow: hidden;
    background: rgba(30,41,59,0.6); position: relative;
  }
  .cs-skeleton::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.07) 50%, transparent 100%);
    background-size: 400px 100%; animation: cs-shimmer 1.6s ease-in-out infinite;
  }

  /* ── Detail sheet ── */
  .cs-detail-sheet { animation: cs-slideUp 0.32s cubic-bezier(.22,1,.36,1) both; }

  /* ── Event detail card ── */
  .cs-ev-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    background: rgba(30,41,59,0.55);
    border: 1px solid rgba(99,102,241,0.12); border-radius: 16px;
    animation: cs-scaleIn 0.3s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Type icon container ── */
  .cs-ev-icon {
    width: 40px; height: 40px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .cs-a0 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.07s both; }
  .cs-a2 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.14s both; }

  /* month transition */
  .cs-month-enter { animation: cs-fadeUp 0.28s cubic-bezier(.22,1,.36,1) both; }

  /* Today indicator pulse */
  .cs-today-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: #6366f1;
    animation: cs-pulse 2s ease-in-out infinite;
    margin: 0 auto;
  }
`;

// ─── Event type config ────────────────────────────────────────────────────────
function getTypeConfig(type: string): { emoji: string; bg: string; color: string; pill: string; pillText: string } {
  switch (type?.toLowerCase()) {
    case 'evaluation':
    case 'evaluacion':
    case 'exam':
      return { emoji: '📝', bg: 'rgba(248,113,113,0.12)', color: '#f87171', pill: 'rgba(248,113,113,0.18)', pillText: '#fca5a5' };
    case 'taller':
    case 'workshop':
      return { emoji: '🔧', bg: 'rgba(251,146,60,0.12)', color: '#fb923c', pill: 'rgba(251,146,60,0.18)', pillText: '#fdba74' };
    case 'trabajo':
    case 'project':
      return { emoji: '📂', bg: 'rgba(34,211,238,0.12)', color: '#22d3ee', pill: 'rgba(34,211,238,0.18)', pillText: '#67e8f9' };
    case 'quiz':
    case 'cuestionario':
      return { emoji: '❓', bg: 'rgba(244,114,182,0.12)', color: '#f472b6', pill: 'rgba(244,114,182,0.18)', pillText: '#f9a8d4' };
    case 'foro':
    case 'forum':
      return { emoji: '💬', bg: 'rgba(52,211,153,0.12)', color: '#34d399', pill: 'rgba(52,211,153,0.18)', pillText: '#6ee7b7' };
    default:
      return { emoji: '📅', bg: 'rgba(99,102,241,0.12)', color: '#818cf8', pill: 'rgba(99,102,241,0.18)', pillText: '#a5b4fc' };
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const DAYS_ES    = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildCalendarCells(year: number, month: number): Array<{ date: string; day: number; isCurrentMonth: boolean }> {
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays   = new Date(year, month, 0).getDate();
  const cells: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

  // Previous month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    cells.push({ date: toDateStr(prevY, prevM, d), day: d, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateStr(year, month, d), day: d, isCurrentMonth: true });
  }
  // Next month head
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    cells.push({ date: toDateStr(nextY, nextM, d), day: d, isCurrentMonth: false });
  }
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Calendar: React.FC = () => {
  const history = useHistory();

  const today       = new Date();
  const todayStr    = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [year,      setYear]      = useState(today.getFullYear());
  const [month,     setMonth]     = useState(today.getMonth());
  const [selected,  setSelected]  = useState<string>(todayStr);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events,    setEvents]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [animKey,   setAnimKey]   = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await calendarService.getEvents();
        setEvents(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) { toast.error(error); }
      finally { setLoading(false); }
    })();
  }, []);

  // Build cells
  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  // Events by date map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventsByDate = useMemo<Record<string, any[]>>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, any[]> = {};
    events.forEach(ev => {
      if (!ev.due_date) return;
      const d = ev.due_date.split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  const selectedEvents = eventsByDate[selected] ?? [];

  const goToPrevMonth = () => {
    setAnimKey(k => k + 1);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    setAnimKey(k => k + 1);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(todayStr);
    setAnimKey(k => k + 1);
  };

  // Count events for the month (for header badge)
  const monthEventCount = useMemo(() => {
    return Object.entries(eventsByDate).filter(([date]) => {
      const d = new Date(date + 'T12:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }).reduce((acc, [, evs]) => acc + evs.length, 0);
  }, [eventsByDate, year, month]);

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div style={{
          minHeight: '100%',
          background: 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
          position: 'relative', paddingBottom: '40px',
        }}>

          {/* Dot grid */}
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.09) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Page header ── */}
          <div style={{ position: 'relative', padding: '52px 20px 20px', overflow: 'hidden', zIndex: 1 }}>
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            <div className="cs-a0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button className="cs-back-btn" onClick={() => history.goBack()} aria-label="Volver">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div>
                  <h1 className="cs-font-display" style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                    Mi Agenda
                  </h1>
                  <p className="cs-font-body" style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.45)', fontWeight: 500 }}>
                    {loading ? 'Cargando…' : `${events.length} entrega${events.length !== 1 ? 's' : ''} registrada${events.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {/* Go to today */}
              <button
                onClick={goToToday}
                style={{
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px', padding: '7px 12px', cursor: 'pointer', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
                  color: '#818cf8', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}
              >
                Hoy
              </button>
            </div>
          </div>

          {/* ── Calendar card ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
            <div className="cs-glass cs-a1" style={{ borderRadius: '24px', overflow: 'hidden' }}>

              {/* Month nav bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 18px 14px',
                borderBottom: '1px solid rgba(99,102,241,0.1)',
              }}>
                <div>
                  <h2 className="cs-font-display" style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    {MONTHS_ES[month]} {year}
                  </h2>
                  {monthEventCount > 0 && (
                    <p className="cs-font-body" style={{ margin: '3px 0 0', fontSize: '10px', color: 'rgba(148,163,184,0.4)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {monthEventCount} entrega{monthEventCount !== 1 ? 's' : ''} este mes
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="cs-nav-btn" onClick={goToPrevMonth} aria-label="Mes anterior">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button className="cs-nav-btn" onClick={goToNextMonth} aria-label="Mes siguiente">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="cs-cal-grid" style={{ padding: '0 2px' }}>
                {DAYS_ES.map(d => (
                  <div key={d} className="cs-cal-header-cell">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              {loading ? (
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="cs-skeleton" style={{ height: '64px' }} />
                  ))}
                </div>
              ) : (
                <div key={animKey} className="cs-cal-grid cs-month-enter" style={{ padding: '0 2px 2px' }}>
                  {cells.map((cell) => {
                    const cellEvents = eventsByDate[cell.date] ?? [];
                    const isToday    = cell.date === todayStr;
                    const isSelected = cell.date === selected;
                    const hasEvents  = cellEvents.length > 0;
                    const MAX_SHOW   = 2;

                    let cellClass = 'cs-day-cell';
                    if (!cell.isCurrentMonth) cellClass += ' cs-day-other';
                    else if (isSelected)      cellClass += ' cs-day-selected';
                    else if (isToday)         cellClass += ' cs-day-today';

                    return (
                      <div
                        key={cell.date}
                        className={cellClass}
                        onClick={() => cell.isCurrentMonth && setSelected(cell.date)}
                      >
                        {/* Day number */}
                        <span
                          className={`cs-day-num ${isToday && !isSelected ? 'today-num' : ''} ${isSelected ? 'selected-num' : ''}`}
                        >
                          {cell.day}
                        </span>

                        {/* Event pills (max 2 + overflow) */}
                        {cell.isCurrentMonth && hasEvents && (
                          <>
                            {cellEvents.slice(0, MAX_SHOW).map((ev, i) => {
                              const cfg = getTypeConfig(ev.type);
                              return (
                                <div
                                  key={i}
                                  className="cs-event-pill"
                                  style={{ background: cfg.pill, color: cfg.pillText }}
                                  title={ev.title}
                                >
                                  <span style={{ fontSize: '7px', lineHeight: 1 }}>{cfg.emoji}</span>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                                    {ev.title}
                                  </span>
                                </div>
                              );
                            })}
                            {cellEvents.length > MAX_SHOW && (
                              <span className="cs-more-badge">+{cellEvents.length - MAX_SHOW} más</span>
                            )}
                          </>
                        )}

                        {/* Today pulse dot (when no events) */}
                        {isToday && !hasEvents && !isSelected && (
                          <div className="cs-today-dot" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Selected day detail ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 0' }}>
            {/* Date label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="cs-font-body" style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(148,163,184,0.38)',
              }}>
                {(() => {
                  const [sy, sm, sd] = selected.split('-').map(Number);
                  const dObj = new Date(sy, sm - 1, sd);
                  return `${DAYS_ES[dObj.getDay()]}, ${sd} de ${MONTHS_ES[sm - 1]}`;
                })()}
              </span>
              {selectedEvents.length > 0 && (
                <span style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)',
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '11px', fontWeight: 700, color: '#818cf8',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {selectedEvents.length} entrega{selectedEvents.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Event detail cards */}
            {selectedEvents.length === 0 ? (
              <div className="cs-detail-sheet" style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '20px',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', fontSize: '22px',
                }}>
                  🗓️
                </div>
                <p className="cs-font-body" style={{ margin: 0, fontSize: '14px', color: 'rgba(148,163,184,0.38)', fontStyle: 'italic' }}>
                  Día libre de entregas
                </p>
              </div>
            ) : (
              <div className="cs-detail-sheet" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedEvents.map((ev, idx) => {
                  const cfg = getTypeConfig(ev.type);
                  return (
                    <div key={ev.id ?? idx} className="cs-ev-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="cs-ev-icon" style={{ background: cfg.bg }}>
                        <span>{cfg.emoji}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 className="cs-font-display" style={{
                          margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#f1f5f9',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {ev.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {ev.subject_name && (
                            <span className="cs-font-body" style={{
                              fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
                              textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)',
                            }}>
                              {ev.subject_name}
                            </span>
                          )}
                          {ev.type && (
                            <span style={{
                              background: cfg.bg, border: `1px solid ${cfg.color}28`,
                              borderRadius: '20px', padding: '2px 8px',
                              fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em',
                              textTransform: 'uppercase', color: cfg.color,
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {ev.type}
                            </span>
                          )}
                        </div>
                      </div>
                      {ev.weight_percentage != null && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span className="cs-font-display" style={{ fontSize: '16px', fontWeight: 800, color: cfg.color }}>
                            {ev.weight_percentage}%
                          </span>
                          <p className="cs-font-body" style={{ margin: '2px 0 0', fontSize: '9px', color: 'rgba(148,163,184,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            peso
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Calendar;