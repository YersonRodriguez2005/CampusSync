import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { evaluationService, Evaluation } from '../services/evaluationService';
import toast from 'react-hot-toast';

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
  @keyframes cs-barGrow {
    from { width: 0; }
    to   { width: var(--bar-w); }
  }
  @keyframes cs-spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes cs-countPop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.06); }
    100% { transform: scale(1);   opacity: 1; }
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

  /* ── Hero metric card ── */
  .cs-hero-card {
    border-radius: 26px; padding: 26px 24px;
    position: relative; overflow: hidden;
  }

  /* ── Orbs ── */
  .cs-orb-a {
    position: absolute; top: -90px; right: -70px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -50px; left: -50px;
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
    transition: background 0.18s;
  }
  .cs-back-btn:active { background: rgba(99,102,241,0.28); }

  /* ── FAB ── */
  .cs-fab {
    position: fixed; bottom: 28px; right: 22px;
    width: 56px; height: 56px; border-radius: 20px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: white;
    box-shadow: 0 8px 32px rgba(99,102,241,0.5);
    transition: transform 0.18s, box-shadow 0.18s; outline: none; z-index: 40;
  }
  .cs-fab:active { transform: scale(0.94); box-shadow: 0 4px 16px rgba(99,102,241,0.35); }

  /* ── Evaluation row card ── */
  .cs-eval-card {
    background: rgba(15,23,42,0.65);
    border: 1px solid rgba(99,102,241,0.13);
    border-radius: 20px; padding: 16px 18px;
    animation: cs-scaleIn 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  .cs-eval-card:hover { border-color: rgba(99,102,241,0.26); }

  /* ── Weight bar ── */
  .cs-weight-track {
    height: 3px; border-radius: 2px; background: rgba(99,102,241,0.1);
    overflow: hidden; margin-top: 8px; flex: 1;
  }
  .cs-weight-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    animation: cs-barGrow 0.8s cubic-bezier(.22,1,.36,1) both;
  }

  /* ── Score badge ── */
  .cs-score-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 52px; height: 32px; border-radius: 10px; padding: 0 10px;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800;
  }

  /* ── Weight chip ── */
  .cs-weight-chip {
    display: inline-flex; align-items: center;
    background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.18);
    border-radius: 20px; padding: 3px 10px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.04em; color: #818cf8;
  }

  /* ── Pending chip ── */
  .cs-pending-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.18);
    border-radius: 20px; padding: 3px 10px;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.04em; color: #fb923c;
  }

  /* ── Icon action buttons ── */
  .cs-icon-btn {
    width: 34px; height: 34px; border-radius: 11px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.18s; outline: none;
  }

  /* ── Metric number pop ── */
  .cs-metric-pop { animation: cs-countPop 0.5s cubic-bezier(.22,1,.36,1) both; }

  /* ── Input ── */
  .cs-input {
    width: 100%; height: 52px; padding: 0 16px;
    border-radius: 14px; font-size: 15px;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: rgba(30,41,59,0.75);
    border: 1.5px solid rgba(99,102,241,0.14); color: #f1f5f9;
    outline: none; transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
    box-sizing: border-box; appearance: none;
  }
  .cs-input::placeholder { color: rgba(148,163,184,0.38); }
  .cs-input:focus {
    border-color: #6366f1; background: rgba(30,41,59,0.95);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
  }
  /* Estilo especial para el input de tipo date con icono oscuro nativo */
  .cs-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.6;
    cursor: pointer;
  }

  .cs-label {
    display: block; font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.075em;
    text-transform: uppercase; color: rgba(148,163,184,0.65);
    margin-bottom: 8px; margin-left: 2px;
  }

  .cs-btn-primary {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: white; font-family: 'Sora', system-ui, sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 20px rgba(99,102,241,0.35); transition: transform 0.18s;
  }
  .cs-btn-primary:active { transform: scale(0.98); }

  .cs-btn-cancel {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: rgba(148,163,184,0.6); font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; background: transparent;
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

  /* ── Global weight progress bar ── */
  .cs-global-track {
    height: 6px; border-radius: 3px; background: rgba(15,23,42,0.5);
    overflow: hidden; margin-top: 12px;
  }
  .cs-global-fill {
    height: 100%; border-radius: 3px;
    transition: width 0.8s cubic-bezier(.22,1,.36,1);
  }

  .cs-a0 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.07s both; }
  .cs-a2 { animation: cs-fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.14s both; }
  .cs-sheet { animation: cs-slideSheet 0.38s cubic-bezier(.22,1,.36,1) both; }

  .cs-section-label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(148,163,184,0.38);
    margin-bottom: 10px; display: block;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number | null): { bg: string; color: string } {
  if (s === null) return { bg: 'rgba(100,116,139,0.1)', color: 'rgba(100,116,139,0.5)' };
  if (s >= 4.0) return { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' };
  if (s >= 3.0) return { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' };
  return              { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' };
}

function avgColor(v: number): string {
  if (v >= 4.0) return '#34d399';
  if (v >= 3.0) return '#818cf8';
  if (v >  0)   return '#fb923c';
  return 'rgba(148,163,184,0.5)';
}

// ─── Confirm delete ───────────────────────────────────────────────────────────
interface ConfirmProps { title: string; onConfirm: () => void; onCancel: () => void; }
const ConfirmDelete: React.FC<ConfirmProps> = ({ title, onConfirm, onCancel }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="cs-glass" style={{ borderRadius: '24px', padding: '32px 28px', width: '100%', maxWidth: '360px', animation: 'cs-scaleIn 0.3s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <h3 className="cs-font-display" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>¿Eliminar evaluación?</h3>
      <p className="cs-font-body" style={{ margin: '0 0 6px', fontSize: '13px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.65 }}>
        Se eliminará <strong style={{ color: '#f1f5f9' }}>"{title}"</strong> y afectará tu promedio actual.
      </p>
      <p className="cs-font-body" style={{ margin: '0 0 24px', fontSize: '12px', color: 'rgba(248,113,113,0.6)', fontWeight: 600 }}>
        Esta acción es irreversible.
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
    {[1, 2, 3].map((i) => (
      <div key={i} className="cs-skeleton" style={{ height: '90px', animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Evaluations: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const history = useHistory();

  const [evaluations,      setEvaluations]      = useState<Evaluation[]>([]);
  const [metrics,          setMetrics]          = useState({ total_weight: 0, current_score: '0.0' });
  const [loading,          setLoading]          = useState(true);
  const [showModal,        setShowModal]        = useState(false);
  const [editingEval,      setEditingEval]      = useState<Evaluation | null>(null);
  const [delTarget,        setDelTarget]        = useState<Evaluation | null>(null);
  
  // Estados del Formulario Unificados
  const [title,            setTitle]            = useState('');
  const [weight,           setWeight]           = useState<number | ''>('');
  const [score,            setScore]            = useState<number | ''>('');
  const [dueDate,          setDueDate]          = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const data = await evaluationService.getBySubject(subjectId);
      setEvaluations(data);
      const totalW = data.reduce((acc, curr) => acc + Number(curr.weight_percentage), 0);
      setMetrics(prev => ({ ...prev, total_weight: totalW }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [subjectId]);

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

  // --- SOLUCIÓN: Función para avisar al Dashboard ---
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
      
      // Lanzamos el evento tras una actualización exitosa
      notifyDashboardUpdate();
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      const res = await evaluationService.delete(delTarget.id);
      setEvaluations(evaluations.filter(ev => ev.id !== delTarget.id));
      setMetrics({ total_weight: res.subject_metrics.total_weight_assigned, current_score: res.subject_metrics.current_accumulated_score });
      toast.success('Nota eliminada');
      
      // Lanzamos el evento tras eliminar exitosamente
      notifyDashboardUpdate();
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error); }
    finally { setDelTarget(null); }
  };

  const avg        = Number(metrics.current_score);
  const totalW     = metrics.total_weight;
  const weightPct  = Math.min(totalW, 100);
  const mainColor  = avgColor(avg);

  const remaining  = 100 - totalW;
  const pendingW   = evaluations.filter(ev => ev.score === null).reduce((a, ev) => a + Number(ev.weight_percentage), 0);
  
  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY>
        <div style={{
          minHeight: '100%',
          background: 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
          position: 'relative', paddingBottom: '100px',
        }}>

          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.09) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Page header ── */}
          <div style={{ position: 'relative', padding: '52px 20px 24px', overflow: 'hidden', zIndex: 1 }}>
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            {/* Back row */}
            <div className="cs-a0" style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2, marginBottom: '24px' }}>
              <button className="cs-back-btn" onClick={() => history.goBack()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div>
                <h1 className="cs-font-display" style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>Calificaciones</h1>
                <p className="cs-font-body" style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.45)', fontWeight: 500 }}>
                  {evaluations.length} evaluación{evaluations.length !== 1 ? 'es' : ''} registrada{evaluations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* ── Hero metric card ── */}
            <div className="cs-glass cs-hero-card cs-a1">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div>
                  <p className="cs-font-body" style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)' }}>
                    Promedio actual
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span key={avg} className="cs-font-display cs-metric-pop" style={{ fontSize: '52px', fontWeight: 800, color: mainColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {avg > 0 ? avg.toFixed(1) : '—'}
                    </span>
                    {avg > 0 && (
                      <span className="cs-font-body" style={{ fontSize: '14px', color: 'rgba(148,163,184,0.4)', fontWeight: 500 }}>/5.0</span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p className="cs-font-body" style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)' }}>
                    Peso asignado
                  </p>
                  <span className="cs-font-display" style={{ fontSize: '28px', fontWeight: 800, color: totalW >= 100 ? '#34d399' : '#f1f5f9', lineHeight: 1 }}>
                    {totalW}%
                  </span>
                  {remaining > 0 && (
                    <p className="cs-font-body" style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(148,163,184,0.35)' }}>
                      {remaining}% sin asignar
                    </p>
                  )}
                </div>
              </div>

              <div className="cs-global-track" style={{ marginTop: '18px' }}>
                <div
                  className="cs-global-fill"
                  style={{
                    width: `${weightPct}%`,
                    background: totalW >= 100
                      ? 'linear-gradient(90deg, #34d399, #10b981)'
                      : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>

              {!loading && evaluations.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {totalW >= 100 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#34d399', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                      Peso completo
                    </span>
                  )}
                  {pendingW > 0 && (
                    <span className="cs-pending-chip">
                      ⏳ {pendingW}% pendiente de calificar
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Evaluation list ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="cs-section-label cs-a2">Actividades evaluativas</span>

            {loading ? (
              <SkeletonRows />
            ) : evaluations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <p className="cs-font-body" style={{ margin: 0, fontSize: '14px', color: 'rgba(148,163,184,0.4)', fontStyle: 'italic' }}>Sin actividades registradas.</p>
                <p className="cs-font-body" style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.25)' }}>Pulsa + para añadir una.</p>
              </div>
            ) : (
              evaluations.map((ev, idx) => {
                const s  = ev.score !== null ? Number(ev.score) : null;
                const sc = scoreColor(s);
                const w  = Number(ev.weight_percentage);

                return (
                  <div
                    key={ev.id}
                    className="cs-eval-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="cs-font-display" style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </h3>
                        {/* Fecha de Entrega añadida a la vista */}
                        {ev.due_date && (
                          <p className="cs-font-body" style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(148,163,184,0.6)' }}>
                            📅 {ev.due_date.split('T')[0]}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span className="cs-score-badge" style={{ background: sc.bg, color: sc.color }}>
                          {s !== null ? s.toFixed(1) : '—'}
                        </span>
                        <button
                          className="cs-icon-btn"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                          onClick={() => openModal(ev)}
                          aria-label="Editar"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="cs-icon-btn"
                          style={{ background: 'rgba(248,113,113,0.08)', color: 'rgba(248,113,113,0.65)' }}
                          onClick={() => setDelTarget(ev)}
                          aria-label="Eliminar"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <span className="cs-weight-chip">{w}%</span>
                      <div className="cs-weight-track">
                        <div
                          className="cs-weight-fill"
                          style={{ '--bar-w': `${w}%`, width: `${w}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── FAB ── */}
        <button className="cs-fab" onClick={() => openModal()} aria-label="Nueva evaluación">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* ── Add / Edit Sheet ── */}
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2,8,23,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass cs-sheet" style={{ width: '100%', maxWidth: '500px', borderRadius: '28px 28px 0 0', padding: '12px 28px 48px', borderBottom: 'none' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.25)', margin: '8px auto 28px' }} />

              <h2 className="cs-font-display" style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>
                {editingEval ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <p className="cs-font-body" style={{ margin: '0 0 22px', fontSize: '13px', color: 'rgba(148,163,184,0.55)', lineHeight: 1.65 }}>
                Registra el título, peso porcentual, fecha y nota obtenida.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="cs-label">Título</label>
                  <input
                    className="cs-input" autoFocus required
                    placeholder="Ej: Taller 1"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Due Date (Nuevo Campo Añadido) */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="cs-label">Fecha de Entrega</label>
                  <input
                    className="cs-input" 
                    type="date" 
                    required
                    value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {/* Weight + Score side by side */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '22px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="cs-label">Peso %</label>
                    <input
                      className="cs-input"
                      type="number" required min="1" max="100" placeholder="20"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="cs-label">Nota <span style={{ textTransform: 'none', fontSize: '10px', color: 'rgba(148,163,184,0.4)' }}>(opcional)</span></label>
                    <input
                      className="cs-input"
                      type="number" step="0.1" min="0" max="5" placeholder="4.5"
                      value={score}
                      onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Remaining weight hint */}
                {!editingEval && remaining > 0 && (
                  <p className="cs-font-body" style={{ margin: '-12px 0 16px 2px', fontSize: '11px', color: 'rgba(148,163,184,0.4)', fontWeight: 500 }}>
                    Peso disponible restante: <span style={{ color: '#818cf8', fontWeight: 700 }}>{remaining}%</span>
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="cs-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="cs-btn-primary">
                    {editingEval ? 'Guardar cambios' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete confirm ── */}
        {delTarget && (
          <ConfirmDelete
            title={delTarget.title}
            onConfirm={confirmDelete}
            onCancel={() => setDelTarget(null)}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Evaluations;