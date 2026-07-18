import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuMail, LuLock, LuArrowRight } from 'react-icons/lu';
import { authService } from '../services/authService';

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

const strengthConfig: Record<StrengthLevel, { label: string; colorClass: string; textColor: string }> = {
  0: { label: '',        colorClass: 'bg-slate-700/50',   textColor: 'text-transparent' },
  1: { label: 'Débil',   colorClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', textColor: 'text-red-400' },
  2: { label: 'Regular', colorClass: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]', textColor: 'text-orange-400' },
  3: { label: 'Fuerte',  colorClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', textColor: 'text-emerald-400' },
};

// ─── Toast helper ─────────────────────────────────────────────────────────────
const makeToast = (message: string, type: 'success' | 'error') => {
  const accent = type === 'success' ? '#10b981' : '#f87171';
  const label  = type === 'success' ? 'Cuenta Creada' : 'Error de Registro';
  toast.custom((t) => (
    <div className={`flex items-stretch w-full max-w-95 bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/15 border-l-4 transition-opacity duration-200 ${t.visible ? 'opacity-100' : 'opacity-0'}`} style={{ borderLeftColor: accent }}>
      <div className="flex-1 px-4 py-3.5">
        <p className="m-0 text-[10px] font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
        <p className="mt-1 text-sm text-slate-200 font-medium">{message}</p>
      </div>
      <button onClick={() => toast.dismiss(t.id)} className="px-4 bg-transparent border-none border-l border-indigo-500/10 text-indigo-400 text-xs font-bold cursor-pointer hover:bg-indigo-500/5 transition-colors">
        OK
      </button>
    </div>
  ));
};

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();
  const strength = useMemo(() => getStrength(password), [password]);
  const strengthInfo = strengthConfig[strength];

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
      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col justify-center px-5 py-8 bg-linear-to-br from-[#030a18] via-[#0f172a] to-[#0b0818] relative overflow-hidden">
          
          {/* ── Orbes Ambientales (GPU Accelerated) ── */}
          <div className="absolute -top-40 -left-24 w-100 h-100 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-75 h-75 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(139,92,246,0.1)_1px,transparent_1px)] bg-size-[28px_28px]" />

          <div className="w-full max-w-105 mx-auto relative z-10">

            {/* ── Logo Dinámico ── */}
            <div className="flex justify-center mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0ms' }}>
              <div className="relative w-19 h-19 flex items-center justify-center">
                <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-purple-500 border-r-indigo-500/30 animate-spin-slow pointer-events-none" />
                <div className="w-18 h-18 rounded-[22px] -rotate-3 bg-linear-to-br from-purple-500 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_8px_40px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <span className="text-white text-[26px] font-extrabold rotate-3 tracking-tighter font-serif">CS</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8 animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
              <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">Registro</h1>
              <p className="mt-2 text-sm text-slate-400 font-medium">Únete a CampuSync hoy mismo</p>
            </div>

            {/* ── Glass Card Formulario ── */}
            <div className="cs-glass-card animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleRegister} className="space-y-5">

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Correo Institucional
                  </label>
                  <div className="cs-soft-input group">
                    <LuMail className="text-indigo-400 text-lg mr-3 transition-transform group-focus-within:scale-110" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@universidad.edu"
                      className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Crear Contraseña
                  </label>
                  <div className="cs-soft-input group mb-3">
                    <LuLock className="text-indigo-400 text-lg mr-3 transition-transform group-focus-within:scale-110" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                    />
                  </div>

                  {/* ── Indicador de Fuerza Neumórfico ── */}
                  <div className="flex gap-1.5 mb-1.5 px-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                          password ? (bar <= strength ? strengthInfo.colorClass : 'bg-slate-700/50') : 'bg-slate-700/30'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="h-4 px-1">
                    {password.length > 0 && (
                      <p className={`m-0 text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${strengthInfo.textColor}`}>
                        {strengthInfo.label}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="cs-btn-primary group">
                    {isLoading ? <IonSpinner name="crescent" /> : (
                      <>
                        <span>Crear Cuenta</span>
                        <div className="bg-black/20 rounded-lg p-1.5 transition-transform group-hover:translate-x-1 absolute right-3">
                          <LuArrowRight className="text-sm" />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divisor */}
              <div className="flex items-center gap-3 my-6 opacity-60">
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-indigo-500/30" />
                <span className="text-[11px] font-bold text-slate-500 uppercase">ó</span>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-indigo-500/30" />
              </div>

              <p className="text-center text-[13px] text-slate-400 font-medium m-0 animate-slide-up opacity-0" style={{ animationDelay: '300ms' }}>
                ¿Ya tienes una cuenta?{' '}
                <button onClick={() => history.push('/login')} className="text-indigo-400 font-bold bg-transparent p-0 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 transition-colors">
                  Inicia Sesión
                </button>
              </p>
            </div>

            <p className="text-center text-[11px] text-slate-600 mt-6 font-medium animate-slide-up opacity-0" style={{ animationDelay: '400ms' }}>
              Al registrarte aceptas nuestros Términos de Servicio
            </p>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;