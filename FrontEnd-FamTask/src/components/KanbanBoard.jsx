import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError, showWarning } from "../utils/notifications";

export default function KanbanBoard() {
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [boardId, setBoardId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [editingCard, setEditingCard] = useState(null); // ✅ NUEVO

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedUserDni: "",
    dueDate: "",
  });

  const token = localStorage.getItem("token");

  const [noBoard, setNoBoard] = useState(false);

  // ---------------------------
  // Helpers
  // ---------------------------
  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const msg = (await res.text().catch(() => "")) || res.statusText;
      throw new Error(msg);
    }

    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) return null;
    return res.json();
  };

  const toLocalDateTimeString = (val) => {
    if (!val) return null;
    return val.length === 16 ? `${val}:00` : val;
  };

  const getDniFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.dni || payload.sub || null;
    } catch {
      return null;
    }
  };

  const memberNameByDni = useMemo(() => {
    const m = {};
    familyMembers.forEach((fm) => (m[fm.dni] = fm.name));
    return m;
  }, [familyMembers]);

  const parseLocalDateTime = (s) => {
    // s: "YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DDTHH:mm"
    if (!s) return null;

    const [datePart, timePartRaw] = s.split("T");
    const timePart = timePartRaw || "00:00:00";

    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ss = "0"] = timePart.split(":").map(Number);

    return new Date(y, m - 1, d, hh, mm, Number(ss));
  };

  const formatLocalDateTime = (s) => {
    const dt = parseLocalDateTime(s);
    return dt
      ? dt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
      : "";
  };

  // ---------------------------
  // Load family members
  // ---------------------------
  const loadFamilyMembers = async () => {
    try {
      const data = await apiFetch("http://localhost:8080/api/homepage");
      setFamilyMembers(data?.members || []);
    } catch (e) {
      console.warn("No se pudieron cargar miembros:", e);
    }
  };

  const handleCreateBoard = async () => {
    try {
      const dni = getDniFromToken();
      if (!dni) {
        showWarning("Sesión expirada");
        return;
      }

      const profile = await apiFetch(
        `http://localhost:8080/api/users/${dni}/profile`,
      );

      const familyId = profile.familyId;
      if (!familyId) {
        showWarning("No tenés familia asignada");
        return;
      }

      // ✅ Creamos el tablero con nombre por defecto
      await apiFetch(`http://localhost:8080/api/board/family/${familyId}`, {
        method: "POST",
        body: JSON.stringify({
          name: "Tablero Familiar",
        }),
      });

      showSuccess("Tablero creado correctamente");

      // ✅ Reset flags y recargamos tablero
      setNoBoard(false);
      loadBoard();
    } catch (err) {
      console.error(err);
      showError("No se pudo crear el tablero");
    }
  };

  // ---------------------------
  // Load board + columns + cards
  // ---------------------------
  const loadBoard = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const dni = getDniFromToken();
      if (!dni) {
        setErrorMsg("Tu sesión expiró. Iniciá sesión nuevamente.");
        return;
      }

      const profile = await apiFetch(
        `http://localhost:8080/api/users/${dni}/profile`,
      );
      const familyId = profile.familyId;
      if (!familyId) {
        setErrorMsg("No se encontró la familia del usuario.");
        return;
      }

      const board = await apiFetch(
        `http://localhost:8080/api/board/family/${familyId}`,
      );
      const bId = board.boardId || board.id;
      setBoardId(bId);

      const columnsData = await apiFetch(
        `http://localhost:8080/api/board/${bId}/columns`,
      );

      const columnsWithCards = await Promise.all(
        columnsData.map(async (col) => {
          try {
            const cards = await apiFetch(
              `http://localhost:8080/api/cards/column/${col.id}`,
            );

            return {
              ...col,
              cards: (cards || []).sort((a, b) => a.position - b.position),
            };
          } catch {
            return { ...col, cards: [] };
          }
        }),
      );

      setColumns(
        columnsWithCards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      );
    } catch (err) {
      console.error(err);

      // ✅ Si el backend no encuentra tablero, mostramos CTA
      if (
        err.message.includes("404") ||
        err.message.toLowerCase().includes("not found")
      ) {
        setNoBoard(true);
        setErrorMsg("");
      } else {
        setErrorMsg("No se pudo cargar el tablero.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
    loadFamilyMembers();
  }, []);

  // ---------------------------
  // Create OR Edit task ✅
  // ---------------------------
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      showWarning("El título es obligatorio");
      return;
    }

    if (!newTask.assignedUserDni) {
      showWarning("Tenés que asignar la tarea a un usuario");
      return;
    }

    try {
      const body = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || "",
        assignedUserDni: newTask.assignedUserDni || null,
        dueDate: toLocalDateTimeString(newTask.dueDate),
      };

      let saved;

      if (editingCard) {
        // ✅ EDIT
        saved = await apiFetch(
          `http://localhost:8080/api/cards/${editingCard.id}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          },
        );

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === saved.id ? saved : c)),
          })),
        );

        showSuccess("Tarea actualizada");
      } else {
        // ✅ CREATE
        saved = await apiFetch(
          `http://localhost:8080/api/cards/column/${selectedColumnId}`,
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        );
        console.log("SAVED CARD =>", saved);

        setColumns((prev) =>
          prev.map((c) =>
            c.id === selectedColumnId
              ? { ...c, cards: [...c.cards, saved] }
              : c,
          ),
        );

        showSuccess("Tarea creada");
      }

      closeTaskModal();
    } catch (err) {
      console.error(err);
      showError("No se pudo guardar la tarea");
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedColumnId(null);
    setEditingCard(null);
    setNewTask({
      title: "",
      description: "",
      assignedUserDni: "",
      dueDate: "",
    });
  };

  // ---------------------------
  // Delete task
  // ---------------------------
  const handleDeleteTask = async () => {
    if (!editingCard) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de que querés eliminar la tarea "${editingCard.title}"?`,
    );

    if (!confirmDelete) return;

    try {
      await apiFetch(`http://localhost:8080/api/cards/${editingCard.id}`, {
        method: "DELETE",
      });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== editingCard.id),
        })),
      );

      showSuccess("Tarea eliminada");
      closeTaskModal();
    } catch (err) {
      console.error(err);
      showError("No se pudo eliminar la tarea");
    }
  };

  // ---------------------------
  // Drag & Drop
  // ---------------------------
  const [draggedCard, setDraggedCard] = useState(null);

  const handleDragStart = (card, colId) => {
    setDraggedCard({ card, fromColumnId: colId });
  };

  const handleDrop = async (e, newColumnId) => {
    e.preventDefault();
    if (!draggedCard) return;

    const { card, fromColumnId } = draggedCard;

    if (card.finished === true) {
      showWarning("No se puede mover una tarea finalizada");
      setDraggedCard(null);
      return;
    }

    const newPosition =
      columns.find((c) => c.id === newColumnId)?.cards?.length ?? 0;

    const droppedColumn = columns.find((c) => c.id === newColumnId);
    const isFinalColumn = droppedColumn?.name
      ?.toLowerCase()
      .includes("finalizado");

    try {
      // ✅ ÚNICA LLAMADA AL BACK
      const updatedCard = await apiFetch(
        `http://localhost:8080/api/cards/${card.id}/move-to-column`,
        {
          method: "PATCH",
          body: JSON.stringify({
            newColumnId,
            newPosition,
          }),
        },
      );

      // ✅ SI ES FINALIZADO, FORZAMOS ESTADO LOCAL
      const finalCard = isFinalColumn
        ? { ...updatedCard, finished: true, status: "DONE" }
        : updatedCard;

      // ✅ Update UI
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === fromColumnId) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            };
          }

          if (col.id === newColumnId) {
            return {
              ...col,
              cards: [...col.cards, finalCard],
            };
          }

          return col;
        }),
      );
    } catch (err) {
      console.error("Error moviendo card:", err);
      showError("Error moviendo la tarea");
    }

    setDraggedCard(null);
  };

  // ---------------------------
  // UI
  // ---------------------------
  if (loading)
    return <div className="p-6 text-gray-500">Cargando tablero...</div>;

  if (noBoard)
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-6 bg-gray-50 rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-800">
          Todavía no tenés un tablero Kanban
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          Creá tu primer tablero para comenzar a organizar las tareas de tu
          familia.
        </p>

        <button
          onClick={handleCreateBoard}
          className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold
                    hover:bg-amber-600 transition shadow-lg"
        >
          ➕ Crear tablero
        </button>
      </div>
    );

  if (errorMsg)
    return (
      <div className="p-6">
        <p className="text-red-500">{errorMsg}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 h-full max-h-[80vh] overflow-hidden rounded-2xl">
      {/* COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-2xl shadow border p-0 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div
              className="p-4 text-white font-semibold rounded-t-2xl"
              style={{ background: col.color || "#FFB020" }}
            >
              {col.name}
            </div>

            <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">
              {(col.cards || []).map((card) => {
                const now = new Date();
                const due = card.dueDate
                  ? parseLocalDateTime(card.dueDate)
                  : null;
                const isDone = card.finished === true;
                const isExpired = !isDone && due && due < now;
                const assignedDni =
                  card.assignedUserDni || card.assignedUser?.dni || "";
                const assignedName =
                  memberNameByDni[assignedDni] || "Sin asignar";

                const isNearDue =
                  !isDone &&
                  due &&
                  due > now &&
                  (due - now) / (1000 * 60) <= 60;

                let bgColor = "bg-gray-50";
                let borderColor = "border-gray-300";

                if (isDone) {
                  bgColor = "bg-green-100";
                  borderColor = "border-green-500";
                } else if (isExpired) {
                  bgColor = "bg-red-100";
                  borderColor = "border-red-500";
                } else if (isNearDue) {
                  bgColor = "bg-orange-100";
                  borderColor = "border-orange-500";
                }

                return (
                  <div
                    key={card.id}
                    className={`${bgColor} ${borderColor} border p-4 rounded-xl cursor-move transition`}
                    draggable
                    onDragStart={() => handleDragStart(card, col.id)}
                    onClick={() => {
                      setEditingCard(card);
                      setSelectedColumnId(col.id);
                      setNewTask({
                        title: card.title || "",
                        description: card.description || "",
                        assignedUserDni:
                          card.assignedUserDni || card.assignedUser?.dni || "",
                        dueDate: card.dueDate ? card.dueDate.slice(0, 16) : "",
                      });
                      setShowTaskModal(true);
                    }}
                  >
                    <h4 className="font-bold">{card.title}</h4>
                    {card.description && (
                      <p className="text-sm mt-1">{card.description}</p>
                    )}

                    <p className="text-xs mt-2 text-gray-600">
                      👤 A cargo de:
                      <span className="font-semibold">{assignedName}</span>
                    </p>

                    {card.dueDate && (
                      <p className="text-xs mt-2 font-medium">
                        📅 {formatLocalDateTime(card.dueDate)}
                      </p>
                    )}

                    {isDone && (
                      <span className="inline-block mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                        ✅ COMPLETADA
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-block mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                        ⚠️ VENCIDA
                      </span>
                    )}
                    {isNearDue && !isExpired && (
                      <span className="inline-block mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded">
                        ⏳ POR VENCER
                      </span>
                    )}
                  </div>
                );
              })}

              {col.name.toLowerCase().includes("hacer") && (
                <button
                  className="w-full py-2 border-2 border-dashed rounded-xl text-gray-500 hover:text-amber-600"
                  onClick={() => {
                    setSelectedColumnId(col.id);
                    setShowTaskModal(true);
                  }}
                >
                  + Nueva Tarea
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? "Editar Tarea" : "Nueva Tarea"}
            </h2>

            <input
              type="text"
              className="border p-2 rounded-lg w-full mb-3"
              placeholder="Título"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <textarea
              className="border p-2 rounded-lg w-full mb-3"
              placeholder="Descripción"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <input
              type="datetime-local"
              className="border p-2 rounded-lg w-full mb-3"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />

            <select
              className="border p-2 rounded-lg w-full mb-3"
              value={newTask.assignedUserDni}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedUserDni: e.target.value })
              }
            >
              <option value="">Asignar a...</option>
              {familyMembers.map((m) => (
                <option key={m.dni} value={m.dni}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="flex justify-between items-center gap-4 mt-4">
              {editingCard && (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={handleDeleteTask}
                >
                  Eliminar
                </button>
              )}

              <div className="flex gap-4 ml-auto">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  onClick={closeTaskModal}
                >
                  Cancelar
                </button>

                <button
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                  onClick={handleCreateTask}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
