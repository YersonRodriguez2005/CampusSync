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
import { useAuthStore } from "../store/authStore";
import { pushService } from "../services/pushService";
import {
  dashboardService,
  DashboardSummary,
} from "../services/dashboardService";
import toast from "react-hot-toast";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(20px,-30px) scale(1.05); }
  }
  @keyframes cs-floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-16px,22px) scale(0.96); }
  }
  @keyframes cs-spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes cs-chartReveal {
    from { opacity: 0; }
    to   { opacity: 1; }
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

  .cs-stat-card {
    background: rgba(30,41,59,0.6);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 22px;
    padding: 20px 18px;
    flex: 1;
  }

  .cs-nav-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    gap: 10px; padding: 20px 10px;
    background: rgba(30,41,59,0.55);
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }
  .cs-nav-btn:active  { transform: scale(0.96); }
  .cs-nav-btn:hover   { background: rgba(30,41,59,0.85); border-color: rgba(99,102,241,0.28); }

  .cs-nav-icon {
    width: 46px; height: 46px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
  }

  .cs-orb-a {
    position: absolute; top: -80px; right: -60px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.32) 0%, transparent 68%);
    animation: cs-floatA 9s ease-in-out infinite; pointer-events: none;
  }
  .cs-orb-b {
    position: absolute; bottom: -60px; left: -60px;
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 68%);
    animation: cs-floatB 11s ease-in-out infinite; pointer-events: none;
  }

  .cs-spin-ring {
    position: absolute; inset: -7px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #6366f1;
    border-right-color: rgba(139,92,246,0.3);
    animation: cs-spinRing 5s linear infinite; pointer-events: none;
  }

  .cs-skeleton {
    border-radius: 20px; overflow: hidden;
    background: rgba(30,41,59,0.6);
    position: relative;
  }
  .cs-skeleton::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.07) 50%, transparent 100%);
    background-size: 400px 100%;
    animation: cs-shimmer 1.6s ease-in-out infinite;
  }

  .cs-logout-btn {
    width: 40px; height: 40px; border-radius: 14px;
    background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.18s ease;
    color: rgba(165,180,252,0.85); outline: none;
  }
  .cs-logout-btn:active { background: rgba(99,102,241,0.28); }

  .cs-section-label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(148,163,184,0.4);
    margin-bottom: 12px; display: block;
  }

  .cs-a0 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .cs-a1 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.09s both; }
  .cs-a2 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.18s both; }
  .cs-a3 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.27s both; }
  .cs-a4 { animation: cs-fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.36s both; }

  .cs-chart-reveal { animation: cs-chartReveal 0.8s ease both; }
`;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "12px",
        padding: "10px 14px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          color: "rgba(148,163,184,0.55)",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: "20px",
          fontWeight: 700,
          color: "#818cf8",
          fontFamily: "'Sora', sans-serif",
          lineHeight: 1,
        }}
      >
        {Number(payload[0].value).toFixed(1)}
      </p>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonDash: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
    <div style={{ display: "flex", gap: "12px" }}>
      <div className="cs-skeleton" style={{ height: "120px", flex: 1 }} />
      <div className="cs-skeleton" style={{ height: "120px", flex: 1 }} />
    </div>
    <div className="cs-skeleton" style={{ height: "210px" }} />
    <div className="cs-skeleton" style={{ height: "90px" }} />
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
        toast.success("Notificaciones activadas");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error al activar notificaciones");
    }
  };

  return (
    <div
      className="cs-glass"
      style={{
        marginTop: "20px",
        padding: "16px 20px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeft: "4px solid #818cf8",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
        <div
          style={{
            background: "rgba(99,102,241,0.15)",
            margin: 0,
            flexShrink: 0,
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
          <span
            className="cs-font-display"
            style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1" }}
          >
            Alertas de Tareas
          </span>
          <span
            className="cs-font-body"
            style={{
              fontSize: "11px",
              color: "rgba(148,163,184,0.5)",
              fontWeight: 500,
              marginTop: "2px",
            }}
          >
            Avisos antes de tus entregas
          </span>
        </div>
      </div>

      <button
        onClick={handleEnableNotifications}
        disabled={isSubscribed}
        style={{
          padding: "8px 16px",
          borderRadius: "12px",
          border: "none",
          background: isSubscribed ? "rgba(148,163,184,0.1)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: isSubscribed ? "rgba(148,163,184,0.5)" : "#ffffff",
          boxShadow: isSubscribed ? "none" : "0 4px 14px rgba(99,102,241,0.3)",
          fontFamily: "'Sora', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          cursor: isSubscribed ? "default" : "pointer",
          transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
          flexShrink: 0,
        }}
        onMouseDown={(e) => !isSubscribed && (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => !isSubscribed && (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => !isSubscribed && (e.currentTarget.style.transform = "scale(1)")}
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
      toast.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setShowChart(true), 400);
    }
  };

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches",
    );
    loadData();
  }, []);

  const doRefresh = async (event: CustomEvent) => {
    setShowChart(false);
    setLoading(true);
    await loadData();
    event.detail.complete();
  };

  const username = user?.email ? user.email.split("@")[0] : "Estudiante";
  const avg = Number(summary.global_average);
  const avgColor =
    avg >= 4.0
      ? "#34d399"
      : avg >= 3.0
        ? "#818cf8"
        : avg > 0
          ? "#fb923c"
          : "#64748b";
  const ringPct = Math.min(avg / 5, 1);
  const CIRC = 2 * Math.PI * 26; // r=26

  return (
    <IonPage>
      <style>{CSS}</style>

      <IonContent
        style={{ "--background": "transparent" } as React.CSSProperties}
        scrollY
      >
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div
          style={{
            minHeight: "100%",
            background:
              "linear-gradient(160deg, #020817 0%, #0f172a 55%, #080d1a 100%)",
            position: "relative",
            paddingBottom: "40px",
          }}
        >
          {/* Dot grid */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              backgroundImage:
                "radial-gradient(rgba(99,102,241,0.1) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* ── Hero ── */}
          <div
            style={{
              position: "relative",
              padding: "52px 20px 96px",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            <div className="cs-orb-a" />
            <div className="cs-orb-b" />

            {/* Top bar */}
            <div
              className="cs-a0"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                {/* Avatar */}
                <div
                  style={{
                    position: "relative",
                    width: "50px",
                    height: "50px",
                  }}
                >
                  <div className="cs-spin-ring" />
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                    }}
                  >
                    <span
                      className="cs-font-display"
                      style={{
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: 800,
                      }}
                    >
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p
                    className="cs-font-body"
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "rgba(148,163,184,0.5)",
                      fontWeight: 500,
                    }}
                  >
                    {greeting},
                  </p>
                  <h2
                    className="cs-font-display"
                    style={{
                      margin: 0,
                      fontSize: "19px",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {username}
                  </h2>
                </div>
              </div>
              <button
                className="cs-logout-btn"
                onClick={() => {
                  logout();
                  history.push("/login");
                }}
                aria-label="Cerrar sesión"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>

            {/* Tagline */}
            <div
              className="cs-a1"
              style={{ marginTop: "24px", position: "relative", zIndex: 2 }}
            >
              <p
                className="cs-font-display"
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#f8fafc",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Tu rendimiento,
                <br />
                <span style={{ color: avgColor }}>
                  {avg > 0 ? `${avg.toFixed(2)} / 5.0` : "sin datos aún"}
                </span>
              </p>
            </div>
          </div>

          {/* ── Body cards (overlap hero) ── */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "0 20px",
              marginTop: "-68px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {loading ? (
              <SkeletonDash />
            ) : (
              <>
                {/* Stat row */}
                <div className="cs-a2" style={{ display: "flex", gap: "12px" }}>
                  {/* Active subjects */}
                  <div className="cs-stat-card">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "13px",
                        background: "rgba(99,102,241,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <p
                      className="cs-font-body"
                      style={{
                        margin: "0 0 2px",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(148,163,184,0.45)",
                      }}
                    >
                      Materias act.
                    </p>
                    <p
                      className="cs-font-display"
                      style={{
                        margin: 0,
                        fontSize: "32px",
                        fontWeight: 800,
                        color: "#f1f5f9",
                        lineHeight: 1,
                      }}
                    >
                      {summary.active_subjects}
                    </p>
                  </div>

                  {/* Ring card */}
                  <div
                    className="cs-stat-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg
                      width="70"
                      height="70"
                      viewBox="0 0 64 64"
                      style={{ overflow: "visible" }}
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="rgba(30,41,59,0.9)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke={avgColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${ringPct * CIRC} ${CIRC}`}
                        strokeDashoffset={CIRC * 0.25}
                        style={{ transition: "stroke-dasharray 1s ease" }}
                      />
                      <text
                        x="32"
                        y="37"
                        textAnchor="middle"
                        fill={avgColor}
                        fontSize="13"
                        fontWeight="700"
                        fontFamily="'Sora',sans-serif"
                      >
                        {avg > 0 ? avg.toFixed(1) : "—"}
                      </text>
                    </svg>
                    <p
                      className="cs-font-body"
                      style={{
                        margin: 0,
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(148,163,184,0.4)",
                        textAlign: "center",
                      }}
                    >
                      Promedio
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div
                  className="cs-glass cs-a3"
                  style={{ borderRadius: "24px", padding: "22px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <h3
                        className="cs-font-display"
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#f1f5f9",
                        }}
                      >
                        Rendimiento histórico
                      </h3>
                      <p
                        className="cs-font-body"
                        style={{
                          margin: "3px 0 0",
                          fontSize: "11px",
                          color: "rgba(148,163,184,0.4)",
                        }}
                      >
                        Promedio por semestre
                      </p>
                    </div>
                    {summary.chart_data.length > 0 && (
                      <span
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.18)",
                          borderRadius: "20px",
                          padding: "3px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#818cf8",
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        {summary.chart_data.length} sem.
                      </span>
                    )}
                  </div>
                  <div style={{ height: "160px" }}>
                    {showChart && summary.chart_data.length > 0 ? (
                      <div
                        className="cs-chart-reveal"
                        style={{ height: "100%" }}
                      >
                        <ResponsiveContainer width="99%" height="100%">
                          <AreaChart
                            data={summary.chart_data}
                            margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="csGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#6366f1"
                                  stopOpacity={0.35}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#6366f1"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 10,
                                fill: "rgba(148,163,184,0.4)",
                                fontFamily: "'DM Sans',sans-serif",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              content={<CustomTooltip />}
                              cursor={{
                                stroke: "rgba(99,102,241,0.18)",
                                strokeWidth: 1,
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="promedio"
                              stroke="#6366f1"
                              strokeWidth={2.5}
                              fill="url(#csGrad)"
                              dot={{ fill: "#818cf8", r: 4, strokeWidth: 0 }}
                              activeDot={{
                                fill: "#a5b4fc",
                                r: 5,
                                strokeWidth: 0,
                              }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        {loading ? (
                          <IonSpinner
                            name="crescent"
                            style={
                              { "--color": "#6366f1" } as React.CSSProperties
                            }
                          />
                        ) : (
                          <>
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="rgba(99,102,241,0.3)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            <p
                              className="cs-font-body"
                              style={{
                                margin: 0,
                                fontSize: "12px",
                                color: "rgba(148,163,184,0.3)",
                                fontStyle: "italic",
                              }}
                            >
                              Sin datos para graficar
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick nav */}
                <div className="cs-a4">
                  <span
                    className="cs-section-label"
                    style={{ marginBottom: "12px", display: "block" }}
                  >
                    Navegación rápida
                  </span>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {/* 1. Semestres */}
                    <button
                      className="cs-nav-btn"
                      onClick={() => history.push("/terms")}
                    >
                      <div
                        className="cs-nav-icon"
                        style={{ background: "rgba(99,102,241,0.15)" }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                      <span
                        className="cs-font-display"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#cbd5e1",
                        }}
                      >
                        Semestres
                      </span>
                    </button>

                    {/* 2. Calendario */}
                    <button
                      className="cs-nav-btn"
                      onClick={() => history.push("/calendar")}
                    >
                      <div
                        className="cs-nav-icon"
                        style={{ background: "rgba(251,146,60,0.1)" }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fb923c"
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span
                        className="cs-font-display"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#cbd5e1",
                        }}
                      >
                        Calendario
                      </span>
                    </button>

                    {/* 3. Métodos de Estudio */}
                    <button
                      className="cs-nav-btn"
                      onClick={() => history.push("/study-methods")}
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "16px 20px",
                        gap: "16px",
                      }}
                    >
                      <div
                        className="cs-nav-icon"
                        style={{
                          background: "rgba(168,85,247,0.15)",
                          margin: 0,
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div
                        style={{
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <span
                          className="cs-font-display"
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#cbd5e1",
                          }}
                        >
                          Métodos de Estudio
                        </span>
                        <span
                          className="cs-font-body"
                          style={{
                            fontSize: "11px",
                            color: "rgba(148,163,184,0.5)",
                            fontWeight: 500,
                            marginTop: "2px",
                          }}
                        >
                          Pomodoro y Notas Rápidas
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* NUEVO: Banner de Notificaciones unificado */}
                <div className="cs-a4" style={{ animationDelay: "0.2s" }}>
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