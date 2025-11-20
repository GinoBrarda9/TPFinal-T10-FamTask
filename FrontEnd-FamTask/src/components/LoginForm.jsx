import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onNavigateToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login exitoso:", data);
        localStorage.setItem("token", data.token);
        navigate("/home");
        // Guardar token, redirigir al dashboard, etc.
      } else {
        console.error("Error en login");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* 🟡 Sección izquierda — visible solo en desktop */}
      <div className="hidden lg:flex flex-col w-1/2 items-center justify-center relative bg-gradient-to-br from-amber-50 to-yellow-100 overflow-hidden px-6 gap-4">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070')",
          }}
        />
        {/* Contenido visible sobre la imagen */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-400 rounded-full mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">FamTask</h1>
            <p className="text-xl text-gray-600">
              Organiza tu familia, simplifica tu vida
            </p>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-md mx-auto">
            <div className="space-y-4 text-left">
              <p className="font-semibold text-gray-700 flex items-center gap-2">
                📅 <span>Calendario compartido</span>
              </p>
              <p className="font-semibold text-gray-700 flex items-center gap-2">
                ✅ <span>Tablero Kanban</span>
              </p>
              <p className="font-semibold text-gray-700 flex items-center gap-2">
                🔔 <span>Notificaciones familiares</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Sección derecha — formulario visible en todas las pantallas */}
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 sm:p-8">
        {/* Logo (solo móvil) */}
        <div className="lg:hidden text-center mb-8 mt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-full mb-3 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FamTask</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-amber-200 w-full max-w-sm sm:max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Inicia sesión para gestionar tu familia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-amber-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transform transition duration-200 hover:scale-105 shadow-lg"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={onNavigateToSignup}
              className="w-full font-medium text-amber-600 hover:text-amber-700 transition duration-200 mt-2"
            >
              Crear cuenta nueva
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
