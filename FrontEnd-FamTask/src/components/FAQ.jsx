import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();
  const faqs = [
    {
      q: "¿Qué es FamTask?",
      a: "Es una plataforma para organizar actividades familiares, gestionar tareas, eventos y miembros desde un solo lugar.",
    },
    {
      q: "¿Es gratis?",
      a: "Sí, FamTask es totalmente gratuito para todas las familias y usuarios.",
    },
    {
      q: "¿Puedo sincronizar Google Calendar?",
      a: "Sí. Podés sincronizar tus eventos con Google Calendar desde la sección de Calendario. La sincronización es individual: cada usuario conecta su propia cuenta de Google, y solo se sincronizan sus eventos personales.",
    },
    {
      q: "¿Puedo ver los eventos personales de otras personas?",
      a: "No. Los eventos personales solo pueden ser vistos por quien los crea. Los eventos familiares sí son visibles para todos los miembros del grupo.",
    },
    {
      q: "¿Puedo ver las tareas creadas por otras personas en el tablero Kanban?",
      a: "Sí, si pertenecen a la misma familia. El Kanban es colaborativo: todos los miembros pueden ver, mover y editar las tareas del tablero familiar, excepto aquellas que estén marcadas como privadas por el creador.",
    },

    {
      q: "¿Puedo invitar a otros miembros?",
      a: "Sí. Desde la tarjeta 'Mi familia' podés enviar invitaciones por correo a otros usuarios.",
    },

    {
      q: "¿Qué hago si olvidé mi contraseña?",
      a: "Pronto activaremos la recuperación de contraseña. Mientras tanto, podés contactarnos para asistencia.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Usamos autenticación con tokens y almacenamos la información en servidores protegidos.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-amber-200">
        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al inicio
        </button>

        <h1 className="text-3xl font-bold text-amber-600 mb-6">
          Preguntas Frecuentes
        </h1>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-800">{item.q}</h3>
              <p className="text-gray-600 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
