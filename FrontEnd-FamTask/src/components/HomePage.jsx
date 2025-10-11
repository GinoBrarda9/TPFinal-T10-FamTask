import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Solo decodifica si token parece un JWT
        if (token.split(".").length === 3) {
          const decoded = jwt_decode(token);
          setUserName(decoded.name || "Usuario"); // Ajusta según tu payload real
        } else {
          console.warn(
            "Token no es un JWT decodable, usando nombre por defecto"
          );
        }
      } catch (err) {
        console.warn("No se pudo decodificar token:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // redirige a login
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white shadow-md w-full px-6 py-4">
        <div className="text-amber-600 font-bold text-2xl tracking-tight">
          FamTask
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200"
          >
            <span>{userName}</span>
            <img
              src={`https://ui-avatars.com/api/?name=${userName}&background=FFB020&color=fff`}
              alt="avatar"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <button
                onClick={() => alert("Ver perfil")}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 transition"
              >
                Ver perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 w-full flex flex-col">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg p-8 text-white w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ¡Hola, {userName}! 👋
          </h1>
          <p className="text-amber-50 text-lg">
            Bienvenido a tu espacio personal
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-2xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-800">12</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Tareas Pendientes
            </h3>
            <p className="text-sm text-gray-500 mt-1">3 vencen hoy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-2xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-800">5</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Eventos</h3>
            <p className="text-sm text-gray-500 mt-1">Esta semana</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-2xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <span className="text-3xl font-bold text-gray-800">8</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Notificaciones
            </h3>
            <p className="text-sm text-gray-500 mt-1">Sin leer</p>
          </div>
        </div>
      </main>
    </div>
  );
}
