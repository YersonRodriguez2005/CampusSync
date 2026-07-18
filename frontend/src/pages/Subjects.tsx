import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { 
  LuChevronLeft, 
  LuPlus, 
  LuCalculator, 
  LuPen, 
  LuTrash2, 
  LuTriangleAlert,
  LuBookOpen
} from 'react-icons/lu';
import { subjectService, Subject } from '../services/subjectService';
import toast from 'react-hot-toast';

// ─── Paleta de colores para los íconos de las materias (Tailwind Classes) ────
const PALETTE = [
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
];

// Helper para colores de notas
function getScoreClasses(avg: number | null | undefined): { pill: string; fill: string } {
  if (!avg) return { pill: 'bg-slate-700/30 text-slate-400', fill: 'bg-slate-600' };
  if (avg >= 4.0) return { pill: 'bg-emerald-500/15 text-emerald-400', fill: 'bg-emerald-400' };
  if (avg >= 3.0) return { pill: 'bg-indigo-500/15 text-indigo-400', fill: 'bg-indigo-400' };
  return { pill: 'bg-orange-500/15 text-orange-400', fill: 'bg-orange-400' };
}

// ─── Confirm Delete Modal (Glassmorphism) ─────────────────────────────────────
interface ConfirmProps { name: string; onConfirm: () => void; onCancel: () => void; }
const ConfirmDelete: React.FC<ConfirmProps> = ({ name, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-60 bg-[#020817]/85 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="cs-glass-card w-full max-w-90 animate-slide-up" style={{ animationDuration: '0.3s' }}>
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <LuTriangleAlert className="text-red-400 text-2xl" />
      </div>
      <h3 className="m-0 mb-2 text-xl font-extrabold text-slate-50 font-serif">¿Eliminar materia?</h3>
      <p className="m-0 mb-6 text-[13px] text-slate-400 leading-relaxed font-medium">
        Se eliminarán <strong className="text-slate-200">{name}</strong> y todas sus notas. Esta acción es irreversible.
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
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-21 rounded-2xl bg-slate-800/50 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Subjects: React.FC = () => {
  const { termId } = useParams<{ termId: string }>();
  const history    = useHistory();

  // Estados Base
  const [subjects,        setSubjects]        = useState<Subject[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [editingSubject,  setEditingSubject]  = useState<Subject | null>(null);
  const [name,            setName]            = useState('');
  const [targetScore,     setTargetScore]     = useState<number | ''>('');
  const [delTarget,       setDelTarget]       = useState<Subject | null>(null);

  // Estados para el Motor de Proyección
  const [showProjector,       setShowProjector]       = useState(false);
  const [projSubject,         setProjSubject]         = useState<Subject | null>(null);
  const [projAccumulated,     setProjAccumulated]     = useState<number | ''>('');
  const [projPendingWeight,   setProjPendingWeight]   = useState<number | ''>('');
  const [projTarget,          setProjTarget]          = useState<number>(3.0);

  const loadData = async () => {
    try {
      const data = await subjectService.getByTerm(termId);
      setSubjects(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al cargar materias"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [termId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setName(subject.name);
      setTargetScore(subject.target_score);
    } else {
      setEditingSubject(null);
      setName(''); setTargetScore('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetScore === '') return;
    try {
      if (editingSubject) {
        const updated = await subjectService.update(editingSubject.id, { name, target_score: Number(targetScore) });
        setSubjects(subjects.map(s => s.id === editingSubject.id ? updated : s));
        toast.success('Materia actualizada');
      } else {
        const created = await subjectService.create({ term_id: termId, name, target_score: Number(targetScore) });
        setSubjects([created, ...subjects]);
        toast.success('Materia creada');
      }
      setShowModal(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al guardar"); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      await subjectService.delete(delTarget.id);
      setSubjects(subjects.filter(s => s.id !== delTarget.id));
      toast.success('Materia eliminada');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al eliminar"); }
    finally { setDelTarget(null); }
  };

  // ─── Funciones del Proyector ───
  const openProjector = (subject: Subject) => {
    setProjSubject(subject);
    setProjTarget(Number(subject.target_score) || 3.0);
    setProjAccumulated(subject.current_average ? Number(subject.current_average) : '');
    setProjPendingWeight(''); 
    setShowProjector(true);
  };

  const getRequiredScore = () => {
    if (projAccumulated === '' || projPendingWeight === '' || Number(projPendingWeight) <= 0) return null;
    const acc = Number(projAccumulated);
    const pend = Number(projPendingWeight) / 100;
    return (projTarget - acc) / pend;
  };

  const requiredScore = getRequiredScore();

  return (
    <IonPage>
      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div className="min-h-full bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative pb-10 overflow-hidden">

          {/* ── Orbes y Malla (GPU Accelerated) ── */}
          <div className="absolute -top-24 -right-20 w-75 h-75 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute top-[30%] -left-12 w-50 h-50 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
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
                onClick={() => openModal()} 
                className="w-12 h-12 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
              >
                <LuPlus className="text-2xl" />
              </button>
            </div>

            <div>
              <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">Materias</h1>
              <p className="mt-1 text-sm text-slate-400 font-medium">
                {subjects.length > 0 ? `${subjects.length} registrada${subjects.length !== 1 ? 's' : ''}` : 'Organiza tus asignaturas'}
              </p>
            </div>
          </div>

          {/* ── Listado de Materias ── */}
          <div className="relative z-10 px-5 flex flex-col gap-3">
            {loading ? (
              <SkeletonRows />
            ) : subjects.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-4">
                  <LuBookOpen className="text-indigo-400 text-3xl opacity-80" />
                </div>
                <p className="text-slate-400 text-sm italic font-medium m-0">Aún no hay materias registradas.</p>
                <p className="text-slate-500 text-xs mt-1">Toca el botón + para añadir una.</p>
              </div>
            ) : (
              subjects.map((subject, idx) => {
                const palette  = PALETTE[idx % PALETTE.length];
                const avg      = subject.current_average ? Number(subject.current_average) : null;
                const target   = Number(subject.target_score);
                const pct      = avg ? Math.min(avg / target, 1) : 0;
                const sc       = getScoreClasses(avg);
                const initials = subject.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div
                    key={subject.id}
                    onClick={() => history.push(`/subjects/${subject.id}/evaluations`)}
                    className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-[20px] p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/60 hover:border-indigo-500/30 active:scale-[0.98] transition-all animate-slide-up shadow-lg"
                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                  >
                    {/* Avatar Iniciales */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold font-serif shrink-0 border shadow-sm ${palette}`}>
                      {initials}
                    </div>

                    {/* Información Central */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="m-0 text-sm font-bold text-slate-100 truncate">
                          {subject.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono shrink-0 ${sc.pill}`}>
                          {avg ? avg.toFixed(1) : '—'}
                        </span>
                      </div>
                      <p className="m-0 mt-1 text-[11px] text-slate-400 font-medium">
                        Meta: <span className="text-slate-300 font-bold">{target.toFixed(1)}</span>
                      </p>
                      
                      {/* Barra de Progreso */}
                      <div className="h-1.5 w-full bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${sc.fill}`} 
                          style={{ width: `${pct * 100}%` }} 
                        />
                      </div>
                    </div>

                    {/* Botones de Acción (Soft UI) */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openProjector(subject); }}
                          className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all"
                        >
                          <LuCalculator className="text-sm" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(subject); }}
                          className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 active:scale-95 transition-all"
                        >
                          <LuPen className="text-sm" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDelTarget(subject); }}
                        className="w-full h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"
                      >
                        <LuTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Modal Agregar / Editar Materia (Glass Sheet) ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-[#020817]/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass-sheet w-full max-w-125 animate-sheet-up">
              <div className="w-10 h-1.5 rounded-full bg-indigo-500/20 mx-auto mb-6" />
              
              <h2 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif mb-1">
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                Define el nombre y la nota que esperas obtener.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre</label>
                  <input
                    className="cs-soft-input"
                    autoFocus required
                    placeholder="Ej: Cálculo Integral"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nota Meta (0.0 - 5.0)</label>
                  <input
                    className="cs-soft-input"
                    type="number" required step="0.1" min="0" max="5"
                    placeholder="Ej: 4.5"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-13 rounded-2xl font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800/80 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="cs-btn-primary">
                    {editingSubject ? 'Guardar cambios' : 'Crear materia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Simulador de Notas (Proyector) ── */}
        {showProjector && projSubject && (
          <div
            className="fixed inset-0 z-50 bg-[#020817]/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowProjector(false); }}
          >
            <div className="cs-glass-sheet w-full max-w-125 animate-sheet-up">
              <div className="w-10 h-1.5 rounded-full bg-purple-500/20 mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-2">
                <LuCalculator className="text-2xl text-purple-400" />
                <h2 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif">
                  Simulador de Notas
                </h2>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                Calcula cuánto necesitas en <strong className="text-slate-200">{projSubject.name}</strong> para alcanzar tu meta.
              </p>

              {/* Resultado Neumórfico Dinámico */}
              <div className={`p-6 rounded-3xl text-center mb-6 transition-all duration-300 border shadow-inner ${
                requiredScore === null 
                  ? 'bg-slate-800/40 border-slate-700/50' 
                  : requiredScore > 5.0 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : requiredScore < 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-purple-500/10 border-purple-500/20'
              }`}>
                {requiredScore === null ? (
                  <span className="text-sm font-bold text-slate-400">Ingresa los datos para calcular...</span>
                ) : requiredScore > 5.0 ? (
                  <>
                    <span className="block text-3xl font-black text-red-400 mb-1 font-serif">Imposible 💀</span>
                    <span className="text-xs text-red-400/80 font-medium">Necesitarías un {requiredScore.toFixed(2)}, lo cual supera el 5.0 máximo.</span>
                  </>
                ) : requiredScore <= 0 ? (
                  <>
                    <span className="block text-3xl font-black text-emerald-400 mb-1 font-serif">¡Meta Superada! 🎉</span>
                    <span className="text-xs text-emerald-400/80 font-medium">Ya tienes los puntos necesarios para esta nota.</span>
                  </>
                ) : (
                  <>
                    <span className="block text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">Necesitas sacar al menos</span>
                    <span className="text-5xl font-black text-slate-50 leading-none font-serif">{requiredScore.toFixed(1)}</span>
                  </>
                )}
              </div>

              {/* Inputs de Simulación */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nota Acumulada</label>
                  <input
                    className="cs-soft-input font-mono! font-bold!" type="number" step="0.1" min="0" max="5" placeholder="Ej: 1.5"
                    value={projAccumulated} onChange={(e) => setProjAccumulated(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">% Restante</label>
                  <input
                    className="cs-soft-input font-mono! font-bold!" type="number" step="1" min="1" max="100" placeholder="Ej: 40"
                    value={projPendingWeight} onChange={(e) => setProjPendingWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Slider Meta */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">¿Qué nota final deseas?</label>
                  <span className="text-lg font-black text-purple-400 font-serif">{projTarget.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="3.0" max="5.0" step="0.1" 
                  value={projTarget} onChange={(e) => setProjTarget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <button onClick={() => setShowProjector(false)} className="w-full h-14 rounded-2xl font-bold text-slate-300 bg-slate-800/60 hover:bg-slate-800 transition-colors">
                Cerrar Simulador
              </button>
            </div>
          </div>
        )}

        {/* ── Confirm Delete ── */}
        {delTarget && (
          <ConfirmDelete name={delTarget.name} onConfirm={confirmDelete} onCancel={() => setDelTarget(null)} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Subjects;