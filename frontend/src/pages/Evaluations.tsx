import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { 
  LuChevronLeft, 
  LuPlus, 
  LuPen, 
  LuTrash2, 
  LuTriangleAlert,
  LuFileText,
  LuCalendar
} from 'react-icons/lu';
import { evaluationService, Evaluation } from '../services/evaluationService';
import toast from 'react-hot-toast';

// ─── Helpers para Notas ───────────────────────────────────────────────────────
function getScoreClasses(s: number | null): { bg: string; color: string; fill: string; grad: string } {
  if (s === null) return { bg: 'bg-slate-700/30', color: 'text-slate-400', fill: 'bg-slate-600', grad: 'from-slate-600 to-slate-500' };
  if (s >= 4.0) return { bg: 'bg-emerald-500/15', color: 'text-emerald-400', fill: 'bg-emerald-400', grad: 'from-emerald-400 to-emerald-500' };
  if (s >= 3.0) return { bg: 'bg-indigo-500/15',  color: 'text-indigo-400',  fill: 'bg-indigo-400',  grad: 'from-indigo-400 to-indigo-500' };
  return { bg: 'bg-orange-500/15', color: 'text-orange-400', fill: 'bg-orange-400', grad: 'from-orange-400 to-orange-500' };
}

function getGlobalTrackGradient(totalW: number): string {
  if (totalW >= 100) return 'from-emerald-400 to-emerald-500';
  return 'from-indigo-500 to-purple-500';
}

// ─── Confirm Delete Modal (Glassmorphism) ─────────────────────────────────────
interface ConfirmProps { title: string; onConfirm: () => void; onCancel: () => void; }
const ConfirmDelete: React.FC<ConfirmProps> = ({ title, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-60 bg-[#020817]/85 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="cs-glass-card w-full max-w-90 animate-slide-up" style={{ animationDuration: '0.3s' }}>
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <LuTriangleAlert className="text-red-400 text-2xl" />
      </div>
      <h3 className="m-0 mb-2 text-xl font-extrabold text-slate-50 font-serif">¿Eliminar evaluación?</h3>
      <p className="m-0 mb-3 text-[13px] text-slate-400 leading-relaxed font-medium">
        Se eliminará <strong className="text-slate-200">"{title}"</strong> y afectará tu promedio actual.
      </p>
      <p className="m-0 mb-6 text-xs text-red-400/80 font-bold uppercase tracking-wider">
        Esta acción es irreversible.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 h-12 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} className="flex-1 h-12 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold active:scale-95 transition-all">
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRows: React.FC = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-22.5 rounded-[20px] bg-slate-800/50 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Evaluations: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const history = useHistory();

  const [evaluations,  setEvaluations]  = useState<Evaluation[]>([]);
  const [metrics,      setMetrics]      = useState({ total_weight: 0, current_score: '0.0' });
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editingEval,  setEditingEval]  = useState<Evaluation | null>(null);
  const [delTarget,    setDelTarget]    = useState<Evaluation | null>(null);
  
  // Estados del Formulario Unificados
  const [title,        setTitle]        = useState('');
  const [weight,       setWeight]       = useState<number | ''>('');
  const [score,        setScore]        = useState<number | ''>('');
  const [dueDate,      setDueDate]      = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const data = await evaluationService.getBySubject(subjectId);
      setEvaluations(data);
      const totalW = data.reduce((acc, curr) => acc + Number(curr.weight_percentage), 0);
      setMetrics(prev => ({ ...prev, total_weight: totalW }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al cargar evaluaciones"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = (ev?: Evaluation) => {
    if (ev) {
      setEditingEval(ev);
      setTitle(ev.title);
      setWeight(ev.weight_percentage);
      setScore(ev.score === null ? '' : ev.score);
      setDueDate(ev.due_date ? ev.due_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setEditingEval(null);
      setTitle(''); setWeight(''); setScore('');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
    setShowModal(true);
  };

  const notifyDashboardUpdate = () => {
    window.dispatchEvent(new CustomEvent('grades-updated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || weight === '') return;
    try {
      const payload = { 
        subject_id: subjectId, 
        title, 
        weight_percentage: Number(weight), 
        score: score === '' ? null : Number(score),
        due_date: dueDate
      };

      if (editingEval) {
        const res = await evaluationService.update(editingEval.id, payload);
        setEvaluations(evaluations.map(ev => ev.id === editingEval.id ? res.evaluation : ev));
        setMetrics({ total_weight: res.subject_metrics.total_weight_assigned, current_score: res.subject_metrics.current_accumulated_score });
        toast.success('Nota actualizada');
      } else {
        const res = await evaluationService.create(payload);
        setEvaluations([...evaluations, res.evaluation]);
        setMetrics({ total_weight: res.subject_metrics.total_weight_assigned, current_score: res.subject_metrics.current_accumulated_score });
        toast.success('Actividad registrada');
      }
      setShowModal(false);
      notifyDashboardUpdate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al guardar"); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      const res = await evaluationService.delete(delTarget.id);
      setEvaluations(evaluations.filter(ev => ev.id !== delTarget.id));
      setMetrics({ total_weight: res.subject_metrics.total_weight_assigned, current_score: res.subject_metrics.current_accumulated_score });
      toast.success('Nota eliminada');
      notifyDashboardUpdate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al eliminar"); }
    finally { setDelTarget(null); }
  };

  const avg        = Number(metrics.current_score);
  const totalW     = metrics.total_weight;
  const weightPct  = Math.min(totalW, 100);
  const mainScoreC = getScoreClasses(avg > 0 ? avg : null);

  const remaining  = 100 - totalW;
  const pendingW   = evaluations.filter(ev => ev.score === null).reduce((a, ev) => a + Number(ev.weight_percentage), 0);
  
  return (
    <IonPage>
      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div className="min-h-full bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative pb-28 overflow-hidden">

          {/* ── Orbes y Malla (GPU Accelerated) ── */}
          <div className="absolute -top-24 -right-16 w-65 h-65 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute top-[25%] -left-12 w-45 h-45 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] bg-size-[28px_28px] z-0" />

          {/* ── Header ── */}
          <div className="relative z-10 pt-14 px-6 pb-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-3.5 mb-6">
              <button 
                onClick={() => history.goBack()} 
                className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-95 transition-all"
              >
                <LuChevronLeft className="text-2xl" />
              </button>
              <div>
                <h1 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif">Calificaciones</h1>
                <p className="m-0 mt-1 text-xs text-slate-400 font-medium">
                  {evaluations.length} evaluación{evaluations.length !== 1 ? 'es' : ''} registrada{evaluations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* ── Hero Metric Card (Glassmorphism) ── */}
            <div className="cs-glass-card p-6! animate-slide-up shadow-xl" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-between items-start">
                
                {/* Promedio Actual */}
                <div>
                  <p className="m-0 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Promedio actual
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-[46px] font-extrabold leading-none font-serif tracking-tighter ${mainScoreC.color}`}>
                      {avg > 0 ? avg.toFixed(1) : '—'}
                    </span>
                    {avg > 0 && (
                      <span className="text-sm font-bold text-slate-500">/5.0</span>
                    )}
                  </div>
                </div>

                {/* Peso Asignado */}
                <div className="text-right">
                  <p className="m-0 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Peso asignado
                  </p>
                  <span className={`text-[26px] font-extrabold leading-none font-serif ${totalW >= 100 ? 'text-emerald-400' : 'text-slate-50'}`}>
                    {totalW}%
                  </span>
                  {remaining > 0 && (
                    <p className="m-0 mt-1 text-[10px] text-slate-500 font-bold">
                      {remaining}% sin asignar
                    </p>
                  )}
                </div>
              </div>

              {/* Barra de Peso Global */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full mt-5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-linear-to-r ${getGlobalTrackGradient(totalW)}`} 
                  style={{ width: `${weightPct}%` }} 
                />
              </div>

              {/* Chips de Estado */}
              {!loading && evaluations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {totalW >= 100 && (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      Peso completo
                    </span>
                  )}
                  {pendingW > 0 && (
                    <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                      ⏳ {pendingW}% pdte. calificar
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Evaluation List ── */}
          <div className="relative z-10 px-5 flex flex-col gap-3">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
              Actividades evaluativas
            </span>

            {loading ? (
              <SkeletonRows />
            ) : evaluations.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-4">
                  <LuFileText className="text-indigo-400 text-3xl opacity-80" />
                </div>
                <p className="text-slate-400 text-sm italic font-medium m-0">Sin actividades registradas.</p>
                <p className="text-slate-500 text-xs mt-1">Pulsa el botón + para añadir una.</p>
              </div>
            ) : (
              evaluations.map((ev, idx) => {
                const s  = ev.score !== null ? Number(ev.score) : null;
                const sc = getScoreClasses(s);
                const w  = Number(ev.weight_percentage);

                return (
                  <div
                    key={ev.id}
                    className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-[20px] p-4 hover:border-indigo-500/30 transition-all animate-slide-up shadow-lg"
                    style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      
                      {/* Título y Fecha */}
                      <div className="flex-1 min-w-0">
                        <h3 className="m-0 text-sm font-bold text-slate-100 truncate">
                          {ev.title}
                        </h3>
                        {ev.due_date && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 font-medium">
                            <LuCalendar className="text-slate-500" />
                            {ev.due_date.split('T')[0]}
                          </div>
                        )}
                      </div>

                      {/* Nota Badge & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`flex items-center justify-center min-w-12.5 h-8 rounded-xl text-sm font-extrabold font-serif ${sc.bg} ${sc.color} border border-white/5`}>
                          {s !== null ? s.toFixed(1) : '—'}
                        </span>
                        
                        <button
                          onClick={() => openModal(ev)}
                          className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                          <LuPen className="text-sm" />
                        </button>
                        
                        <button
                          onClick={() => setDelTarget(ev)}
                          className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all opacity-80 hover:opacity-100"
                        >
                          <LuTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Weight Bar Inferior */}
                    <div className="flex items-center gap-3 mt-3.5">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-mono">
                        {w}%
                      </span>
                      <div className="h-1 flex-1 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${w}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Botón Flotante (FAB) ── */}
        <button 
          onClick={() => openModal()} 
          className="fixed bottom-7 right-6 w-14 h-14 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] active:scale-95 transition-all z-40"
        >
          <LuPlus className="text-2xl" />
        </button>

        {/* ── Modal Agregar / Editar Evaluación (Glass Sheet) ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-[#020817]/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass-sheet w-full max-w-125 animate-sheet-up">
              <div className="w-10 h-1.5 rounded-full bg-indigo-500/20 mx-auto mb-6" />
              
              <h2 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif mb-1">
                {editingEval ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                Registra el título, peso porcentual, fecha y nota obtenida.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título</label>
                  <input
                    className="cs-soft-input"
                    autoFocus required
                    placeholder="Ej: Taller 1"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha de Entrega</label>
                  <input
                    className="cs-soft-input" 
                    type="date" required
                    value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    style={{ colorScheme: 'dark' }} // Forzar calendario oscuro en navegadores
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Peso %</label>
                    <input
                      className="cs-soft-input font-mono! font-bold!"
                      type="number" required min="1" max="100" placeholder="Ej: 20"
                      value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nota (0.0 - 5.0)</label>
                    <input
                      className="cs-soft-input font-mono! font-bold!"
                      type="number" step="0.1" min="0" max="5" placeholder="Opcional"
                      value={score} onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Hint: Peso Restante */}
                {!editingEval && remaining > 0 && (
                  <p className="m-0 ml-1 text-[11px] text-slate-400 font-medium">
                    Peso disponible en la materia: <strong className="text-indigo-400">{remaining}%</strong>
                  </p>
                )}

                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-13 rounded-2xl font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800/80 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="cs-btn-primary">
                    {editingEval ? 'Guardar cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Confirm Delete ── */}
        {delTarget && (
          <ConfirmDelete title={delTarget.title} onConfirm={confirmDelete} onCancel={() => setDelTarget(null)} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Evaluations;