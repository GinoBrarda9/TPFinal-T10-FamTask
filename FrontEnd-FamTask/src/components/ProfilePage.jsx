import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("contacto");

  // Estados para los formularios
  const [contactData, setContactData] = useState({
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
  });

  const [workData, setWorkData] = useState({
    ocupacion: "",
    empresa: "",
    nivelEducacion: "",
    institucion: "",
    titulo: "",
  });

  const [medicalData, setMedicalData] = useState({
    obraSocial: "",
    numeroAfiliado: "",
    grupoSanguineo: "",
    alergias: "",
    medicamentos: "",
    contactoEmergencia: "",
    telefonoEmergencia: "",
  });

  const tabs = [
    {
      id: "contacto",
      label: "Información de Contacto",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      id: "trabajo",
      label: "Estudio y Trabajo",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      id: "medico",
      label: "Información Médica",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando datos de contacto:", contactData);
    alert("Información de contacto guardada exitosamente");
  };

  const handleWorkSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando datos de trabajo:", workData);
    alert("Información de estudio/trabajo guardada exitosamente");
  };

  const handleMedicalSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando datos médicos:", medicalData);
    alert("Información médica guardada exitosamente");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-amber-600 font-bold text-3xl shadow-xl">
            {user?.nombre?.charAt(0)}
            {user?.apellido?.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-amber-50 mb-2">{user?.email}</p>
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              <span className="text-sm capitalize">{user?.rol}</span>
            </div>
          </div>
          <button className="bg-white text-amber-600 hover:bg-amber-50 px-6 py-2 rounded-xl font-semibold transition-colors duration-200 shadow-md">
            Editar foto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-6 py-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-white text-amber-600 border-b-2 border-amber-500"
                    : "text-gray-600 hover:bg-white hover:bg-opacity-50"
                }`}
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
                    d={tab.icon}
                  />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Información de Contacto */}
          {activeTab === "contacto" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={contactData.telefono}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          telefono: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={contactData.direccion}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          direccion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Calle 123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={contactData.ciudad}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          ciudad: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Buenos Aires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia
                    </label>
                    <input
                      type="text"
                      value={contactData.provincia}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          provincia: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Buenos Aires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={contactData.codigoPostal}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          codigoPostal: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="1234"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleContactSubmit}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Guardar información
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información de Estudio/Trabajo */}
          {activeTab === "trabajo" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Estudio y Trabajo
              </h2>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Información Laboral
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      value={workData.ocupacion}
                      onChange={(e) =>
                        setWorkData({ ...workData, ocupacion: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Desarrollador, Médico, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={workData.empresa}
                      onChange={(e) =>
                        setWorkData({ ...workData, empresa: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Información Educativa
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Educación
                    </label>
                    <select
                      value={workData.nivelEducacion}
                      onChange={(e) =>
                        setWorkData({
                          ...workData,
                          nivelEducacion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="secundario">Secundario</option>
                      <option value="terciario">Terciario</option>
                      <option value="universitario">Universitario</option>
                      <option value="posgrado">Posgrado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institución
                    </label>
                    <input
                      type="text"
                      value={workData.institucion}
                      onChange={(e) =>
                        setWorkData({
                          ...workData,
                          institucion: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Universidad/Escuela"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={workData.titulo}
                      onChange={(e) =>
                        setWorkData({ ...workData, titulo: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Licenciatura, Técnico, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleWorkSubmit}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Guardar información
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información Médica */}
          {activeTab === "medico" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Información Médica
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Información sensible
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Esta información es confidencial y solo será visible para
                      ti y los miembros de tu familia con permisos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Obra Social / Prepaga
                    </label>
                    <input
                      type="text"
                      value={medicalData.obraSocial}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          obraSocial: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="OSDE, Swiss Medical, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Afiliado
                    </label>
                    <input
                      type="text"
                      value={medicalData.numeroAfiliado}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          numeroAfiliado: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={medicalData.grupoSanguineo}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        grupoSanguineo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias
                  </label>
                  <textarea
                    value={medicalData.alergias}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        alergias: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    rows="3"
                    placeholder="Describe cualquier alergia conocida"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicamentos Actuales
                  </label>
                  <textarea
                    value={medicalData.medicamentos}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        medicamentos: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    rows="3"
                    placeholder="Lista de medicamentos que tomas regularmente"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Contacto de Emergencia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={medicalData.contactoEmergencia}
                        onChange={(e) =>
                          setMedicalData({
                            ...medicalData,
                            contactoEmergencia: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={medicalData.telefonoEmergencia}
                        onChange={(e) =>
                          setMedicalData({
                            ...medicalData,
                            telefonoEmergencia: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleMedicalSubmit}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Guardar información
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
