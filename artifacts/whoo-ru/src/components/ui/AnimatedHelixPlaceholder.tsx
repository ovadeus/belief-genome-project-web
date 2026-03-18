import { motion } from "framer-motion";

export function AnimatedHelixPlaceholder() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1000px]">
      <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent opacity-50" />
      
      {/* CSS representation of a spinning triple helix DNA structure placeholder */}
      <div className="relative w-32 h-96 transform-style-3d animate-[spin_12s_linear_infinite]">
        {[0, 1, 2].map((strand) => (
          <motion.div
            key={strand}
            className="absolute inset-0 flex flex-col justify-between py-8"
            initial={{ rotateY: strand * 120 }}
            animate={{ rotateY: strand * 120 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-4 h-4 rounded-full shadow-[0_0_20px_currentColor]`}
                style={{
                  backgroundColor: strand === 0 ? 'var(--color-primary)' : strand === 1 ? 'var(--color-secondary)' : 'var(--color-accent)',
                  color: strand === 0 ? 'var(--color-primary)' : strand === 1 ? 'var(--color-secondary)' : 'var(--color-accent)',
                  transform: `translateX(${Math.sin((i / 11) * Math.PI * 4) * 60}px) translateZ(${Math.cos((i / 11) * Math.PI * 4) * 60}px)`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1 + (strand * 0.3),
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        ))}
        {/* Central connecting core */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 blur-[1px]" />
      </div>
    </div>
  );
}
