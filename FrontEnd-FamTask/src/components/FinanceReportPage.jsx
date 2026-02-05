import React, { useEffect, useState } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function FinanceReportPage() {

  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const [report, setReport] = useState(null);

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User info (para sidebar)
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState("Usuario");

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0"];

  const token = localStorage.getItem("token");

  // Decode JWT para nombre/rol
  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.name) setUserName(payload.name);
      if (payload?.role) setUserRole(payload.role);
    } catch (e) {
      console.warn("No se pudo decodificar el token:", e);
    }
  }, [token]);

  // ----------------------------
  // Fetch principal
  // ----------------------------
  const loadReport = async () => {
    try {
      setLoading(true);

      let url = "http://localhost:8080/api/reports/finance";

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

  // ----------------------------
  // Render
  // ----------------------------
  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          currentView="reports"
          onNavigate={() => {}}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userName={userName}
          userRole={userRole}
        />
        <div className="flex-1 p-4">
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentView="reports"
        onNavigate={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 truncate">
                Hola, {userName} 👋
              </h1>
              <p className="text-sm text-gray-600">
                Reportes financieros de la familia
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold shadow">
                {(userName || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-16">
          {/* BOTÓN VOLVER AL INICIO */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 mb-6 text-amber-600 hover:text-amber-700 font-semibold"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al inicio
          </button>

          <h1 className="text-3xl font-bold mb-6">Reporte Financiero</h1>

      {/* --------------------- FILTRO --------------------- */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Filtrar por fecha</h2>

        <div className="flex flex-col md:flex-row md:items-end gap-4">

          <div className="flex flex-col">
            <label className="text-sm mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>

          <button
            onClick={loadReport}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* --------------------- RESUMEN --------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-sm text-gray-500">Ingresos</h3>
          <p className="text-2xl font-bold text-green-600">
            ${report.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-sm text-gray-500">Egresos</h3>
          <p className="text-2xl font-bold text-red-600">
            ${report.totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-sm text-gray-500">Balance</h3>
          <p className={`text-2xl font-bold ${
              report.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
            ${report.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* --------------------- GRAFICO: TENDENCIA MENSUAL --------------------- */}
      <div className="bg-white p-4 rounded shadow mb-10">
        <h2 className="text-xl font-bold mb-4">Tendencia Mensual</h2>

        <div className="w-full h-64">
          <ResponsiveContainer>
            <LineChart data={report.monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line type="monotone" dataKey="income" name="Ingresos" stroke="#4CAF50" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" name="Egresos" stroke="#F44336" strokeWidth={2} />
              <Line type="monotone" dataKey="balance" name="Balance" stroke="#2196F3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --------------------- GRAFICO: GASTOS POR CATEGORÍA --------------------- */}
      <div className="bg-white p-4 rounded shadow mb-10">
        <h2 className="text-xl font-bold mb-4">Gastos por Categoría</h2>

        <div className="w-full h-64 flex justify-center">
          <ResponsiveContainer width="60%">
            <PieChart>
              <Pie
                data={Object.entries(report.expensesByCategory).map(([cat, total]) => ({
                  name: cat,
                  value: total,
                }))}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {Object.entries(report.expensesByCategory).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --------------------- GRAFICO: GASTOS POR MIEMBRO --------------------- */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Gastos por Miembro</h2>

        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart
              data={Object.entries(report.expensesByMember).map(([member, total]) => ({
                member,
                total,
              }))}
            >
              <XAxis dataKey="member" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#9C27B0" name="Gasto Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
