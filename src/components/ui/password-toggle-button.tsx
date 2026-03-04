"use client";

import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PasswordToggleButtonProps {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PasswordToggleButton({
  show,
  onToggle,
  disabled,
}: PasswordToggleButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
      onClick={onToggle}
      disabled={disabled}
    >
      <motion.div
        initial={false}
        animate={{ scale: [1, 0.8, 1] }}
        transition={{ duration: 0.2 }}
        key={show ? "hide" : "show"}
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </motion.div>
      <span className="sr-only">{show ? "Hide password" : "Show password"}</span>
    </Button>
  );
}
