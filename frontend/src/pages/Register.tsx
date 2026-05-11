import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-20px, 28px) scale(1.05); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(16px,-20px) scale(0.96); }
  }
  @keyframes cs-spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes cs-barIn {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .cs-font-display { font-family: 'Sora', system-ui, sans-serif; }
  .cs-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  .cs-glass {
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(99, 102, 241, 0.18);
    box-shadow:
      0 32px 64px rgba(0,0,0,0.55),
      inset 0 1px 0 rgba(255,255,255,0.06);
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
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .cs-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.52);
  }
  .cs-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cs-btn-primary:disabled { opacity: 0.52; cursor: not-allowed; }

  .cs-orb-a {
    position: absolute; top: -160px; left: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 68%);
    animation: cs-floatA 10s ease-in-out infinite;
    pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -100px; right: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 68%);
    animation: cs-floatB 8s ease-in-out infinite;
    pointer-events: none;
  }

  .cs-spin-ring {
    position: absolute; inset: -8px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #8b5cf6;
    border-right-color: rgba(99, 102, 241, 0.3);
    animation: cs-spinRing 5s linear infinite;
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
  .cs-a3 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.24s both; }

  .cs-strength-bar {
    height: 3px; border-radius: 2px; flex: 1;
    transition: background 0.3s ease;
  }

  .cs-divider {
    display: flex; align-items: center; gap: 12px; margin: 22px 0;
  }
  .cs-divider-line { flex: 1; height: 1px; background: rgba(99,102,241,0.12); }
  .cs-divider-text {
    font-size: 12px; font-weight: 500; color: rgba(148,163,184,0.38);
    font-family: 'DM Sans', system-ui, sans-serif;
  }
`;

// ─── Password strength helper ─────────────────────────────────────────────────
type StrengthLevel = 0 | 1 | 2 | 3;

function getStrength(pwd: string): StrengthLevel {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[^a-zA-Z0-9]/.test(pwd) || /[0-9]/.test(pwd)) score++;
  return Math.min(score, 3) as StrengthLevel;
}

const strengthConfig: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
  0: { label: '',         color: 'rgba(30,41,59,0.5)',  bars: 0 },
  1: { label: 'Débil',   color: '#f87171',              bars: 1 },
  2: { label: 'Regular', color: '#fb923c',              bars: 2 },
  3: { label: 'Fuerte',  color: '#34d399',              bars: 3 },
};

// ─── Toast helper ─────────────────────────────────────────────────────────────
const makeToast = (message: string, type: 'success' | 'error') => {
  const accent = type === 'success' ? '#10b981' : '#f87171';
  const label  = type === 'success' ? 'Cuenta Creada' : 'Error de Registro';
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
const Register: React.FC = () => {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();

  const strength      = useMemo(() => getStrength(password), [password]);
  const strengthInfo  = strengthConfig[strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.register(email, password);
      makeToast('Tu cuenta ha sido creada. Por favor inicia sesión.', 'success');
      setEmail('');
      setPassword('');
      history.push('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      makeToast(error, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent style={{ '--background': 'transparent' } as React.CSSProperties} scrollY={false}>

        {/* ── Page background ── */}
        <div
          style={{
            minHeight: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '28px 20px',
            background: 'linear-gradient(155deg, #030a18 0%, #0f172a 50%, #0b0818 100%)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div className="cs-orb-a" />
          <div className="cs-orb-b" />

          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(139,92,246,0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* ── Content ── */}
          <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* Logo */}
            <div className="cs-a0" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="cs-spin-ring" />
                <div style={{
                  width: '72px', height: '72px', borderRadius: '22px', transform: 'rotate(-3deg)',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 40px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}>
                  <span className="cs-font-display" style={{ color: 'white', fontSize: '26px', fontWeight: 800, transform: 'rotate(3deg)', letterSpacing: '-0.03em' }}>CS</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="cs-a1" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 className="cs-font-display" style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                Registro
              </h1>
              <p className="cs-font-body" style={{ margin: '8px 0 0', color: 'rgba(148,163,184,0.65)', fontSize: '14px', fontWeight: 500 }}>
                Únete a CampusSync hoy mismo
              </p>
            </div>

            {/* Glass card */}
            <div className="cs-glass cs-a2" style={{ borderRadius: '28px', padding: '32px 28px' }}>
              <form onSubmit={handleRegister}>

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
                <div style={{ marginBottom: '8px' }}>
                  <label className="cs-label">Crear Contraseña</label>
                  <input
                    className="cs-input"
                    type="password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {/* Strength indicator */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className="cs-strength-bar"
                        style={{
                          background: password
                            ? (bar <= strength ? strengthInfo.color : 'rgba(30,41,59,0.6)')
                            : 'rgba(30,41,59,0.4)',
                        }}
                      />
                    ))}
                  </div>
                  {password.length > 0 && (
                    <p
                      className="cs-font-body"
                      style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: strengthInfo.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                    >
                      {strengthInfo.label}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="cs-btn-primary">
                  {isLoading ? <IonSpinner name="crescent" /> : 'Crear Cuenta'}
                </button>

              </form>

              {/* Divider */}
              <div className="cs-divider">
                <div className="cs-divider-line" />
                <span className="cs-divider-text">o</span>
                <div className="cs-divider-line" />
              </div>

              <p className="cs-font-body" style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(148,163,184,0.55)', margin: 0 }}>
                ¿Ya tienes una cuenta?{' '}
                <span
                  onClick={() => history.push('/login')}
                  style={{ color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}
                >
                  Inicia Sesión
                </span>
              </p>
            </div>

            {/* Fine print */}
            <p className="cs-a3 cs-font-body" style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(148,163,184,0.3)', marginTop: '20px' }}>
              Al registrarte aceptas nuestros Términos de servicio
            </p>

          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Register;