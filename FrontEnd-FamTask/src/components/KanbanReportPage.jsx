import React, { useEffect, useState } from "react";
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function KanbanReportPage() {

  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // ---------------------------------------------------------
  // FETCH DATA
  // ---------------------------------------------------------
  const loadReport = async () => {
    try {
      setLoading(true);

      let url = "http://localhost:8080/api/reports/kanban";
      const params = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);

      if (params.length > 0) {
        url += "?" + params.join("&");
      }

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setReport(data);

    } catch (err) {
      console.error("Error cargando reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  if (loading || !report) {
    return <p className="p-4 text-gray-600">Cargando reporte...</p>;
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="p-6 pb-20">

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 mb-6 text-indigo-600 hover:text-indigo-700 font-semibold"
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

      <h1 className="text-3xl font-bold mb-6">Reporte Kanban</h1>

      {/* ---------------------------------------------------------
         FILTROS
      --------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl shadow mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Filtrar por fecha</h2>

        <div className="flex flex-col md:flex-row md:items-end gap-4">

          <div className="flex flex-col">
            <label className="text-sm mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            />
          </div>

          <button
            onClick={loadReport}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
         RESUMEN
      --------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <h3 className="text-sm text-gray-500">Total de Tareas</h3>
          <p className="text-3xl font-bold text-indigo-600">{report.totalCards}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <h3 className="text-sm text-gray-500">Completadas</h3>
          <p className="text-3xl font-bold text-green-600">{report.finishedCards}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <h3 className="text-sm text-gray-500">Vencidas</h3>
          <p className="text-3xl font-bold text-red-600">{report.overdueCards}</p>
        </div>
      </div>

      {/* ---------------------------------------------------------
         GRAFICO: TENDENCIA (AREA CHART)
      --------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-100 mb-12">
        <h2 className="text-xl font-bold mb-4">Tendencia Mensual</h2>

        <div className="w-full h-72">
          <ResponsiveContainer>
            <AreaChart data={report.monthlyTrend}>
              <defs>
                <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area type="monotone" dataKey="createdCards" name="Creadas"
                stroke="#4F46E5" fill="url(#created)" strokeWidth={2} />

              <Area type="monotone" dataKey="completedCards" name="Completadas"
                stroke="#10B981" fill="url(#completed)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------------------------------------------------
         GRAFICO: DONUT COLUMNS
      --------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-100 mb-12">
        <h2 className="text-xl font-bold mb-4">Distribución por Columna</h2>

        <div className="w-full h-72 flex justify-center">
          <ResponsiveContainer width="60%">
            <PieChart>
              <Pie
                data={report.columnSummaries.map(c => ({
                  name: c.columnName,
                  value: c.totalCards,
                }))}
                innerRadius={55}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label
              >
                {report.columnSummaries.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------------------------------------------------
         GRAFICO: MIEMBROS (BARRAS HORIZONTALES)
      --------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Tareas por Miembro</h2>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={report.memberSummaries}
              margin={{ left: 70 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />

              <Bar dataKey="totalAssigned" fill="#8B5CF6" name="Asignadas" />
              <Bar dataKey="completed" fill="#10B981" name="Completadas" />
              <Bar dataKey="overdue" fill="#EF4444" name="Vencidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
