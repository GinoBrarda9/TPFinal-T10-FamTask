import { useEffect, useState } from "react";

export default function TransferSection({ refreshFinance }) {
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SERVICIOS");
  const [toUserDni, setToUserDni] = useState("");

  // ========================
  // LOAD MEMBERS
  // ========================
  const loadMembers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/homepage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const membersList = data?.members || [];
      setMembers(membersList);
      console.log("members sample:", data?.members?.[0]);

      if (!toUserDni && membersList.length) {
        setToUserDni(membersList[0].dni);
      }
    } catch (e) {
      console.warn("No se pudieron cargar miembros", e);
    }
  };

  // ========================
  // LOAD TRANSFERS
  // ========================
  const loadTransfers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/finance/transfers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setTransfers(data || []);
    } catch (e) {
      console.warn("No se pudieron cargar transferencias", e);
    }
  };

  useEffect(() => {
    loadMembers();
    loadTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // CREATE TRANSFER
  // ========================
  const createTransfer = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/finance/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          category,
          toUserDni,
        }),
      });

      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        alert(data?.message || "No se pudo crear la transferencia");
        return;
      }

      if (data?.mpInitPoint) {
        window.open(data.mpInitPoint, "_blank");
      }

      setAmount(0);
      setDescription("");
      await loadTransfers();
    } catch (e) {
      console.error(e);
      alert("Error al crear la transferencia");
    }
  };

  // ========================
  // MARK PAID (DEMO)
  // ========================
  const markPaid = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/finance/transfers/${id}/mark-paid`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("No se pudo marcar como pagada");
        return;
      }

      await loadTransfers();
      if (refreshFinance) await refreshFinance();
    } catch (e) {
      console.error(e);
      alert("Error marcando como pagada");
    }
  };

  // ========================
  // SEND WHATSAPP
  // ========================
  const sendWhatsApp = (toUserDni, transfer) => {
    const member = members.find((m) => m.dni === toUserDni);

    if (!member || !member.phone) {
      alert("El destinatario no tiene teléfono cargado.");
      return;
    }

    if (!transfer.mpInitPoint) {
      alert("Esta transferencia no tiene link de Mercado Pago.");
      return;
    }

    // Teléfono en formato internacional (sin + ni espacios)
    const phone = member.phone.replace(/\D/g, "");

    const text =
      `Hola ${member.name} 👋\n\n` +
      `Te envío el link para una transferencia familiar:\n\n` +
      `💰 Monto: $${transfer.amount}\n` +
      `📝 Concepto: ${transfer.description}\n\n` +
      `👉 Link de pago:\n${transfer.mpInitPoint}\n\n` +
      `Gracias 😊`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ========================
  // RENDER
  // ========================
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border mb-6">
      <h3 className="text-lg font-semibold mb-2">
        Transferencias (Mercado Pago)
      </h3>

      {/* FORM */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          type="number"
          min="0"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="border p-2 rounded col-span-2"
          placeholder="Concepto (ej: Internet Enero)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={toUserDni}
          onChange={(e) => setToUserDni(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.dni} value={m.dni}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="SERVICIOS">Servicios</option>
          <option value="SUPERMERCADO">Supermercado</option>
          <option value="TRANSPORTE">Transporte</option>
          <option value="SALUD">Salud</option>
          <option value="OTROS">Otros</option>
        </select>

        <button
          onClick={createTransfer}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded col-span-3"
        >
          Generar link de Mercado Pago
        </button>
      </div>

      {/* LIST */}
      <div>
        <h4 className="font-semibold mb-2">Últimas transferencias</h4>

        {transfers.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no hay transferencias.
          </p>
        ) : (
          <div className="space-y-2">
            {transfers.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">
                    ${t.amount} – {t.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Estado: {t.status}
                  </div>
                </div>

                <div className="flex gap-2">
                  {t.status === "PENDING" && t.mpInitPoint && (
                    <button
                      onClick={() => window.open(t.mpInitPoint, "_blank")}
                      className="px-3 py-2 rounded border font-semibold"
                    >
                      Abrir link
                    </button>
                  )}

                  {t.status === "PENDING" && t.mpInitPoint && (
                    <button
                      onClick={() => sendWhatsApp(t.toUserDni, t)}
                      className="px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
                    >
                      Enviar por WhatsApp
                    </button>
                  )}

                  {t.status === "PENDING" && (
                    <button
                      onClick={() => markPaid(t.id)}
                      className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Marcar pagada (demo)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
