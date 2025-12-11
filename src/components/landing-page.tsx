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
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  PieChart,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Globe,
  CheckCircle2,
  Layers,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Lock,
  Zap,
  ChevronRight,
  Play,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

// Currency data for the interactive demo
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "SLE", symbol: "Le", name: "Sierra Leonean Leone", flag: "🇸🇱" },
];

// Category colors for showcase
const categoryColors = [
  { name: "Housing", color: "#6366f1", percentage: 30 },
  { name: "Food", color: "#22c55e", percentage: 15 },
  { name: "Transport", color: "#f59e0b", percentage: 10 },
  { name: "Entertainment", color: "#ec4899", percentage: 10 },
  { name: "Utilities", color: "#06b6d4", percentage: 8 },
  { name: "Shopping", color: "#8b5cf6", percentage: 7 },
];

export function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Interactive demo states
  const [activeCurrency, setActiveCurrency] = useState(0);
  const [savingsRate, setSavingsRate] = useState(20);
  const income = 5000;
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

  // Animate income counter
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
  }, [income]);

  // Auto-rotate currency
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
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      ref={containerRef}
    >
      {/* Animated Background Grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/30 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]"
          animate={{
            x: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <motion.div
              className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet className="w-5 h-5" />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Budget App
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                className="rounded-full w-10 h-10"
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
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="rounded-full px-6">
                  Dashboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="rounded-full px-5">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/25">
                      Get Started
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container mx-auto px-6 py-20 lg:py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Badge className="mb-6 px-4 py-2 text-sm rounded-full border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Budgeting Reimagined
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
              >
                <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Master Your Money
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-blue-500 bg-clip-text text-transparent">
                  with Smart Defaults
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Stop micromanaging every penny. Our{" "}
                <span className="text-primary font-medium">smart 20% savings rule</span>,
                custom categories, and beautiful insights help you build wealth
                effortlessly.
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
                    className="h-14 px-8 text-lg rounded-full group shadow-xl shadow-primary/25 w-full sm:w-auto"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Start for Free"}
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg rounded-full group w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    See How It Works
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Free forever</span>
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
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-3xl opacity-50" />

              {/* Main Demo Card */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl">
                {/* Currency Switcher Preview */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      key={activeCurrency}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl"
                    >
                      {currentCurrency.flag}
                    </motion.div>
                    <div>
                      <motion.div
                        key={`code-${activeCurrency}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="font-bold"
                      >
                        {currentCurrency.code}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        {currentCurrency.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {currencies.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                          i === activeCurrency ? "bg-primary" : "bg-muted"
                        }`}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setActiveCurrency(i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Income Display */}
                <div className="bg-secondary/50 rounded-2xl p-5 mb-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Monthly Income
                  </div>
                  <motion.div
                    className="text-4xl font-bold"
                    key={activeCurrency}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {currentCurrency.symbol}
                    {animatedIncome.toLocaleString()}
                  </motion.div>
                </div>

                {/* Savings Rate Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Savings Rate</span>
                    <Badge
                      variant={savingsRate >= 20 ? "default" : "secondary"}
                      className={`${
                        savingsRate >= 20
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }`}
                    >
                      {savingsRate >= 20 ? "On Track" : "Below Target"}
                    </Badge>
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
                      className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-primary font-medium">{savingsRate}%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                    animate={{
                      scale: savingsRate >= 20 ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-sm text-green-600 mb-1">Savings</div>
                    <div className="text-xl font-bold text-green-600">
                      {currentCurrency.symbol}
                      {Math.round(income * (savingsRate / 100)).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {savingsRate}% of income
                    </div>
                  </motion.div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <div className="text-sm text-primary mb-1">To Spend</div>
                    <div className="text-xl font-bold text-primary">
                      {currentCurrency.symbol}
                      {Math.round(income * ((100 - savingsRate) / 100)).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {100 - savingsRate}% of income
                    </div>
                  </div>
                </div>

                {/* Category Preview */}
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Budget Categories
                  </div>
                  <div className="flex gap-1.5">
                    {categoryColors.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        className="h-8 rounded-md relative group cursor-pointer"
                        style={{
                          backgroundColor: cat.color,
                          flex: cat.percentage,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scaleY: 1.1 }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {cat.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -right-4 top-1/4 bg-card border rounded-xl p-3 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </motion.div>
              <motion.div
                className="absolute -left-4 bottom-1/4 bg-card border rounded-xl p-3 shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-primary" />
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

      {/* Stats Section */}
      <section className="py-20 border-y border-border/50 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="10K+" label="Active Users" delay={0} />
            <StatCard value="$2M+" label="Tracked Monthly" delay={0.1} />
            <StatCard value="20%" label="Avg. Savings Rate" delay={0.2} />
            <StatCard value="4.9★" label="User Rating" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="demo" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-primary">succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Powerful features designed to help you understand your spending and
              grow your savings—without the complexity.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Large Feature: Smart Savings */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Smart 20% Savings Rule</h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                  Automatically sets aside 20% of your income for savings. If you
                  save less, we&apos;ll ask why—keeping you accountable without being
                  restrictive.
                </p>
                <div className="bg-card/50 backdrop-blur rounded-2xl p-4 inline-block">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: "80%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-green-500">80%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    $800 of $1,000 goal reached this month
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Multi-Currency */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multi-Currency</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Support for SLE, USD, GBP, EUR, and NGN.
                </p>
                <div className="flex flex-wrap gap-2">
                  {currencies.map((c) => (
                    <span
                      key={c.code}
                      className="text-lg"
                      title={c.name}
                    >
                      {c.flag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Custom Categories */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 border border-pink-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6">
                  <Layers className="w-7 h-7 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Custom Categories</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create categories with custom colors.
                </p>
                <div className="flex gap-2">
                  {categoryColors.slice(0, 5).map((c, i) => (
                    <motion.div
                      key={c.name}
                      className="w-8 h-8 rounded-full shadow-lg"
                      style={{ backgroundColor: c.color }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.2, y: -4 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Real-time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
                <p className="text-muted-foreground text-sm">
                  See exactly how much you have left in each category as you
                  track expenses.
                </p>
              </div>
            </motion.div>

            {/* Visual Insights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                    <PieChart className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Visual Insights</h3>
                  <p className="text-muted-foreground">
                    Beautiful charts and graphs help you visualize spending
                    patterns and track your savings growth over time.
                  </p>
                </div>
                <div className="flex-1 flex items-end gap-2 h-32">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-blue-500/30 rounded-t-md hover:bg-blue-500/50 transition-colors"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Historical Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6">
                  <Calendar className="w-7 h-7 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Historical Tracking</h3>
                <p className="text-muted-foreground text-sm">
                  View past months as read-only records. Track your progress and
                  learn from spending patterns.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, effective <span className="text-primary">budgeting</span>
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
                  <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="bg-card border rounded-3xl p-8 relative z-10 h-full hover:shadow-xl hover:shadow-primary/5 transition-shadow">
                  <div className="text-6xl font-bold text-primary/10 mb-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            {/* Animated circles */}
            <motion.div
              className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative z-10 py-20 md:py-28 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Ready to take control?
                </h2>
                <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                  Join thousands of users building wealth with the smart 20%
                  savings rule. Start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-14 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all group"
                    >
                      Start Budgeting Now
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-white/60 text-sm">
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
      <footer className="py-16 border-t bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5 font-bold text-xl">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground">
                <Wallet className="w-5 h-5" />
              </div>
              <span>Budget App</span>
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
              © 2025 Budget App. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}
