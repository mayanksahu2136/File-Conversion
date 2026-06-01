import { motion } from "framer-motion";

export default function Button({ children, className = "", loading = false, disabled = false, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 800, damping: 30 }}
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent shadow-glass disabled:opacity-60 " +
        className
      }
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-white/80" />
      ) : (
        children
      )}
    </motion.button>
  );
}
