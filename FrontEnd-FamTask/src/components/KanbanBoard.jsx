import React, { useState, useEffect } from "react";

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewColumnModal, setShowNewColumnModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#FFB020");
  const [draggedTask, setDraggedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  // Cargar el tablero al montar el componente
  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/boards/1", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setColumns(data.columns || []);
      } else if (response.status === 404) {
        // Si no existe el tablero, crear uno con columnas predefinidas
        await createDefaultBoard();
      }
    } catch (error) {
      console.error("Error al cargar el tablero:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBoard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/boards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Tablero Familiar",
          description: "Tablero de tareas de la familia",
          familyId: 1, // Ajustar según tu lógica de familias
        }),
      });

      if (response.ok) {
        const board = await response.json();
        setColumns(board.columns || []);
      }
    } catch (error) {
      console.error("Error al crear tablero:", error);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      alert("El nombre de la columna es requerido");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/boards/1/columns",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newColumnName,
            color: newColumnColor,
            position: columns.length,
          }),
        }
      );

      if (response.ok) {
        const newColumn = await response.json();
        setColumns([...columns, newColumn]);
        setShowNewColumnModal(false);
        setNewColumnName("");
        setNewColumnColor("#FFB020");
      }
    } catch (error) {
      console.error("Error al crear columna:", error);
      alert("Error al crear la columna");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta columna? Se eliminarán todas las tareas."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/boards/1/columns/${columnId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setColumns(columns.filter((col) => col.id !== columnId));
      }
    } catch (error) {
      console.error("Error al eliminar columna:", error);
      alert("Error al eliminar la columna");
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("El título de la tarea es requerido");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/boards/1/columns/${selectedColumn}/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newTask,
            position:
              columns.find((col) => col.id === selectedColumn)?.tasks?.length ||
              0,
          }),
        }
      );

      if (response.ok) {
        const createdTask = await response.json();
        setColumns(
          columns.map((col) =>
            col.id === selectedColumn
              ? { ...col, tasks: [...(col.tasks || []), createdTask] }
              : col
          )
        );
        setShowNewTaskModal(false);
        setNewTask({
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
        });
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      alert("Error al crear la tarea");
    }
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask({ task, fromColumnId: columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, toColumnId) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.fromColumnId === toColumnId) {
      setDraggedTask(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/tasks/${draggedTask.task.id}/move`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newColumnId: toColumnId,
          }),
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        const updatedColumns = columns.map((col) => {
          if (col.id === draggedTask.fromColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
            };
          }
          if (col.id === toColumnId) {
            return {
              ...col,
              tasks: [...(col.tasks || []), draggedTask.task],
            };
          }
          return col;
        });
        setColumns(updatedColumns);
      }
    } catch (error) {
      console.error("Error al mover tarea:", error);
    } finally {
      setDraggedTask(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Tablero de Tareas
          </h1>
          <p className="text-gray-600">Organiza las tareas de tu familia</p>
        </div>
        <button
          onClick={() => setShowNewColumnModal(true)}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
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
          Nueva Columna
        </button>
      </div>

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border-2"
            style={{ borderColor: column.color || "#FFB020" }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div
              className="p-4 rounded-t-2xl"
              style={{ backgroundColor: column.color || "#FFB020" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{column.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-white bg-opacity-30 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    {column.tasks?.length || 0}
                  </span>
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
              {column.tasks?.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-move"
                >
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Task Button */}
              <button
                onClick={() => {
                  setSelectedColumn(column.id);
                  setShowNewTaskModal(true);
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
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
          </div>
        ))}
      </div>

      {/* Modal Nueva Columna */}
      {showNewColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nueva Columna
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la columna
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="Ej: Por hacer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewColumnModal(false);
                  setNewColumnName("");
                  setNewColumnColor("#FFB020");
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddColumn}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Tarea */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nueva Tarea
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="Título de la tarea"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  rows="3"
                  placeholder="Detalles de la tarea"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewTaskModal(false);
                  setNewTask({
                    title: "",
                    description: "",
                    priority: "MEDIUM",
                    dueDate: "",
                  });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
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
