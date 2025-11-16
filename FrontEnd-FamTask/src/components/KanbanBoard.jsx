import React, { useEffect, useState } from "react";

export default function KanbanBoard() {
  const API_HOME = "http://localhost:8080/api/homepage";
  const API_CARDS = "http://localhost:8080/api/cards";

  const token = localStorage.getItem("token");

  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // ============================================================
  // 1️⃣ CARGAR TODO (family + board + columnas)
  // ============================================================
  const loadHomeData = async () => {
    const res = await fetch(API_HOME, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("No se pudo cargar homepage");

    const data = await res.json();

    const board = data.board;

    if (!board || !board.columns) {
      console.error("El backend no devolvió columnas");
      return;
    }

    setColumns(board.columns);

    // Inicializo estructura vacía
    const structure = {};
    board.columns.forEach((c) => (structure[c.id] = []));
    setTasks(structure);

    // Cargar tareas reales por cada columna
    for (const col of board.columns) {
      await loadTasks(col.id);
    }

    setLoading(false);
  };

  // ============================================================
  // 2️⃣ Cargar tareas por columna
  // ============================================================
  const loadTasks = async (columnId) => {
    const res = await fetch(`${API_CARDS}/column/${columnId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setTasks((prev) => ({
      ...prev,
      [columnId]: data,
    }));
  };

  // ============================================================
  // 🔄 Inicialización
  // ============================================================
  useEffect(() => {
    loadHomeData().catch((e) => console.error("Error:", e));
  }, []);

  // ============================================================
  // 3️⃣ Crear tarea (siempre en la columna 0)
  // ============================================================
  const createTask = async () => {
    const firstColumn = columns[0].id;

    const res = await fetch(`${API_CARDS}/column/${firstColumn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });

    const saved = await res.json();

    setTasks((prev) => ({
      ...prev,
      [firstColumn]: [...prev[firstColumn], saved],
    }));

    setShowModal(false);
    setNewTask({ title: "", description: "", dueDate: "" });
  };

  // ============================================================
  // 4️⃣ Editar tarea
  // ============================================================
  const updateTask = async () => {
    const res = await fetch(`${API_CARDS}/${editingTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingTask),
    });

    const updated = await res.json();

    const colId = updated.columnId;

    setTasks((prev) => ({
      ...prev,
      [colId]: prev[colId].map((t) => (t.id === updated.id ? updated : t)),
    }));

    setShowModal(false);
    setEditingTask(null);
  };

  // ============================================================
  // 5️⃣ Eliminar tarea
  // ============================================================
  const deleteTask = async (taskId, columnId) => {
    await fetch(`${API_CARDS}/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((t) => t.id !== taskId),
    }));
  };

  // ============================================================
  // 6️⃣ Drag & Drop
  // ============================================================
  const handleDragStart = (task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
  };

  const handleDrop = async (targetColumnId, position) => {
    if (!draggedTask) return;

    const body =
      draggedFrom === targetColumnId
        ? { newPosition: position }
        : { newColumnId: targetColumnId, newPosition: position };

    await fetch(`${API_CARDS}/${draggedTask.id}/move`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    await loadTasks(draggedFrom);
    await loadTasks(targetColumnId);

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  if (loading) return <p>Cargando tablero...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Tablero Familiar</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg"
        >
          Nueva tarea
        </button>
      </div>

      {/* GRID DE COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="bg-gray-50 p-4 rounded-xl border shadow">
            <h4 className="font-semibold mb-3">{col.name}</h4>

            <div className="space-y-3 min-h-[200px]">
              {tasks[col.id]?.map((t, idx) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => handleDragStart(t, col.id)}
                  onDrop={() => handleDrop(col.id, idx)}
                  className="p-4 bg-white border rounded-lg shadow"
                >
                  <div className="flex justify-between">
                    <h4 className="font-bold">{t.title}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTask(t);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button onClick={() => deleteTask(t.id, col.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  {t.description && <p>{t.description}</p>}
                  {t.dueDate && (
                    <p className="text-xs text-gray-500">
                      📅 {new Date(t.dueDate).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id, tasks[col.id]?.length || 0)}
              className="mt-4 p-2 border-dashed border-2 rounded-lg text-center"
            >
              Soltar aquí
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingTask ? "Editar tarea" : "Nueva tarea"}
            </h3>

            <input
              type="text"
              className="w-full border p-2 rounded mb-3"
              placeholder="Título"
              value={editingTask ? editingTask.title : newTask.title}
              onChange={(e) =>
                editingTask
                  ? setEditingTask({ ...editingTask, title: e.target.value })
                  : setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 rounded mb-3"
              placeholder="Descripción"
              value={
                editingTask ? editingTask.description : newTask.description
              }
              onChange={(e) =>
                editingTask
                  ? setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  : setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border p-2 rounded mb-3"
              value={editingTask ? editingTask.dueDate : newTask.dueDate}
              onChange={(e) =>
                editingTask
                  ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                  : setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={editingTask ? updateTask : createTask}
                className="flex-1 bg-amber-500 text-white py-2 rounded"
              >
                {editingTask ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
