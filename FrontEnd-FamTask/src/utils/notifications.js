import { toast } from 'react-toastify';

/**
 * Sistema de notificaciones personalizado para FamTask
 * Mantiene los colores del proyecto (amber/yellow para success, etc.)
 */

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const showSuccess = (message) => {
  toast.success(message, {
    ...defaultOptions,
    icon: "✓",
  });
};

export const showError = (message) => {
  toast.error(message, {
    ...defaultOptions,
    icon: "✕",
    autoClose: 4000, // Errores duran un poco más
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...defaultOptions,
    icon: "⚠",
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    ...defaultOptions,
    icon: "ℹ",
  });
};

// Para notificaciones que requieren más atención (no se cierran automáticamente)
export const showPersistent = (message, type = 'info') => {
  const options = {
    ...defaultOptions,
    autoClose: false,
  };

  switch(type) {
    case 'success':
      toast.success(message, { ...options, icon: "✓" });
      break;
    case 'error':
      toast.error(message, { ...options, icon: "✕" });
      break;
    case 'warning':
      toast.warning(message, { ...options, icon: "⚠" });
      break;
    default:
      toast.info(message, { ...options, icon: "ℹ" });
  }
};

// Para notificaciones con loading (operaciones en progreso)
export const showLoading = (message) => {
  return toast.loading(message, {
    position: "top-right",
  });
};

// Para actualizar una notificación de loading
export const updateLoading = (toastId, message, type = 'success') => {
  const updateOptions = {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
    closeButton: true,
  };

  toast.update(toastId, updateOptions);
};

// Exportar toast por si se necesita algo más específico
export { toast };
