import { useState } from "react";

export default function TransactionForm({ refresh }) {
  const [form, setForm] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    category: "",
  });

  const categories = {
    INCOME: ["SUELDO", "VENTA", "AHORROS", "DEVOLUCION"],
    EXPENSE: ["SUPERMERCADO", "SERVICIOS", "TRANSPORTE", "SALUD", "OTROS"],
  };

  const addTx = async () => {
    if (!form.amount || !form.description || !form.category) {
      alert("Completá todos los campos");
      return;
    }

    await fetch("http://localhost:8080/api/finance/movement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      body: JSON.stringify({
        amount: Number(form.amount),
        description: form.description,
        type: form.type,
        category: form.category,
      }),
    });

    setForm({
      type: "INCOME",
      amount: "",
      description: "",
      category: "",
    });

    refresh();
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6 border">

      <h3 className="text-lg font-semibold mb-4">Agregar movimiento</h3>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.type === "INCOME"}
            onChange={() => setForm({ ...form, type: "INCOME" })}
          />
          Ingreso
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.type === "EXPENSE"}
            onChange={() => setForm({ ...form, type: "EXPENSE" })}
          />
          Gasto
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          placeholder="Monto"
          className="border p-2 rounded"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="text"
          placeholder="Descripción"
          className="border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Categoría</option>
          {categories[form.type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <button
        onClick={addTx}
        className="mt-4 w-full bg-amber-500 text-white font-semibold py-2 rounded-lg"
      >
        Agregar
      </button>

    </div>
  );
}
