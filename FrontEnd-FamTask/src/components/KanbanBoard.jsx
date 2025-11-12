import React, { useState } from "react";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    priority: "medium",
    dueDate: "",
  });

  const columns = {
    todo: {
      title: "Por hacer",
      color:
        "bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]",
      icon: "📝",
    },
    inProgress: {
      title: "En progreso",
      color:
        "bg-blue-50 border-2 border-blue-400 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]",
      icon: "⚙️",
    },
    done: {
      title: "Completado",
      color:
        "bg-green-50 border-2 border-green-400 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]",
      icon: "✅",
    },
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-red-100 text-red-800 border-red-300",
  };

  const handleDragStart = (task, column) => {
    setDraggedTask(task);
    setDraggedFrom(column);
  };

  const handleDrop = (targetColumn) => {
    if (draggedTask && draggedFrom !== targetColumn) {
      setTasks((prev) => {
        const updated = { ...prev };
        updated[draggedFrom] = updated[draggedFrom].filter(
          (t) => t.id !== draggedTask.id
        );
        updated[targetColumn] = [
          ...updated[targetColumn],
          { ...draggedTask, status: targetColumn },
        ];
        return updated;
      });
    }
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignee || !newTask.dueDate) {
      alert("Por favor completa todos los campos");
      return;
    }

    const task = { id: Date.now(), ...newTask, status: "todo" };

    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, task],
    }));

    setShowTaskModal(false);
    setNewTask({ title: "", assignee: "", priority: "medium", dueDate: "" });
  };

  const handleEditTask = (task, column) => {
    setEditingTask({ ...task, column });
    setShowTaskModal(true);
  };

  const handleSaveEdit = () => {
    setTasks((prev) => {
      const updated = { ...prev };
      const col = editingTask.column;
      updated[col] = updated[col].map((t) =>
        t.id === editingTask.id ? editingTask : t
      );
      return updated;
    });
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const handleDeleteTask = (taskId, column) => {
    if (confirm("¿Seguro deseas eliminar esta tarea?")) {
      setTasks((prev) => ({
        ...prev,
        [column]: prev[column].filter((t) => t.id !== taskId),
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-amber-300/70 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-amber-800 tracking-tight">
          Tablero Kanban
        </h3>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Tarea
        </button>
      </div>

      {/* 🟢 Responsive grid: 3 columnas en desktop, 1 debajo de otra en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full transition-all duration-300">
        {Object.entries(columns).map(([colId, col]) => (
          <div
            key={colId}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(colId)}
            className={`${col.color} w-full`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`font-bold text-lg ${
                  colId === "todo"
                    ? "text-yellow-700"
                    : colId === "inProgress"
                    ? "text-blue-700"
                    : "text-green-700"
                } flex items-center gap-2`}
              >
                {col.icon} {col.title}
              </h4>
              <span
                className={`bg-white border px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                  colId === "todo"
                    ? "border-yellow-300 text-yellow-700"
                    : colId === "inProgress"
                    ? "border-blue-300 text-blue-700"
                    : "border-green-300 text-green-700"
                }`}
              >
                {tasks[colId].length}
              </span>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {tasks[colId].length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  Sin tareas
                </p>
              ) : (
                tasks[colId].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, colId)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 cursor-move hover:shadow-lg transition-all duration-200 hover:border-amber-400 group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-800 flex-1">
                        {task.title}
                      </h4>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEditTask(task, colId)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, colId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      👤 {task.assignee}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border font-semibold ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority === "high"
                          ? "🔴 Alta"
                          : task.priority === "medium"
                          ? "🟡 Media"
                          : "🟢 Baja"}
                      </span>
                      <span className="text-xs text-gray-500">
                        📅 {new Date(task.dueDate).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear/Editar Tarea */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTask ? "Editar Tarea" : "Nueva Tarea"}
              </h2>
              <button onClick={() => setShowTaskModal(false)}>✖️</button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({ ...editingTask, title: e.target.value })
                    : setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="Asignado a"
                value={editingTask ? editingTask.assignee : newTask.assignee}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({
                        ...editingTask,
                        assignee: e.target.value,
                      })
                    : setNewTask({ ...newTask, assignee: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              />
              <select
                value={editingTask ? editingTask.priority : newTask.priority}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({
                        ...editingTask,
                        priority: e.target.value,
                      })
                    : setNewTask({ ...newTask, priority: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
              <input
                type="date"
                value={editingTask ? editingTask.dueDate : newTask.dueDate}
                onChange={(e) =>
                  editingTask
                    ? setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    : setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
              />
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={editingTask ? handleSaveEdit : handleCreateTask}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg"
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
