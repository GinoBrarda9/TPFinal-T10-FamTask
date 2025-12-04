import { motion } from 'framer-motion';

/**
 * Card de Invitaciones Pendientes - Compacta
 */
const InvitationsCard = ({ invitations = [], onAccept, onReject }) => {
  if (!invitations || invitations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-md
               border border-amber-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-amber-200 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500
                        flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Invitaciones</h3>
            <p className="text-xs text-gray-600">{invitations.length} pendiente(s)</p>
          </div>
        </div>
      </div>

      {/* Invitations list */}
      <div className="p-4 space-y-3">
        {invitations.map((inv, idx) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm"
          >
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-800 mb-1">
                Invitación a <strong className="text-amber-600">{inv.familyName}</strong>
              </p>
              <p className="text-xs text-gray-500">Rol: {inv.role}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAccept(inv.id, true)}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600
                         text-white text-sm font-medium rounded-lg
                         hover:from-green-600 hover:to-green-700
                         transition-all duration-200 shadow-sm hover:shadow-md
                         flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                </svg>
                Aceptar
              </button>
              <button
                onClick={() => onReject(inv.id, false)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium
                         rounded-lg hover:bg-gray-200 transition-colors
                         flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InvitationsCard;
