import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import HomePage from "./components/HomePage";
import "./App.css";

function App() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <Router>
      <div className="App min-h-screen flex items-center justify-center bg-gray-100 relative">
        <Routes>
          {/* Página de Login */}
          <Route
            path="/"
            element={
              <LoginForm onNavigateToSignup={() => setShowSignup(true)} />
            }
          />

          {/* Página principal después del login */}
          <Route path="/home" element={<HomePage />} />
        </Routes>

        {/* Modal de Signup */}
        {showSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 overflow-y-auto">
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
