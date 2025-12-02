import React, { useEffect, useState } from "react";
import {
  LineChart, Line,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function FinanceReportPage() {

  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const [report, setReport] = useState(null);

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0"];

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
    return <p className="p-4 text-gray-600">Cargando reporte...</p>;
  }

  return (
    <div className="p-6 pb-16">
        {/* BOTÓN VOLVER AL INICIO */}
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

    </div>
  );
}
