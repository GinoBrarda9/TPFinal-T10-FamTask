import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contacto");
  const [userDni, setUserDni] = useState("");

  // Estados para datos del usuario
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    rol: "",
  });

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
    tipoActividad: "",
    cargo: "",
    horario: "",
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

  const [emergencyData, setEmergencyData] = useState({
    nombreContacto: "",
    telefonoContacto: "",
    relacionContacto: "",
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No hay token, por favor inicia sesión");
      navigate("/");
      return;
    }

    try {
      if (token.split(".").length === 3) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        const dni = decoded.sub || decoded.dni;
        setUserDni(dni);
        fetchAllProfiles(dni, token);
      }
    } catch (error) {
      console.error("Error al decodificar token:", error);
      alert("Token inválido");
      navigate("/");
    }
  }, [navigate]);

  const fetchAllProfiles = async (dni, token) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBasicProfile(dni, token),
        fetchContactProfile(dni, token),
        fetchMedicalProfile(dni, token),
        fetchWorkProfile(dni, token),
        fetchEmergencyProfile(dni, token),
      ]);
    } catch (error) {
      console.error("Error al cargar perfiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBasicProfile = async (dni, token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${dni}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Separar nombre completo en nombre y apellido
        const nombreCompleto = data.name || "";
        const partes = nombreCompleto.split(" ");
        setUserData({
          nombre: partes[0] || "",
          apellido: partes.slice(1).join(" ") || "",
          email: data.email || "",
          dni: data.dni || "",
          rol: data.role || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil básico:", error);
    }
  };

  const fetchContactProfile = async (dni, token) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/contact-info`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContactData({
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          ciudad: data.ciudad || "",
          provincia: data.provincia || "",
          codigoPostal: data.codigoPostal || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil de contacto:", error);
    }
  };

  const fetchMedicalProfile = async (dni, token) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/medical-info`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMedicalData({
          obraSocial: data.obraSocial || "",
          numeroAfiliado: data.numeroAfiliado || "",
          grupoSanguineo: data.grupoSanguineo || "",
          alergias: data.alergias || "",
          medicamentos: data.medicamentos || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil médico:", error);
    }
  };

  const fetchWorkProfile = async (dni, token) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/work-or-study`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkData({
          ocupacion: data.ocupacion || "",
          empresa: data.empresa || "",
          nivelEducacion: data.nivelEducacion || "",
          institucion: data.institucion || "",
          titulo: data.titulo || "",
          tipoActividad: data.tipoActividad || "",
          cargo: data.cargo || "",
          horario: data.horario || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar perfil laboral:", error);
    }
  };

  const fetchEmergencyProfile = async (dni, token) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/emergency-contact`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmergencyData({
          nombreContacto: data.nombreContacto || "",
          telefonoContacto: data.telefonoContacto || "",
          relacionContacto: data.relacionContacto || "",
        });
        // También actualizar en medicalData para compatibilidad
        setMedicalData((prev) => ({
          ...prev,
          contactoEmergencia: data.nombreContacto || "",
          telefonoEmergencia: data.telefonoContacto || "",
        }));
      }
    } catch (error) {
      console.error("Error al cargar contacto de emergencia:", error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/contact-info`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        }
      );

      if (response.ok) {
        alert("Información de contacto guardada exitosamente");
        await fetchContactProfile(userDni, token);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Error al guardar"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/work-or-study`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workData),
        }
      );

      if (response.ok) {
        alert("Información de estudio/trabajo guardada exitosamente");
        await fetchWorkProfile(userDni, token);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Error al guardar"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const medicalResponse = await fetch(
        `http://localhost:8080/api/profile/medical-info`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            obraSocial: medicalData.obraSocial,
            numeroAfiliado: medicalData.numeroAfiliado,
            grupoSanguineo: medicalData.grupoSanguineo,
            alergias: medicalData.alergias,
            medicamentos: medicalData.medicamentos,
          }),
        }
      );

      const emergencyResponse = await fetch(
        `http://localhost:8080/api/profile/emergency-contact`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombreContacto: medicalData.contactoEmergencia,
            telefonoContacto: medicalData.telefonoEmergencia,
            relacionContacto: emergencyData.relacionContacto,
          }),
        }
      );

      if (medicalResponse.ok && emergencyResponse.ok) {
        alert("Información médica guardada exitosamente");
        await fetchMedicalProfile(userDni, token);
        await fetchEmergencyProfile(userDni, token);
      } else {
        alert("Error al guardar información médica");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
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
      {/* Header con botón de regreso */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
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
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-amber-600 font-bold text-3xl shadow-xl">
              {userData.nombre?.charAt(0)}
              {userData.apellido?.charAt(0)}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {userData.nombre} {userData.apellido}
              </h1>
              <p className="text-amber-50 mb-2">{userData.email}</p>
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
                <span className="text-sm capitalize">{userData.rol}</span>
              </div>
            </div>
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
              <form onSubmit={handleContactSubmit}>
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
                      type="submit"
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Guardar información
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Información de Estudio/Trabajo */}
            {activeTab === "trabajo" && (
              <form onSubmit={handleWorkSubmit}>
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
                          setWorkData({
                            ...workData,
                            ocupacion: e.target.value,
                          })
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
                      type="submit"
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Guardar información
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Información Médica */}
            {activeTab === "medico" && (
              <form onSubmit={handleMedicalSubmit}>
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
                        Esta información es confidencial y solo será visible
                        para ti y los miembros de tu familia con permisos.
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
                      type="submit"
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Guardar información
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
