"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  PieChart,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Globe,
  Layers,
  Sun,
  Moon,
  Calendar,
  Zap,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "SLE", symbol: "Le", name: "Sierra Leonean Leone", flag: "🇸🇱" },
];

const categoryColors = [
  { name: "Housing", color: "#5a9a7b", percentage: 30 },
  { name: "Food", color: "#c76d4e", percentage: 15 },
  { name: "Transport", color: "#d4a84b", percentage: 10 },
  { name: "Entertainment", color: "#8b7eb8", percentage: 10 },
  { name: "Utilities", color: "#6b9dbd", percentage: 8 },
  { name: "Shopping", color: "#c9958a", percentage: 7 },
];

const income = 5000;

export function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const [activeCurrency, setActiveCurrency] = useState(0);
  const [savingsRate, setSavingsRate] = useState(20);
  const [animatedIncome, setAnimatedIncome] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = income / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= income) {
        setAnimatedIncome(income);
        clearInterval(timer);
      } else {
        setAnimatedIncome(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCurrency((prev) => (prev + 1) % currencies.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -50]);

  const currentTheme = mounted ? resolvedTheme : "light";
  const currentCurrency = currencies[activeCurrency];

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden grain"
      ref={containerRef}
    >
      {/* Warm gradient backgrounds */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Primary gradient blob */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.18 28 / 0.15), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Secondary gradient blob */}
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.14 165 / 0.1), transparent 70%)",
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/30"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-1 xs:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 xs:gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/new_ledgerise_logo_1.png"
                alt="Ledgerise Logo"
                width={40}
                height={40}
                className="rounded-xl shadow-lg"
              />
            </motion.div>
            <span className="flex items-baseline gap-0.5">
              <span className="text-xl font-serif tracking-tight">Ledger</span>
              <span className="text-xl font-serif text-primary italic">ise</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 xs:gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() =>
                  setTheme(currentTheme === "dark" ? "light" : "dark")
                }
                className="rounded-full w-8 h-8 xs:w-10 xs:h-10"
              >
                <AnimatePresence mode="wait">
                  {currentTheme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4 xs:w-5 xs:h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4 xs:w-5 xs:h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="rounded-xl px-4 xs:px-6 gap-2 text-xs xs:text-sm h-8 xs:h-10">
                  Dashboard
                  <ChevronRight className="hidden xs:block w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="rounded-xl px-5 text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="rounded-xl px-4 xs:px-6 shadow-lg shadow-primary/20 gap-1 xs:gap-2 text-xs xs:text-sm h-8 xs:h-10">
                      Get Started
                      <Sparkles className="w-3 h-3 xs:w-4 xs:h-4" />
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-16"
      >
        <motion.div
           style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
           className="container mx-auto px-4 sm:px-6 py-10 xs:py-16 sm:py-20 lg:py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm rounded-full border border-primary/30 bg-primary/5 text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Budgeting Reimagined
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif tracking-tight mb-4 xs:mb-6 leading-[1.1]"
              >
                <span className="text-foreground">Master Your Money</span>
                <br />
                <span className="text-primary italic">with Smart Defaults</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Stop micromanaging every penny. Our{" "}
                <span className="text-primary font-medium">
                  smart 20% savings rule
                </span>
                , custom categories, and beautiful insights help you build
                wealth effortlessly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-xl group shadow-xl shadow-primary/20 w-full sm:w-auto gap-2"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Start for Free"}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg rounded-xl w-full sm:w-auto border-dashed"
                  >
                    See Features
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-savings" />
                  <span>Secure by default</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Interactive Demo Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Decorative blur */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-savings/10 rounded-3xl blur-3xl opacity-60" />

              {/* Main Demo Card */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-5 sm:p-7 shadow-2xl">
                {/* Currency Switcher */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      key={activeCurrency}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl"
                    >
                      {currentCurrency.flag}
                    </motion.div>
                    <div>
                      <motion.div
                        key={`code-${activeCurrency}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="font-semibold"
                      >
                        {currentCurrency.code}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        {currentCurrency.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {currencies.map((_, i) => (
                      <motion.button
                        key={i}
                        aria-label={`Select ${currencies[i].name} currency`}
                        aria-pressed={i === activeCurrency}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                          i === activeCurrency ? "bg-primary" : "bg-muted"
                        }`}
                        whileHover={{ scale: 1.3 }}
                        onClick={() => setActiveCurrency(i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Income Display */}
                <div className="bg-muted/50 rounded-2xl p-5 mb-5">
                  <div className="text-sm text-muted-foreground mb-1">
                    Monthly Income
                  </div>
                  <motion.div
                    className="text-4xl sm:text-5xl font-mono font-bold tabular-nums"
                    key={activeCurrency}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="text-muted-foreground text-2xl sm:text-3xl">
                      {currentCurrency.symbol}
                    </span>
                    {animatedIncome.toLocaleString()}
                  </motion.div>
                </div>

                {/* Savings Rate Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Savings Rate</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        savingsRate >= 20
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {savingsRate >= 20 ? "On Track" : "Below Target"}
                    </span>
                  </div>
                  <div className="relative">
                    <label htmlFor="savings-rate" className="sr-only">
                      Savings Rate Slider
                    </label>
                    <input
                      id="savings-rate"
                      type="range"
                      min="0"
                      max="50"
                      value={savingsRate}
                      onChange={(e) => setSavingsRate(Number(e.target.value))}
                      className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-primary font-semibold text-sm">
                      {savingsRate}%
                    </span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    className="bg-savings/10 border border-savings/20 rounded-2xl p-4"
                    animate={{
                      scale: savingsRate >= 20 ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-sm text-savings mb-1">Savings</div>
                    <div className="text-2xl font-mono font-bold text-savings tabular-nums">
                      {currentCurrency.symbol}
                      {Math.round(income * (savingsRate / 100)).toLocaleString()}
                    </div>
                  </motion.div>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                    <div className="text-sm text-primary mb-1">To Spend</div>
                    <div className="text-2xl font-mono font-bold text-primary tabular-nums">
                      {currentCurrency.symbol}
                      {Math.round(
                        income * ((100 - savingsRate) / 100)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Category Preview */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Budget Categories
                  </div>
                  <div className="flex gap-1">
                    {categoryColors.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        className="h-10 rounded-lg relative group cursor-pointer"
                        style={{
                          backgroundColor: cat.color,
                          flex: cat.percentage,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scaleY: 1.15, y: -2 }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card text-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                          {cat.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating decorations */}
              <motion.div
                className="hidden sm:flex absolute -right-4 top-1/4 bg-card border rounded-xl p-3 shadow-lg items-center gap-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Auto-save</span>
              </motion.div>
              <motion.div
                className="hidden sm:flex absolute -left-4 bottom-1/4 bg-card border rounded-xl p-3 shadow-lg items-center gap-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">+20%</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Principles Section — what the app stands for, not fabricated metrics */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PrincipleCard
              title="Save first"
              description="20% of every paycheck, before everything else."
              delay={0}
            />
            <PrincipleCard
              title="Plan honestly"
              description="If you save less, write down why. No silent slippage."
              delay={0.1}
            />
            <PrincipleCard
              title="Look back, learn forward"
              description="Every month becomes a record you can read."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 text-sm rounded-full bg-primary/5 text-primary border border-primary/20">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">
              Everything you need to{" "}
              <span className="text-primary italic">succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Powerful features designed to help you understand your spending
              and grow your savings—without the complexity.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={ShieldCheck}
              title="Smart 20% Rule"
              description="Automatically sets aside 20% for savings. If you save less, we'll ask why—keeping you accountable."
              color="savings"
              delay={0.1}
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Currency"
              description="Support for SLE, USD, GBP, EUR, and NGN currencies."
              color="primary"
              delay={0.2}
            />
            <FeatureCard
              icon={Layers}
              title="Custom Categories"
              description="Create categories with custom colors to match your lifestyle."
              color="primary"
              delay={0.3}
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Updates"
              description="See exactly how much you have left as you track expenses."
              color="warning"
              delay={0.4}
            />
            <FeatureCard
              icon={PieChart}
              title="Visual Insights"
              description="Beautiful charts help you visualize spending patterns over time."
              color="primary"
              delay={0.5}
            />
            <FeatureCard
              icon={Calendar}
              title="Historical Tracking"
              description="View past months as read-only records. Track your progress."
              color="primary"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 text-sm rounded-full bg-primary/5 text-primary border border-primary/20">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-serif mb-4">
              Simple, effective <span className="text-primary italic">budgeting</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Get started in minutes. No complex setup, no learning curve.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Set your income",
                description:
                  "Enter your monthly income and we'll automatically calculate your 20% savings goal.",
                icon: Wallet,
              },
              {
                step: "02",
                title: "Customize categories",
                description:
                  "Adjust allocations for your needs. Housing, Food, Transport—you name it.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Track & Grow",
                description:
                  "Log expenses, stay within budget, and watch your savings grow month over month.",
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="bg-card border rounded-3xl p-8 relative z-10 h-full transition-shadow hover:shadow-xl">
                  <div className="text-6xl font-serif text-primary/10 mb-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10 py-16 md:py-24 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-primary-foreground mb-6">
                  Ready to take control?
                </h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                  Build the habit of saving 20% of every paycheck — with the
                  receipts to prove it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-14 px-10 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all group gap-2"
                    >
                      Start Budgeting Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-primary-foreground/60 text-sm">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Free forever
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> No credit card required
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/new_ledgerise_logo_1.png"
                alt="Ledgerise Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="flex items-baseline gap-0.5">
                <span className="text-xl font-serif">Ledger</span>
                <span className="text-xl font-serif text-primary italic">ise</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 Ledgerise. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Principle Card Component — replaces fake stats with the app's actual principles
function PrincipleCard({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center md:text-left"
    >
      <h3 className="text-2xl md:text-3xl font-serif mb-2">
        <span className="text-primary italic">{title}</span>
      </h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 border-primary/20",
    savings: "from-savings/10 to-savings/5 border-savings/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
  };

  const iconColorClasses = {
    primary: "bg-primary/20 text-primary",
    savings: "bg-savings/20 text-savings",
    warning: "bg-warning/20 text-warning",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <div
        className={`h-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-3xl p-8 relative overflow-hidden group transition-all hover:shadow-lg`}
      >
        <div
          className={`w-14 h-14 rounded-2xl ${iconColorClasses[color as keyof typeof iconColorClasses]} flex items-center justify-center mb-6`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
