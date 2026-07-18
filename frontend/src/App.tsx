import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { LuX } from "react-icons/lu";

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
  mode: "ios",
});

// ─── Custom Toaster renderer (Glassmorphism con Tailwind V4) ────────────────
const CustomToaster: React.FC = () => (
  <Toaster
    position="top-center"
    gutter={10}
    toastOptions={{
      duration: 4000,
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
          const accent = isSuccess ? "#10b981" : isError ? "#f87171" : "#818cf8";
          const label = isSuccess ? "Éxito" : isError ? "Error" : "Info";

          return (
            <div
              onClick={() => toast.dismiss(t.id)}
              className={`flex items-stretch w-full max-w-95 bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/15 border-l-4 transition-all duration-300 cursor-pointer ${
                t.visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
              }`}
              style={{ borderLeftColor: accent }}
            >
              <div className="flex-1 px-4 py-3.5">
                <p
                  className="m-0 text-[10px] font-bold tracking-[0.09em] uppercase"
                  style={{ color: accent }}
                >
                  {label}
                </p>
                <div className="m-0 mt-1 text-[13px] text-slate-200 leading-relaxed font-medium">
                  {message}
                </div>
              </div>
              {/* Botón Cerrar (Dismiss Hint) */}
              <div className="flex items-center px-4 border-l border-indigo-500/10 hover:bg-white/5 transition-colors">
                <LuX className="text-slate-500 text-base" />
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
  <IonApp className="bg-[#020817]">
    {/* Toaster glassmorphism global */}
    <CustomToaster />

    <IonReactRouter>
      <IonRouterOutlet animated className="bg-[#020817]">
        {/* Auth */}
        <Route exact path="/login"><Login /></Route>
        <Route exact path="/register"><Register /></Route>
        <Route exact path="/reset-password/:token"><ResetPassword /></Route>

        {/* Redirect raíz → login */}
        <Route exact path="/"><Redirect to="/login" /></Route>

        {/* App (protegidas) */}
        <Route path="/dashboard"><Dashboard /></Route>
        <Route exact path="/terms"><Terms /></Route>
        <Route exact path="/terms/:termId/subjects"><Subjects /></Route>
        <Route exact path="/subjects/:subjectId/evaluations"><Evaluations /></Route>
        <Route exact path="/calendar"><Calendar /></Route>
        <Route exact path="/study-methods"><StudyMethods /></Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;