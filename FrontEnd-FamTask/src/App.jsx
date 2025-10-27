import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import HomePage from "./components/HomePage";
import UserProfile from "./components/UserProfile";
import "./App.css";

function App() {
  const [showSignup, setShowSignup] = useState(false);

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return localStorage.getItem("token") !== null;
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

          {/* Página principal después del login - PROTEGIDA */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Página de perfil - PROTEGIDA */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
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
      </div>
    </Router>
  );
}

export default App;
