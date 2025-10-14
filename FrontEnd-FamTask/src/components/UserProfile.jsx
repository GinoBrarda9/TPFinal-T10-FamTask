import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [userData, setUserData] = useState({
    // Datos personales
    nombre: "",
    email: "",
    dni: "",
    rol: "",
    telefono: "",
    direccion: "",

    // Datos médicos
    obraSocial: "",
    numeroAfiliado: "",
    grupoSanguineo: "",
    alergias: "",

    // Datos escolares/laborales
    tipoActividad: "",
    institucion: "",
    cargo: "",
    horario: "",

    // Contacto de emergencia
    nombreContacto: "",
    telefonoContacto: "",
    relacionContacto: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Error al cargar perfil");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Perfil actualizado exitosamente");
        setEditing(false);
        fetchUserProfile();
      } else {
        alert("Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-amber-600">Mi Perfil</h1>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  fetchUserProfile();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Card Principal - Información Básica */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  userData.nombre || "Usuario"
                }&size=120&background=FFB020&color=fff`}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-amber-400"
              />
            </div>

            {/* Datos Principales */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg font-semibold border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    DNI
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={userData.dni}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Rol
                  </label>
                  <input
                    type="text"
                    name="rol"
                    value={userData.rol}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={userData.telefono}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={userData.direccion}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 text-lg border rounded-lg ${
                      editing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-transparent"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones Desplegables */}
        <div className="space-y-4">
          {/* Datos Médicos */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => toggleSection("medical")}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Datos Médicos
                </h3>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 text-gray-400 transition-transform ${
                  expandedSection === "medical" ? "rotate-45" : ""
                }`}
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
            </button>

            {expandedSection === "medical" && (
              <div className="p-5 pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Obra Social
                    </label>
                    <input
                      type="text"
                      name="obraSocial"
                      value={userData.obraSocial}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Afiliado
                    </label>
                    <input
                      type="text"
                      name="numeroAfiliado"
                      value={userData.numeroAfiliado}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grupo Sanguíneo
                    </label>
                    <select
                      name="grupoSanguineo"
                      value={userData.grupoSanguineo}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alergias
                    </label>
                    <input
                      type="text"
                      name="alergias"
                      value={userData.alergias}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Ninguna"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos Escolares/Laborales */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => toggleSection("work")}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Datos Escolares/Laborales
                </h3>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 text-gray-400 transition-transform ${
                  expandedSection === "work" ? "rotate-45" : ""
                }`}
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
            </button>

            {expandedSection === "work" && (
              <div className="p-5 pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Actividad
                    </label>
                    <select
                      name="tipoActividad"
                      value={userData.tipoActividad}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      <option value="Escolar">Escolar</option>
                      <option value="Laboral">Laboral</option>
                      <option value="Ninguna">Ninguna</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Institución/Empresa
                    </label>
                    <input
                      type="text"
                      name="institucion"
                      value={userData.institucion}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cargo/Grado
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      value={userData.cargo}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horario
                    </label>
                    <input
                      type="text"
                      name="horario"
                      value={userData.horario}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Ej: 8:00 - 17:00"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contacto de Emergencia */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => toggleSection("emergency")}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Contacto de Emergencia
                </h3>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 text-gray-400 transition-transform ${
                  expandedSection === "emergency" ? "rotate-45" : ""
                }`}
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
            </button>

            {expandedSection === "emergency" && (
              <div className="p-5 pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del Contacto
                    </label>
                    <input
                      type="text"
                      name="nombreContacto"
                      value={userData.nombreContacto}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      name="telefonoContacto"
                      value={userData.telefonoContacto}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relación
                    </label>
                    <input
                      type="text"
                      name="relacionContacto"
                      value={userData.relacionContacto}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Ej: Madre, Padre, Hermano/a, etc."
                      className={`w-full px-4 py-2 border rounded-lg ${
                        editing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
