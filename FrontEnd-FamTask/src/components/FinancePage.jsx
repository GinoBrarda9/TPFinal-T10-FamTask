import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import BalanceCard from "./BalanceCard";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import EditModal from "./EditModal";
import TransferSection from "./TransferSection";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  // ✅ balance personal
  const [personalBalance, setPersonalBalance] = useState(0);

  const [selectedTx, setSelectedTx] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState("MOVEMENTS"); // MOVEMENTS | PAYMENTS

  // Filters
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");

  // ✅ rango temporal por defecto
  const [range, setRange] = useState("LAST_30_DAYS"); // LAST_30_DAYS | ALL

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User info (para sidebar/navbar como en Home)
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState("Usuario");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const BASE = "http://localhost:8080";

  const parseBalancePayload = (payload) => {
    // soporta: number | { personalBalance } | { balance } | { value }
    if (typeof payload === "number") return payload;
    if (payload && typeof payload === "object") {
      if (typeof payload.personalBalance === "number") return payload.personalBalance;
      if (typeof payload.balance === "number") return payload.balance;
      if (typeof payload.value === "number") return payload.value;
    }
    return 0;
  };

  // ✅ Decode JWT (igual que HomePage) para nombre/rol
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

  const loadFinanceData = async () => {
    try {
      // Movimientos
      const res1 = await fetch(`${BASE}/api/finance/movements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res1.ok) {
        console.error("Error movimientos:", res1.status);
        return;
      }
      const movs = await res1.json();
      setTransactions(movs);

      // Balance familiar
      const res2 = await fetch(`${BASE}/api/finance/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res2.ok) {
        console.error("Error balance:", res2.status);
        return;
      }
      const bal = await res2.json();
      setBalance(parseBalancePayload(bal));

      // Balance personal
      const res3 = await fetch(`${BASE}/api/finance/balance/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res3.ok) {
        const pb = await res3.json();
        setPersonalBalance(parseBalancePayload(pb));
      } else {
        console.warn("No se pudo cargar balance personal:", res3.status);
        setPersonalBalance(0);
      }
    } catch (error) {
      console.error("Error cargando Finanzas:", error);
    }
  };

  useEffect(() => {
    loadFinanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== "ALL" && tx.type !== filterType) return false;
    if (filterCategory !== "ALL" && tx.category !== filterCategory) return false;

    if (filterMonth !== "ALL") {
      const txMonth = new Date(tx.createdAt).getMonth() + 1;
      if (txMonth !== Number(filterMonth)) return false;
    }

    if (range === "LAST_30_DAYS") {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) return false;
    }

    return true;
  });

  const deleteTx = async (id) => {
    try {
      const res = await fetch(`${BASE}/api/finance/movement/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error al eliminar:", res.status);
        return;
      }

      loadFinanceData();
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    }
  };

  const openEdit = (tx) => {
    setSelectedTx(tx);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar unificado (mismo que Home) */}
      <Sidebar
        currentView="finances"
        onNavigate={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userRole={userRole}
        notificationCount={0}
        onShowNotifications={() => {}}
      />

      <div className="flex-1 flex flex-col">
        {/* ✅ Topbar estilo Home */}
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
                Gestioná movimientos y solicitudes de pago (Mercado Pago).
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
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* ✅ Título centrado como pediste */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 mb-6">
            <div />

            <div className="text-center">
              <h2 className="text-3xl font-bold text-amber-600">Finanzas Familiares 💰</h2>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold px-4 py-2 rounded-lg bg-white border"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al inicio
              </button>
            </div>
          </div>

          {/* ✅ Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Si tu BalanceCard todavía NO acepta title, decime y te lo paso actualizado */}
            <BalanceCard balance={balance} title="Balance familiar" />
            <BalanceCard balance={personalBalance} title="Mi balance" />
          </div>

          {/* Tabs */}
          <div className="bg-white shadow-sm rounded-xl p-2 border mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab("MOVEMENTS")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                activeTab === "MOVEMENTS" ? "bg-amber-500 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              type="button"
            >
              Movimientos
            </button>

            <button
              onClick={() => setActiveTab("PAYMENTS")}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                activeTab === "PAYMENTS" ? "bg-amber-500 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              type="button"
            >
              Solicitudes de pago (Mercado Pago)
            </button>
          </div>

          {/* MOVIMIENTOS */}
          {activeTab === "MOVEMENTS" && (
            <>
              <TransactionForm refresh={loadFinanceData} />

              <div className="bg-white shadow-md rounded-xl p-4 border mb-6">
                <h3 className="text-lg font-semibold">Filtros</h3>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setRange("LAST_30_DAYS")}
                    className={`px-3 py-2 rounded-lg border font-semibold ${
                      range === "LAST_30_DAYS" ? "bg-amber-500 text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Últimos 30 días
                  </button>

                  <button
                    type="button"
                    onClick={() => setRange("ALL")}
                    className={`px-3 py-2 rounded-lg border font-semibold ${
                      range === "ALL" ? "bg-amber-500 text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Todo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <select className="border p-2 rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL">Todos</option>
                    <option value="INCOME">Ingresos</option>
                    <option value="EXPENSE">Gastos</option>
                  </select>

                  <select className="border p-2 rounded" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="ALL">Todas las categorías</option>
                    <option value="SUELDO">Sueldo</option>
                    <option value="VENTA">Venta</option>
                    <option value="AHORROS">Ahorros</option>
                    <option value="DEVOLUCION">Devolución</option>
                    <option value="SUPERMERCADO">Supermercado</option>
                    <option value="SERVICIOS">Servicios</option>
                    <option value="TRANSPORTE">Transporte</option>
                    <option value="SALUD">Salud</option>
                    <option value="OTROS">Otros</option>
                  </select>

                  <select className="border p-2 rounded" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                    <option value="ALL">Todos los meses</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <TransactionList transactions={filteredTransactions} onDelete={deleteTx} onEdit={openEdit} />
            </>
          )}

          {/* PAYMENTS */}
          {activeTab === "PAYMENTS" && <TransferSection refreshFinance={loadFinanceData} />}

          {/* EDIT MODAL */}
          {showEditModal && (
            <EditModal
              tx={selectedTx}
              onClose={() => setShowEditModal(false)}
              refresh={loadFinanceData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
