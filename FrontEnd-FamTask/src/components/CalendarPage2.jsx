import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function CalendarPage() {
  const navigate = useNavigate();

  // Estados base
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [family, setFamily] = useState(null);
  const [userDni, setUserDni] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    color: "#FF5733",
    familyId: null,
  });

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const getEventsForDay = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    return events.filter((ev) => ev.date === date);
  };

  // -------------------------------
  // 🔐 Decodificar token y obtener DNI + familia
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode(token);
    setUserDni(decoded.sub || decoded.dni);

    // cargar familia
    fetch("http://localhost:8080/api/homepage", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFamily({
            id: data.familyId ?? data.id ?? null,
            name: data.familyName ?? data.name ?? "Mi familia",
          });
        }
      })
      .catch((err) => console.error("Error al cargar familia:", err));
  }, []);

  // -------------------------------
  // 📅 Cargar eventos personales + familiares
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userDni) return;

    const loadEvents = async () => {
      try {
        const personalRes = await fetch(
          `http://localhost:8080/api/events/member/${userDni}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const personalEvents = personalRes.ok ? await personalRes.json() : [];

        let familyEvents = [];
        if (family?.id) {
          const familyRes = await fetch(
            `http://localhost:8080/api/events/family/${family.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          familyEvents = familyRes.ok ? await familyRes.json() : [];
        }

        const all = [...personalEvents, ...familyEvents].map((ev) => ({
          id: ev.id,
          title: ev.title,
          description: ev.description,
          date: new Date(ev.startTime).toISOString().split("T")[0],
          time: new Date(ev.startTime).toTimeString().slice(0, 5),
          color: ev.familyId ? "purple" : "blue",
        }));

        setEvents(all);
      } catch (e) {
        console.error("Error al cargar eventos:", e);
      }
    };

    loadEvents();
  }, [userDni, family]);

  // -------------------------------
  // 🧭 Navegación calendario
  // -------------------------------
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < first.getDay(); i++)
      days.push({ day: "", isCurrentMonth: false });
    for (let i = 1; i <= last.getDate(); i++)
      days.push({ day: i, isCurrentMonth: true });

    return days;
  };

  const goToPreviousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const goToNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDayClick = (day) => {
    if (day)
      setSelectedDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) =>
    day === selectedDate.getDate() &&
    currentDate.getMonth() === selectedDate.getMonth() &&
    currentDate.getFullYear() === selectedDate.getFullYear();

  // -------------------------------
  // 🟢 Crear evento (igual a Home)
  // -------------------------------
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !userDni) {
      alert("No hay sesión activa");
      return;
    }

    const eventData = {
      title: newEvent.title.trim(),
      description: newEvent.description?.trim() || "",
      startTime: `${newEvent.date}T${newEvent.time}:00`,
      endTime: `${newEvent.date}T${newEvent.time}:00`,
      color: newEvent.color || "#FF5733",
      location: "",
      allDay: false,
      familyId: newEvent.familyId || null,
      memberDni: newEvent.familyId ? null : userDni,
    };

    try {
      const res = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        alert("Evento creado exitosamente");
        setShowEventModal(false);
        setNewEvent({
          title: "",
          description: "",
          date: "",
          time: "",
          color: "#FF5733",
          familyId: null,
        });
        // refrescar eventos
        const data = await res.json();
        setEvents((prev) => [
          ...prev,
          {
            id: data.id,
            title: data.title,
            description: data.description,
            date: new Date(data.startTime).toISOString().split("T")[0],
            time: new Date(data.startTime).toTimeString().slice(0, 5),
            color: data.familyId ? "purple" : "blue",
          },
        ]);
      } else {
        alert("Error al crear evento");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  // -------------------------------
  // 🔎 Eventos del día seleccionado
  // -------------------------------
  const getEventsForSelectedDate = () => {
    const localDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const dateStr = localDate.toISOString().split("T")[0];
    return events.filter((e) => e.date === dateStr);
  };

  const eventColors = {
    blue: "bg-blue-100 border-blue-500 text-blue-800",
    purple: "bg-purple-100 border-purple-500 text-purple-800",
  };

  const days = getDaysInMonth(currentDate);

  // -------------------------------
  // 🖼️ Render
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-amber-600">Calendario</h1>
        <button
          onClick={() => setShowEventModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Evento
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
          <div className="flex justify-between mb-4 items-center">
            <h2 className="text-xl font-bold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg"
              >
                Hoy
              </button>
              <button onClick={goToPreviousMonth}>◀</button>
              <button onClick={goToNextMonth}>▶</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-center text-sm font-bold text-gray-600"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const dayEvents = getEventsForDay(d.day);
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(d.day)}
                  disabled={!d.isCurrentMonth}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all
          ${
            !d.isCurrentMonth
              ? "text-gray-300 cursor-not-allowed"
              : isToday(d.day)
              ? "bg-amber-400 text-white font-bold"
              : isSelected(d.day)
              ? "ring-2 ring-amber-400"
              : "hover:bg-amber-50"
          }`}
                >
                  {/* Número del día */}
                  <span className="text-sm">{d.day}</span>

                  {/* Marcadores de eventos */}
                  <div className="flex gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={`w-2 h-2 rounded-full ${
                          ev.color === "purple"
                            ? "bg-purple-500"
                            : ev.color === "blue"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                        title={ev.title}
                      />
                    ))}
                    {/* Si hay más de 3 eventos, mostrar “...” */}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-gray-400">•</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Eventos del día */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
          <h3 className="text-lg font-bold mb-4">
            Eventos del {selectedDate.getDate()} de{" "}
            {months[selectedDate.getMonth()]}
          </h3>
          {getEventsForSelectedDate().length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay eventos</p>
          ) : (
            getEventsForSelectedDate().map((e) => (
              <div
                key={e.id}
                className={`p-4 mb-3 rounded-xl border-l-4 ${
                  eventColors[e.color]
                }`}
              >
                <h4 className="font-semibold">{e.title}</h4>
                <p className="text-sm opacity-75">{e.time}</p>
                {e.description && (
                  <p className="text-sm mt-2">{e.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de creación */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Evento</h2>
            <input
              type="text"
              placeholder="Título"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <textarea
              placeholder="Descripción"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
            />
            <input
              type="date"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
            />
            <input
              type="time"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
            />

            {family && (
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={!!newEvent.familyId}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      familyId: e.target.checked ? family.id : null,
                    })
                  }
                />
                <span>Evento familiar</span>
              </label>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 bg-amber-500 text-white py-2 rounded-lg"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
