import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contacto");
  const [userDni, setUserDni] = useState("");

  const tabs = [
    { id: "contacto", label: "Información de Contacto" },
    { id: "trabajo", label: "Estudio y Trabajo" },
    { id: "medico", label: "Información Médica" },
  ];

  // BASIC PROFILE
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    rol: "",
  });

  // CONTACT INFO
  const [contactData, setContactData] = useState({
    phone: "",
    address: "",
    city: "",
    province: "",
    country: "",
  });

  // WORK / STUDY
  const [workData, setWorkData] = useState({
    activityType: "",
    organization: "",
    positionOrGrade: "",
    schedule: "",
  });

  // MEDICAL
  const [medicalData, setMedicalData] = useState({
    healthInsurance: "",
    membershipNumber: "",
    bloodType: "",
    allergies: "",
  });

  // EMERGENCY
  const [emergencyData, setEmergencyData] = useState({
    contactName: "",
    phoneNumber: "",
    relationship: "",
  });

  // --------------------------------------
  // TOKEN + LOAD
  // --------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      const dni = decoded.sub || decoded.dni;

      setUserDni(dni);
      loadAll(dni, token);
    } catch (error) {
      navigate("/");
    }
  }, []);

  // LOAD ALL
  const loadAll = async (dni, token) => {
    setLoading(true);
    await Promise.all([
      loadBasic(dni, token),
      loadContact(token),
      loadWork(token),
      loadMedical(token),
      loadEmergency(token),
    ]);
    setLoading(false);
  };

  // BASIC PROFILE
  const loadBasic = async (dni, token) => {
    const res = await fetch(`http://localhost:8080/api/users/${dni}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const data = await res.json();

    const partes = (data.name || "").split(" ");

    setUserData({
      nombre: partes[0] || "",
      apellido: partes.slice(1).join(" ") || "",
      email: data.email || "",
      dni: data.dni || "",
      rol: data.role || "",
    });
  };

  // CONTACT
  const loadContact = async (token) => {
    const res = await fetch("http://localhost:8080/api/profile/contact-info", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const d = await res.json();

    setContactData({
      phone: d.phone || "",
      address: d.address || "",
      city: d.city || "",
      province: d.province || "",
      country: d.country || "",
    });
  };

  // WORK
  const loadWork = async (token) => {
    const res = await fetch("http://localhost:8080/api/profile/work-or-study", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const d = await res.json();

    setWorkData({
      activityType: d.activityType || "",
      organization: d.organization || "",
      positionOrGrade: d.positionOrGrade || "",
      schedule: d.schedule || "",
    });
  };

  // MEDICAL
  const loadMedical = async (token) => {
    const res = await fetch("http://localhost:8080/api/profile/medical-info", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;
    const d = await res.json();

    setMedicalData({
      healthInsurance: d.healthInsurance || "",
      membershipNumber: d.membershipNumber || "",
      bloodType: d.bloodType || "",
      allergies: d.allergies || "",
    });
  };

  // EMERGENCY
  const loadEmergency = async (token) => {
    const res = await fetch(
      "http://localhost:8080/api/profile/emergency-contact",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;
    const d = await res.json();

    setEmergencyData({
      contactName: d.contactName || "",
      phoneNumber: d.phoneNumber || "",
      relationship: d.relationship || "",
    });
  };

  // --------------------------------------
  // SUBMIT CONTACT
  // --------------------------------------
  const submitContact = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8080/api/profile/contact-info", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    alert("Información guardada");
    loadContact(token);
  };

  // SUBMIT WORK
  const submitWork = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8080/api/profile/work-or-study", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workData),
    });

    alert("Información guardada");
    loadWork(token);
  };

  // SUBMIT MEDICAL + EMERGENCY
  const submitMedical = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8080/api/profile/medical-info", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(medicalData),
    });

    await fetch("http://localhost:8080/api/profile/emergency-contact", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emergencyData),
    });

    alert("Información guardada");
    loadMedical(token);
    loadEmergency(token);
  };

  // --------------------------------------
  // UI
  // --------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-amber-600">Mi Perfil</h1>
        </div>
      </div>

      {/* PROFILE HEADER */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 rounded-3xl text-white shadow-xl flex items-center gap-6">
          <div className="bg-white text-amber-600 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold shadow-lg">
            {userData.nombre?.charAt(0)}
            {userData.apellido?.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              {userData.nombre} {userData.apellido}
            </h2>
            <p className="opacity-80">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
          {/* TAB BUTTONS */}
          <div className="flex border-b border-amber-200 bg-amber-50">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`flex-1 py-4 font-semibold ${
                  activeTab === t.id
                    ? "bg-white text-amber-600 border-b-2 border-amber-600"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "contacto" && (
            <form className="p-8 space-y-8" onSubmit={submitContact}>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Información de Contacto
              </h2>

              <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Teléfono
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="+54 9 351..."
                      value={contactData.phone}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Dirección
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Calle 123"
                      value={contactData.address}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Ciudad
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Ciudad"
                      value={contactData.city}
                      onChange={(e) =>
                        setContactData({ ...contactData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Provincia
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Provincia"
                      value={contactData.province}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          province: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Código Postal
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="5000"
                      value={contactData.country}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all">
                  Guardar información
                </button>
              </div>
            </form>
          )}

          {activeTab === "trabajo" && (
            <form className="p-8 space-y-8" onSubmit={submitWork}>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Estudio y Trabajo
              </h2>

              <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-blue-700 text-center">
                  Información Laboral
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Tipo de Actividad
                    </label>
                    <input
                      className="input"
                      value={workData.activityType}
                      placeholder="Trabajo / Estudio"
                      onChange={(e) =>
                        setWorkData({
                          ...workData,
                          activityType: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Organización / Empresa
                    </label>
                    <input
                      className="input"
                      value={workData.organization}
                      placeholder="Empresa o Institución"
                      onChange={(e) =>
                        setWorkData({
                          ...workData,
                          organization: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Cargo / Grado
                    </label>
                    <input
                      className="input"
                      value={workData.positionOrGrade}
                      placeholder="Ej: Desarrollador / 6to Año"
                      onChange={(e) =>
                        setWorkData({
                          ...workData,
                          positionOrGrade: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Horario
                    </label>
                    <input
                      className="input"
                      value={workData.schedule}
                      placeholder="Ej: 9:00 - 17:00"
                      onChange={(e) =>
                        setWorkData({ ...workData, schedule: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all">
                  Guardar información
                </button>
              </div>
            </form>
          )}

          {/* MEDICAL TAB */}
          {activeTab === "medico" && (
            <form className="p-8 space-y-8" onSubmit={submitMedical}>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Información Médica
              </h2>

              {/* MEDICAL INFO BOX */}
              <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Obra Social / Prepaga
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="OSDE / Swiss Medical / etc."
                      value={medicalData.healthInsurance}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          healthInsurance: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Número de Afiliado
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="123456789"
                      value={medicalData.membershipNumber}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          membershipNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Grupo Sanguíneo
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      value={medicalData.bloodType}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          bloodType: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Alergias
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      placeholder="Describa alergias"
                      value={medicalData.allergies}
                      onChange={(e) =>
                        setMedicalData({
                          ...medicalData,
                          allergies: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* EMERGENCY CONTACT BOX */}
              <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-center text-red-700">
                  Contacto de Emergencia
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Nombre Completo
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="Ej: Juan Pérez"
                      value={emergencyData.contactName}
                      onChange={(e) =>
                        setEmergencyData({
                          ...emergencyData,
                          contactName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Teléfono
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="+54 9 351..."
                      value={emergencyData.phoneNumber}
                      onChange={(e) =>
                        setEmergencyData({
                          ...emergencyData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 mb-2 font-medium">
                      Relación
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="Madre / Padre / Pareja / etc."
                      value={emergencyData.relationship}
                      onChange={(e) =>
                        setEmergencyData({
                          ...emergencyData,
                          relationship: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all">
                  Guardar información
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
