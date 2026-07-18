import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  LuLogOut, 
  LuBookOpen, 
  LuCalendarDays, 
  LuClock, 
  LuBellRing, 
  LuLayers
} from "react-icons/lu";
import { useAuthStore } from "../store/authStore";
import { pushService } from "../services/pushService";
import { dashboardService, DashboardSummary } from "../services/dashboardService";
import toast from "react-hot-toast";

// ─── Custom Tooltip para Recharts (Glassmorphism) ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/20 rounded-xl px-4 py-3 shadow-xl">
      <p className="m-0 text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
        {label}
      </p>
      <p className="m-0 text-xl font-extrabold text-indigo-400 font-serif leading-none">
        {Number(payload[0].value).toFixed(1)}
      </p>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonDash: React.FC = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="flex gap-3">
      <div className="h-30 flex-1 rounded-3xl bg-slate-800/50 border border-white/5" />
      <div className="h-30 flex-1 rounded-3xl bg-slate-800/50 border border-white/5" />
    </div>
    <div className="h-52.5 rounded-[28px] bg-slate-800/50 border border-white/5" />
    <div className="h-22.5 rounded-2xl bg-slate-800/50 border border-white/5" />
  </div>
);

// ─── Notification Banner Component ─────────────────────────────────────────────
const NotificationBanner: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      const success = await pushService.subscribeUser();
      if (success) {
        setIsSubscribed(true);
        toast.success("Notificaciones activadas", {
          style: { background: '#0f172a', color: '#fff', border: '1px solid #10b981' }
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error al activar notificaciones");
    }
  };

  return (
    <div className="cs-glass-card p-4! flex items-center justify-between border-l-4 border-l-indigo-500 mt-5">
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <LuBellRing className={`text-indigo-400 text-lg ${!isSubscribed && 'animate-pulse'}`} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-slate-200">Alertas de Tareas</span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">Avisos antes de tus entregas</span>
        </div>
      </div>

      <button
        onClick={handleEnableNotifications}
        disabled={isSubscribed}
        className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300 shrink-0 ${
          isSubscribed 
            ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' 
            : 'bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] active:scale-95'
        }`}
      >
        {isSubscribed ? "Activado" : "Activar"}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useAuthStore((state: any) => state.user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logout = useAuthStore((state: any) => state.logout);

  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>({
    active_subjects: 0,
    global_average: 0,
    chart_data: [],
  });

  const loadData = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Error al cargar datos");
    } finally {
      setLoading(false);
      setTimeout(() => setShowChart(true), 400);
    }
  };

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches");
    
    loadData();
    window.addEventListener('grades-updated', loadData);

    return () => {
      window.removeEventListener('grades-updated', loadData);
    };
  }, []);

  const doRefresh = async (event: CustomEvent) => {
    setShowChart(false);
    setLoading(true);
    await loadData();
    event.detail.complete();
  };

  const username = user?.email ? user.email.split("@")[0] : "Estudiante";
  const avg = Number(summary.global_average);
  
  // Lógica de colores según el promedio
  const avgColor = avg >= 4.0 ? "#34d399" : avg >= 3.0 ? "#818cf8" : avg > 0 ? "#fb923c" : "#64748b";
  const ringPct = Math.min(avg / 5, 1);
  const CIRC = 2 * Math.PI * 26; // Radio del SVG = 26

  return (
    <IonPage>
      <IonContent style={{ "--background": "transparent" } as React.CSSProperties} scrollY>
        
        <div className="min-h-full bg-linear-to-br from-[#020817] via-[#0f172a] to-[#080d1a] relative overflow-hidden pb-10">
          
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* ── Orbes Ambientales y Malla (GPU Accelerated) ── */}
          <div className="absolute -top-20 -right-16 w-70 h-70 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.25)_0%,transparent_70%)] animate-float-orb-a pointer-events-none" />
          <div className="absolute top-[20%] -left-16 w-55 h-55 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,transparent_70%)] animate-float-orb-b pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] bg-size-[28px_28px] z-0" />

          {/* ── Hero Section ── */}
          <div className="relative z-10 pt-14 px-6 pb-24">
            
            {/* Top bar */}
            <div className="flex justify-between items-center animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500/40 animate-spin-slow pointer-events-none" />
                  <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
                    <span className="text-white text-lg font-extrabold font-serif">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="m-0 text-xs text-slate-400 font-medium">{greeting},</p>
                  <h2 className="m-0 text-xl font-bold text-slate-50 max-w-45 truncate">
                    {username}
                  </h2>
                </div>
              </div>

              {/* Botón Logout */}
              <button
                onClick={() => { logout(); history.push("/login"); }}
                aria-label="Cerrar sesión"
                className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-95 hover:bg-indigo-500/20 transition-all shadow-sm"
              >
                <LuLogOut className="text-lg" />
              </button>
            </div>

            {/* Tagline Rendimiento */}
            <div className="mt-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="m-0 text-3xl font-extrabold text-slate-50 tracking-tight leading-tight font-serif">
                Tu rendimiento,<br />
                <span style={{ color: avgColor }} className="drop-shadow-md">
                  {avg > 0 ? `${avg.toFixed(2)} / 5.0` : "sin datos aún"}
                </span>
              </p>
            </div>
          </div>

          {/* ── Body Content (Solapado sobre el Hero) ── */}
          <div className="relative z-10 px-5 -mt-16 flex flex-col gap-4">
            
            {loading ? (
              <SkeletonDash />
            ) : (
              <>
                {/* ── Stats Row ── */}
                <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  
                  {/* Materias Activas */}
                  <div className="flex-1 bg-slate-800/40 backdrop-blur-md border border-indigo-500/15 rounded-3xl p-5 shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-3 border border-indigo-500/20">
                      <LuBookOpen className="text-indigo-400 text-lg" />
                    </div>
                    <p className="m-0 text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">
                      Materias act.
                    </p>
                    <p className="m-0 text-[32px] font-extrabold text-slate-50 leading-none font-serif">
                      {summary.active_subjects}
                    </p>
                  </div>

                  {/* Ring Card (Promedio Radial) */}
                  <div className="flex-1 bg-slate-800/40 backdrop-blur-md border border-indigo-500/15 rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center gap-1">
                    <svg width="70" height="70" viewBox="0 0 64 64" className="overflow-visible">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(30,41,59,0.9)" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke={avgColor} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${ringPct * CIRC} ${CIRC}`}
                        strokeDashoffset={CIRC * 0.25}
                        className="transition-all duration-1000 ease-out"
                      />
                      <text x="32" y="37" textAnchor="middle" fill={avgColor} fontSize="13" fontWeight="800" fontFamily="sans-serif">
                        {avg > 0 ? avg.toFixed(1) : "—"}
                      </text>
                    </svg>
                    <p className="m-0 mt-1 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      Promedio
                    </p>
                  </div>
                </div>

                {/* ── Chart Card ── */}
                <div className="cs-glass-card p-5! animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="m-0 text-base font-extrabold text-slate-50 font-serif">Rendimiento histórico</h3>
                      <p className="m-0 mt-1 text-[11px] text-slate-400 font-medium">Promedio por semestre</p>
                    </div>
                    {summary.chart_data.length > 0 && (
                      <span className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-2.5 py-1 text-[11px] font-bold text-indigo-400">
                        {summary.chart_data.length} sem.
                      </span>
                    )}
                  </div>

                  <div className="h-40 w-full">
                    {showChart && summary.chart_data.length > 0 ? (
                      <div className="h-full animate-fade-in">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={summary.chart_data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                            <defs>
                              <linearGradient id="csGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 10, fill: "rgba(148,163,184,0.5)", fontWeight: 600 }} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
                            <Area
                              type="monotone"
                              dataKey="promedio"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              fill="url(#csGrad)"
                              dot={{ fill: "#0f172a", stroke: "#8b5cf6", strokeWidth: 2, r: 4 }}
                              activeDot={{ fill: "#6366f1", stroke: "#fff", strokeWidth: 2, r: 6 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
                        {loading ? (
                          <IonSpinner name="crescent" className="text-indigo-500" />
                        ) : (
                          <>
                            <LuLayers className="text-3xl text-slate-500" />
                            <p className="m-0 text-xs text-slate-400 italic">Sin datos para graficar</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Quick Navigation ── */}
                <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    Navegación Rápida
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Semestres */}
                    <button
                      onClick={() => history.push("/terms")}
                      className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-[20px] p-4 flex flex-col items-center gap-2.5 active:scale-95 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20">
                        <LuLayers className="text-indigo-400 text-xl" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">Semestres</span>
                    </button>

                    {/* Calendario */}
                    <button
                      onClick={() => history.push("/calendar")}
                      className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-[20px] p-4 flex flex-col items-center gap-2.5 active:scale-95 hover:bg-slate-800/60 hover:border-orange-500/30 transition-all"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <LuCalendarDays className="text-orange-400 text-xl" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">Calendario</span>
                    </button>

                    {/* Métodos de Estudio (Toma el ancho completo) */}
                    <button
                      onClick={() => history.push("/study-methods")}
                      className="col-span-2 bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-[20px] p-4 flex items-center justify-start gap-4 active:scale-[0.98] hover:bg-slate-800/60 hover:border-purple-500/30 transition-all"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <LuClock className="text-purple-400 text-xl" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-slate-200">Métodos de Estudio</span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">Pomodoro y Notas Rápidas</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── Notificaciones ── */}
                <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <NotificationBanner />
                </div>
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;