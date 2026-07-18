import React, { useState } from 'react';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuLock, LuCircleCheck, LuArrowLeft, LuKeyRound } from 'react-icons/lu';
import { authService } from '../services/authService';

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

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const history   = useHistory();

  const [password,         setPassword]         = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [isLoading,        setIsLoading]        = useState(false);
  const [isSuccess,        setIsSuccess]        = useState(false);

  const mismatch  = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort  = password.length > 0 && password.length < 6;
  const canSubmit = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      makeToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (password !== confirmPassword) {
      makeToast('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authService.confirmReset(token, password);
      setIsSuccess(true);
      setTimeout(() => history.push('/login'), 2800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      makeToast(error.message || "Error al restablecer", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div
          className={`min-h-full flex flex-col justify-center px-5 py-8 relative overflow-hidden transition-colors duration-1000 ${
            isSuccess 
              ? 'bg-linear-to-br from-[#020a0f] via-[#061a14] to-[#020c10]' 
              : 'bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a]'
          }`}
        >
          {/* ── Orbes Ambientales (GPU Accelerated) ── */}
          {!isSuccess ? (
            <>
              <div className="absolute -top-32 -right-20 w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_68%)] animate-float-orb-a pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_68%)] animate-float-orb-b pointer-events-none" />
            </>
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.08)_0%,transparent_60%)] pointer-events-none animate-pulse" />
          )}

          {/* Malla de puntos dinámica */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-1000" 
            style={{
              backgroundImage: `radial-gradient(${isSuccess ? 'rgba(52,211,153,0.07)' : 'rgba(99,102,241,0.09)'} 1px, transparent 1px)`,
              backgroundSize: '28px 28px'
            }}
          />

          <div className="w-full max-w-105 mx-auto relative z-10">

            {/* ── ESTADO DE ÉXITO (Success State) ── */}
            {isSuccess ? (
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/20 rounded-[28px] shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_60px_rgba(52,211,153,0.06),inset_0_1px_0_rgba(52,211,153,0.08)] p-10 text-center animate-slide-up">
                
                {/* Check animado Neumórfico */}
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/25">
                  <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-500/15 animate-[ping_2s_ease-out_infinite]" />
                  <LuCircleCheck className="text-emerald-400 text-5xl animate-slide-up" />
                </div>

                <h2 className="m-0 mb-3 text-3xl font-extrabold text-emerald-50 tracking-tight font-serif">
                  ¡Todo listo!
                </h2>
                <p className="m-0 mb-8 text-sm text-emerald-300/70 leading-relaxed font-medium">
                  Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
                </p>

                {/* Loader dots (Tailwind native) */}
                <div className="flex justify-center gap-2 mt-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            ) : (
              
              /* ── ESTADO DE FORMULARIO ── */
              <>
                <div className="text-center mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0ms' }}>
                  <div className="w-16 h-16 mx-auto bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <LuKeyRound className="text-3xl text-indigo-400" />
                  </div>
                  <h1 className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight font-serif">
                    Nueva Contraseña
                  </h1>
                  <p className="mt-2 text-sm text-slate-400 font-medium">
                    Ingresa tu nueva credencial de acceso
                  </p>
                </div>

                {/* Glass Card */}
                <div className="cs-glass-card animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Input: Nueva contraseña */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Nueva Contraseña
                      </label>
                      <div className={`cs-soft-input group ${tooShort ? 'border-red-500/50! focus-within:border-red-500! focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15),inset_2px_2px_6px_rgba(0,0,0,0.5)]!' : ''}`}>
                        <LuLock className={`text-lg mr-3 transition-transform group-focus-within:scale-110 ${tooShort ? 'text-red-400' : 'text-indigo-400'}`} />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                        />
                      </div>
                      {tooShort && (
                        <p className="m-0 mt-1.5 ml-2 text-[11px] text-red-400 font-bold">
                          Debe tener al menos 6 caracteres
                        </p>
                      )}
                    </div>

                    {/* Input: Confirmar contraseña */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Confirmar Contraseña
                      </label>
                      <div className={`cs-soft-input group ${mismatch ? 'border-red-500/50! focus-within:border-red-500! focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15),inset_2px_2px_6px_rgba(0,0,0,0.5)]!' : ''}`}>
                        <LuLock className={`text-lg mr-3 transition-transform group-focus-within:scale-110 ${mismatch ? 'text-red-400' : 'text-indigo-400'}`} />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite tu nueva contraseña"
                          className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                        />
                      </div>
                      
                      {/* Validaciones Dinámicas */}
                      {mismatch && (
                        <p className="m-0 mt-1.5 ml-2 text-[11px] text-red-400 font-bold">
                          Las contraseñas no coinciden
                        </p>
                      )}
                      {!mismatch && confirmPassword.length > 0 && password === confirmPassword && (
                        <p className="m-0 mt-1.5 ml-2 text-[11px] text-emerald-400 font-bold">
                          ✓ Las contraseñas coinciden
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading || !canSubmit}
                        className="cs-btn-primary"
                      >
                        {isLoading ? <IonSpinner name="crescent" /> : 'Actualizar Contraseña'}
                      </button>
                    </div>

                  </form>

                  {/* Volver al login */}
                  <div className="mt-6 text-center animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
                    <button
                      onClick={() => history.push('/login')}
                      className="flex items-center justify-center gap-2 mx-auto text-indigo-400 font-bold bg-transparent p-0 hover:text-indigo-300 transition-colors text-[13px]"
                    >
                      <LuArrowLeft className="text-base" /> Volver al inicio de sesión
                    </button>
                  </div>

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