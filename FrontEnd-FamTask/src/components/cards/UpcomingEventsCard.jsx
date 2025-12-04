import { motion } from 'framer-motion';

/**
 * Card de Próximos Eventos - Diseño profesional
 */
const UpcomingEventsCard = ({
  events = [],
  loading,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  canEditEvent,
  getEventTypeLabel,
  getEventTypeColor,
  formatDateTime
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500
                          flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Próximos Eventos</h2>
              <p className="text-sm text-gray-500">
                {events.length > 0 ? `${events.length} evento(s) programado(s)` : 'No hay eventos'}
              </p>
            </div>
          </div>
          <button
            onClick={onCreateEvent}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white
                     rounded-lg font-medium hover:from-purple-600 hover:to-blue-600
                     transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg
                     hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Cargando eventos...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100
                          flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-2">No hay eventos programados</p>
            <p className="text-sm text-gray-400">Crea tu primer evento para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl border border-gray-100 hover:border-purple-200
                         hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Date indicator */}
                  <div className="flex-shrink-0 w-16 text-center p-2 rounded-lg bg-gradient-to-br
                                from-purple-50 to-blue-50 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(event.startTime).getDate()}
                    </div>
                    <div className="text-xs text-gray-600 uppercase">
                      {new Date(event.startTime).toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600
                                     transition-colors">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Badge de tipo */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                                     ${getEventTypeColor(event)}`}>
                        {getEventTypeLabel(event)}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDateTime(event.startTime)}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canEditEvent && canEditEvent(event) && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50
                                   rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50
                                   rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingEventsCard;
