import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Sidebar moderno y profesional para FamTask
 * - Fijo en desktop
 * - Slide-in en móvil
 * - Con colores del proyecto
 */
const Sidebar = ({ isOpen, onClose, currentView, onNavigate, userName, userRole = "USER" }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
    },
    {
      id: 'kanban',
      label: 'Tareas',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      ),
    },
    {
      id: 'finances',
      label: 'Finanzas',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      onClick: () => navigate('/finances'),
    },
  ];

  const reportItems = [
    { id: 'events', label: 'Eventos', path: '/reports/events' },
    { id: 'kanban', label: 'Tareas', path: '/reports/kanban' },
    { id: 'finance', label: 'Finanzas', path: '/reports/finance' },
  ];

  const handleNavigation = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(item.id);
    }
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const sidebarContent = (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500
                          flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600
                           bg-clip-text text-transparent">
                FamTask
              </h2>
              <p className="text-xs text-gray-500">Gestión familiar</p>
            </div>
          </div>

          {/* Close button - solo en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50
                      rounded-xl border border-amber-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500
                        flex items-center justify-center text-white font-bold shadow-md">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-xs text-gray-500">{userRole === 'ADMIN' ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Menú Principal
        </p>

        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       transition-all duration-200 group relative overflow-hidden
                       ${isActive
                         ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md'
                         : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <svg
                className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110
                          ${isActive ? 'text-white' : 'text-gray-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {item.icon}
              </svg>
              <span className={`relative z-10 font-medium ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Reportes section */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Reportes
          </p>
          {reportItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-gray-600 hover:bg-amber-50 hover:text-amber-600
                       transition-colors duration-200 group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="pt-2">
          <button
            onClick={() => {
              navigate('/faq');
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                     text-gray-600 hover:bg-amber-50 hover:text-amber-600
                     transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Preguntas Frecuentes</span>
          </button>
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                   text-red-600 hover:bg-red-50 transition-all duration-200
                   group font-medium"
        >
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Desktop - Sidebar fijo */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 border-r border-gray-200 bg-white">
        {sidebarContent}
      </div>

      {/* Mobile - Sidebar slide-in */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
