"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, PieChart, Shield } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Shield,
    title: "Smart 20% Savings",
    description: "Save first, then spend — with accountability if you don't.",
  },
  {
    icon: PieChart,
    title: "Visual Insights",
    description: "Beautiful charts to see where your money actually goes.",
  },
  {
    icon: TrendingUp,
    title: "A budget you'll keep",
    description: "Watch your savings compound, month after month.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side — Branding */}
      <div className="relative lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-primary via-primary to-[oklch(0.55_0.16_18)] overflow-hidden">
        {/* Background pattern + warm orbs */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[oklch(0.55_0.14_165)/0.18] rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6 lg:p-12 text-white min-h-[200px] sm:min-h-[250px] lg:min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/new_ledgerise_logo_1.png"
                  alt="Ledgerise Logo"
                  width={48}
                  height={48}
                  className="rounded-2xl shadow-lg"
                />
              </motion.div>
              <span className="flex items-baseline gap-0.5">
                <span className="text-2xl font-serif">Ledger</span>
                <span className="text-2xl font-serif italic">ise</span>
              </span>
            </Link>
          </motion.div>

          {/* Main Message */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-md"
            >
              <h1 className="text-4xl xl:text-5xl font-serif mb-6 leading-tight">
                Your financial clarity{" "}
                <span className="italic">starts here</span>
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Smart budgeting, the 20% rule, and a record of every month —
                without the guilt-tripping.
              </p>

              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{feature.title}</div>
                      <div className="text-white/70 text-sm">
                        {feature.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden lg:block text-white/60 text-sm"
          >
            Save first. Plan honestly. Look back, learn forward.
          </motion.div>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
