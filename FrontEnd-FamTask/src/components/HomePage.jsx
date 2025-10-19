import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function HomePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMember, setNewMember] = useState({ nombre: "", rol: "" });
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "task",
      title: "Hacer la compra",
      status: "pending",
      assignee: "María",
      dueDate: "Hoy",
    },
    {
      id: 2,
      type: "task",
      title: "Revisar tareas escolares",
      status: "pending",
      assignee: "Juan",
      dueDate: "Mañana",
    },
    {
      id: 3,
      type: "event",
      title: "Cita médica",
      status: "scheduled",
      assignee: "Pedro",
      dueDate: "Jueves",
    },
    {
      id: 4,
      type: "task",
      title: "Limpiar la casa",
      status: "in-progress",
      assignee: "Ana",
      dueDate: "Hoy",
    },
    {
      id: 5,
      type: "event",
      title: "Reunión familiar",
      status: "scheduled",
      assignee: "Todos",
      dueDate: "Viernes",
    },
  ]);

  const handleAddActivity = () => {
    const newActivity = {
      id: activities.length + 1,
      type: "task",
      title: "Nueva actividad",
      status: "pending",
      assignee: userName,
      dueDate: "Hoy",
    };
    setActivities([...activities, newActivity]);
  };

  const handleAddMember = () => {
    if (newMember.nombre.trim() && newMember.rol.trim()) {
      setFamilyMembers([...familyMembers, { ...newMember, id: Date.now() }]);
      setNewMember({ nombre: "", rol: "" });
    }
  };

  const handleRemoveMember = (id) => {
    setFamilyMembers(familyMembers.filter((member) => member.id !== id));
  };

  const handleCreateFamily = async () => {
    if (familyMembers.length === 0) {
      alert("Debes agregar al menos un miembro a la familia");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "No hay token de autenticación. Por favor inicia sesión nuevamente."
        );
        navigate("/");
        return;
      }

      console.log("Creando familia con:", familyMembers);
      console.log("Token:", token ? "presente" : "ausente");

      const response = await fetch("http://localhost:8080/api/families", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          members: familyMembers,
        }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Familia creada:", data);
        alert("¡Familia creada exitosamente!");
        setShowCreateFamilyModal(false);
        setFamilyMembers([]);
      } else if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error 403:", errorData);
        alert("No tienes permisos para crear una familia. Verifica tu sesión.");
      } else if (response.status === 401) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error al crear familia:", errorData);
        alert(
          `Error al crear la familia: ${
            errorData.message || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        if (token.split(".").length === 3) {
          const decoded = jwt_decode(token);
          setUserName(decoded.name || "Usuario");
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
    window.location.reload();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    return type === "task" ? "✓" : "📅";
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-amber-600">FamTask</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-amber-50 text-amber-600 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span>Inicio</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span>Calendario</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span>Tareas</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Familia</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <span>Notificaciones</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Configuración</span>
            </a>
          </nav>

          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white shadow-md w-full px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-amber-600 font-bold text-2xl tracking-tight">
            FamTask
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

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
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Card: Crear Familia */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-2xl transition-shadow">
            <div className="flex flex-col items-center text-center h-full justify-between">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Crear Familia</h3>
                <p className="text-gray-600 mb-4">
                  Invita a tus familiares y comienza a organizar juntos
                </p>
              </div>
              <button
                onClick={() => setShowCreateFamilyModal(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear Familia
              </button>
            </div>
          </div>

          {/* Card: Board de Actividades */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Board de Actividades</h3>
              <button
                onClick={handleAddActivity}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nueva
              </button>
            </div>

            {/* Activities List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(activity.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Asignado a:{" "}
                        <span className="font-medium">{activity.assignee}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {activity.dueDate}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {activity.type === "task" ? "Tarea" : "Evento"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6">
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

      {/* Modal Crear Familia */}
      {showCreateFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Crear Familia
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateFamilyModal(false);
                  setFamilyMembers([]);
                  setNewMember({ nombre: "", rol: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Formulario para agregar miembro */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Agregar Miembro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newMember.nombre}
                      onChange={(e) =>
                        setNewMember({ ...newMember, nombre: e.target.value })
                      }
                      placeholder="Ej: María"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      value={newMember.rol}
                      onChange={(e) =>
                        setNewMember({ ...newMember, rol: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="Padre/Madre">Padre/Madre</option>
                      <option value="Hijo/Hija">Hijo/Hija</option>
                      <option value="Abuelo/Abuela">Abuelo/Abuela</option>
                      <option value="Tío/Tía">Tío/Tía</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddMember}
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar
                </button>
              </div>

              {/* Lista de miembros agregados */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Miembros de la Familia ({familyMembers.length})
                </h3>

                {familyMembers.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-gray-500">
                      No hay miembros agregados aún
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Agrega al menos un miembro para crear la familia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {member.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {member.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.rol}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowCreateFamilyModal(false);
                  setFamilyMembers([]);
                  setNewMember({ nombre: "", rol: "" });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFamily}
                disabled={familyMembers.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Familia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
