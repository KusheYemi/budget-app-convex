"use client";

import { motion } from "framer-motion";

interface AuthCardProps {
  children: React.ReactNode;
  delay?: number;
}

export function AuthCard({ children, delay = 0.1 }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl"
    >
      {children}
    </motion.div>
  );
}
