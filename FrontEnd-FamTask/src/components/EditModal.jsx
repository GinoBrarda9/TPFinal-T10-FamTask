import { useState } from "react";

export default function EditModal({ tx, onClose, refresh }) {
  const [form, setForm] = useState({ ...tx });

  const save = async () => {
    await fetch(`http://localhost:8080/api/finance/movement/${tx.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      body: JSON.stringify({
        amount: Number(form.amount),
        description: form.description,
        category: form.category,
        type: form.type,
      }),
    });

    onClose();
    refresh();
  };

  const categories = {
    INCOME: ["SUELDO", "VENTA", "AHORROS", "DEVOLUCION"],
    EXPENSE: ["SUPERMERCADO", "SERVICIOS", "TRANSPORTE", "SALUD", "OTROS"],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96">

        <h3 className="text-lg font-semibold mb-4">Editar movimiento</h3>

        <input
          type="number"
          className="border p-2 rounded w-full mb-3"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="text"
          className="border p-2 rounded w-full mb-3"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full mb-3"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories[form.type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="text-gray-500"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={save}
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
