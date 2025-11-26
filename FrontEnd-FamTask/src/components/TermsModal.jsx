import React, { useState } from "react";

export default function TermsModal({ open, onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[85vh] border border-amber-200 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Términos y Condiciones de FamTask
        </h2>

        <div className="text-gray-700 space-y-4 text-sm">
          <p>
            Bienvenido a <strong>FamTask</strong>. Al registrarte y utilizar
            nuestros servicios, aceptás los siguientes Términos y Condiciones.
          </p>

          <h3 className="text-lg font-semibold">1. Uso de la Aplicación</h3>
          <p>
            FamTask permite organizar tareas familiares, eventos y calendarios
            compartidos.
          </p>

          <h3 className="text-lg font-semibold">
            2. Registro y Responsabilidad
          </h3>
          <p>
            El usuario debe proporcionar información real y mantener su
            contraseña segura.
          </p>

          <h3 className="text-lg font-semibold">3. Privacidad</h3>
          <p>
            La información será utilizada solo para el funcionamiento interno de
            la plataforma.
          </p>

          <h3 className="text-lg font-semibold">4. Integraciones externas</h3>
          <p>
            Al conectar Google Calendar, el usuario acepta sus permisos
            correspondientes.
          </p>

          <h3 className="text-lg font-semibold">5. Aceptación</h3>
          <p>
            Para continuar con el registro, es obligatorio aceptar estos
            términos.
          </p>
        </div>

        {/* Checkbox */}
        <div className="flex items-center mt-6 mb-4">
          <input
            type="checkbox"
            id="acceptTerms"
            className="w-4 h-4 mr-2"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="acceptTerms" className="text-gray-700 text-sm">
            Confirmo que he leído y acepto los Términos y Condiciones.
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              if (checked) onAccept();
            }}
            disabled={!checked}
            className={`px-4 py-2 rounded-xl font-semibold text-white transition ${
              checked
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Aceptar términos
          </button>
        </div>
      </div>
    </div>
  );
}
