import React, { useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(16px,-24px) scale(1.04); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-12px,20px) scale(0.96); }
  }
  @keyframes cs-scaleIn {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes cs-checkDraw {
    from { stroke-dashoffset: 60; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes cs-ringPulse {
    0%   { transform: scale(1);    opacity: 0.7; }
    100% { transform: scale(1.5);  opacity: 0; }
  }
  @keyframes cs-shimmerSuccess {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  .cs-glass {
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99, 102, 241, 0.18);
    box-shadow: 0 32px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .cs-glass-success {
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(52, 211, 153, 0.22);
    box-shadow: 0 32px 64px rgba(0,0,0,0.55), 0 0 60px rgba(52,211,153,0.06), inset 0 1px 0 rgba(52,211,153,0.08);
  }

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
  .cs-input-error {
    border-color: rgba(248,113,113,0.5) !important;
  }
  .cs-input-error:focus {
    border-color: #f87171 !important;
    box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important;
  }

  .cs-btn-primary {
    width: 100%;
    height: 52px;
    border: none;
    border-radius: 14px;
    color: white;
    font-family: 'Sora', system-ui, sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: 0.01em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #7c3aed 100%);
    box-shadow: 0 4px 24px rgba(99, 102, 241, 0.38);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    position: relative; overflow: hidden;
  }
  .cs-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .cs-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.52);
  }
  .cs-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cs-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .cs-orb-a {
    position: absolute; top: -140px; right: -80px;
    width: 360px; height: 360px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite;
    pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -100px; left: -100px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 68%);
    animation: cs-floatB 12s ease-in-out infinite;
    pointer-events: none;
  }
  .cs-orb-success {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  .cs-label {
    display: block;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.075em; text-transform: uppercase;
    color: rgba(148, 163, 184, 0.75);
    margin-bottom: 8px; margin-left: 2px;
  }

  .cs-a0 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both; }
  .cs-a2 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.16s both; }

  /* Success state */
  .cs-success-card { animation: cs-scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }

  .cs-check-circle {
    width: 88px; height: 88px; border-radius: 50%;
    background: rgba(52,211,153,0.1);
    border: 2px solid rgba(52,211,153,0.25);
    display: flex; align-items: center; justify-content: center;
    position: relative; margin: 0 auto 24px;
  }
  .cs-check-circle::before {
    content: '';
    position: absolute; inset: -10px; border-radius: 50%;
    border: 2px solid rgba(52,211,153,0.15);
    animation: cs-ringPulse 2s ease-out infinite;
  }
  .cs-check-svg {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: cs-checkDraw 0.6s cubic-bezier(.22,1,.36,1) 0.3s both;
  }

  .cs-progress-dots {
    display: flex; gap: 6px; justify-content: center; margin-top: 20px;
  }
  .cs-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(52,211,153,0.4);
    animation: cs-ringPulse 1.4s ease-out infinite;
  }
  .cs-dot:nth-child(2) { animation-delay: 0.2s; }
  .cs-dot:nth-child(3) { animation-delay: 0.4s; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const history   = useHistory();

  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [isLoading,        setIsLoading]        = useState(false);
  const [isSuccess,        setIsSuccess]        = useState(false);

  const mismatch     = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort     = password.length > 0 && password.length < 6;
  const canSubmit    = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await authService.confirmReset(token, password);
      setIsSuccess(true);
      setTimeout(() => history.push('/login'), 2800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY={false}>
        <div
          style={{
            minHeight: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '28px 20px',
            background: isSuccess
              ? 'linear-gradient(160deg, #020a0f 0%, #061a14 55%, #020c10 100%)'
              : 'linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)',
            position: 'relative', overflow: 'hidden',
            transition: 'background 1s ease',
          }}
        >
          {/* Orbs */}
          {!isSuccess && <><div className="cs-orb-a" /><div className="cs-orb-b" /></>}
          {isSuccess  && <div className="cs-orb-success" />}

          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `radial-gradient(${isSuccess ? 'rgba(52,211,153,0.07)' : 'rgba(99,102,241,0.09)'} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            transition: 'all 1s ease',
          }} />

          <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* ── SUCCESS STATE ── */}
            {isSuccess ? (
              <div className="cs-glass-success cs-success-card" style={{ borderRadius: '28px', padding: '40px 32px', textAlign: 'center' }}>

                {/* Animated check */}
                <div className="cs-check-circle">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline
                      className="cs-check-svg"
                      points="8,20 16,30 32,12"
                      stroke="#34d399"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <h2
                  className="cs-font-display"
                  style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.03em' }}
                >
                  ¡Todo listo!
                </h2>
                <p
                  className="cs-font-body"
                  style={{ margin: '0 0 28px', fontSize: '14px', color: 'rgba(134,239,172,0.7)', lineHeight: 1.65 }}
                >
                  Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
                </p>

                {/* Animated dots as loader */}
                <div className="cs-progress-dots">
                  <div className="cs-dot" />
                  <div className="cs-dot" />
                  <div className="cs-dot" />
                </div>
              </div>

            ) : (
              /* ── FORM STATE ── */
              <>
                {/* Heading */}
                <div className="cs-a0" style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h1 className="cs-font-display" style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                    Nueva Contraseña
                  </h1>
                  <p className="cs-font-body" style={{ margin: '8px 0 0', color: 'rgba(148,163,184,0.65)', fontSize: '14px' }}>
                    Ingresa tu nueva credencial de acceso
                  </p>
                </div>

                {/* Card */}
                <div className="cs-glass cs-a1" style={{ borderRadius: '28px', padding: '32px 28px' }}>
                  <form onSubmit={handleSubmit}>

                    {/* New password */}
                    <div style={{ marginBottom: '18px' }}>
                      <label className="cs-label">Nueva Contraseña</label>
                      <input
                        className={`cs-input${tooShort ? ' cs-input-error' : ''}`}
                        type="password" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {tooShort && (
                        <p className="cs-font-body" style={{ margin: '6px 0 0 4px', fontSize: '11px', color: '#f87171', fontWeight: 600 }}>
                          Mínimo 6 caracteres
                        </p>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div style={{ marginBottom: '24px' }}>
                      <label className="cs-label">Confirmar Contraseña</label>
                      <input
                        className={`cs-input${mismatch ? ' cs-input-error' : ''}`}
                        type="password" required
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                      />
                      {mismatch && (
                        <p className="cs-font-body" style={{ margin: '6px 0 0 4px', fontSize: '11px', color: '#f87171', fontWeight: 600 }}>
                          Las contraseñas no coinciden
                        </p>
                      )}
                      {!mismatch && confirmPassword.length > 0 && password === confirmPassword && (
                        <p className="cs-font-body" style={{ margin: '6px 0 0 4px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                          ✓ Las contraseñas coinciden
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading || !canSubmit}
                      className="cs-btn-primary"
                    >
                      {isLoading ? <IonSpinner name="crescent" /> : 'Actualizar Contraseña'}
                    </button>

                  </form>

                  {/* Back to login */}
                  <p
                    className="cs-font-body"
                    style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(148,163,184,0.5)', margin: '20px 0 0' }}
                  >
                    <span
                      onClick={() => history.push('/login')}
                      style={{ color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ← Volver al inicio de sesión
                    </span>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;