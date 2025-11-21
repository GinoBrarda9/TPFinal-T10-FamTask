import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BalanceCard from "./BalanceCard";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import EditModal from "./EditModal";
import StatsCharts from "./StatsCharts";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  const [selectedTx, setSelectedTx] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");

  // TOKEN
  const token = localStorage.getItem("token");

  // Navegación
  const navigate = useNavigate();

  // ========================
  // LOAD ON MOUNT
  // ========================
  const loadFinanceData = async () => {
    try {
      // MOVIMIENTOS
      const res1 = await fetch("http://localhost:8080/api/finance/movements", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res1.ok) {
        console.error("Error movimientos:", res1.status);
        return;
      }

      const movs = await res1.json();
      setTransactions(movs);

      // BALANCE
      const res2 = await fetch("http://localhost:8080/api/finance/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res2.ok) {
        console.error("Error balance:", res2.status);
        return;
      }

      const bal = await res2.json();
      setBalance(bal);

    } catch (error) {
      console.error("Error cargando Finanzas:", error);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  // ========================
  // FILTERS
  // ========================
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== "ALL" && tx.type !== filterType) return false;
    if (filterCategory !== "ALL" && tx.category !== filterCategory) return false;

    if (filterMonth !== "ALL") {
      const txMonth = new Date(tx.createdAt).getMonth() + 1;
      return txMonth === Number(filterMonth);
    }

    return true;
  });

  // ========================
  // DELETE
  // ========================
  const deleteTx = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/finance/movement/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Error al eliminar:", res.status);
        return;
      }

      loadFinanceData();

    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    }
  };

  // ========================
  // OPEN EDIT MODAL
  // ========================
  const openEdit = (tx) => {
    setSelectedTx(tx);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* FLECHA VOLVER */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-amber-600 hover:text-amber-800 mb-4"
      >
        <span className="text-2xl">←</span>
        <span className="font-medium">Volver</span>
      </button>

      <h1 className="text-3xl font-bold text-amber-600 mb-6">
        Finanzas Familiares 💰
      </h1>

      <BalanceCard balance={balance} />

      {/* FORM */}
      <TransactionForm refresh={loadFinanceData} />

      {/* FILTERS */}
      <div className="bg-white shadow-md rounded-xl p-4 border mb-6">
        <h3 className="text-lg font-semibold">Filtros</h3>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <select
            className="border p-2 rounded"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
          </select>

          <select
            className="border p-2 rounded"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
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

          <select
            className="border p-2 rounded"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="ALL">Todos los meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("es-AR", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST */}
      <TransactionList
        transactions={filteredTransactions}
        onDelete={deleteTx}
        onEdit={openEdit}
      />

      {/* STATS */}
      <StatsCharts transactions={filteredTransactions} />

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditModal
          tx={selectedTx}
          onClose={() => setShowEditModal(false)}
          refresh={loadFinanceData}
        />
      )}
    </div>
  );
}
