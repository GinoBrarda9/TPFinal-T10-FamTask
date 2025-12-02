// src/pages/EventReportPage.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function EventReportPage() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rangePreset, setRangePreset] = useState("all");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const apiBaseUrl = "http://localhost:8080";

  // Helpers de fechas para presets tipo GA
  const formatDate = (date) => date.toISOString().slice(0, 10);

  const applyPreset = (preset) => {
    setRangePreset(preset);
    const today = new Date();
    let fromDate = "";
    let toDate = "";

    switch (preset) {
      case "today":
        fromDate = formatDate(today);
        toDate = formatDate(today);
        break;
      case "7d": {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        fromDate = formatDate(d);
        toDate = formatDate(today);
        break;
      }
      case "30d": {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        fromDate = formatDate(d);
        toDate = formatDate(today);
        break;
      }
      case "all":
        fromDate = "";
        toDate = "";
        break;
      default:
        break;
    }

    setFrom(fromDate);
    setTo(toDate);
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${apiBaseUrl}/api/reports/events`;

      const params = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Error cargando reporte eventos:", err);
      setError("No se pudo cargar el reporte. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallbacks seguros para evitar .map sobre undefined
  const totalEvents = report?.totalEvents ?? 0;
  const finishedEvents = report?.finishedEvents ?? 0;
  const pendingEvents = report?.pendingEvents ?? 0;
  const overdueEvents = report?.overdueEvents ?? 0;

  const eventsByType = report?.eventsByType || [];
  const eventsByMember = report?.eventsByMember || [];
  const monthlyTrend = report?.monthlyTrend || [];
  const upcomingEvents = report?.upcomingEvents || [];

  const completionRate =
    totalEvents > 0 ? Math.round((finishedEvents / totalEvents) * 100) : 0;
  const overdueRate =
    totalEvents > 0 ? Math.round((overdueEvents / totalEvents) * 100) : 0;

  if (loading && !report) {
    return (
      <div className="p-6 pb-16">
        <p className="text-gray-600">Cargando reporte de eventos...</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6 pb-16">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 mb-6 text-amber-600 hover:text-amber-700 font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </button>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="p-6 pb-16 bg-gray-50 min-h-screen">
      {/* Botón volver */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 mb-6 text-amber-600 hover:text-amber-700 font-semibold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </button>

      {/* Título */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reporte de Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visibilidad general del calendario familiar: volumen, estado y próximos eventos.
          </p>
        </div>
      </div>

      {/* Filtros tipo GA */}
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Rango de fechas</h2>
            <p className="text-xs text-gray-500">
              Elige un rango rápido o personaliza las fechas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm border ${
                rangePreset === "today"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => applyPreset("today")}
            >
              Hoy
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm border ${
                rangePreset === "7d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => applyPreset("7d")}
            >
              Últimos 7 días
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm border ${
                rangePreset === "30d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => applyPreset("30d")}
            >
              Últimos 30 días
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm border ${
                rangePreset === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => applyPreset("all")}
            >
              Todo
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setRangePreset("custom");
                  setFrom(e.target.value);
                }}
                className="border px-3 py-2 rounded text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setRangePreset("custom");
                  setTo(e.target.value);
                }}
                className="border px-3 py-2 rounded text-sm"
              />
            </div>
            <button
              onClick={loadReport}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Cards resumen tipo GA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 border border-blue-50">
          <p className="text-xs uppercase text-blue-500 font-semibold mb-1">
            Total de eventos
          </p>
          <p className="text-3xl font-bold">{totalEvents}</p>
          <p className="text-xs text-gray-500 mt-1">
            Suma de todos los eventos en el rango seleccionado.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-emerald-50">
          <p className="text-xs uppercase text-emerald-500 font-semibold mb-1">
            Finalizados
          </p>
          <p className="text-3xl font-bold text-emerald-600">
            {finishedEvents}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {completionRate}% del total marcado como finalizado.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-amber-50">
          <p className="text-xs uppercase text-amber-500 font-semibold mb-1">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-amber-600">
            {pendingEvents}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Eventos que todavía están activos o por ocurrir.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-red-50">
          <p className="text-xs uppercase text-red-500 font-semibold mb-1">
            Vencidos
          </p>
          <p className="text-3xl font-bold text-red-600">
            {overdueEvents}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {overdueRate}% del total está vencido.
          </p>
        </div>
      </div>

      {/* Grilla principal: tendencia + por tipo + por miembro */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Tendencia mensual */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Tendencia mensual</h2>
            <span className="text-xs text-gray-400">
              Eventos creados vs finalizados
            </span>
          </div>
          <div className="w-full h-64">
            {monthlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay datos para el período seleccionado.
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Creados"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="finished"
                    name="Finalizados"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Eventos por tipo */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Eventos por tipo</h2>
            <span className="text-xs text-gray-400">Distribución</span>
          </div>
          <div className="w-full h-64">
            {eventsByType.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay tipos de eventos registrados en este período.
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={eventsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Eventos" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Eventos por miembro + próximos eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos por miembro */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Eventos por miembro</h2>
            <span className="text-xs text-gray-400">Carga de agenda</span>
          </div>
          <div className="w-full h-64">
            {eventsByMember.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay eventos asignados a miembros en este período.
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={eventsByMember}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="memberName" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Eventos" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Próximos eventos</h2>
            <span className="text-xs text-gray-400">
              Próximos 10 eventos en agenda
            </span>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No hay eventos próximos en el rango seleccionado.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {upcomingEvents.slice(0, 10).map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 border rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {ev.title || "Evento sin título"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ev.startTime || "Fecha sin especificar"}
                      {ev.location ? ` · ${ev.location}` : ""}
                    </p>
                    {ev.type && (
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                        {ev.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-xs text-gray-400">
          Actualizando datos del reporte...
        </p>
      )}
    </div>
  );
}
