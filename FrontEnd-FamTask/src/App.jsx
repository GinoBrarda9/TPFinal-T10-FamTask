import { useState } from "react";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import "./App.css";

function App() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="App min-h-screen flex items-center justify-center bg-gray-100">
      {/* Siempre se ve el login */}
      <LoginForm onNavigateToSignup={() => setShowSignup(true)} />

      {/* Si showSignup es true, mostramos el modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6">
            {/* Botón cerrar arriba a la derecha */}
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              ✕
            </button>

            {/* Formulario Signup */}
            <SignupForm onNavigateToLogin={() => setShowSignup(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
