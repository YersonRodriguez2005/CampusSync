import React, { useEffect, useState, useMemo } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  LuChevronLeft, 
  LuChevronRight,
  LuCalendarX
} from 'react-icons/lu';
import { calendarService } from '../services/calendarService';
import toast from 'react-hot-toast';

// ─── Configuración Visual por Tipo de Evento (Clases Tailwind) ───────────────
function getTypeConfig(type: string) {
  switch (type?.toLowerCase()) {
    case 'evaluation':
    case 'evaluacion':
    case 'exam':
      return { emoji: '📝', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' };
    case 'taller':
    case 'workshop':
      return { emoji: '🔧', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' };
    case 'trabajo':
    case 'project':
      return { emoji: '📂', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'quiz':
    case 'cuestionario':
      return { emoji: '❓', bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/20' };
    case 'foro':
    case 'forum':
      return { emoji: '💬', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    default:
      return { emoji: '📅', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/20' };
  }
}

// ─── Helpers de Fecha ────────────────────────────────────────────────────────
const DAYS_ES    = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

  // Cola del mes anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    cells.push({ date: toDateStr(prevY, prevM, d), day: d, isCurrentMonth: false });
  }
  // Mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toDateStr(year, month, d), day: d, isCurrentMonth: true });
  }
  // Cabeza del próximo mes
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    cells.push({ date: toDateStr(nextY, nextM, d), day: d, isCurrentMonth: false });
  }
  return cells;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-7 gap-px bg-slate-700/30 p-px">
    {Array.from({ length: 35 }).map((_, i) => (
      <div key={i} className="h-16 bg-[#0f172a] animate-pulse" style={{ animationDelay: `${(i % 7) * 50}ms` }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Calendar: React.FC = () => {
  const history = useHistory();

  const today    = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

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
      } catch (error: any) { toast.error(error.message || "Error al cargar agenda"); }
      finally { setLoading(false); }
    })();
  }, []);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

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

  const monthEventCount = useMemo(() => {
    return Object.entries(eventsByDate).filter(([date]) => {
      const d = new Date(date + 'T12:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }).reduce((acc, [, evs]) => acc + evs.length, 0);
  }, [eventsByDate, year, month]);

  return (
    <IonPage>
      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div className="min-h-full bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative pb-10 overflow-hidden">
          
          {/* ── Orbes y Malla (GPU Accelerated) ── */}
          <div className="absolute -top-20 -right-16 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute top-[20%] -left-16 w-55 h-55 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] bg-size-[28px_28px] z-0" />

          {/* ── Header ── */}
          <div className="relative z-10 pt-14 px-6 pb-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => history.goBack()} 
                className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-95 transition-all"
              >
                <LuChevronLeft className="text-2xl" />
              </button>
              
              <button 
                onClick={goToToday}
                className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                Hoy
              </button>
            </div>

            <div>
              <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">Mi Agenda</h1>
              <p className="mt-1 text-sm text-slate-400 font-medium">
                {loading ? 'Sincronizando fechas...' : `${events.length} entrega${events.length !== 1 ? 's' : ''} en total`}
              </p>
            </div>
          </div>

          {/* ── Calendar Card (Glassmorphism + CSS Grid de 1px) ── */}
          <div className="relative z-10 px-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="cs-glass-card p-0! overflow-hidden shadow-2xl">
              
              {/* Controles del Mes */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-indigo-500/15 bg-slate-900/40">
                <div>
                  <h2 className="m-0 text-lg font-extrabold text-slate-50 tracking-tight font-serif capitalize">
                    {MONTHS_ES[month]} {year}
                  </h2>
                  {monthEventCount > 0 && (
                    <p className="m-0 mt-0.5 text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
                      {monthEventCount} entrega{monthEventCount !== 1 ? 's' : ''} este mes
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={goToPrevMonth} className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-300 hover:bg-slate-700 active:scale-90 transition-all">
                    <LuChevronLeft className="text-lg" />
                  </button>
                  <button onClick={goToNextMonth} className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-300 hover:bg-slate-700 active:scale-90 transition-all">
                    <LuChevronRight className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-slate-900/60 border-b border-indigo-500/15">
                {DAYS_ES.map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de Celdas */}
              {loading ? (
                <SkeletonGrid />
              ) : (
                <div key={animKey} className="grid grid-cols-7 gap-px bg-slate-700/30 p-px animate-fade-in">
                  {cells.map((cell) => {
                    const cellEvents = eventsByDate[cell.date] ?? [];
                    const isToday    = cell.date === todayStr;
                    const isSelected = cell.date === selected;
                    const hasEvents  = cellEvents.length > 0;
                    const MAX_SHOW   = 2;

                    return (
                      <div
                        key={cell.date}
                        onClick={() => cell.isCurrentMonth && setSelected(cell.date)}
                        className={`min-h-17 p-1 flex flex-col items-center gap-1 transition-colors duration-200 ${
                          !cell.isCurrentMonth 
                            ? 'bg-[#0f172a]/95 opacity-40 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-indigo-500/15 cursor-pointer' 
                              : 'bg-[#0f172a] hover:bg-slate-800/80 cursor-pointer'
                        }`}
                      >
                        {/* Número del día */}
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all ${
                          isToday && !isSelected 
                            ? 'bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-md' 
                            : isSelected 
                              ? 'bg-indigo-500/30 text-indigo-300' 
                              : 'text-slate-300'
                        }`}>
                          {cell.day}
                        </span>

                        {/* Píldoras de Evento */}
                        {cell.isCurrentMonth && hasEvents && (
                          <div className="w-full flex flex-col gap-0.5 px-0.5">
                            {cellEvents.slice(0, MAX_SHOW).map((ev, i) => {
                              const cfg = getTypeConfig(ev.type);
                              return (
                                <div key={i} className={`w-full px-1 py-0.5 rounded flex items-center gap-1 ${cfg.bg}`}>
                                  <span className="text-[7px] leading-none">{cfg.emoji}</span>
                                  <span className={`text-[8px] font-bold truncate flex-1 ${cfg.text}`}>
                                    {ev.title}
                                  </span>
                                </div>
                              );
                            })}
                            {cellEvents.length > MAX_SHOW && (
                              <span className="text-[8px] font-bold text-slate-500 text-center w-full mt-0.5">
                                +{cellEvents.length - MAX_SHOW}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Indicador de "Hoy" cuando no hay eventos */}
                        {isToday && !hasEvents && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse mt-auto mb-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Detalles del Día Seleccionado ── */}
          <div className="relative z-10 px-5 pt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {(() => {
                  const [sy, sm, sd] = selected.split('-').map(Number);
                  const dObj = new Date(sy, sm - 1, sd);
                  return `${DAYS_ES[dObj.getDay()]}, ${sd} de ${MONTHS_ES[sm - 1]}`;
                })()}
              </span>
              {selectedEvents.length > 0 && (
                <span className="bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  {selectedEvents.length} Actividad{selectedEvents.length !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {selectedEvents.length === 0 ? (
              <div className="cs-glass-card p-8! flex flex-col items-center text-center border-dashed border-2 border-slate-700/50">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3">
                  <LuCalendarX className="text-slate-500 text-2xl" />
                </div>
                <p className="m-0 text-sm font-medium text-slate-400 italic">Día libre de entregas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEvents.map((ev, idx) => {
                  const cfg = getTypeConfig(ev.type);
                  return (
                    <div key={ev.id ?? idx} className="cs-glass-card p-4! flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${cfg.bg} ${cfg.border}`}>
                        <span className="text-xl">{cfg.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="m-0 text-sm font-bold text-slate-100 truncate">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {ev.subject_name && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {ev.subject_name}
                            </span>
                          )}
                          {ev.type && (
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                              {ev.type}
                            </span>
                          )}
                        </div>
                      </div>
                      {ev.weight_percentage != null && (
                        <div className="text-right shrink-0">
                          <span className={`text-lg font-black font-serif ${cfg.text}`}>
                            {ev.weight_percentage}%
                          </span>
                          <p className="m-0 mt-0.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            Peso
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