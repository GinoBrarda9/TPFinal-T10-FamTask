import { useState, useEffect } from "react";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [newTx, setNewTx] = useState({
    type: "income",
    amount: "",
    description: "",
    category: "",
  });

  const categories = {
    income: ["Sueldo", "Venta", "Ahorros", "Devolución"],
    expense: ["Supermercado", "Servicios", "Transporte", "Salud", "Otros"],
  };

  const balance = transactions.reduce((acc, tx) => {
    return tx.type === "income" ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const addTransaction = () => {
    if (!newTx.amount || !newTx.description) {
      alert("Completá todos los datos");
      return;
    }

    setTransactions([
      ...transactions,
      { ...newTx, id: Date.now(), amount: Number(newTx.amount) },
    ]);

    setNewTx({ type: "income", amount: "", description: "", category: "" });
  };

  const deleteTx = (id) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">
        Finanzas Familiares 💰
      </h1>

      {/* CARD DE BALANCE */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-amber-200">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Balance actual
        </h2>
        <p
          className={`text-3xl font-bold ${
            balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${balance.toLocaleString("es-AR")}
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-amber-200">
        <h3 className="text-lg font-semibold mb-4">Agregar movimiento</h3>

        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={newTx.type === "income"}
              onChange={() => setNewTx({ ...newTx, type: "income" })}
            />
            Ingreso
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={newTx.type === "expense"}
              onChange={() => setNewTx({ ...newTx, type: "expense" })}
            />
            Gasto
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Monto"
            className="border p-2 rounded-lg"
            value={newTx.amount}
            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
          />

          <input
            type="text"
            placeholder="Descripción"
            className="border p-2 rounded-lg"
            value={newTx.description}
            onChange={(e) =>
              setNewTx({ ...newTx, description: e.target.value })
            }
          />

          <select
            className="border p-2 rounded-lg"
            value={newTx.category}
            onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
          >
            <option value="">Categoría</option>
            {categories[newTx.type].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={addTransaction}
          className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg"
        >
          Agregar
        </button>
      </div>

      {/* LISTADO */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No hay movimientos todavía.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border"
              >
                <div>
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+ " : "- "}$
                    {tx.amount.toLocaleString("es-AR")}
                  </p>
                  <p className="text-sm text-gray-600">{tx.description}</p>
                  <p className="text-xs text-gray-400">{tx.category}</p>
                </div>
                <button
                  onClick={() => deleteTx(tx.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
