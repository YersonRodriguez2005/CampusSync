import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { subjectService, Subject } from '../services/subjectService';
import toast from 'react-hot-toast';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
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
  @keyframes cs-slideSheet {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cs-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  .cs-glass {
    background: rgba(15,23,42,0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99,102,241,0.18);
    box-shadow: 0 20px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* ── Back & FAB ── */
  .cs-back-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(165,180,252,0.85); outline: none;
    transition: background 0.18s;
  }
  .cs-back-btn:active { background: rgba(99,102,241,0.28); }

  .cs-fab {
    width: 44px; height: 44px; border-radius: 15px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: white;
    box-shadow: 0 4px 18px rgba(99,102,241,0.4);
    transition: transform 0.18s, box-shadow 0.18s; outline: none;
  }
  .cs-fab:active { transform: scale(0.94); }

  /* ── Subject card ── */
  .cs-subject-card {
    background: rgba(15,23,42,0.65);
    border: 1px solid rgba(99,102,241,0.13);
    border-radius: 20px;
    padding: 16px 18px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer;
    transition: transform 0.18s, border-color 0.18s, background 0.18s;
    animation: cs-scaleIn 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  .cs-subject-card:active { transform: scale(0.98); }
  .cs-subject-card:hover  { border-color: rgba(99,102,241,0.28); background: rgba(15,23,42,0.85); }

  /* ── Subject color dot ── */
  .cs-subject-icon {
    width: 44px; height: 44px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800;
    flex-shrink: 0;
  }

  /* ── Score pill ── */
  .cs-score-pill {
    display: inline-flex; align-items: center;
    border-radius: 20px; padding: 4px 10px;
    font-family: 'Sora', system-ui, sans-serif;
    font-size: 13px; font-weight: 700; white-space: nowrap;
  }

  /* ── Progress bar bg ── */
  .cs-progress-track {
    height: 3px; border-radius: 2px;
    background: rgba(99,102,241,0.1); overflow: hidden; margin-top: 6px;
  }
  .cs-progress-fill {
    height: 100%; border-radius: 2px;
    transition: width 0.6s cubic-bezier(.22,1,.36,1);
  }

  /* ── Edit/Delete/Project buttons ── */
  .cs-icon-btn {
    width: 34px; height: 34px; border-radius: 11px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.18s; outline: none; flex-shrink: 0;
  }

  /* ── Input ── */
  .cs-input {
    width: 100%; height: 52px; padding: 0 16px;
    border-radius: 14px; font-size: 15px;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: rgba(30,41,59,0.75);
    border: 1.5px solid rgba(99,102,241,0.14);
    color: #f1f5f9; outline: none;
    transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
    box-sizing: border-box; appearance: none;
  }
  .cs-input::placeholder { color: rgba(148,163,184,0.38); }
  .cs-input:focus {
    border-color: #6366f1; background: rgba(30,41,59,0.95);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
  }

  /* ── Slider (Range) Customization ── */
  .cs-range {
    -webkit-appearance: none; width: 100%; background: transparent; margin: 10px 0;
  }
  .cs-range::-webkit-slider-thumb {
    -webkit-appearance: none; height: 24px; width: 24px;
    border-radius: 50%; background: #a855f7; cursor: pointer;
    margin-top: -10px; box-shadow: 0 0 12px rgba(168,85,247,0.5);
    transition: transform 0.1s;
  }
  .cs-range::-webkit-slider-thumb:active { transform: scale(1.15); }
  .cs-range::-webkit-slider-runnable-track {
    width: 100%; height: 6px; cursor: pointer;
    background: rgba(99,102,241,0.2); border-radius: 3px;
  }

  /* ── Primary button ── */
  .cs-btn-primary {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: white; font-family: 'Sora', system-ui, sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    transition: transform 0.18s;
  }
  .cs-btn-primary:active { transform: scale(0.98); }

  .cs-btn-cancel {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: rgba(148,163,184,0.6); font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; background: transparent;
  }

  /* ── Label ── */
  .cs-label {
    display: block; font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.075em; text-transform: uppercase;
    color: rgba(148,163,184,0.65); margin-bottom: 8px; margin-left: 2px;
  }

  /* ── Orbs ── */
  .cs-orb-a {
    position: absolute; top: -100px; right: -70px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.26) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -50px; left: -50px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.13) 0%, transparent 68%);
    animation: cs-floatB 12s ease-in-out infinite; pointer-events: none;
  }

  /* ── Skeleton ── */
  .cs-skeleton {
    border-radius: 20px; overflow: hidden;
    background: rgba(30,41,59,0.6); position: relative;
  }
  .cs-skeleton::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.07) 50%, transparent 100%);
    background-size: 400px 100%; animation: cs-shimmer 1.6s ease-in-out infinite;
  }

  .cs-a0 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.07s both; }
  .cs-sheet { animation: cs-slideSheet 0.38s cubic-bezier(.22,1,.36,1) both; }
  .cs-section-label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(148,163,184,0.38); margin-bottom: 10px; display: block;
  }
`;

// ─── Color palette for subjects (cycles) ─────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.22)' },
  { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.22)' },
  { bg: 'rgba(34,211,238,0.12)',  color: '#22d3ee', border: 'rgba(34,211,238,0.22)' },
  { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', border: 'rgba(244,114,182,0.22)' },
  { bg: 'rgba(250,204,21,0.12)',  color: '#facc15', border: 'rgba(250,204,21,0.22)' },
];

function scoreColor(avg: number | null | undefined): { bg: string; color: string } {
  if (!avg) return { bg: 'rgba(100,116,139,0.12)', color: 'rgba(100,116,139,0.6)' };
  if (avg >= 4.0) return { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' };
  if (avg >= 3.0) return { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' };
  return              { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' };
}

// ─── Confirm delete ───────────────────────────────────────────────────────────
interface ConfirmProps { name: string; onConfirm: () => void; onCancel: () => void; }
const ConfirmDelete: React.FC<ConfirmProps> = ({ name, onConfirm, onCancel }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="cs-glass" style={{ borderRadius: '24px', padding: '32px 28px', width: '100%', maxWidth: '360px', animation: 'cs-scaleIn 0.3s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <h3 className="cs-font-display" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>¿Eliminar materia?</h3>
      <p className="cs-font-body" style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.65 }}>
        Se eliminarán <strong style={{ color: '#f1f5f9' }}>{name}</strong> y todas sus notas. Esta acción es irreversible.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="cs-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, height: '48px', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '14px', background: 'rgba(248,113,113,0.12)', color: '#f87171', fontFamily: "'Sora',sans-serif", fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRows: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="cs-skeleton" style={{ height: '78px', animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
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
    } catch (error: any) { toast.error(error); }
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
    } catch (error: any) { toast.error(error); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      await subjectService.delete(delTarget.id);
      setSubjects(subjects.filter(s => s.id !== delTarget.id));
      toast.success('Materia eliminada');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error); }
    finally { setDelTarget(null); }
  };

  // ─── Funciones del Proyector ───
  const openProjector = (subject: Subject) => {
    setProjSubject(subject);
    setProjTarget(Number(subject.target_score) || 3.0);
    // Pre-cargamos el acumulado actual si la materia ya tiene notas, sino lo dejamos vacío
    setProjAccumulated(subject.current_average ? Number(subject.current_average) : '');
    setProjPendingWeight(''); 
    setShowProjector(true);
  };

  // Lógica Matemática de Proyección
  const getRequiredScore = () => {
    if (projAccumulated === '' || projPendingWeight === '' || Number(projPendingWeight) <= 0) return null;
    
    const acc = Number(projAccumulated);
    const pend = Number(projPendingWeight) / 100;
    
    // Fórmula: (Meta - Acumulado Actual) / (Porcentaje Restante / 100)
    const required = (projTarget - acc) / pend;
    return required;
  };

  const requiredScore = getRequiredScore();

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div style={{
          minHeight: '100%',
          background: 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
          position: 'relative', paddingBottom: '40px',
        }}>

          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.09) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Header ── */}
          <div style={{ position: 'relative', padding: '52px 20px 32px', overflow: 'hidden', zIndex: 1 }}>
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            <div className="cs-a0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <button className="cs-back-btn" onClick={() => history.goBack()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button className="cs-fab" onClick={() => openModal()} aria-label="Nueva materia">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>

            <div className="cs-a1" style={{ marginTop: '24px', position: 'relative', zIndex: 2 }}>
              <h1 className="cs-font-display" style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em' }}>
                Materias
              </h1>
              <p className="cs-font-body" style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(148,163,184,0.5)', fontWeight: 500 }}>
                {subjects.length > 0 ? `${subjects.length} materia${subjects.length !== 1 ? 's' : ''} registrada${subjects.length !== 1 ? 's' : ''}` : 'Sin materias aún'}
              </p>
            </div>
          </div>

          {/* ── List ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <SkeletonRows />
            ) : subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <p className="cs-font-body" style={{ margin: 0, fontSize: '14px', color: 'rgba(148,163,184,0.4)', fontStyle: 'italic' }}>Aún no hay materias registradas.</p>
                <p className="cs-font-body" style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.25)' }}>Pulsa + para añadir una.</p>
              </div>
            ) : (
              subjects.map((subject, idx) => {
                const palette  = PALETTE[idx % PALETTE.length];
                const avg      = subject.current_average ? Number(subject.current_average) : null;
                const target   = Number(subject.target_score);
                const pct      = avg ? Math.min(avg / target, 1) : 0;
                const sc       = scoreColor(avg);
                const initials = subject.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div
                    key={subject.id}
                    className="cs-subject-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                    onClick={() => history.push(`/subjects/${subject.id}/evaluations`)}
                  >
                    {/* Icon */}
                    <div className="cs-subject-icon" style={{ background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h3 className="cs-font-display" style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {subject.name}
                        </h3>
                        <span className="cs-score-pill" style={{ background: sc.bg, color: sc.color, flexShrink: 0 }}>
                          {avg ? avg.toFixed(1) : '—'}
                        </span>
                      </div>
                      <p className="cs-font-body" style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(148,163,184,0.4)' }}>
                        Meta: <span style={{ color: 'rgba(148,163,184,0.65)', fontWeight: 600 }}>{target.toFixed(1)}</span>
                      </p>
                      <div className="cs-progress-track">
                        <div className="cs-progress-fill" style={{ width: `${pct * 100}%`, background: sc.color }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Botón de Proyección */}
                        <button
                          className="cs-icon-btn"
                          style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc' }}
                          onClick={(e) => { e.stopPropagation(); openProjector(subject); }}
                          aria-label="Proyectar nota"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                          </svg>
                        </button>
                        {/* Botón de Edición */}
                        <button
                          className="cs-icon-btn"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                          onClick={(e) => { e.stopPropagation(); openModal(subject); }}
                          aria-label="Editar materia"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Botón de Eliminación (Centrado Abajo) */}
                      <button
                        className="cs-icon-btn"
                        style={{ background: 'rgba(248,113,113,0.08)', color: 'rgba(248,113,113,0.65)', width: '100%' }}
                        onClick={(e) => { e.stopPropagation(); setDelTarget(subject); }}
                        aria-label="Eliminar materia"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                        </svg>
                      </button>
                    </div>

                    {/* Chevron */}
                    <svg style={{ color: 'rgba(99,102,241,0.35)', flexShrink: 0, marginLeft: '-4px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Projector Sheet (NUEVO) ── */}
        {showProjector && projSubject && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(2,8,23,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowProjector(false); }}
          >
            <div className="cs-glass cs-sheet" style={{ width: '100%', maxWidth: '500px', borderRadius: '28px 28px 0 0', padding: '12px 28px 48px', borderBottom: 'none' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(168,85,247,0.25)', margin: '8px auto 28px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
                <h2 className="cs-font-display" style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>
                  Simulador de Notas
                </h2>
              </div>
              <p className="cs-font-body" style={{ margin: '0 0 22px', fontSize: '13px', color: 'rgba(148,163,184,0.55)', lineHeight: 1.65 }}>
                Descubre cuánto necesitas sacar en lo que queda de <strong style={{ color: '#cbd5e1' }}>{projSubject.name}</strong> para alcanzar tu meta.
              </p>

              {/* Resultado Hero */}
              <div style={{ 
                background: requiredScore === null ? 'rgba(30,41,59,0.5)' : requiredScore > 5.0 ? 'rgba(239,68,68,0.1)' : requiredScore < 0 ? 'rgba(16,185,129,0.1)' : 'rgba(168,85,247,0.1)',
                border: `1px solid ${requiredScore === null ? 'transparent' : requiredScore > 5.0 ? 'rgba(239,68,68,0.2)' : requiredScore < 0 ? 'rgba(16,185,129,0.2)' : 'rgba(168,85,247,0.2)'}`,
                borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '24px', transition: 'all 0.3s'
              }}>
                {requiredScore === null ? (
                  <span className="cs-font-display" style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(148,163,184,0.6)' }}>Ingresa los datos para calcular...</span>
                ) : requiredScore > 5.0 ? (
                  <>
                    <span className="cs-font-display" style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>Imposible 💀</span>
                    <span className="cs-font-body" style={{ fontSize: '12px', color: 'rgba(239,68,68,0.7)', fontWeight: 500 }}>Necesitarías un {requiredScore.toFixed(2)}, lo cual supera el 5.0 máximo.</span>
                  </>
                ) : requiredScore <= 0 ? (
                  <>
                    <span className="cs-font-display" style={{ display: 'block', fontSize: '28px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>¡Meta Superada! 🎉</span>
                    <span className="cs-font-body" style={{ fontSize: '12px', color: 'rgba(16,185,129,0.7)', fontWeight: 500 }}>Ya tienes los puntos necesarios para esta nota.</span>
                  </>
                ) : (
                  <>
                    <span className="cs-font-body" style={{ display: 'block', fontSize: '12px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Necesitas sacar al menos</span>
                    <span className="cs-font-display" style={{ fontSize: '48px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{requiredScore.toFixed(1)}</span>
                  </>
                )}
              </div>

              {/* Inputs */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label className="cs-label">Nota Acumulada</label>
                  <input
                    className="cs-input" type="number" step="0.1" min="0" max="5" placeholder="Ej: 1.5"
                    value={projAccumulated} onChange={(e) => setProjAccumulated(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="cs-label">Porcentaje Restante</label>
                  <input
                    className="cs-input" type="number" step="1" min="1" max="100" placeholder="Ej: 40"
                    value={projPendingWeight} onChange={(e) => setProjPendingWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <label className="cs-label" style={{ margin: 0 }}>¿Qué nota final deseas?</label>
                  <span className="cs-font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>{projTarget.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="3.0" max="5.0" step="0.1" 
                  value={projTarget} onChange={(e) => setProjTarget(Number(e.target.value))}
                  className="cs-range"
                />
              </div>

              <button className="cs-btn-cancel" style={{ width: '100%', background: 'rgba(30,41,59,0.5)' }} onClick={() => setShowProjector(false)}>Cerrar Simulador</button>
            </div>
          </div>
        )}

        {/* ── Add / Edit Sheet ── */}
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2,8,23,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass cs-sheet" style={{ width: '100%', maxWidth: '500px', borderRadius: '28px 28px 0 0', padding: '12px 28px 48px', borderBottom: 'none' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.25)', margin: '8px auto 28px' }} />

              <h2 className="cs-font-display" style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <p className="cs-font-body" style={{ margin: '0 0 22px', fontSize: '13px', color: 'rgba(148,163,184,0.55)', lineHeight: 1.65 }}>
                Define el nombre y la nota que esperas obtener.
              </p>

              <form onSubmit={handleSave}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="cs-label">Nombre</label>
                  <input
                    className="cs-input" autoFocus required
                    placeholder="Ej: Cálculo Integral"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label className="cs-label">Nota Meta (0.0 – 5.0)</label>
                  <input
                    className="cs-input"
                    type="number" required step="0.1" min="0" max="5"
                    placeholder="4.5"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="cs-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="cs-btn-primary">
                    {editingSubject ? 'Guardar cambios' : 'Crear materia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete confirm ── */}
        {delTarget && (
          <ConfirmDelete
            name={delTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDelTarget(null)}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Subjects;