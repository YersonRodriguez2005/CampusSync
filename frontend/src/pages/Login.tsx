import React, { useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ─── Shared CSS injected per-component ───────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(18px,-28px) scale(1.04); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-14px,22px) scale(0.97); }
  }
  @keyframes cs-spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes cs-slideSheet {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  /* Glassmorphism card */
  .cs-glass {
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99, 102, 241, 0.18);
    box-shadow:
      0 32px 64px rgba(0,0,0,0.55),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* Input */
  .cs-input {
    width: 100%;
    height: 52px;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 15px;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: rgba(30, 41, 59, 0.75);
    border: 1.5px solid rgba(99, 102, 241, 0.14);
    color: #f1f5f9;
    outline: none;
    transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;
  }
  .cs-input::placeholder { color: rgba(148, 163, 184, 0.4); }
  .cs-input:focus {
    border-color: #6366f1;
    background: rgba(30, 41, 59, 0.95);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14), 0 0 24px rgba(99, 102, 241, 0.08);
  }
  .cs-input-error:focus {
    border-color: #f87171 !important;
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.14) !important;
  }

  /* Primary button */
  .cs-btn-primary {
    width: 100%;
    height: 52px;
    border: none;
    border-radius: 14px;
    color: white;
    font-family: 'Sora', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #7c3aed 100%);
    box-shadow: 0 4px 24px rgba(99, 102, 241, 0.38);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    position: relative;
    overflow: hidden;
  }
  .cs-btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .cs-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.52);
  }
  .cs-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cs-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Secondary button (dark) */
  .cs-btn-dark {
    background: rgba(30, 41, 59, 0.9);
    border: 1.5px solid rgba(99, 102, 241, 0.2);
  }
  .cs-btn-dark:hover:not(:disabled) {
    background: rgba(30, 41, 59, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  /* Orbs */
  .cs-orb-a {
    position: absolute; top: -140px; right: -100px;
    width: 380px; height: 380px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite;
    pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -120px; left: -120px;
    width: 340px; height: 340px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 68%);
    animation: cs-floatB 11s ease-in-out infinite;
    pointer-events: none;
  }

  /* Spinning logo ring */
  .cs-spin-ring {
    position: absolute; inset: -8px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #6366f1;
    border-right-color: rgba(139, 92, 246, 0.35);
    animation: cs-spinRing 5s linear infinite;
    pointer-events: none;
  }

  /* Label */
  .cs-label {
    display: block;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.075em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.75);
    margin-bottom: 8px;
    margin-left: 2px;
  }

  /* Animations */
  .cs-a0 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both; }
  .cs-a2 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.16s both; }
  .cs-a3 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.24s both; }

  /* Sheet modal */
  .cs-sheet { animation: cs-slideSheet 0.38s cubic-bezier(.22,1,.36,1) both; }

  /* Divider */
  .cs-divider {
    display: flex; align-items: center; gap: 12px; margin: 22px 0;
  }
  .cs-divider-line {
    flex: 1; height: 1px; background: rgba(99,102,241,0.12);
  }
  .cs-divider-text {
    font-size: 12px; font-weight: 500; color: rgba(148,163,184,0.38);
    font-family: 'DM Sans', system-ui, sans-serif;
  }
`;

// ─── Toast helper ─────────────────────────────────────────────────────────────
const makeToast = (message: string, type: 'success' | 'error') => {
  const accent = type === 'success' ? '#10b981' : '#f87171';
  const label  = type === 'success' ? 'Operación Exitosa' : 'Error';
  toast.custom((t) => (
    <div
      style={{
        display: 'flex', alignItems: 'stretch',
        maxWidth: '380px', width: '100%',
        background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(20px)',
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
        border: '1px solid rgba(99,102,241,0.14)',
        borderLeft: `4px solid ${accent}`,
        opacity: t.visible ? 1 : 0, transition: 'opacity 0.2s',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ flex: 1, padding: '14px 16px' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#cbd5e1' }}>{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{ padding: '0 18px', background: 'transparent', border: 'none', borderLeft: '1px solid rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        OK
      </button>
    </div>
  ));
};

// ─── Component ────────────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [resetEmail,  setResetEmail]  = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setAuth(data.user, data.token);
      makeToast(`Bienvenido, ${data.user.email}`, 'success');
      history.push('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      makeToast(error, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    try {
      await authService.resetPassword(resetEmail);
      makeToast('Si el correo está registrado, recibirás instrucciones pronto.', 'success');
      setShowModal(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      makeToast(error, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <IonPage>
      <style>{CSS}</style>

      {/* --background transparent so our div controls the bg */}
      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY={false}>

        {/* ── Page background ── */}
        <div
          style={{
            minHeight: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '28px 20px',
            background: 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div className="cs-orb-a" />
          <div className="cs-orb-b" />

          {/* Dot-grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Content ── */}
          <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* Logo */}
            <div className="cs-a0" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="cs-spin-ring" />
                <div style={{
                  width: '72px', height: '72px', borderRadius: '22px', transform: 'rotate(3deg)',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 40px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}>
                  <span className="cs-font-display" style={{ color: 'white', fontSize: '26px', fontWeight: 800, transform: 'rotate(-3deg)', letterSpacing: '-0.03em' }}>CS</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="cs-a1" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 className="cs-font-display" style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                CampusSync
              </h1>
              <p className="cs-font-body" style={{ margin: '8px 0 0', color: 'rgba(148,163,184,0.65)', fontSize: '14px', fontWeight: 500 }}>
                Gestiona tu vida académica
              </p>
            </div>

            {/* Glass card */}
            <div className="cs-glass cs-a2" style={{ borderRadius: '28px', padding: '32px 28px' }}>

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="cs-label">Correo Institucional</label>
                  <input
                    className="cs-input"
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@universidad.edu"
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="cs-label" style={{ margin: 0 }}>Contraseña</label>
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setShowModal(true); }}
                      className="cs-font-body"
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', fontWeight: 600, color: '#818cf8', cursor: 'pointer' }}
                    >
                      ¿La olvidaste?
                    </button>
                  </div>
                  <input
                    className="cs-input"
                    type="password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="cs-btn-primary">
                  {isLoading ? <IonSpinner name="crescent" /> : 'Iniciar Sesión'}
                </button>
              </form>

              {/* Divider */}
              <div className="cs-divider">
                <div className="cs-divider-line" />
                <span className="cs-divider-text">o</span>
                <div className="cs-divider-line" />
              </div>

              <p className="cs-font-body" style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(148,163,184,0.55)', margin: 0 }}>
                ¿No tienes una cuenta?{' '}
                <span
                  onClick={() => history.push('/register')}
                  style={{ color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}
                >
                  Regístrate
                </span>
              </p>

            </div>
          </div>
        </div>

        {/* ── Password Reset Sheet ── */}
        {showModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(2,8,23,0.82)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div
              className="cs-glass cs-sheet"
              style={{
                width: '100%', maxWidth: '500px',
                borderRadius: '28px 28px 0 0', padding: '12px 28px 48px',
                borderBottom: 'none', position: 'relative',
              }}
            >
              {/* Drag handle */}
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.28)', margin: '8px auto 28px' }} />

              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute', top: '20px', right: '24px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: '10px', width: '32px', height: '32px',
                  color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>

              <h2
                className="cs-font-display"
                style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}
              >
                Recuperar acceso
              </h2>
              <p
                className="cs-font-body"
                style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(148,163,184,0.6)', lineHeight: 1.65 }}
              >
                Ingresa tu correo institucional y te enviaremos un enlace para cambiar tu contraseña.
              </p>

              <form onSubmit={handlePasswordReset}>
                <input
                  className="cs-input"
                  type="email" required autoFocus
                  value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="ejemplo@universidad.edu"
                  style={{ marginBottom: '16px' }}
                />
                <button type="submit" disabled={isResetting} className="cs-btn-primary">
                  {isResetting ? <IonSpinner name="crescent" /> : 'Enviar enlace'}
                </button>
              </form>
            </div>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Login;