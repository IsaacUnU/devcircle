'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: 0.35,
            ease: [0.25, 0.1, 0.25, 1] as const,
          },
        }}
        exit={{
          opacity: 0,
          y: -4,
          filter: 'blur(2px)',
          transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1] as const,
          },
        }}
        className="flex-1 flex flex-col min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
