import React, { useState, useEffect } from "react";

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [boardId, setBoardId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedUserDni: "",
    dueDate: "",
    status: "PENDING", // mapea a tu CardStatus
  });

  const token = localStorage.getItem("token");

  const getDniFromToken = () => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.dni;
  };

  // -------------------------------------------------------------------------
  // LOAD BOARD + FAMILY MEMBERS
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadBoard();
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const resp = await fetch("http://localhost:8080/api/homepage", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await resp.json();
      setFamilyMembers(data.members || []);
    } catch (e) {
      console.error("Error cargando miembros:", e);
    }
  };

  const loadBoard = async () => {
    try {
      const dni = getDniFromToken();

      // Perfil del usuario → familyId
      const profRes = await fetch(
        `http://localhost:8080/api/users/${dni}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const profile = await profRes.json();
      const familyId = profile.familyId;

      // Board de esa familia
      const boardRes = await fetch(
        `http://localhost:8080/api/board/family/${familyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const board = await boardRes.json();
      setBoardId(board.boardId);

      // Columnas
      const colsRes = await fetch(
        `http://localhost:8080/api/board/${board.boardId}/columns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const columnsData = await colsRes.json();
      setColumns(columnsData || []);
    } catch (err) {
      console.error("Error cargando tablero:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // CREATE TASK
  // -------------------------------------------------------------------------
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return alert("El título es obligatorio");
    if (!newTask.assignedUserDni) return alert("Seleccioná un usuario");

    try {
      const res = await fetch(
        `http://localhost:8080/api/cards/column/${selectedColumnId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        }
      );
      console.log("Creando card en columna:", selectedColumnId);

      if (!res.ok) throw new Error("Error creando tarea");

      const created = await res.json();

      // Agregarla a la UI
      setColumns(
        columns.map((c) =>
          c.id === selectedColumnId
            ? { ...c, cards: [...(c.cards || []), created] }
            : c
        )
      );

      closeTaskModal();
    } catch (e) {
      console.error("Error creando card:", e);
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setNewTask({
      title: "",
      description: "",
      assignedUserDni: "",
      dueDate: "",
      status: "PENDING",
    });
  };

  // -------------------------------------------------------------------------
  // DRAG & DROP
  // -------------------------------------------------------------------------
  const [draggedCard, setDraggedCard] = useState(null);

  const handleDragStart = (card, colId) => {
    setDraggedCard({ card, fromColumnId: colId });
  };

  const handleDrop = async (e, newColumnId) => {
    e.preventDefault();

    if (!draggedCard) return;
    const { card, fromColumnId } = draggedCard;

    try {
      await fetch(`http://localhost:8080/api/cards/${card.id}/move`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newColumnId: newColumnId,
          newPosition: 0,
        }),
      });

      // Actualizar UI
      setColumns(
        columns.map((col) => {
          // quitar de columna anterior
          if (col.id === fromColumnId) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== card.id),
            };
          }
          // agregar a columna nueva
          if (col.id === newColumnId) {
            return {
              ...col,
              cards: [...(col.cards || []), card],
            };
          }
          return col;
        })
      );
    } catch (err) {
      console.error("Error moviendo card:", err);
    }

    setDraggedCard(null);
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center p-10 text-gray-500">
        Cargando tablero...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Tablero de Tareas
      </h1>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="w-80 flex-shrink-0 bg-white rounded-2xl shadow border"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div
              className="p-4 rounded-t-2xl text-white font-semibold"
              style={{ background: col.color || "#FFB020" }}
            >
              {col.name}
            </div>

            <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">
              {(col.cards || []).map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-50 p-4 rounded-xl border cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(card, col.id)}
                >
                  <h4 className="font-bold">{card.title}</h4>
                  {card.description && (
                    <p className="text-sm mt-1">{card.description}</p>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {card.dueDate && (
                      <div>
                        📅 {new Date(card.dueDate).toLocaleDateString("es-AR")}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                className="w-full py-2 border-2 border-dashed rounded-xl text-gray-500 hover:text-amber-600 hover:border-amber-600"
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

      {/* ------------------------------------------------------------------ */}
      {/* MODAL NUEVA TAREA */}
      {/* ------------------------------------------------------------------ */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nueva Tarea</h2>
              <button
                onClick={closeTaskModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="font-semibold">Título</label>
                <input
                  type="text"
                  className="border p-3 rounded-xl w-full mt-1"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold">Descripción</label>
                <textarea
                  rows={3}
                  className="border p-3 rounded-xl w-full mt-1"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="font-semibold">Asignar a</label>
                <select
                  className="border p-3 rounded-xl w-full mt-1"
                  value={newTask.assignedUserDni}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assignedUserDni: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar</option>
                  {familyMembers.map((m) => (
                    <option key={m.dni} value={m.dni}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold">Fecha límite</label>
                <input
                  type="date"
                  className="border p-3 rounded-xl w-full mt-1"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      dueDate: e.target.value
                        ? `${e.target.value}T00:00:00`
                        : null,
                    })
                  }
                />
              </div>

              <div>
                <label className="font-semibold">Estado</label>
                <select
                  className="border p-3 rounded-xl w-full mt-1"
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="DONE">Finalizada</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-8 gap-4">
              <button
                onClick={closeTaskModal}
                className="px-5 py-3 bg-gray-500 text-white rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateTask}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
