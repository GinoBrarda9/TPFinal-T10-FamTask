import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

/**
 * Hook personalizado para manejar modales de confirmación
 * Uso:
 * const { ConfirmDialog, confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "¿Eliminar evento?",
 *     message: "Esta acción no se puede deshacer",
 *     type: "danger"
 *   });
 *   if (confirmed) {
 *     // hacer algo
 *   }
 * };
 */
const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = (options = {}) => {
    setConfig({
      title: options.title || "¿Estás seguro?",
      message: options.message || "Esta acción no se puede deshacer",
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      type: options.type || "warning",
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  const ConfirmDialog = () => (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      {...config}
    />
  );

  return { ConfirmDialog, confirm };
};

export default useConfirm;
