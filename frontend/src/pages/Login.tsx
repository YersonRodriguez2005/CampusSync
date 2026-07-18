import React, { useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuMail, LuLock, LuArrowRight } from 'react-icons/lu';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ─── Toast helper modularizado ───────────────────────────────────────────────
const makeToast = (message: string, type: 'success' | 'error') => {
  const accent = type === 'success' ? '#10b981' : '#f87171';
  const label  = type === 'success' ? 'Operación Exitosa' : 'Error';
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
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
      <IonContent scrollY={false}>
        <div className="min-h-full flex flex-col justify-center px-5 py-8 bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative overflow-hidden">
          
          {/* ── Orbes Ambientales (GPU Accelerated) ── */}
          <div className="absolute -top-32 -right-24 w-95 h-95 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-85 h-85 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          
          {/* Malla de puntos sutil */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(99,102,241,0.12)_1px,transparent_1px)] bg-size-[28px_28px]" />

          <div className="w-full max-w-105 mx-auto relative z-10">
            
            {/* ── Logo Dinámico ── */}
            <div className="flex justify-center mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0ms' }}>
              <div className="relative w-19 h-19 flex items-center justify-center">
                <div className="absolute -inset-2 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-500/30 animate-spin-slow pointer-events-none" />
                <div className="w-18 h-18 rounded-[22px] rotate-3 bg-linear-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_8px_40px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <span className="text-white text-[26px] font-extrabold -rotate-3 tracking-tighter font-serif">CS</span>
                </div>
              </div>
            </div>

            {/* ── Textos ── */}
            <div className="text-center mb-8 animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
              <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">CampuSync</h1>
              <p className="mt-2 text-sm text-slate-400 font-medium">Gestiona tu vida académica</p>
            </div>

            {/* ── Glass Card Formulario ── */}
            <div className="cs-glass-card animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleLogin} className="space-y-5">
                
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
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setShowModal(true); }}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent p-0 m-0"
                    >
                      ¿La olvidaste?
                    </button>
                  </div>
                  <div className="cs-soft-input group">
                    <LuLock className="text-indigo-400 text-lg mr-3 transition-transform group-focus-within:scale-110" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="cs-btn-primary group">
                    {isLoading ? <IonSpinner name="crescent" /> : (
                      <>
                        <span>Iniciar Sesión</span>
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
                ¿No tienes una cuenta?{' '}
                <button onClick={() => history.push('/register')} className="text-indigo-400 font-bold bg-transparent p-0 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 transition-colors">
                  Regístrate
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ── Modal de Recuperación (Glass Sheet) ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-[#020817]/80 backdrop-blur-sm flex items-end justify-center animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="cs-glass-sheet w-full max-w-125 animate-sheet-up">
              <div className="w-10 h-1.5 rounded-full bg-indigo-500/20 mx-auto mb-6" />
              
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                ✕
              </button>

              <h2 className="m-0 text-2xl font-extrabold text-slate-50 tracking-tight font-serif mb-2">
                Recuperar acceso
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6 font-medium pr-8">
                Ingresa tu correo institucional y te enviaremos un enlace seguro para cambiar tu contraseña.
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="cs-soft-input group">
                  <LuMail className="text-indigo-400 text-lg mr-3 transition-transform group-focus-within:scale-110" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ejemplo@universidad.edu"
                    className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                  />
                </div>
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