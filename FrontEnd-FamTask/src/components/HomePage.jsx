import { useState, useEffect } from "react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [userDni, setUserDni] = useState("");
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [createdFamilyId, setCreatedFamilyId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [family, setFamily] = useState(null); // { id, name, members: [...] }
  const [familyMembers, setFamilyMembers] = useState([]); // [{ dni, name, role }]
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [familyError, setFamilyError] = useState("");
  const [loadingFamily, setLoadingFamily] = useState(false);

  const [activities] = useState([
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
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        if (token.split(".").length === 3) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const decoded = JSON.parse(jsonPayload);
          setUserName(decoded.name || "Usuario");
          setUserDni(decoded.sub || decoded.dni);
        }
      } catch (err) {
        console.warn("No se pudo decodificar token:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (userDni) fetchInvitations();
    fetchFamily();
  }, [userDni]);

  const fetchInvitations = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userDni) return;

    try {
      const resp = await fetch(
        "http://localhost:8080/api/invitations/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        setInvitations(data || []);
        setNotificationCount(
          (data || []).filter((inv) => inv.status === "PENDING").length
        );
      } else if (resp.status === 404) {
        setInvitations([]);
        setNotificationCount(0);
      }
    } catch (e) {
      console.error("Error al cargar invitaciones:", e);
    }
  };

  const createFamily = async () => {
    setFamilyError("");
    if (!familyName.trim()) {
      setFamilyError("Ingresá un nombre para la familia.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setFamilyError("No hay sesión activa.");
      return;
    }

    try {
      setCreatingFamily(true);
      const resp = await fetch("http://localhost:8080/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: familyName.trim() }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "No se pudo crear la familia.");
      }

      // Éxito: guardo id, cierro y abro el modal de invitación
      const data = await resp.json();
      setCreatedFamilyId(data.id);
      setShowCreateFamilyModal(false);
      setShowInviteMemberModal(true);
      setFamilyName("");
      await fetchFamily();
    } catch (e) {
      setFamilyError(e.message);
    } finally {
      setCreatingFamily(false);
    }
  };

  const fetchFamily = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resp = await fetch("http://localhost:8080/api/homepage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("FETCH FAMILY - Status:", resp.status);

      if (resp.status === 401) {
        console.warn("Sesión expirada");
        localStorage.removeItem("token");
        return;
      }

      if (resp.status === 404) {
        console.log("Usuario no pertenece a ninguna familia");
        setFamily(null);
        setFamilyMembers([]);
        return;
      }

      if (!resp.ok) {
        console.warn("Error obteniendo familia:", resp.status);
        setFamily(null);
        setFamilyMembers([]);
        return;
      }

      const data = await resp.json();
      console.log("FETCH FAMILY - DATA recibida:", data);

      const normalized = {
        id: data.familyId ?? data.id ?? null,
        name: data.familyName ?? data.name ?? "Mi familia",
        members: Array.isArray(data.members)
          ? data.members.map((m) => ({
              dni: m.dni ?? m.userDni ?? m.id ?? "",
              name: m.name ?? m.userName ?? "—",
              role: String(m.role ?? m.userRole ?? "").toUpperCase(),
            }))
          : [],
      };

      console.log("FETCH FAMILY - Normalized:", normalized);

      setFamily(normalized);
      setFamilyMembers(normalized.members || []);
      if (normalized.id) {
        setCreatedFamilyId(normalized.id);
      }

      console.log("FETCH FAMILY - createdFamilyId guardado:", normalized.id);
    } catch (e) {
      console.error("Error al cargar familia:", e);
      setFamily(null);
      setFamilyMembers([]);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      alert("Por favor ingresa un nombre para la familia");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay token de autenticación");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/families", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: familyName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedFamilyId(data.id);
        alert("¡Familia creada exitosamente!");
        setShowCreateFamilyModal(false);
        setShowInviteMemberModal(true);
        setFamilyName("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          `Error al crear familia: ${errorData.message || "Error desconocido"}`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor");
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      alert("Por favor ingresa un email");
      return;
    }

    const familyId = createdFamilyId ?? family?.id;
    console.log("DEBUG - createdFamilyId:", createdFamilyId);
    console.log("DEBUG - family?.id:", family?.id);
    console.log("DEBUG - familyId final:", familyId);

    if (!familyId) {
      alert("No hay una familia seleccionada");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay token de autenticación");
      return;
    }

    // Debug completo
    console.log("=== DEBUG INVITACIÓN ===");
    console.log("Token:", token.substring(0, 50) + "...");
    console.log("Family ID:", createdFamilyId);
    console.log("Email a invitar:", inviteEmail);

    const payload = {
      familyId,
      invitedUserEmail: inviteEmail.trim(),
      role: "USER",
    };

    console.log("Payload:", JSON.stringify(payload));

    try {
      const response = await fetch("http://localhost:8080/api/invitations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Intentar leer la respuesta como texto primero
      const responseText = await response.text();
      console.log("Response body (text):", responseText);

      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
        console.log("Response body (parsed):", errorData);
      } catch (e) {
        console.log("No se pudo parsear como JSON");
      }

      if (response.ok) {
        alert("¡Invitación enviada exitosamente!");
        setInviteEmail("");
      } else if (response.status === 403) {
        alert(
          `⛔ Acceso denegado (403): ${
            errorData.message ||
            errorData.error ||
            "No tienes permisos para enviar invitaciones"
          }`
        );
      } else if (response.status === 401) {
        alert(
          "Tu sesión ha expirado (401). Por favor inicia sesión nuevamente."
        );
        localStorage.removeItem("token");
        window.location.reload();
      } else {
        alert(
          `Error ${response.status}: ${
            errorData.message || errorData.error || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor");
    }
  };

  const handleRespondInvitation = async (invitationId, accept) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/invitations/${invitationId}/respond?accept=${accept}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert(accept ? "¡Invitación aceptada!" : "Invitación rechazada");
        fetchInvitations();
        if (accept) fetchFamily();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

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

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
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
            <button className="w-full flex items-center gap-3 p-3 bg-amber-50 text-amber-600 rounded-lg">
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
            </button>
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
          {/* Botón de Notificaciones */}
          <button
            onClick={() => {
              setShowNotificationsModal(true);
              fetchInvitations();
            }}
            className="p-2 hover:bg-gray-100 rounded-full relative"
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
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {notificationCount}
              </span>
            )}
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
                  onClick={() => setMenuOpen(false)}
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
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg p-8 text-white w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ¡Hola, {userName}! 👋
          </h1>
          <p className="text-amber-50 text-lg">
            Bienvenido a tu espacio personal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Card: Mi familia */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-700">Mi familia</h3>
              {family && (
                <span className="text-sm text-gray-500">
                  {familyMembers?.length ?? 0} miembro(s)
                </span>
              )}
            </div>

            {/* Cargando */}
            {loadingFamily ? (
              <div className="flex items-center gap-2 text-gray-500">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
                Cargando datos...
              </div>
            ) : family ? (
              /* Hay familia: nombre + lista de miembros */
              <>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {family.name}
                </h4>

                {!familyMembers || familyMembers.length === 0 ? (
                  <p className="text-gray-500">Aún no hay miembros.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {familyMembers.map((m) => (
                      <li
                        key={m.dni || m.email || m.name}
                        className="py-2 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {m.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {m.dni || m.email}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {(m.role || "MIEMBRO").toString().toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Acción rápida: invitar si ya hay familia */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (family?.id) setCreatedFamilyId(family.id);
                      setShowInviteMemberModal(true);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Invitar miembro
                  </button>
                </div>
              </>
            ) : (
              /* No pertenece a una familia: CTA crear */
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Aún no perteneces a una familia.
                </p>
                <button
                  onClick={() => setShowCreateFamilyModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Crear familia
                </button>
              </div>
            )}
          </div>

          {/* Card: Board de Actividades */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Board de Actividades</h3>
            </div>

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
      </main>

      {/* Modal Crear Familia */}
      {showCreateFamilyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                Crear Familia
              </h2>
              <button
                onClick={() => setShowCreateFamilyModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
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

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Familia
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFamily();
                  }}
                  placeholder="Ej: Familia García"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  disabled={creatingFamily}
                />
              </div>

              {familyError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {familyError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowCreateFamilyModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
                disabled={creatingFamily}
              >
                Cancelar
              </button>
              <button
                onClick={createFamily}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={creatingFamily || !familyName.trim()}
              >
                {creatingFamily ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                    Creando...
                  </span>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Invitar Miembros */}
      {showInviteMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                Invitar Miembros
              </h2>
              <button
                onClick={() => {
                  setShowInviteMemberModal(false);
                  setInviteEmail("");
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

            <div className="p-6 space-y-6">
              {family && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    📤 Enviando invitación para:{" "}
                    <span className="font-semibold">{family.name}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email del usuario
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSendInvitation}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Enviar Invitación
              </button>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowInviteMemberModal(false);
                  setInviteEmail("");
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notificaciones */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">
                  Invitaciones
                </h2>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notificationCount} pendientes
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
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

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg">
                    No tienes invitaciones
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Las invitaciones que recibas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">
                            {invitation.familyName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Invitado por:{" "}
                            <span className="font-medium">
                              {invitation.inviterName}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            📅{" "}
                            {new Date(invitation.createdAt).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getInvitationStatusColor(
                            invitation.status
                          )}`}
                        >
                          {invitation.status === "PENDING"
                            ? "Pendiente"
                            : invitation.status === "ACCEPTED"
                            ? "Aceptada"
                            : "Rechazada"}
                        </span>
                      </div>

                      {invitation.status === "PENDING" && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() =>
                              handleRespondInvitation(invitation.id, true)
                            }
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Aceptar
                          </button>
                          <button
                            onClick={() =>
                              handleRespondInvitation(invitation.id, false)
                            }
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
