import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal de confirmación personalizado para FamTask
 * Reemplaza los window.confirm() nativos
 * Mantiene los colores amber del proyecto
 */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "warning" }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Colores según el tipo
  const typeStyles = {
    warning: {
      icon: "⚠",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      confirmBg: "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600",
    },
    danger: {
      icon: "✕",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      confirmBg: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    },
    info: {
      icon: "ℹ",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      confirmBg: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    },
  };

  const styles = typeStyles[type] || typeStyles.warning;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icono */}
              <div className="flex justify-center mb-4">
                <div className={`${styles.iconBg} ${styles.iconText} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {styles.icon}
                </div>
              </div>

              {/* Título */}
              {title && (
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                  {title}
                </h3>
              )}

              {/* Mensaje */}
              <p className="text-gray-600 text-center mb-6">
                {message}
              </p>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold
                           hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-3 ${styles.confirmBg} text-white rounded-xl font-semibold
                           transition-all duration-200 transform hover:scale-105 shadow-lg`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
