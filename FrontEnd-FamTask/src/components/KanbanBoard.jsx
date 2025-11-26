import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function KanbanBoard() {
  const navigate = useNavigate();

  const [columns, setColumns] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [boardId, setBoardId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedUserDni: "",
    dueDate: "",
  });

  const token = localStorage.getItem("token");

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
        `http://localhost:8080/api/users/${dni}/profile`
      );
      const familyId = profile.familyId;
      if (!familyId) {
        setErrorMsg("No se encontró la familia del usuario.");
        return;
      }

      const board = await apiFetch(
        `http://localhost:8080/api/board/family/${familyId}`
      );
      const bId = board.boardId || board.id;
      setBoardId(bId);

      const columnsData = await apiFetch(
        `http://localhost:8080/api/board/${bId}/columns`
      );

      const columnsWithCards = await Promise.all(
        columnsData.map(async (col) => {
          try {
            const cards = await apiFetch(
              `http://localhost:8080/api/cards/column/${col.id}`
            );

            return {
              ...col,
              cards: (cards || []).sort((a, b) => a.position - b.position),
            };
          } catch {
            return { ...col, cards: [] };
          }
        })
      );

      setColumns(
        columnsWithCards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo cargar el tablero.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
    loadFamilyMembers();
  }, []);

  // ---------------------------
  // Create task
  // ---------------------------
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return alert("El título es obligatorio");

    try {
      const body = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        assignedUserDni: newTask.assignedUserDni || null,
        dueDate: newTask.dueDate || null,
      };

      const created = await apiFetch(
        `http://localhost:8080/api/cards/column/${selectedColumnId}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      // update UI
      setColumns((prev) =>
        prev.map((c) =>
          c.id === selectedColumnId ? { ...c, cards: [...c.cards, created] } : c
        )
      );

      closeTaskModal();
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la tarea");
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedColumnId(null);
    setNewTask({
      title: "",
      description: "",
      assignedUserDni: "",
      dueDate: "",
    });
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

    const newPosition =
      columns.find((c) => c.id === newColumnId)?.cards?.length ?? 0;

    try {
      await apiFetch(`http://localhost:8080/api/cards/${card.id}/move`, {
        method: "PATCH",
        body: JSON.stringify({
          newColumnId,
          newPosition,
        }),
      });

      // update UI
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === fromColumnId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== card.id) };
          }
          if (col.id === newColumnId) {
            return {
              ...col,
              cards: [...col.cards, { ...card, columnId: newColumnId }],
            };
          }
          return col;
        })
      );
    } catch (err) {
      console.error("Error moviendo card:", err);
      alert("Error moviendo la tarea");
    }

    setDraggedCard(null);
  };

  // ---------------------------
  // UI
  // ---------------------------
  if (loading)
    return <div className="p-6 text-gray-500">Cargando tablero...</div>;

  if (errorMsg)
    return (
      <div className="p-6">
        <p className="text-red-500">{errorMsg}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 h-full max-h-[80vh] overflow-hidden rounded-2xl">
      <h1 className="text-3xl font-bold mb-4">Kanban Familiar</h1>

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
              {(col.cards || []).map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-50 border p-4 rounded-xl cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(card, col.id)}
                >
                  <h4 className="font-bold">{card.title}</h4>
                  {card.description && (
                    <p className="text-sm mt-1">{card.description}</p>
                  )}
                  {card.dueDate && (
                    <p className="text-xs mt-2 text-gray-500">
                      📅 {new Date(card.dueDate).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
              ))}

              <button
                className="w-full py-2 border-2 border-dashed rounded-xl text-gray-500 hover:text-amber-600"
                onClick={() => {
                  setSelectedColumnId(col.id);
                  setShowTaskModal(true);
                }}
              >
                + Nueva Tarea
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>

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
              type="date"
              className="border p-2 rounded-lg w-full mb-3"
              value={newTask.dueDate.slice(0, 10)}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  dueDate: e.target.value ? `${e.target.value}T00:00:00` : "",
                })
              }
            />

            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                onClick={closeTaskModal}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 bg-amber-500 text-white rounded-lg"
                onClick={handleCreateTask}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
