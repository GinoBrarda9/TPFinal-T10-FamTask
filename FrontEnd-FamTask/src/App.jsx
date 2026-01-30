import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import GoogleSuccess from "./components/GoogleSuccess";
import FinancePage from "./components/FinancePage";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import CalendarPage from "./components/CalendarPage2";
import FAQ from "./components/FAQ";
import TermsModal from "./components/TermsModal";
import FinanceReportPage from "./components/FinanceReportPage";
import KanbanReportPage from "./components/KanbanReportPage";
import EventReportPage from "./components/EventReportPage";

import "./App.css";

// ✅ Valida exp del JWT (base64url safe)
const isTokenValid = (token) => {
  try {
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // Si no hay exp, lo consideramos inválido (más seguro)
    if (!payload?.exp) return false;

    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  } catch (e) {
    return false;
  }
};

function App() {
  const [showSignup, setShowSignup] = useState(false);

  // ✅ Verificar si el usuario está autenticado (y token NO expirado)
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const valid = isTokenValid(token);
    if (!valid) {
      localStorage.removeItem("token"); // limpia sesión vencida
      return false;
    }
    return true;
  };

  // Componente para proteger rutas
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Página de Login */}
          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <Navigate to="/home" replace />
              ) : (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <LoginForm onNavigateToSignup={() => setShowSignup(true)} />
                </div>
              )
            }
          />

          {/* ✅ Finanzas PROTEGIDA */}
          <Route
            path="/finances"
            element={
              <ProtectedRoute>
                <FinancePage />
              </ProtectedRoute>
            }
          />

          {/* Página principal después del login - PROTEGIDA */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route path="/terminos" element={<TermsModal />} />
          <Route path="/faq" element={<FAQ />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/google/success" element={<GoogleSuccess />} />

          {/* ✅ Calendario PROTEGIDA */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Reportes PROTEGIDOS */}
          <Route
            path="/reports/finance"
            element={
              <ProtectedRoute>
                <FinanceReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/kanban"
            element={
              <ProtectedRoute>
                <KanbanReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/events"
            element={
              <ProtectedRoute>
                <EventReportPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 - Redirigir según autenticación */}
          <Route
            path="*"
            element={
              isAuthenticated() ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        {/* Modal de Signup */}
        {showSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              {/* Botón de cierre */}
              <button
                onClick={() => setShowSignup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                ✕
              </button>

              {/* Formulario de registro */}
              <SignupForm onNavigateToLogin={() => setShowSignup(false)} />
            </div>
          </div>
        )}

        {/* Toast Container para notificaciones */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
