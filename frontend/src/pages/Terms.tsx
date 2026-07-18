import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LuChevronLeft, 
  LuPlus, 
  LuLayers, 
  LuTrash2, 
  LuTriangleAlert,
  LuChevronRight
} from 'react-icons/lu';
import { termService, Term } from '../services/termService';

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
      <h3 className="m-0 mb-2 text-xl font-extrabold text-slate-50 font-serif">¿Eliminar semestre?</h3>
      <p className="m-0 mb-6 text-[13px] text-slate-400 leading-relaxed font-medium">
        Se eliminarán <strong className="text-slate-200">{name}</strong> junto con todas sus materias y notas. Esta acción es irreversible.
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
      <div key={i} className="h-19 rounded-[20px] bg-slate-800/50 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Terms: React.FC = () => {
  const [terms,      setTerms]      = useState<Term[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [newName,    setNewName]    = useState('');
  const [delTarget,  setDelTarget]  = useState<Term | null>(null);
  const history = useHistory();

  const loadTerms = async () => {
    try {
      const data = await termService.getAll();
      setTerms(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al cargar semestres"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTerms(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await termService.create(newName);
      setTerms([created, ...terms]);
      setNewName(''); setShowModal(false);
      toast.success('Semestre creado correctamente');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al crear semestre"); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      await termService.delete(delTarget.id);
      setTerms(terms.filter(t => t.id !== delTarget.id));
      toast.success('Semestre eliminado');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error.message || "Error al eliminar semestre"); }
    finally { setDelTarget(null); }
  };

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
                onClick={() => setShowModal(true)} 
                className="w-12 h-12 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
              >
                <LuPlus className="text-2xl" />
              </button>
            </div>

            <div>
              <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">Mis Semestres</h1>
              <p className="mt-1 text-sm text-slate-400 font-medium">
                {terms.length > 0 ? `${terms.length} periodo${terms.length !== 1 ? 's' : ''} registrado${terms.length !== 1 ? 's' : ''}` : 'Organiza tus periodos académicos'}
              </p>
            </div>
          </div>

          {/* ── Listado de Semestres ── */}
          <div className="relative z-10 px-5 flex flex-col gap-3">
            {loading ? (
              <SkeletonRows />
            ) : terms.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center mb-4">
                  <LuLayers className="text-indigo-400 text-3xl opacity-80" />
                </div>
                <p className="text-slate-400 text-sm italic font-medium m-0">No tienes semestres registrados.</p>
                <p className="text-slate-500 text-xs mt-1">Toca el botón + para añadir uno.</p>
              </div>
            ) : (
              terms.map((term, idx) => (
                <div
                  key={term.id}
                  onClick={() => history.push(`/terms/${term.id}/subjects`)}
                  className="group bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-[22px] p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/60 hover:border-indigo-500/30 active:scale-[0.98] transition-all animate-slide-up shadow-lg"
                  style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                >
                  {/* Info Central */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Status Dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                      term.is_active ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-500/40'
                    }`} />
                    
                    <div className="min-w-0">
                      <h3 className="m-0 text-[15px] font-bold text-slate-100 truncate font-serif">
                        {term.name}
                      </h3>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                        term.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                      }`}>
                        {term.is_active ? 'Activo' : 'Finalizado'}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDelTarget(term); }}
                      className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all opacity-80 hover:opacity-100"
                      aria-label="Eliminar semestre"
                    >
                      <LuTrash2 className="text-[15px]" />
                    </button>
                    <LuChevronRight className="text-slate-500 text-lg group-hover:text-indigo-400 transition-colors group-hover:translate-x-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Modal Agregar Semestre (Glass Sheet) ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-[#020817]/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass-sheet w-full max-w-125 animate-sheet-up">
              <div className="w-10 h-1.5 rounded-full bg-indigo-500/20 mx-auto mb-6" />
              
              <h2 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif mb-1">
                Nuevo Semestre
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                Ingresa el nombre del periodo académico.
              </p>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <input
                    className="cs-soft-input"
                    autoFocus required
                    placeholder="Ej: Semestre 2026-1"
                    value={newName} onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-13 rounded-2xl font-bold text-slate-400 bg-slate-800/50 hover:bg-slate-800/80 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="cs-btn-primary">
                    Crear Periodo
                  </button>
                </div>
              </form>
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

export default Terms;