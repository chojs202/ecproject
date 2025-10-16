import { motion } from "framer-motion";

const transition = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1], // 자연스러운 cubic-bezier
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
      transition={transition}
      style={{
        minHeight: "100vh",
        willChange: "opacity, transform, filter",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}
