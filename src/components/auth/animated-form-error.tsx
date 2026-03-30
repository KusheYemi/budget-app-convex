"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AnimatedFormErrorProps {
  error: string | null;
}

export function AnimatedFormError({ error }: AnimatedFormErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
