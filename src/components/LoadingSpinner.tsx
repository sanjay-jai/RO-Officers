import { motion } from 'motion/react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full"
      />
      <p className="mt-4 text-gray-500 font-medium animate-pulse">Fetching officer data...</p>
    </div>
  );
}
