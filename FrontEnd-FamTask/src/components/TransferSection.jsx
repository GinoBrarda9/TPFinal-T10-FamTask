import { useEffect, useMemo, useState } from "react";

export default function TransferSection({ refreshFinance }) {
  const token = localStorage.getItem("token");

  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SERVICIOS");
  const [toUserDni, setToUserDni] = useState("");

  // ========================
  // JWT -> DNI (usuario logueado)
  // ========================
  const decodeJwtPayload = (jwt) => {
    try {
      if (!jwt) return null;
      const payload = jwt.split(".")[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const json = decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const myDni = useMemo(() => {
    const payload = decodeJwtPayload(token);
    // ⬇️ Si tu claim es otro, ajustalo acá:
    // ejemplos comunes: payload?.dni, payload?.sub, payload?.username, payload?.userDni
    return payload?.dni || payload?.userDni || payload?.sub || "";
  }, [token]);

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const statusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendiente de pago";
      case "COMPLETED":
        return "Pagada";
      default:
        return status || "-";
    }
  };

  const nameByDni = (dni) => members.find((m) => m.dni === dni)?.name || dni;

  // ✅ miembros disponibles para pagar (excluye logueado)
  const payableMembers = useMemo(() => {
    if (!myDni) return members; // fallback si no pudimos leer DNI del token
    return members.filter((m) => m.dni !== myDni);
  }, [members, myDni]);

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
    } catch (e) {
      console.warn("No se pudieron cargar miembros", e);
    }
  };

  // ========================
  // LOAD REQUESTS
  // ========================
  const loadRequests = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/finance/transfers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setRequests(data || []);
    } catch (e) {
      console.warn("No se pudieron cargar solicitudes de pago", e);
    }
  };

  useEffect(() => {
    loadMembers();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ set default de toUserDni una vez que ya tenemos members + myDni
  useEffect(() => {
    if (toUserDni) return;
    if (!payableMembers.length) return;
    setToUserDni(payableMembers[0].dni);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payableMembers]);

  // ========================
  // CREATE REQUEST
  // ========================
  const createRequest = async () => {
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
        alert(data?.message || "No se pudo crear la solicitud de pago");
        return;
      }

      if (data?.mpInitPoint) {
        window.open(data.mpInitPoint, "_blank");
      }

      setAmount(0);
      setDescription("");
      await loadRequests();
    } catch (e) {
      console.error(e);
      alert("Error al crear la solicitud de pago");
    }
  };

  // ========================
  // MARK PAID (DEMO)
  // ========================
  const markPaidDemo = async (id) => {
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

      await loadRequests();
      if (refreshFinance) await refreshFinance();
    } catch (e) {
      console.error(e);
      alert("Error marcando como pagada");
    }
  };

  // ========================
  // SEND WHATSAPP
  // ========================
  const sendWhatsApp = (dni, request) => {
    const member = members.find((m) => m.dni === dni);

    if (!member || !member.phone) {
      alert("El destinatario no tiene teléfono cargado.");
      return;
    }

    if (!request.mpInitPoint) {
      alert("Esta solicitud no tiene link de cobro de Mercado Pago.");
      return;
    }

    const phone = member.phone.replace(/\D/g, "");

    const text =
      `Hola ${member.name} 👋\n\n` +
      `Te envío una solicitud de pago familiar:\n\n` +
      `💰 Monto: $${formatAmount(request.amount)} ARS\n` +
      `📝 Concepto: ${request.description}\n\n` +
      `👉 Link de cobro (para pagar):\n${request.mpInitPoint}\n\n` +
      `Gracias 😊`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ========================
  // RENDER
  // ========================
  // ✅ clases comunes para unificar tamaño
  const fieldClass = "border rounded h-10 px-3 text-sm w-full";
  const selectClass = "border rounded h-10 px-3 text-sm w-full bg-white";
  const buttonClass =
    "bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 h-10 rounded";

  return (
    <div className="bg-white shadow-md rounded-xl p-4 border mb-6">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold">
          Solicitudes de pago (Mercado Pago)
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Generá un <span className="font-semibold">link de cobro</span> para que
          otro miembro pague
        </p>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 items-center">
        <input
          className={fieldClass}
          type="number"
          min="0"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className={`${fieldClass} md:col-span-2`}
          placeholder="Concepto (ej: Internet Enero)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* ✅ label + select EN LA MISMA LÍNEA, texto más chico */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            ¿Quién va a pagar?
          </span>

          <select
            className={`${selectClass} w-44 md:w-full`}
            value={toUserDni}
            onChange={(e) => setToUserDni(e.target.value)}
            disabled={payableMembers.length === 0}
            title={
              payableMembers.length === 0
                ? "No hay otros miembros disponibles"
                : ""
            }
          >
            {payableMembers.map((m) => (
              <option key={m.dni} value={m.dni}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <select
          className={selectClass}
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
          onClick={createRequest}
          className={`${buttonClass} md:col-span-3`}
          type="button"
          disabled={!toUserDni || Number(amount) <= 0}
          title={!toUserDni ? "Seleccioná quién va a pagar" : ""}
        >
          Generar link de cobro
        </button>
      </div>

      {/* LIST */}
      <div>
        <h4 className="font-semibold mb-2">Últimas solicitudes</h4>

        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no hay solicitudes de pago.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 6).map((t) => {
              // ✅ checkout pro: el creador del link (fromUserDni) es quien cobra
              const iAmCollector = myDni && t.fromUserDni === myDni;

              return (
                <div key={t.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-sm text-gray-600 truncate">
                    {t.description}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Cobra: {nameByDni(t.fromUserDni)} · Paga:{" "}
                    {nameByDni(t.toUserDni)}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Estado: {statusLabel(t.status)}
                  </div>

                  <div className="text-right mt-2">
                    <div className="text-lg font-bold text-amber-700">
                      ${formatAmount(t.amount)}{" "}
                      <span className="text-sm font-semibold">ARS</span>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 mt-2">
                      {t.status === "PENDING" && t.mpInitPoint && (
                        <button
                          onClick={() => window.open(t.mpInitPoint, "_blank")}
                          className="px-3 py-2 rounded border font-semibold bg-white text-sm"
                          type="button"
                        >
                          Abrir link
                        </button>
                      )}

                      {/* ✅ solo el cobrador debería compartir y cerrar demo */}
                      {t.status === "PENDING" && t.mpInitPoint && iAmCollector && (
                        <button
                          onClick={() => sendWhatsApp(t.toUserDni, t)}
                          className="px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold text-sm"
                          type="button"
                        >
                          Enviar por WhatsApp
                        </button>
                      )}

                      {t.status === "PENDING" && iAmCollector && (
                        <button
                          onClick={() => markPaidDemo(t.id)}
                          className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
                          type="button"
                        >
                          Marcar pagada (demo)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
