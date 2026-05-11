import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { termService, Term } from '../services/termService';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(14px,-20px); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-10px,16px); }
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

  /* ── Back button ── */
  .cs-back-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(165,180,252,0.85); outline: none;
    transition: background 0.18s ease;
  }
  .cs-back-btn:active { background: rgba(99,102,241,0.28); }

  /* ── FAB add button ── */
  .cs-fab {
    width: 44px; height: 44px; border-radius: 15px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: white;
    box-shadow: 0 4px 18px rgba(99,102,241,0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    outline: none;
  }
  .cs-fab:active { transform: scale(0.94); box-shadow: 0 2px 10px rgba(99,102,241,0.3); }

  /* ── Term card ── */
  .cs-term-card {
    background: rgba(15,23,42,0.65);
    border: 1px solid rgba(99,102,241,0.14);
    border-radius: 22px;
    padding: 18px 20px;
    display: flex; justify-content: space-between; align-items: center;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    animation: cs-scaleIn 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  .cs-term-card:active { transform: scale(0.98); }
  .cs-term-card:hover  { border-color: rgba(99,102,241,0.28); background: rgba(15,23,42,0.85); }

  /* ── Active badge ── */
  .cs-badge-active {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2);
    border-radius: 20px; padding: 3px 10px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #34d399;
  }
  .cs-badge-inactive {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(100,116,139,0.12); border: 1px solid rgba(100,116,139,0.2);
    border-radius: 20px; padding: 3px 10px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: rgba(100,116,139,0.7);
  }

  /* ── Delete button ── */
  .cs-delete-btn {
    width: 36px; height: 36px; border-radius: 12px; border: none;
    background: rgba(248,113,113,0.08); color: rgba(248,113,113,0.65);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.18s ease, color 0.18s ease;
    outline: none; flex-shrink: 0;
  }
  .cs-delete-btn:active { background: rgba(248,113,113,0.2); color: #f87171; }

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

  /* ── Primary button ── */
  .cs-btn-primary {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: white; font-family: 'Sora', system-ui, sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    transition: transform 0.18s ease;
  }
  .cs-btn-primary:active { transform: scale(0.98); }

  /* ── Cancel button ── */
  .cs-btn-cancel {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    color: rgba(148,163,184,0.6); font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 15px; font-weight: 600; cursor: pointer; background: transparent;
  }

  /* ── Orbs ── */
  .cs-orb-a {
    position: absolute; top: -100px; right: -80px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -60px; left: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 68%);
    animation: cs-floatB 12s ease-in-out infinite; pointer-events: none;
  }

  /* ── Skeleton ── */
  .cs-skeleton {
    border-radius: 22px; overflow: hidden;
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

  /* Chevron */
  .cs-chevron {
    color: rgba(99,102,241,0.4); transition: color 0.18s, transform 0.18s;
    flex-shrink: 0;
  }
  .cs-term-card:hover .cs-chevron { color: #818cf8; transform: translateX(3px); }
`;

// ─── Delete confirm modal ─────────────────────────────────────────────────────
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
      <h3 className="cs-font-display" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>¿Eliminar semestre?</h3>
      <p className="cs-font-body" style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.65 }}>
        Se eliminarán <strong style={{ color: '#f1f5f9' }}>{name}</strong> junto con todas sus materias y notas. Esta acción es irreversible.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="cs-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, height: '48px', borderRadius: '14px', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', fontFamily: "'Sora',sans-serif", fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton rows ─────────────────────────────────────────────────────────────
const SkeletonRows: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[1, 2, 3].map((i) => (
      <div key={i} className="cs-skeleton" style={{ height: '76px', animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
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
    } catch (error: any) { toast.error(error); }
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
    } catch (error: any) { toast.error(error); }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      await termService.delete(delTarget.id);
      setTerms(terms.filter(t => t.id !== delTarget.id));
      toast.success('Semestre eliminado');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) { toast.error(error); }
    finally { setDelTarget(null); }
  };

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

          {/* ── Header ── */}
          <div style={{ position: 'relative', padding: '52px 20px 32px', overflow: 'hidden', zIndex: 1 }}>
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            <div className="cs-a0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              {/* Back */}
              <button className="cs-back-btn" onClick={() => history.goBack()} aria-label="Volver">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              {/* FAB */}
              <button className="cs-fab" onClick={() => setShowModal(true)} aria-label="Nuevo semestre">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>

            <div className="cs-a1" style={{ marginTop: '24px', position: 'relative', zIndex: 2 }}>
              <h1 className="cs-font-display" style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em' }}>
                Mis Semestres
              </h1>
              <p className="cs-font-body" style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(148,163,184,0.5)', fontWeight: 500 }}>
                {terms.length > 0 ? `${terms.length} periodo${terms.length !== 1 ? 's' : ''} registrado${terms.length !== 1 ? 's' : ''}` : 'Sin semestres aún'}
              </p>
            </div>
          </div>

          {/* ── List ── */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <SkeletonRows />
            ) : terms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <p className="cs-font-body" style={{ margin: 0, fontSize: '14px', color: 'rgba(148,163,184,0.4)', fontStyle: 'italic' }}>
                  No tienes semestres registrados.
                </p>
                <p className="cs-font-body" style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(148,163,184,0.25)' }}>
                  Pulsa + para añadir uno.
                </p>
              </div>
            ) : (
              terms.map((term, idx) => (
                <div
                  key={term.id}
                  className="cs-term-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  onClick={() => history.push(`/terms/${term.id}/subjects`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {/* Status dot */}
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                      background: term.is_active ? '#34d399' : 'rgba(100,116,139,0.4)',
                      boxShadow: term.is_active ? '0 0 10px rgba(52,211,153,0.5)' : 'none',
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <h3 className="cs-font-display" style={{ margin: '0 0 5px', fontSize: '15px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {term.name}
                      </h3>
                      <span className={term.is_active ? 'cs-badge-active' : 'cs-badge-inactive'}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {term.is_active ? 'Activo' : 'Finalizado'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="cs-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDelTarget(term); }}
                      aria-label="Eliminar semestre"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                    <svg className="cs-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Add Term Sheet ── */}
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2,8,23,0.82)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div
              className="cs-glass cs-sheet"
              style={{ width: '100%', maxWidth: '500px', borderRadius: '28px 28px 0 0', padding: '12px 28px 48px', borderBottom: 'none' }}
            >
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.25)', margin: '8px auto 28px' }} />
              <h2 className="cs-font-display" style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>
                Nuevo Semestre
              </h2>
              <p className="cs-font-body" style={{ margin: '0 0 22px', fontSize: '13px', color: 'rgba(148,163,184,0.55)', lineHeight: 1.65 }}>
                Ingresa el nombre del periodo académico.
              </p>
              <form onSubmit={handleAdd}>
                <input
                  className="cs-input"
                  autoFocus required
                  placeholder="Ej: Semestre 2026-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="cs-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="cs-btn-primary">Crear</button>
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

export default Terms;