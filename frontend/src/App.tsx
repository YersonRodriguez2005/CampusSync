import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Toaster, ToastBar, toast } from "react-hot-toast";

/* ── Páginas ── */
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import Subjects from "./pages/Subjects";
import Evaluations from "./pages/Evaluations";
import ResetPassword from "./pages/ResetPassword";
import Calendar from "./pages/Calendar";
import StudyMethods from "./pages/StudyMethods";

/* ── Core CSS requerido para Ionic ── */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* ── CSS Opcional de Ionic ── */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* ── Variables de Tema y Tailwind ── */
import "./theme/variables.css";

setupIonicReact({
  // Evita que Ionic sobreescriba el fondo con su propio color
  mode: "ios",
});

// ─── Custom Toaster renderer ──────────────────────────────────────────────────
// Centraliza el estilo glassmorphism de los toasts aquí para que las páginas
// solo necesiten llamar a toast.success / toast.error simples.
const CustomToaster: React.FC = () => (
  <Toaster
    position="top-center"
    gutter={10}
    toastOptions={{
      duration: 4000,
      // Estilos base (sobreescritos por ToastBar abajo)
      style: { background: "transparent", boxShadow: "none", padding: 0 },
    }}
  >
    {(t) => (
      <ToastBar
        toast={t}
        style={{ background: "transparent", boxShadow: "none", padding: 0 }}
      >
        {({ message }) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const accent = isSuccess
            ? "#10b981"
            : isError
              ? "#f87171"
              : "#818cf8";
          const label = isSuccess ? "Éxito" : isError ? "Error" : "Info";

          return (
            <div
              onClick={() => toast.dismiss(t.id)}
              style={{
                display: "flex",
                alignItems: "stretch",
                maxWidth: "380px",
                width: "100%",
                background: "rgba(15,23,42,0.96)",
                backdropFilter: "blur(20px)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
                border: "1px solid rgba(99,102,241,0.14)",
                borderLeft: `4px solid ${accent}`,
                opacity: t.visible ? 1 : 0,
                transition: "opacity 0.22s",
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              <div style={{ flex: 1, padding: "14px 16px" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: accent,
                  }}
                >
                  {label}
                </p>
                <div
                  style={{
                    margin: "4px 0 0",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  {message}
                </div>
              </div>
              {/* Dismiss hint */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  borderLeft: "1px solid rgba(99,102,241,0.1)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(148,163,184,0.4)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
          );
        }}
      </ToastBar>
    )}
  </Toaster>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <IonApp>
    {/* Toaster glassmorphism global */}
    <CustomToaster />

    <IonReactRouter>
      <IonRouterOutlet animated>
        {/* Auth */}
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        <Route exact path="/reset-password/:token">
          <ResetPassword />
        </Route>

        {/* Redirect raíz → login */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        {/* App (protegidas) */}
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/terms">
          <Terms />
        </Route>
        <Route exact path="/terms/:termId/subjects">
          <Subjects />
        </Route>
        <Route exact path="/subjects/:subjectId/evaluations">
          <Evaluations />
        </Route>
        <Route exact path="/calendar">
          <Calendar />
        </Route>
        <Route exact path="/study-methods">
          <StudyMethods />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
