import { useState, useEffect } from "react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [userDni, setUserDni] = useState("");
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [createdFamilyId, setCreatedFamilyId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [family, setFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [creatingFamily, setCreatingFamily] = useState(false);
  const [familyError, setFamilyError] = useState("");
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [userRole, setUserRole] = useState("USER");

  // Estados para eventos
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    color: "#FF5733",
    location: "",
    allDay: false,
    familyId: null,
    memberDni: null,
  });

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
    if (userDni) {
      fetchInvitations();
      fetchEvents();
    }
    fetchFamily();
  }, [userDni]);

  useEffect(() => {
    if (family) {
      const currentMember = familyMembers.find((m) => m.dni === userDni);
      if (currentMember) {
        setUserRole(currentMember.role);
      }
    }
  }, [family, familyMembers, userDni]);

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userDni) return;

    setLoadingEvents(true);
    try {
      // Obtener eventos personales
      const personalResp = await fetch(
        `http://localhost:8080/api/events/member/${userDni}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let personalEvents = [];
      if (personalResp.ok) {
        personalEvents = await personalResp.json();
      }

      // Obtener eventos familiares si tiene familia
      let familyEvents = [];
      if (family?.id) {
        const familyResp = await fetch(
          `http://localhost:8080/api/events/family/${family.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (familyResp.ok) {
          familyEvents = await familyResp.json();
        }
      }

      // Combinar eventos
      const allEvents = [...personalEvents, ...familyEvents];
      setEvents(allEvents);
    } catch (e) {
      console.error("Error al cargar eventos:", e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCreateOrUpdateEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay sesión activa");
      return;
    }

    if (!eventForm.title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    // Validar que si es evento familiar, el usuario sea ADMIN
    if (eventForm.familyId && userRole !== "ADMIN") {
      alert("Solo los administradores pueden crear eventos familiares");
      return;
    }

    // Preparar datos
    const eventData = {
      ...eventForm,
      familyId: eventForm.familyId || null,
      memberDni: eventForm.familyId ? null : userDni,
    };

    try {
      const url = editingEvent
        ? `http://localhost:8080/api/events/${editingEvent.id}`
        : "http://localhost:8080/api/events";

      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        alert(
          editingEvent
            ? "¡Evento actualizado exitosamente!"
            : "¡Evento creado exitosamente!"
        );
        setShowEventModal(false);
        resetEventForm();
        fetchEvents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Evento eliminado exitosamente");
        fetchEvents();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      color: event.color || "#FF5733",
      location: event.location || "",
      allDay: event.allDay || false,
      familyId: event.familyId || null,
      memberDni: event.memberDni || null,
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      color: "#FF5733",
      location: "",
      allDay: false,
      familyId: null,
      memberDni: null,
    });
  };

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

      if (resp.status === 401) {
        console.warn("Sesión expirada");
        localStorage.removeItem("token");
        return;
      }

      if (resp.status === 404) {
        setFamily(null);
        setFamilyMembers([]);
        return;
      }

      if (!resp.ok) {
        setFamily(null);
        setFamilyMembers([]);
        return;
      }

      const data = await resp.json();

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

      setFamily(normalized);
      setFamilyMembers(normalized.members || []);
      if (normalized.id) {
        setCreatedFamilyId(normalized.id);
      }
    } catch (e) {
      console.error("Error al cargar familia:", e);
      setFamily(null);
      setFamilyMembers([]);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      alert("Por favor ingresa un email");
      return;
    }

    const familyId = createdFamilyId ?? family?.id;

    if (!familyId) {
      alert("No hay una familia seleccionada");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay token de autenticación");
      return;
    }

    const payload = {
      familyId,
      invitedUserEmail: inviteEmail.trim(),
      role: "USER",
    };

    try {
      const response = await fetch("http://localhost:8080/api/invitations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("¡Invitación enviada exitosamente!");
        setInviteEmail("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || "Error desconocido"}`);
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
        if (accept) {
          fetchFamily();
          fetchEvents();
        }
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

  const getEventTypeLabel = (event) => {
    return event.familyId ? "Familiar" : "Personal";
  };

  const getEventTypeColor = (event) => {
    return event.familyId
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditEvent = (event) => {
    // Si es evento familiar, solo ADMIN puede editar
    if (event.familyId) {
      return userRole === "ADMIN";
    }
    // Si es evento personal, solo el dueño puede editar
    return event.memberDni === userDni;
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
  // Construye la URL de WhatsApp Web a partir de los datos del miembro
  const buildWhatsAppUrl = (member) => {
    const raw = member.phone || member.telefono || member.dni || "";
    const digits = String(raw).replace(/\D/g, "");
    if (!digits) return "https://web.whatsapp.com/";

    // Normalizaciones comunes en AR: quitar 0 inicial y 15 local
    let n = digits.replace(/^0+/, "").replace(/^15/, "");

    // Prefijar país si falta (54 Argentina)
    if (!/^54/.test(n)) n = "54" + n;

    // WhatsApp móvil en AR requiere 9 después del país
    if (/^54(?!9)/.test(n)) n = "549" + n.slice(2);

    return `https://web.whatsapp.com/send?phone=${n}`;
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
                          {/* Ícono de WhatsApp */}
                          {m.dni && m.dni !== userDni && (
                            <a
                              href={buildWhatsAppUrl(m)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-green-100 rounded-full transition-colors"
                              title={`Enviar WhatsApp a ${m.name}`}
                              aria-label={`Enviar WhatsApp a ${m.name}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </a>
                          )}
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

          {/* Card: Board de Actividades/Eventos */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Board de Eventos</h3>
              <button
                onClick={() => {
                  resetEventForm();
                  setShowEventModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                Nuevo Evento
              </button>
            </div>

            {loadingEvents ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-amber-500"
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
              </div>
            ) : events.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">No hay eventos</p>
                <p className="text-gray-400 text-sm mt-2">
                  Crea tu primer evento para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">📅</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            🕐 {formatDateTime(event.startTime)}
                          </span>
                          {event.location && (
                            <span className="text-xs text-gray-500">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(
                          event
                        )}`}
                      >
                        {getEventTypeLabel(event)}
                      </span>
                      {canEditEvent(event) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEvent(event)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-red-600"
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Crear/Editar Evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetEventForm();
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

            <div className="p-6 space-y-4">
              {/* Tipo de evento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de evento
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      checked={!eventForm.familyId}
                      onChange={() =>
                        setEventForm({ ...eventForm, familyId: null })
                      }
                      className="w-4 h-4 text-amber-500"
                    />
                    <span className="text-sm text-gray-700">Personal</span>
                  </label>
                  {family && userRole === "ADMIN" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="eventType"
                        checked={!!eventForm.familyId}
                        onChange={() =>
                          setEventForm({ ...eventForm, familyId: family.id })
                        }
                        className="w-4 h-4 text-amber-500"
                      />
                      <span className="text-sm text-gray-700">Familiar</span>
                    </label>
                  )}
                </div>
                {eventForm.familyId && (
                  <p className="text-xs text-purple-600 mt-1">
                    Este evento será visible para toda la familia
                  </p>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  placeholder="Ej: Reunión familiar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  placeholder="Detalles del evento..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, location: e.target.value })
                  }
                  placeholder="Ej: Casa, Zoom, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, startTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, endTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Todo el día */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventForm.allDay}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, allDay: e.target.checked })
                    }
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span className="text-sm text-gray-700">Todo el día</span>
                </label>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={eventForm.color}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, color: e.target.value })
                    }
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    {eventForm.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetEventForm();
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrUpdateEvent}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {editingEvent ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Familia */}
      {showCreateFamilyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                Crear Familia
              </h2>
              <button
                onClick={() => setShowCreateFamilyModal(false)}
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
                {creatingFamily ? "Creando..." : "Crear"}
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
