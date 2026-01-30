import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import CalendarPage from "./CalendarPage2";
import KanbanBoard from "./KanbanBoard";
import Sidebar from "./Sidebar";
import FamilyCard from "./cards/FamilyCard";
import UpcomingEventsCard from "./cards/UpcomingEventsCard";
import InvitationsCard from "./cards/InvitationsCard";
import QuickStatsCard from "./cards/QuickStatsCard";
import { showSuccess, showError, showWarning, showInfo } from "../utils/notifications";
import useConfirm from "../hooks/useConfirm";

export default function HomePage() {
  const [currentView, setCurrentView] = useState("home");
  const navigate = useNavigate();
  const { ConfirmDialog, confirm } = useConfirm();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
  const [hasContactInfo, setHasContactInfo] = useState(true);
  const [showContactReminder, setShowContactReminder] = useState(false);
  const [inviteFamilyRole, setInviteFamilyRole] = useState("PARENT");
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);    
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
  const view = location.state?.view;
  if (view) {
    setCurrentView(view);
    navigate("/home", { replace: true, state: {} });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      fetchFamily();
      checkContactInfo();
    }
  }, [userDni]);

  const checkContactInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resp = await fetch("http://localhost:8080/api/profile/contact-info", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        const data = await resp.json();

        // Verificar si tiene teléfono válido (formato E.164) o dirección
        const hasValidPhone = data.phone && data.phone.trim().length > 0;
        const hasAddress = data.address && data.address.trim().length > 0;
        const hasInfo = hasValidPhone || hasAddress;

        setHasContactInfo(hasInfo);

        // Mostrar recordatorio solo si no tiene info y no fue cerrado en esta sesión
        const reminderDismissed = sessionStorage.getItem("contactReminderDismissed");
        setShowContactReminder(!hasInfo && !reminderDismissed);
      } else if (resp.status === 404) {
        // No tiene datos de contacto
        setHasContactInfo(false);
        const reminderDismissed = sessionStorage.getItem("contactReminderDismissed");
        setShowContactReminder(!reminderDismissed);
      }
    } catch (e) {
      console.error("Error al verificar datos de contacto:", e);
    }
  };

  useEffect(() => {
    if (family) {
      const currentMember = familyMembers.find((m) => m.dni === userDni);
      if (currentMember) {
        setUserRole(currentMember.role);
      }
    }
  }, [family, familyMembers, userDni]);

  // const fetchEvents = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token || !userDni) return;

  //   setLoadingEvents(true);
  //   try {
  //     const personalResp = await fetch(
  //       `http://localhost:8080/api/events/member/${userDni}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     let personalEvents = [];
  //     if (personalResp.ok) {
  //       personalEvents = await personalResp.json();
  //     }

  //     let familyEvents = [];
  //     if (family?.id) {
  //       const familyResp = await fetch(
  //         `http://localhost:8080/api/events/family/${family.id}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       if (familyResp.ok) {
  //         familyEvents = await familyResp.json();
  //       }
  //     }

  //     const allEvents = [...personalEvents, ...familyEvents];
  //     setEvents(allEvents);
  //   } catch (e) {
  //     console.error("Error al cargar eventos:", e);
  //   } finally {
  //     setLoadingEvents(false);
  //   }
  // };

  const handleCreateOrUpdateEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showWarning("No hay sesión activa");
      return;
    }

    if (!eventForm.title.trim()) {
      showWarning("El título es obligatorio");
      return;
    }

    if (!eventForm.startTime || !eventForm.endTime) {
      showWarning("Las fechas de inicio y fin son obligatorias");
      return;
    }

    if (eventForm.familyId && userRole !== "ADMIN") {
      showWarning("Solo los administradores pueden crear eventos familiares");
      return;
    }

    const eventData = {
      title: eventForm.title.trim(),
      description: eventForm.description?.trim() || "",
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      color: eventForm.color || "#FF5733",
      location: eventForm.location?.trim() || "",
      allDay: eventForm.allDay || false,
      familyId: eventForm.familyId || null,
      memberDni: eventForm.familyId ? null : userDni,
    };

    try {
      const url = editingEvent
        ? `http://localhost:8080/api/events/${editingEvent.id}`
        : "http://localhost:8080/api/events";

      const method = editingEvent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        showSuccess(editingEvent ? "¡Evento actualizado!" : "¡Evento creado!");
        setShowEventModal(false);
        resetEventForm();
        fetchFamily();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión con el servidor");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = await confirm({
      title: "¿Eliminar evento?",
      message: "¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      type: "danger"
    });

    if (!confirmed) return;

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
        showSuccess("Evento eliminado exitosamente");
        fetchFamily();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión");
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
        { headers: { Authorization: `Bearer ${token}` } }
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
      setLoadingFamily(true);

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
        setEvents([]); // 👈 clave
        return;
      }

      if (!resp.ok) {
        setFamily(null);
        setFamilyMembers([]);
        setEvents([]);
        return;
      }

      const data = await resp.json();

      // ✅ Normalizamos familia
      const normalized = {
        id: data.familyId ?? null,
        name: data.familyName ?? "Mi familia",
        members: Array.isArray(data.members)
          ? data.members.map((m) => ({
              dni: m.dni ?? "",
              name: m.name ?? "—",
              role: String(m.role ?? "").toUpperCase(),
              phone: m.phone ?? null,
            }))
          : [],
      };

      setFamily(normalized);
      setFamilyMembers(normalized.members || []);

      // ✅ ACA ES DONDE SE RECONSTRUYEN LOS EVENTOS
      if (Array.isArray(data.upcomingEvents)) {
        setEvents(data.upcomingEvents);
      } else {
        setEvents([]);
      }

      if (normalized.id) {
        setCreatedFamilyId(normalized.id);
      }

    } catch (e) {
      console.error("Error al cargar familia:", e);
      setFamily(null);
      setFamilyMembers([]);
      setEvents([]);
    } finally {
      setLoadingFamily(false);
    }
  };


  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      showWarning("Por favor ingresa un email");
      return;
    }

    const familyId = createdFamilyId ?? family?.id;

    if (!familyId) {
      showWarning("No hay una familia seleccionada");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showWarning("No hay token de autenticación");
      return;
    }

    const payload = {
      familyId,
      invitedUserEmail: inviteEmail.trim(),
      role: inviteIsAdmin ? "ADMIN" : "USER",
      familyRole: inviteFamilyRole,
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
        showSuccess("¡Invitación enviada exitosamente!");
        setInviteEmail("");
        setInviteFamilyRole("PARENT");
        setInviteIsAdmin(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      showError("Error de conexión con el servidor");
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
        if (accept) {
          showSuccess("¡Invitación aceptada!");
        } else {
          showInfo("Invitación rechazada");
        }
        fetchInvitations();
        if (accept) {
          fetchFamily();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Error: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión");
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
      ? "bg-orange-100 text-orange-800"
      : "bg-amber-100 text-amber-800";
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
    // El backend envía la entidad Event directamente, no el DTO
    // Por lo tanto, tenemos 'family' (objeto) en lugar de 'familyId'
    // y 'assignedTo' está con @JsonIgnore, por lo que no viene

    // Si el evento tiene 'family', es un evento familiar
    const isFamilyEvent = event.family || event.familyId;

    if (isFamilyEvent) {
      // Solo los ADMIN pueden editar eventos familiares
      return userRole === "ADMIN";
    }

    // Si no es un evento familiar, es personal
    // Como no tenemos memberDni (está ignorado en el backend),
    // permitimos editar si es ADMIN o si es el usuario actual
    // (asumimos que solo ves tus propios eventos personales)
    return true;
  };

  // Si estamos en vista calendario
  if (currentView === "calendar") {
    return <CalendarPage onNavigateBack={() => setCurrentView("home")} />;
  }

  // Si estamos en vista kanban
  if (currentView === "kanban") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onNavigate={setCurrentView}
          userName={userName}
          userRole={userRole}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Navbar minimalista */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-700">
                  Hola, <span className="text-amber-600">{userName}</span>
                </h1>
              </div>

              {/* Profile menu */}
              <div className="flex items-center gap-3">
                {notificationCount > 0 && (
                  <button
                    onClick={() => setShowNotificationsModal(true)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs
                                   rounded-full flex items-center justify-center font-medium">
                      {notificationCount}
                    </span>
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500
                                  flex items-center justify-center text-white font-bold shadow-md">
                      {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl
                                  border border-gray-100 py-2 z-50">
                      <button
                        onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Ver perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Kanban Board */}
          <div className="flex-1 p-6">
            <KanbanBoard />
          </div>
        </div>

        <ConfirmDialog />
      </div>
    );
  }

  // Vista HOME (Dashboard rediseñado)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
        userName={userName}
        userRole={userRole}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar minimalista */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-700">
                Hola, <span className="text-amber-600">{userName}</span> 👋
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              {notificationCount > 0 && (
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs
                               rounded-full flex items-center justify-center font-medium">
                    {notificationCount}
                  </span>
                </button>
              )}

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500
                                flex items-center justify-center text-white font-bold shadow-md">
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl
                                border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Banner de recordatorio de datos de contacto */}
            {showContactReminder && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4
                         border-amber-500 rounded-lg shadow-md p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full
                                flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      ¡Completá tu perfil!
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Para que tu familia pueda contactarte en caso de emergencia, es importante
                      que completes tus datos de contacto. Solo te tomará un minuto.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate("/profile")}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium
                                 hover:bg-amber-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ir a mi perfil
                      </button>

                      <button
                        onClick={() => {
                          sessionStorage.setItem("contactReminderDismissed", "true");
                          setShowContactReminder(false);
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
                                 font-medium transition-colors"
                      >
                        Recordarme después
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sessionStorage.setItem("contactReminderDismissed", "true");
                      setShowContactReminder(false);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}


            {/* Grid 5-7 columns para más espacio a familia */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar - 5 columns */}
              <div className="lg:col-span-5 space-y-6">
                {/* Family Card */}
                <FamilyCard
                  family={family}
                  familyMembers={familyMembers}
                  loading={loadingFamily}
                  onInviteMember={() => setShowInviteMemberModal(true)}
                />

                {/* Quick Stats */}
                <QuickStatsCard events={events} familyMembers={familyMembers} />

                {/* Invitations */}
                <InvitationsCard
                  invitations={invitations}
                  onAccept={handleRespondInvitation}
                  onReject={handleRespondInvitation}
                />

                {/* Create Family CTA */}
                {!family && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowCreateFamilyModal(true)}
                    className="w-full p-6 bg-gradient-to-r from-amber-400 to-yellow-500
                             text-white rounded-xl font-semibold hover:from-amber-500
                             hover:to-yellow-600 transition-all duration-200 shadow-lg
                             hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4v16m8-8H4" />
                    </svg>
                    Crear mi familia
                  </motion.button>
                )}
              </div>

              {/* Main content - 7 columns */}
              <div className="lg:col-span-7 space-y-6">
                {/* Upcoming Events Card */}
                <UpcomingEventsCard
                  events={events}
                  loading={loadingEvents}
                  onCreateEvent={() => setShowEventModal(true)}
                  onEditEvent={openEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  canEditEvent={canEditEvent}
                  getEventTypeLabel={getEventTypeLabel}
                  getEventTypeColor={getEventTypeColor}
                  formatDateTime={formatDateTime}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal: Create Family */}
      {showCreateFamilyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Crear nueva familia</h3>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Nombre de la familia"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                       focus:ring-2 focus:ring-amber-400 focus:border-transparent mb-4"
            />
            {familyError && (
              <p className="text-red-600 text-sm mb-4">{familyError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateFamilyModal(false);
                  setFamilyName("");
                  setFamilyError("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl
                         font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createFamily}
                disabled={creatingFamily}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-yellow-500
                         text-white rounded-xl font-semibold hover:from-amber-500
                         hover:to-yellow-600 transition-all shadow-md disabled:opacity-50"
              >
                {creatingFamily ? "Creando..." : "Crear"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Invite Member */}
      {showInviteMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Invitar miembro</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email del usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                       focus:ring-2 focus:ring-amber-400 focus:border-transparent mb-4"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium">Rol familiar</label>
              <select
                value={inviteFamilyRole}
                onChange={(e) => setInviteFamilyRole(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="PARENT">Padre / Madre</option>
                <option value="CHILD">Hijo</option>
              </select>
            </div>
            {/* Permiso admin */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={inviteIsAdmin}
                onChange={(e) => setInviteIsAdmin(e.target.checked)}
              />
              <label className="text-sm">Permitir administrar la familia</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteMemberModal(false);
                  setInviteEmail("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl
                         font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendInvitation}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-yellow-500
                         text-white rounded-xl font-semibold hover:from-amber-500
                         hover:to-yellow-600 transition-all shadow-md"
              >
                Enviar invitación
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Notifications */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Notificaciones</h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    Invitación a <strong>{inv.familyName}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleRespondInvitation(inv.id, true);
                        setShowNotificationsModal(false);
                      }}
                      className="flex-1 px-3 py-2 bg-green-500 text-white text-sm
                               rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => {
                        handleRespondInvitation(inv.id, false);
                        setShowNotificationsModal(false);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm
                               rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Create/Edit Event */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingEvent ? "Editar evento" : "Crear nuevo evento"}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Título del evento"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />

              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Descripción (opcional)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y hora de inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl
                             focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y hora de fin
                  </label>
                  <input
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl
                             focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Ubicación (opcional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventForm.allDay}
                    onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })}
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded
                             focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-sm text-gray-700">Todo el día</span>
                </label>

                {family && userRole === "ADMIN" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!eventForm.familyId}
                      onChange={(e) => setEventForm({
                        ...eventForm,
                        familyId: e.target.checked ? family.id : null
                      })}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded
                               focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-sm text-gray-700">Evento familiar</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetEventForm();
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl
                         font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrUpdateEvent}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500
                         text-white rounded-xl font-semibold hover:from-orange-600
                         hover:to-red-600 transition-all shadow-md"
              >
                {editingEvent ? "Actualizar" : "Crear evento"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
}
