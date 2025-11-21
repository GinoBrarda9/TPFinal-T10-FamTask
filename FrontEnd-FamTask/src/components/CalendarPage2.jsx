import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function CalendarPage() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [family, setFamily] = useState(null);
  const [userDni, setUserDni] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [view, setView] = useState("month");

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",  
    color: "#FF5733",
    familyId: null,
  });

  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const daysOfWeek = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const [googleConnected, setGoogleConnected] = useState(false);

  // ================================
  //  Google status
  // ================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const dni = localStorage.getItem("dni");

    if (!token || !dni) return;

    fetch(`http://localhost:8080/api/google/calendar/status?state=${dni}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGoogleConnected(data.linked))
      .catch((err) => console.error("Error al verificar Google:", err));
  }, []);

  // ================================
  // Obtener usuario y familia
  // ================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    setUserDni(decoded.sub || decoded.dni);

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
      .catch(() => {});
  }, []);

  // ================================
  //  LOAD EVENTS (con FIX HORARIO)
  // ================================
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

        // FIX HORAS LOCAL
        const all = [...personalEvents, ...familyEvents].map((ev) => {
          const d = new Date(ev.startTime);

          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");

          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");

          return {
            id: ev.id,
            title: ev.title,
            description: ev.description,
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`,
            color: ev.color || "#FF5733",
          };
        });

        setEvents(all);
      } catch (e) {}
    };

    loadEvents();
  }, [userDni, family]);

  // ================================
  // UTILS
  // ================================
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 0; i < first.getDay(); i++) days.push({ day: "", isCurrentMonth: false });
    for (let i = 1; i <= last.getDate(); i++) days.push({ day: i, isCurrentMonth: true });

    return days;
  };

  const getEventsForDay = (day, month = currentDate.getMonth(), year = currentDate.getFullYear()) => {
    if (!day) return [];
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((ev) => ev.date === date);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
  };

  // ================================
  //  CREATE EVENT (FIX HORAS)
  // ================================
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const token = localStorage.getItem("token");
    if (!token || !userDni) return;

    const eventData = {
      title: newEvent.title.trim(),
      description: newEvent.description?.trim() || "",
      startTime: `${newEvent.date}T${newEvent.time}:00`,
      endTime: `${newEvent.date}T${newEvent.time}:00`,
      color: newEvent.color,
      location: newEvent.location || "", 
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
        const data = await res.json();
        const d = new Date(data.startTime);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        setEvents((prev) => [
          ...prev,
          {
            id: data.id,
            title: data.title,
            description: data.description,
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`,
            color: data.color,
          },
        ]);

        setShowEventModal(false);
        setNewEvent({ title: "", description: "", date: "", time: "", color: "#FF5733", familyId: null });
      }
    } catch (err) {}
  };

  // ================================
  //  GET EVENTS OF SELECTED DATE
  // ================================
  const getEventsForSelectedDate = () => {
    const d = selectedDate;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  // ================================
  //  JSX (NO TOCADO)
  // ================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">←</button>

        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-amber-600">Calendario</h1>
          {googleConnected ? (
            <span className="text-green-600 font-semibold text-sm mt-1">Google ✓</span>
          ) : (
            <span className="text-red-600 font-semibold text-sm mt-1">Google ✗</span>
          )}
        </div>

        <button
          onClick={() => setShowEventModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Evento
        </button>

        <button
          onClick={async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const decoded = jwtDecode(token);
            const dni = decoded.dni || decoded.sub;

            const res = await fetch(
              `http://localhost:8080/api/google/calendar/auth/url?dni=${dni}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await res.json();
            window.location.href = data.url;
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Conectar Google
        </button>
      </div>

      {/* ============================
          VISTAS (mes/día/año)
      ============================ */}
      <div className="max-w-7xl mx-auto p-6">
        {/* botones de vista */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setView("day")} className={`px-3 py-1 rounded-lg border ${view === "day" ? "bg-amber-600 text-white" : "bg-white border-gray-300"}`}>Día</button>
          <button onClick={() => setView("month")} className={`px-3 py-1 rounded-lg border ${view === "month" ? "bg-amber-600 text-white" : "bg-white border-gray-300"}`}>Mes</button>
          <button onClick={() => setView("year")} className={`px-3 py-1 rounded-lg border ${view === "year" ? "bg-amber-600 text-white" : "bg-white border-gray-300"}`}>Año</button>
        </div>

        {/* Mes */}
        {view === "month" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-amber-100 p-6">
              <div className="flex justify-between mb-4 items-center">
                <h2 className="text-xl font-bold text-amber-700">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <div className="flex gap-2">
                  <button onClick={goToToday} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-lg">Hoy</button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>◀</button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>▶</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((d) => (
                  <div key={d} className="text-center text-sm font-bold text-gray-600">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((d, i) => {
                  const dayEvents = getEventsForDay(d.day);
                  return (
                    <button
                      key={i}
                      onClick={() => handleDayClick(d.day)}
                      disabled={!d.isCurrentMonth}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
                        !d.isCurrentMonth
                          ? "text-gray-300 cursor-not-allowed"
                          : selectedDate.getDate() === d.day &&
                            selectedDate.getMonth() === currentDate.getMonth()
                          ? "ring-2 ring-amber-400"
                          : "hover:bg-amber-50"
                      }`}
                    >
                      <span className="text-sm">{d.day}</span>

                      <div className="flex gap-1 mt-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ev.color }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* panel lateral */}
            <div className="bg-amber-50 rounded-3xl shadow-lg border border-amber-100 p-6">
              <h3 className="text-lg font-bold mb-4 text-amber-700">
                Eventos del {selectedDate.getDate()} de {months[selectedDate.getMonth()]}
              </h3>

              {getEventsForSelectedDate().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay eventos</p>
              ) : (
                getEventsForSelectedDate().map((e) => (
                  <div
                    key={e.id}
                    className="p-4 mb-3 rounded-xl shadow border-l-4 bg-white"
                    style={{ borderColor: e.color }}
                  >
                    <h4 className="font-semibold">{e.title}</h4>
                    <p className="text-sm opacity-75">{e.time}</p>
                    {e.description && <p className="text-sm mt-2">{e.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Day view */}
        {view === "day" && (
          <div className="bg-white rounded-3xl shadow-lg border border-amber-200 p-6">
            <h3 className="text-xl font-bold text-amber-700 mb-4">
              {selectedDate.getDate()} de {months[selectedDate.getMonth()]}
            </h3>
            {getEventsForSelectedDate().length === 0 ? (
              <p className="text-gray-500">No hay eventos</p>
            ) : (
              getEventsForSelectedDate().map((e) => (
                <div
                  key={e.id}
                  className="p-4 mb-3 rounded-xl shadow border-l-4 bg-white"
                  style={{ borderColor: e.color }}
                >
                  <h4 className="font-semibold">{e.title}</h4>
                  <p className="text-sm opacity-75">{e.time}</p>
                  <p className="text-sm">{e.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {view === "year" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {months.map((m, idx) => {
              const year = currentDate.getFullYear();
              const monthDays = getDaysInMonth(new Date(year, idx, 1));

              return (
                <div key={idx} className="bg-white rounded-xl shadow border border-amber-200 p-3">
                  <h4 className="text-center font-bold text-amber-700 mb-2">{m}</h4>

                  <div className="grid grid-cols-7 text-[10px] mb-1">
                    {daysOfWeek.map((d) => (
                      <div key={d} className="text-center font-semibold text-gray-600">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[10px]">
                    {monthDays.map((d, i) => {
                      const dateEvents = getEventsForDay(d.day, idx, year);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (d.day) {
                              setCurrentDate(new Date(year, idx, 1));
                              setView("month");
                            }
                          }}
                          className="h-5 flex items-center justify-center rounded"
                          style={{
                            backgroundColor: dateEvents[0]?.color ?? "#f0f0f0",
                            color: dateEvents[0] ? "white" : "black",
                          }}
                        >
                          {d.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Evento</h2>

            <input
              type="text"
              placeholder="Título"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />

            <textarea
              placeholder="Descripción"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

            <input
              type="text"
              placeholder="Lugar / Ubicación"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
/>

            <input
              type="date"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />

            <input
              type="time"
              className="w-full border p-2 rounded-lg mb-3"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />

            <div className="mb-3">
              <p className="text-sm font-semibold mb-2">Color del evento</p>
              <div className="flex gap-2">
                {["#FF5733","#FFBD33","#33FF57","#3380FF","#9B33FF","#FF33A8"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    className={`w-7 h-7 rounded-full border-2 ${
                      newEvent.color === color ? "border-black" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {family && (
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={!!newEvent.familyId}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, familyId: e.target.checked ? family.id : null })
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
