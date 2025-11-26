import React, { useState } from "react";
import TermsModal from "./TermsModal";
import famtaskIcon from "../assets/arbol.png";

export default function SignupForm({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "USUARIO",
  });

  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validación
  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido.trim())
      newErrors.apellido = "El apellido es requerido";
    if (!formData.dni.trim()) newErrors.dni = "El DNI es requerido";
    else if (!/^\d{7,8}$/.test(formData.dni))
      newErrors.dni = "Debe tener 7 u 8 dígitos";

    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6)
      newErrors.password = "Debe tener al menos 6 caracteres";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!acceptedTerms) {
      alert("Debes aceptar los Términos y Condiciones");
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        dni: formData.dni,
        name: formData.nombre,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Usuario registrado correctamente");
        onNavigateToLogin();
      } else {
        alert(data.error || "Error al registrar");
      }
    } catch (error) {
      alert("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      {/* Caja principal — SIN SCROLL */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex relative">
        {/* ❌ Botón X */}
        <button
          onClick={onNavigateToLogin}
          className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-700 transition"
        >
          ✕
        </button>

        {/* IZQUIERDA */}
        <div className="w-1/2 bg-gradient-to-br from-amber-100 to-yellow-50 p-10 flex flex-col items-center justify-center border-r">
          <div className="flex flex-col items-center mb-8">
            <img
              src={famtaskIcon}
              alt="FamTask icon"
              className="w-20 h-20 object-contain drop-shadow-md"
            />

            <h1 className="text-4xl font-extrabold text-gray-800 mt-4">
              FamTask
            </h1>
            <p className="text-gray-600 text-lg">
              Únete a la comunidad familiar
            </p>
          </div>

          <div className="bg-white shadow-md rounded-xl px-7 py-6 w-80">
            <h2 className="font-bold text-gray-800 text-xl mb-3">
              ¿Por qué registrarte?
            </h2>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-purple-700 text-xl">✔</span>
                Organiza a tu familia en un solo lugar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-700 text-xl">✔</span>
                Comparte calendarios y tareas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-700 text-xl">✔</span>
                Notificaciones en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-700 text-xl">✔</span>
                Totalmente gratis
              </li>
            </ul>
          </div>
        </div>

        {/* DERECHA — FORMULARIO OPTIMIZADO */}
        <div className="w-1/2 p-8 flex flex-col justify-between">
          {/* ENCABEZADO */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">
              Crear cuenta
            </h2>
            <p className="text-gray-600 mb-4 text-sm">Completa tus datos</p>

            {/* FORM */}
            <div className="space-y-3">
              {/* Nombre + Apellido */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="text-xs font-medium">Nombre *</label>
                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 rounded-lg border ${
                      errors.nombre ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Juan"
                  />
                </div>

                <div className="w-1/2">
                  <label className="text-xs font-medium">Apellido *</label>
                  <input
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 rounded-lg border ${
                      errors.apellido ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              {/* DNI */}
              <div>
                <label className="text-xs font-medium">DNI *</label>
                <input
                  name="dni"
                  maxLength="8"
                  value={formData.dni}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    errors.dni ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="12345678"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="usuario@email.com"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="text-xs font-medium">Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="USUARIO">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="PADRE">Padre/Madre</option>
                  <option value="HIJO">Hijo/Hija</option>
                </select>
              </div>

              {/* Contraseña */}
              <div>
                <label className="text-xs font-medium">Contraseña *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••"
                />
              </div>

              {/* Confirmar */}
              <div>
                <label className="text-xs font-medium">Confirmar *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 rounded-lg border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN FIJADO ABAJO */}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white py-2 rounded-xl font-semibold shadow-md hover:scale-[1.01] transition"
          >
            Crear cuenta
          </button>
        </div>
      </div>

      {/* Modal de términos */}
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTerms(false);
          handleSubmit();
        }}
      />
    </div>
  );
}
