'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.99, y: 4 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.2,
            ease: "easeOut",
          },
        }}
        exit={{
          opacity: 0,
          scale: 1.01,
          y: -2,
          pointerEvents: 'none',
          transition: {
            duration: 0.1,
            ease: "easeIn",
          },
        }}
        className="flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
