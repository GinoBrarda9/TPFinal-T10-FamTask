import { motion } from 'framer-motion';

/**
 * Card de Estadísticas Rápidas - Resumen visual
 */
const QuickStatsCard = ({ events = [], familyMembers = [] }) => {
  const stats = [
    {
      label: 'Eventos',
      value: events.length,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Miembros',
      value: familyMembers.length,
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover-lift"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color}
                        flex items-center justify-center shadow-md mb-3`}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {stat.icon}
            </svg>
          </div>
          <div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStatsCard;
