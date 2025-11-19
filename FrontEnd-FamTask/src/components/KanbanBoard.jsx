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
  const [boardId, setBoardId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  // EXTRAER DNI DEL JWT
  const getDniFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.dni;
  };

  // Cargar tablero al montar
  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    try {
      const token = localStorage.getItem("token");
      const dni = getDniFromToken();

      // Obtener perfil → familyId
      const profileRes = await fetch(
        `http://localhost:8080/api/users/${dni}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const profile = await profileRes.json();
      const familyId = profile.familyId;

      // Obtener Board de esa familia
      const boardRes = await fetch(
        `http://localhost:8080/api/board/family/${familyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!boardRes.ok) throw new Error("Error al obtener tablero");

      const board = await boardRes.json();
      setBoardId(board.boardId);

      // Obtener columnas del tablero
      const columnsRes = await fetch(
        `http://localhost:8080/api/board/${board.boardId}/columns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cols = await columnsRes.json();
      setColumns(cols || []);
    } catch (error) {
      console.error("Error cargando board:", error);
    } finally {
      setLoading(false);
    }
  };

  // Crear columna
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return alert("Nombre requerido");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/api/board/${boardId}/column`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newColumnName }),
        }
      );

      if (res.ok) {
        const newCol = await res.json();
        setColumns([...columns, { ...newCol, tasks: [] }]);
        setShowNewColumnModal(false);
        setNewColumnName("");
        setNewColumnColor("#FFB020");
      }
    } catch (error) {
      console.error("Error creando columna:", error);
    }
  };

  // Eliminar columna
  const handleDeleteColumn = async (columnId) => {
    if (!confirm("¿Eliminar columna y tareas?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8080/api/board/column/${columnId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setColumns(columns.filter((c) => c.id !== columnId));
      }
    } catch (error) {
      console.error("Error al eliminar columna:", error);
    }
  };

  // Crear tarea
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return alert("Título requerido");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8080/api/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          columnId: selectedColumn,
        }),
      });

      if (res.ok) {
        const createdTask = await res.json();

        setColumns(
          columns.map((col) =>
            col.id === selectedColumn
              ? { ...col, tasks: [...col.tasks, createdTask] }
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
      console.error("Error creando tarea:", error);
    }
  };

  // Drag & Drop
  const handleDragStart = (e, task, columnId) => {
    setDraggedTask({ task, fromColumnId: columnId });
  };

  const handleDrop = async (e, toColumnId) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.fromColumnId === toColumnId) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:8080/api/tasks/${draggedTask.task.id}/move`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newColumnId: toColumnId }),
        }
      );

      // Actualizar UI
      setColumns(
        columns.map((col) => {
          if (col.id === draggedTask.fromColumnId)
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
            };

          if (col.id === toColumnId)
            return {
              ...col,
              tasks: [...col.tasks, draggedTask.task],
            };

          return col;
        })
      );
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
          <div className="animate-spin h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
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
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition"
        >
          + Nueva Columna
        </button>
      </div>

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border-2"
            style={{ borderColor: column.color || "#FFB020" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Header Columna */}
            <div
              className="p-4 rounded-t-2xl"
              style={{ backgroundColor: column.color || "#FFB020" }}
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-bold text-white">{column.name}</h3>

                <div className="flex gap-2">
                  <span className="bg-white bg-opacity-30 text-white px-2 py-1 rounded-lg text-sm">
                    {column.tasks?.length || 0}
                  </span>

                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* Tareas */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
              {column.tasks?.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  className="bg-gray-50 rounded-xl p-4 border hover:shadow-md cursor-move"
                >
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>

                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}

                  <div className="flex justify-between mt-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs border ${getPriorityColor(
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

              {/* Botón Nueva tarea */}
              <button
                onClick={() => {
                  setSelectedColumn(column.id);
                  setShowNewTaskModal(true);
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition flex justify-center gap-2"
              >
                + Nueva Tarea
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva columna */}
      {showNewColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Columna</h2>

            <input
              type="text"
              className="border w-full p-3 rounded-xl mb-3"
              placeholder="Nombre"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />

            <input
              type="color"
              className="w-full h-12 rounded-xl mb-4"
              value={newColumnColor}
              onChange={(e) => setNewColumnColor(e.target.value)}
            />

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowNewColumnModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddColumn}
                className="bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva tarea */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>

            <input
              type="text"
              placeholder="Título"
              className="border w-full p-3 rounded-xl mb-3"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <textarea
              placeholder="Descripción"
              className="border w-full p-3 rounded-xl mb-3"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <select
              className="border w-full p-3 rounded-xl mb-3"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>

            <input
              type="date"
              className="border w-full p-3 rounded-xl mb-4"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-4 py-2 rounded-xl"
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
