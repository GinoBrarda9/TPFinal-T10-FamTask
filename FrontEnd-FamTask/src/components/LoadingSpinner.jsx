import { motion } from 'framer-motion';

/**
 * Componente Loading Spinner con colores del proyecto FamTask
 * Uso: <LoadingSpinner size="medium" /> o <LoadingSpinner fullScreen />
 */
const LoadingSpinner = ({ size = 'medium', fullScreen = false, text = '' }) => {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const Spinner = () => (
    <motion.div
      className={`${sizes[size]} relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Círculo exterior rotando */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-amber-200"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          borderTopColor: '#FBBF24', // amber-400
          borderRightColor: '#F59E0B', // amber-500
        }}
      />

      {/* Círculo interior pulsando */}
      <motion.div
        className="absolute inset-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Spinner />
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Spinner />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-gray-600 text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
